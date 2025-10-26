"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSmartReplies = void 0;
const firebase_functions_1 = require("firebase-functions");
const env_1 = require("../helpers/env");
async function verifyAuth(req) {
    const authz = (req.headers["authorization"] || req.headers["Authorization"]);
    if (!authz)
        throw new Error("Missing Authorization");
    const token = authz.replace(/^Bearer\s+/i, "").trim();
    const decoded = await env_1.auth.verifyIdToken(token);
    return decoded.uid;
}
exports.generateSmartReplies = firebase_functions_1.https.onRequest(async (req, res) => {
    try {
        const uid = process.env.FUNCTIONS_EMULATOR === "true" ? "local-test-user" : await verifyAuth(req);
        const { conversationId, tone = "neutral" } = req.body || {};
        if (!env_1.OPENAI_API_KEY)
            throw new Error("Missing OPENAI_API_KEY");
        if (!conversationId) {
            res.status(400).json({ error: "conversationId is required" });
            return;
        }
        const snap = await env_1.db.collection("conversations").doc(conversationId).collection("messages").orderBy("timestamp", "desc").limit(10).get();
        const parts = [];
        snap.forEach(d => { const m = d.data(); parts.push(`[${m.senderId}] ${m.text}`); });
        const context = parts.reverse().join("\n");
        const system = `Generate 3 reply suggestions in both languages (original and target). Tone: ${tone}. Return JSON array of {original, translated}.`;
        const prompt = `${system}\n\nConversation (recent):\n${context}\n\nReturn only JSON array.`;
        const completion = await env_1.openai.chat.completions.create({
            model: env_1.OPENAI_MODEL,
            messages: [{ role: "system", content: system }, { role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 200,
        });
        const raw = completion.choices?.[0]?.message?.content || "[]";
        let suggestions = [];
        try {
            suggestions = JSON.parse(raw.replace(/```json/i, "").replace(/```/g, "").trim());
        }
        catch { }
        res.json({ suggestions, cached: false });
    }
    catch (e) {
        res.status(500).json({ error: e?.message || "generateSmartReplies failed" });
    }
});
