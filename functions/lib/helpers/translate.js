"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateWithCache = translateWithCache;
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../helpers/env");
async function translateWithCache(fromLang, toLang, text) {
    const key = crypto_1.default
        .createHash("sha1")
        .update(`${fromLang.toLowerCase()}|${toLang.toLowerCase()}|${text.trim()}`)
        .digest("hex");
    const ref = env_1.db.collection("translate_cache").doc(key);
    const snap = await ref.get();
    if (snap.exists) {
        const cached = snap.data()?.translated || "";
        if (cached)
            return cached;
    }
    const system = `You are a translation engine. Translate faithfully and naturally from ${fromLang} to ${toLang}. Return only the translated sentence, with no quotes or extra commentary.`;
    const userPrompt = `Source (${fromLang}): ${text}\nTarget (${toLang}):`;
    const completion = await env_1.openai.chat.completions.create({
        model: env_1.OPENAI_MODEL,
        messages: [
            { role: "system", content: system },
            { role: "user", content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: Math.min(400, Math.max(60, text.length + 20)),
    });
    const translatedRaw = completion.choices?.[0]?.message?.content || "";
    const translated = translatedRaw
        .replace(/^```[\s\S]*?```$/g, "")
        .replace(/```[a-z]*\n?|```/gi, "")
        .trim();
    await ref.set({ translated, createdAt: env_1.fv.serverTimestamp(), fromLang, toLang, len: text.length }, { merge: true });
    return translated;
}
