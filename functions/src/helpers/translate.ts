import crypto from "crypto";
import { db, fv, openai, OPENAI_MODEL } from "../helpers/env";

export async function translateWithCache(fromLang: string, toLang: string, text: string): Promise<string> {
    const key = crypto
        .createHash("sha1")
        .update(`${fromLang.toLowerCase()}|${toLang.toLowerCase()}|${text.trim()}`)
        .digest("hex");
    const ref = db.collection("translate_cache").doc(key);
    const snap = await ref.get();
    if (snap.exists) {
        const cached = (snap.data() as any)?.translated || "";
        if (cached) return cached;
    }
    const system = `You are a translation engine. Translate faithfully and naturally from ${fromLang} to ${toLang}. Return only the translated sentence, with no quotes or extra commentary.`;
    const userPrompt = `Source (${fromLang}): ${text}\nTarget (${toLang}):`;
    const completion = await openai.chat.completions.create({
        model: OPENAI_MODEL,
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
    await ref.set({ translated, createdAt: fv.serverTimestamp(), fromLang, toLang, len: text.length }, { merge: true });
    return translated;
}


