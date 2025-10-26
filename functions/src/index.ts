const crypto = require("crypto");
const dotenv = require("dotenv");
import type { Request, Response } from "express";
import type { DocumentData, DocumentReference, DocumentSnapshot, QueryDocumentSnapshot, Timestamp, Transaction } from "firebase-admin/firestore";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
const { getApps, initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { FieldValue, getFirestore } = require("firebase-admin/firestore");
const functions = require("firebase-functions");
const OpenAI = require("openai").default;
dotenv.config();

export const OPENAI_API_KEY: string = process.env.OPENAI_API_KEY || "";
export const OPENAI_MODEL: string = process.env.OPENAI_MODEL || "gpt-4o-mini";
export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

if (!getApps().length) initializeApp();
const db = getFirestore();

type MessageDoc = {
    senderId: string;
    text: string;
    timestamp: Timestamp;
    translations?: Record<string, string>;
};

// Resolve sender/receiver language, preferring conversation.participantLanguages, then users primaryLanguage/language.
export async function resolveLanguages(
    conversationId: string,
    senderId: string,
    receiverId: string
): Promise<{ fromLang: string; toLang: string } | null> {
    const convoSnap = await db.collection("conversations").doc(conversationId).get();
    const convo = convoSnap.data() as any || {};
    const participantLanguages = (convo?.participantLanguages || {}) as Record<string, string>;
    let senderLang: string | undefined = participantLanguages[senderId];
    let receiverLang: string | undefined = participantLanguages[receiverId];

    if (!senderLang || !receiverLang) {
        const usersColl = db.collection("users");
        const [senderSnap, receiverSnap] = await Promise.all([
            usersColl.doc(senderId).get(),
            usersColl.doc(receiverId).get(),
        ]);
        if (!senderLang) senderLang = (senderSnap.data() as any)?.primaryLanguage || (senderSnap.data() as any)?.language || "en";
        if (!receiverLang) receiverLang = (receiverSnap.data() as any)?.primaryLanguage || (receiverSnap.data() as any)?.language || "en";
    }

    if (!senderLang || !receiverLang) return null;
    if (senderLang === receiverLang) return null;
    return { fromLang: senderLang.toLowerCase(), toLang: receiverLang.toLowerCase() };
}

async function fetchRecentMessages(conversationId: string, lastN: number): Promise<{ text: string; lastKey: string }> {
    const snap = await db.collection("conversations").doc(conversationId)
        .collection("messages").orderBy("timestamp", "desc").limit(lastN).get();
    const parts: string[] = [];
    let lastKey = "";
    snap.forEach((doc: QueryDocumentSnapshot) => {
        const d = doc.data() as MessageDoc;
        const tx = d.translations?.["en"] ? `\nTranslated(en): ${d.translations!["en"]}` : "";
        parts.push(`[${d.senderId}] ${d.text}${tx}`);
        if (!lastKey) lastKey = `${doc.id}:${d.timestamp?.toMillis?.() || 0}`;
    });
    return { text: parts.reverse().join("\n"), lastKey };
}

async function verifyAuth(req: Request): Promise<string> {
    const authz = req.headers["authorization"] || req.headers["Authorization"];
    if (!authz || Array.isArray(authz)) throw new Error("Missing Authorization");
    const token = authz.replace(/^Bearer\s+/i, "").trim();
    const decoded = await getAuth().verifyIdToken(token);
    return decoded.uid;
}

async function checkRateLimit(uid: string, key: string, limit: number): Promise<void> {
    const minute = Math.floor(Date.now() / 60000).toString();
    const ref: DocumentReference<DocumentData> = db.collection("ai_rate").doc(uid).collection("windows").doc(`${key}:${minute}`);
    await db.runTransaction(async (tx: Transaction) => {
        const snap = await tx.get(ref) as DocumentSnapshot<DocumentData>;
        const count = (snap.exists ? (snap.data()?.count || 0) : 0) + 1;
        if (count > limit) throw new Error("RATE_LIMIT");
        tx.set(ref, { count, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    });
}

async function readCache(cacheKey: string, maxAgeMs: number): Promise<any | null> {
    const ref = db.collection("ai_cache").doc(cacheKey);
    const snap = await ref.get();
    if (!snap.exists) return null;
    const d = snap.data() as any;
    const createdAt = d.createdAt?.toMillis?.() || 0;
    if (Date.now() - createdAt > maxAgeMs) return null;
    return d.payload || null;
}

async function writeCache(cacheKey: string, payload: any): Promise<void> {
    const ref = db.collection("ai_cache").doc(cacheKey);
    await ref.set({ payload, createdAt: FieldValue.serverTimestamp() });
}

function extractSmartRepliesFromText(raw: string): Array<{ original: string; translated: string }> {
    const suggestions: Array<{ original: string; translated: string }> = [];
    if (!raw || typeof raw !== "string") return suggestions;
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
                    if (suggestions.length >= 3) return suggestions;
                }
            }
        }
    } catch { }

    // Parse line-by-line patterns
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    let pendingOriginal: string | null = null;
    for (const line of lines) {
        const content = line.replace(/^(?:\d+[.)]|[-*•])\s+/, "").trim();
        // Pattern: Original: xxx
        const o = content.match(/^Original\s*:\s*(.+)$/i);
        if (o) { pendingOriginal = o[1].trim(); continue; }

        // Pattern: Translated: yyy (paired with previous Original)
        const t = content.match(/^Translated\s*:\s*(.+)$/i);
        if (t && pendingOriginal) {
            suggestions.push({ original: pendingOriginal, translated: t[1].trim() });
            pendingOriginal = null;
            if (suggestions.length >= 3) return suggestions;
            continue;
        }

        // Pattern: "original -> translated"
        const arrow = content.match(/^(.+?)\s*->\s*(.+)$/);
        if (arrow) {
            suggestions.push({ original: arrow[1].trim(), translated: arrow[2].trim() });
            if (suggestions.length >= 3) return suggestions;
            continue;
        }

        // Pattern: "original - translated" (hyphen)
        const dash = content.match(/^(.+?)\s+-\s+(.+)$/);
        if (dash) {
            suggestions.push({ original: dash[1].trim(), translated: dash[2].trim() });
            if (suggestions.length >= 3) return suggestions;
            continue;
        }

        // Pattern: en/em dash
        const uniDash = content.match(/^(.+?)\s+[–—]\s+(.+)$/);
        if (uniDash) {
            suggestions.push({ original: uniDash[1].trim(), translated: uniDash[2].trim() });
            if (suggestions.length >= 3) return suggestions;
            continue;
        }

        // Pattern: colon separator (including full-width colon)
        const colon = content.match(/^(.+?)\s*[:：]\s+(.+)$/);
        if (colon) {
            suggestions.push({ original: colon[1].trim(), translated: colon[2].trim() });
            if (suggestions.length >= 3) return suggestions;
            continue;
        }
    }

    // Fallback: take the first three bullet/numbered lines as both original and translated
    if (suggestions.length < 3) {
        const candidates = lines
            .map(s => s.replace(/^(?:\d+[.)]|[-*•)\s]+)/, "").trim())
            .filter(s => s && !/^Original\s*:/i.test(s) && !/^Translated\s*:/i.test(s));
        for (const s of candidates) {
            suggestions.push({ original: s, translated: s });
            if (suggestions.length >= 3) break;
        }
    }

    return suggestions.slice(0, 3);
}

