"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openai = exports.OPENAI_MODEL = exports.OPENAI_API_KEY = void 0;
const crypto = require("crypto");
const dotenv = require("dotenv");
const { getApps, initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { FieldValue, getFirestore } = require("firebase-admin/firestore");
const functions = require("firebase-functions");
const OpenAI = require("openai").default;
dotenv.config();
exports.OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
exports.OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
exports.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
if (!getApps().length)
    initializeApp();
const db = getFirestore();
async function fetchRecentMessages(conversationId, lastN) {
    const snap = await db.collection("conversations").doc(conversationId)
        .collection("messages").orderBy("timestamp", "desc").limit(lastN).get();
    const parts = [];
    let lastKey = "";
    snap.forEach((doc) => {
        const d = doc.data();
        const tx = d.translations?.["en"] ? `\nTranslated(en): ${d.translations["en"]}` : "";
        parts.push(`[${d.senderId}] ${d.text}${tx}`);
        if (!lastKey)
            lastKey = `${doc.id}:${d.timestamp?.toMillis?.() || 0}`;
    });
    return { text: parts.reverse().join("\n"), lastKey };
}
async function verifyAuth(req) {
    const authz = req.headers["authorization"] || req.headers["Authorization"];
    if (!authz || Array.isArray(authz))
        throw new Error("Missing Authorization");
    const token = authz.replace(/^Bearer\s+/i, "").trim();
    const decoded = await getAuth().verifyIdToken(token);
    return decoded.uid;
}
async function checkRateLimit(uid, key, limit) {
    const minute = Math.floor(Date.now() / 60000).toString();
    const ref = db.collection("ai_rate").doc(uid).collection("windows").doc(`${key}:${minute}`);
    await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        const count = (snap.exists ? (snap.data()?.count || 0) : 0) + 1;
        if (count > limit)
            throw new Error("RATE_LIMIT");
        tx.set(ref, { count, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    });
}
async function readCache(cacheKey, maxAgeMs) {
    const ref = db.collection("ai_cache").doc(cacheKey);
    const snap = await ref.get();
    if (!snap.exists)
        return null;
    const d = snap.data();
    const createdAt = d.createdAt?.toMillis?.() || 0;
    if (Date.now() - createdAt > maxAgeMs)
        return null;
    return d.payload || null;
}
async function writeCache(cacheKey, payload) {
    const ref = db.collection("ai_cache").doc(cacheKey);
    await ref.set({ payload, createdAt: FieldValue.serverTimestamp() });
}
function extractSmartRepliesFromText(raw) {
    const suggestions = [];
    if (!raw || typeof raw !== "string")
        return suggestions;
    let text = raw.trim();
    // Remove code fences to reduce noise
    text = text.replace(/```[\s\S]*?```/g, "");
    // Attempt to salvage JSON by normalizing single quotes
    try {
        const normalized = text.replace(/\n/g, " ").replace(/'/g, '"');
        const maybe = JSON.parse(normalized);
        if (Array.isArray(maybe)) {
            for (const item of maybe) {
                if (item && typeof item === "object" && typeof item.original === "string") {
                    const translated = typeof item.translated === "string" ? item.translated : item.original;
                    suggestions.push({ original: item.original, translated });
                    if (suggestions.length >= 3)
                        return suggestions;
                }
            }
        }
    }
    catch { }
    // Parse line-by-line patterns
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    let pendingOriginal = null;
    for (const line of lines) {
        // Pattern: Original: xxx
        const o = line.match(/^Original\s*:\s*(.+)$/i);
        if (o) {
            pendingOriginal = o[1].trim();
            continue;
        }
        // Pattern: Translated: yyy (paired with previous Original)
        const t = line.match(/^Translated\s*:\s*(.+)$/i);
        if (t && pendingOriginal) {
            suggestions.push({ original: pendingOriginal, translated: t[1].trim() });
            pendingOriginal = null;
            if (suggestions.length >= 3)
                return suggestions;
            continue;
        }
        // Pattern: "original -> translated"
        const arrow = line.match(/^[-*]?\s*(.+?)\s*->\s*(.+)$/);
        if (arrow) {
            suggestions.push({ original: arrow[1].trim(), translated: arrow[2].trim() });
            if (suggestions.length >= 3)
                return suggestions;
            continue;
        }
        // Pattern: "original - translated"
        const dash = line.match(/^[-*]?\s*(.+?)\s+-\s+(.+)$/);
        if (dash) {
            suggestions.push({ original: dash[1].trim(), translated: dash[2].trim() });
            if (suggestions.length >= 3)
                return suggestions;
            continue;
        }
    }
    // Fallback: take the first three bullet/numbered lines as both original and translated
    if (suggestions.length < 3) {
        const candidates = lines
            .map(s => s.replace(/^\d+\.|^[-*)\s]+/, "").trim())
            .filter(s => s && !/^Original\s*:/i.test(s) && !/^Translated\s*:/i.test(s));
        for (const s of candidates) {
            suggestions.push({ original: s, translated: s });
            if (suggestions.length >= 3)
                break;
        }
    }
    return suggestions.slice(0, 3);
}
const askAI = functions.https.onRequest(async (req, res) => {
    try {
        const uid = process.env.FUNCTIONS_EMULATOR === "true"
            ? "local-test-user"
            : await verifyAuth(req);
        const { conversationId, question, lastN = 20 } = req.body || {};
        if (!exports.OPENAI_API_KEY)
            throw new Error("Missing OPENAI_API_KEY");
        if (!conversationId || !question) {
            res.status(400).json({ error: "conversationId and question are required" });
            return;
        }
        await checkRateLimit(uid, "askAI", 30); // 30/min per user
        const { text: context, lastKey } = await fetchRecentMessages(conversationId, Math.min(lastN, 40));
        const key = `askAI:${conversationId}:${crypto.createHash("sha1").update(`${lastKey}:${question}`).digest("hex")}`;
        const cached = await readCache(key, 24 * 60 * 60 * 1000);
        if (cached) {
            res.json({ ...cached, cached: true });
            return;
        }
        const system = "You are a language learning assistant. Explain vocabulary, grammar, idioms, and cultural context clearly.";
        const prompt = `${system}\n\nConversation (recent):\n${context}\n\nUser question: ${question}`;
        const start = Date.now();
        const completion = await exports.openai.chat.completions.create({
            model: exports.OPENAI_MODEL,
            messages: [
                { role: "system", content: system },
                { role: "user", content: prompt },
            ],
            temperature: 0.5,
            max_tokens: 300,
        });
        const latencyMs = Date.now() - start;
        console.log("OpenAI response received", { fn: "askAI", latencyMs });
        const answer = completion.choices?.[0]?.message?.content || "";
        const payload = { answer, latencyMs };
        await writeCache(key, payload);
        res.json({ ...payload, cached: false });
    }
    catch (e) {
        if (e?.message === "RATE_LIMIT") {
            res.status(429).json({ error: "rate_limited" });
            return;
        }
        res.status(500).json({ error: e?.message || "askAI failed" });
    }
});
const generateSmartReplies = functions.https.onRequest(async (req, res) => {
    try {
        const uid = await verifyAuth(req);
        const { conversationId, tone = "neutral", lastN = 10 } = req.body || {};
        if (!exports.OPENAI_API_KEY)
            throw new Error("Missing OPENAI_API_KEY");
        if (!conversationId) {
            res.status(400).json({ error: "conversationId is required" });
            return;
        }
        await checkRateLimit(uid, "smartReplies", 60); // 60/min per user
        const { text: context, lastKey } = await fetchRecentMessages(conversationId, Math.min(lastN, 20));
        const key = `smartReplies:${conversationId}:${tone}:${crypto.createHash("sha1").update(lastKey).digest("hex")}`;
        const cached = await readCache(key, 60 * 60 * 1000);
        if (cached) {
            res.json({ ...cached, cached: true });
            return;
        }
        const system = `Generate 3 reply suggestions in both languages (original and target). Tone: ${tone}. Return JSON array of {original, translated}.`;
        const prompt = `${system}\n\nConversation (recent):\n${context}\n\nReturn only JSON array.`;
        const start = Date.now();
        const completion = await exports.openai.chat.completions.create({
            model: exports.OPENAI_MODEL,
            messages: [
                { role: "system", content: system },
                { role: "user", content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 200,
        });
        const latencyMs = Date.now() - start;
        console.log("OpenAI response received", { fn: "generateSmartReplies", latencyMs });
        const raw = completion.choices?.[0]?.message?.content || "[]";
        let suggestions;
        try {
            suggestions = JSON.parse(raw);
        }
        catch {
            suggestions = extractSmartRepliesFromText(raw);
        }
        const payload = { suggestions, latencyMs };
        await writeCache(key, payload);
        res.json({ ...payload, cached: false });
    }
    catch (e) {
        if (e?.message === "RATE_LIMIT") {
            res.status(429).json({ error: "rate_limited" });
            return;
        }
        res.status(500).json({ error: e?.message || "generateSmartReplies failed" });
    }
});
module.exports = { askAI, generateSmartReplies };