const askAI = functions.https.onRequest(async (req: Request, res: Response) => {
    try {
        const uid =
            process.env.FUNCTIONS_EMULATOR === "true"
                ? "local-test-user"
                : await verifyAuth(req);
        const { conversationId, question, lastN = 20 } = req.body || {};
        if (!OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY");
        if (!conversationId || !question) {
            res.status(400).json({ error: "conversationId and question are required" });
            return;
        }

        await checkRateLimit(uid, "askAI", 30); // 30/min per user

        const { text: context, lastKey } = await fetchRecentMessages(conversationId, Math.min(lastN, 40));
        const key = `askAI:${conversationId}:${crypto.createHash("sha1").update(`${lastKey}:${question}`).digest("hex")}`;
        const cached = await readCache(key, 24 * 60 * 60 * 1000);
        if (cached) { res.json({ ...cached, cached: true }); return; }

        const system = "You are a language learning assistant. Explain vocabulary, grammar, idioms, and cultural context clearly.";
        const prompt = `${system}\n\nConversation (recent):\n${context}\n\nUser question: ${question}`;

        const start = Date.now();
        const completion = await openai.chat.completions.create({
            model: OPENAI_MODEL,
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
    } catch (e: any) {
        if (e?.message === "RATE_LIMIT") { res.status(429).json({ error: "rate_limited" }); return; }
        res.status(500).json({ error: e?.message || "askAI failed" });
    }
});

const generateSmartReplies = functions.https.onRequest(async (req: Request, res: Response) => {
    try {
        const uid =
            process.env.FUNCTIONS_EMULATOR === "true"
                ? "local-test-user"
                : await verifyAuth(req);
        const { conversationId, tone = "neutral", lastN = 10 } = req.body || {};
        if (!OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY");
        if (!conversationId) {
            res.status(400).json({ error: "conversationId is required" });
            return;
        }
        await checkRateLimit(uid, "smartReplies", 60); // 60/min per user
        const { text: context, lastKey } = await fetchRecentMessages(conversationId, Math.min(lastN, 20));
        const key = `smartReplies:${conversationId}:${tone}:${crypto.createHash("sha1").update(lastKey).digest("hex")}`;
        const cached = await readCache(key, 60 * 60 * 1000);
        if (cached) { res.json({ ...cached, cached: true }); return; }
        const system = `Generate 3 reply suggestions in both languages (original and target). Tone: ${tone}. Return JSON array of {original, translated}.`;
        const prompt = `${system}\n\nConversation (recent):\n${context}\n\nReturn only JSON array.`;

        const start = Date.now();
        const completion = await openai.chat.completions.create({
            model: OPENAI_MODEL,
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
        let suggestions: Array<{ original: string; translated: string }>;
        try {
            // Strip code fences like ```json or ```
            const cleaned = raw
                .replace(/```json/i, "")
                .replace(/```/g, "")
                .trim();

            suggestions = JSON.parse(cleaned);
            console.log("✅ generateSmartReplies JSON parse success", { count: suggestions.length, suggestions });
        } catch (err) {
            console.warn("⚠️ generateSmartReplies JSON parse failed", { error: err, raw });
            const extracted = extractSmartRepliesFromText(raw);
            suggestions = extracted;
            console.log("🧩 Fallback extraction used", { count: suggestions.length, extracted });
        }
        const payload = { suggestions, latencyMs };
        await writeCache(key, payload);
        res.json({ ...payload, cached: false });
    } catch (e: any) {
        if (e?.message === "RATE_LIMIT") { res.status(429).json({ error: "rate_limited" }); return; }
        res.status(500).json({ error: e?.message || "generateSmartReplies failed" });
    }
});

// Simple translation cache: avoid translating same text/lang repeatedly
async function translateWithCache(fromLang: string, toLang: string, text: string): Promise<string> {
    const key = crypto.createHash("sha1").update(`${fromLang.toLowerCase()}|${toLang.toLowerCase()}|${text.trim()}`)
        .digest("hex");
    const ref = db.collection("translate_cache").doc(key);
    const snap = await ref.get();
    if (snap.exists) {
        const cached = (snap.data() as any)?.translated || "";
        if (cached) { return cached; }
    }
    const system = `You are a translation engine. Translate faithfully and naturally from ${fromLang} to ${toLang}. Return only the translated sentence, with no quotes or extra commentary.`;
    const userPrompt = `Source (${fromLang}): ${text}\nTarget (${toLang}):`;
    const start = Date.now();
    const completion = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
            { role: "system", content: system },
            { role: "user", content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: Math.min(400, Math.max(60, text.length + 20)),
    });
    const latencyMs = Date.now() - start;
    const translatedRaw = completion.choices?.[0]?.message?.content || "";
    const translated = translatedRaw
        .replace(/^```[\s\S]*?```$/g, "")
        .replace(/```[a-z]*\n?|```/gi, "")
        .trim();
    await ref.set({ translated, createdAt: FieldValue.serverTimestamp(), fromLang, toLang, len: text.length, latencyMs }, { merge: true });
    return translated;
}

// Translate newly created messages for groups and 1:1 (v2 trigger)
exports.onMessageCreate = onDocumentCreated("conversations/{conversationId}/messages/{messageId}", async (event: any) => {
    const { conversationId, messageId } = event.params || {};
    try {
        if (!OPENAI_API_KEY) { console.warn("onMessageCreate: Missing OPENAI_API_KEY"); return; }
        const snap = event.data;
        if (!snap) { console.log("onMessageCreate: No snapshot in event", { conversationId, messageId }); return; }
        const data = snap.data() as MessageDoc;
        if (!data || !data.senderId || !data.text) { console.log("onMessageCreate: Missing senderId or text", { conversationId, messageId }); return; }

        // Idempotency: if already translated to any language, and sender/receiver language would match that, skip later
        const messageRef: DocumentReference<DocumentData> = db.collection("conversations").doc(conversationId).collection("messages").doc(messageId);

        // Read conversation to identify participants and ensure participantLanguages are present
        const convoRef = db.collection("conversations").doc(conversationId);
        const convoSnap = await convoRef.get();
        if (!convoSnap.exists) { console.log("onMessageCreate: Conversation not found", { conversationId }); return; }
        const convo = convoSnap.data() as any;
        const participants: string[] = Array.isArray(convo?.participants) ? convo.participants : [];
        const convoType: string = (convo?.type || "one-on-one") as string;
        const senderId: string = data.senderId;
        // Populate missing participantLanguages for any participants
        const existingMap = (convo?.participantLanguages || {}) as Record<string, string>;
        const missing = participants.filter((p: string) => !existingMap[p]);
        if (missing.length > 0) {
            const usersColl = db.collection("users");
            const snaps = await Promise.all(missing.map((uid: string) => usersColl.doc(uid).get()));
            const updates: Record<string, any> = { participantLanguages: { ...existingMap } };
            snaps.forEach((snap: DocumentSnapshot) => {
                const uid = snap.id;
                const d = snap.data() as any;
                const lang = d?.primaryLanguage || d?.language || "en";
                updates.participantLanguages[uid] = lang;
            });
            await convoRef.set(updates, { merge: true });
        }

        // Resolve sender language
        const updatedConvoSnap = await convoRef.get();
        const updated = (updatedConvoSnap.data() as any) || {};
        const participantLanguages = (updated.participantLanguages || {}) as Record<string, string>;
        const senderLang = (participantLanguages[senderId] || "en").toLowerCase();

        // Determine unique target languages for all other participants
        const toLangsSet = new Set<string>();
        for (const uid of participants) {
            if (uid === senderId) continue;
            const lang = (participantLanguages[uid] || "en").toLowerCase();
            if (lang && lang !== senderLang) toLangsSet.add(lang);
        }
        if (toLangsSet.size === 0) { console.log("onMessageCreate: No target languages required"); return; }

        // Check existing translations to avoid rework
        const latest = await messageRef.get();
        const existingTranslations = (latest.data() as MessageDoc | undefined)?.translations || {};

        const text = (data.text || "").trim();
        if (!text) { console.log("onMessageCreate: Empty text, skipping"); return; }

        const toTranslate: string[] = Array.from(toLangsSet).filter(l => !Object.prototype.hasOwnProperty.call(existingTranslations, l));
        if (toTranslate.length === 0) { console.log("onMessageCreate: All translations already present"); return; }

        const newTranslations: Record<string, string> = {};
        console.log("onMessageCreate: Fanout", { type: convoType, conversationId, messageId, senderId, toLangs: Array.from(toTranslate) });
        const results = await Promise.all(toTranslate.map(async (toLang) => {
            try {
                const translated = await translateWithCache(senderLang, toLang, text);
                return { toLang, translated };
            } catch (e) {
                console.warn("onMessageCreate: translate failed", { toLang, error: (e as any)?.message || e });
                return { toLang, translated: "" };
            }
        }));
        for (const r of results) {
            if (r.translated) newTranslations[r.toLang] = r.translated;
        }

        if (Object.keys(newTranslations).length > 0) {
            await db.runTransaction(async (tx: Transaction) => {
                const cur = await tx.get(messageRef) as DocumentSnapshot<DocumentData>;
                const curData = cur.data() as MessageDoc | undefined;
                const curTranslations = (curData?.translations || {}) as Record<string, string>;
                const merged = { ...curTranslations, ...newTranslations };
                tx.set(messageRef, { translations: merged }, { merge: true });
            });
        }
    } catch (err) {
        console.error("onMessageCreate: Failed to translate", { conversationId, messageId, error: (err as any)?.message || err });
    }
});

// When a conversation is created, populate participantLanguages from users (1:1 and group)
exports.onConversationCreated = onDocumentCreated("conversations/{conversationId}", async (event: any) => {
    const { conversationId } = event.params || {};
    try {
        const snap = event.data;
        const data = snap ? (snap.data ? snap.data() : {}) : {};
        const participants: string[] = Array.isArray(data?.participants) ? data.participants : [];
        if (participants.length < 2) { return; }
        const convoRef = db.collection("conversations").doc(conversationId);
        const convoSnap = await convoRef.get();
        const current = (convoSnap.data() as any) || {};
        const existingMap = (current.participantLanguages || {}) as Record<string, string>;
        const toFill: Record<string, string> = {};
        for (const uid of participants) {
            if (existingMap[uid]) continue;
            const uSnap = await db.collection("users").doc(uid).get();
            toFill[uid] = (uSnap.data() as any)?.primaryLanguage || (uSnap.data() as any)?.language || "en";
        }
        if (Object.keys(toFill).length > 0) {
            await convoRef.set({ participantLanguages: { ...existingMap, ...toFill } }, { merge: true });
            console.log("onConversationCreated: participantLanguages populated", { conversationId, toFill, participants });
        }
    } catch (err) {
        console.error("onConversationCreated: Failed to set participantLanguages", { conversationId, error: (err as any)?.message || err });
    }
});

exports.askAI = askAI;
exports.generateSmartReplies = generateSmartReplies;
exports.onMessageCreate = exports.onMessageCreate;
exports.onConversationCreated = exports.onConversationCreated;