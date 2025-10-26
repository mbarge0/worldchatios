import type { Request, Response } from "express";
import { https } from "firebase-functions";
import { auth, db, openai, OPENAI_API_KEY, OPENAI_MODEL } from "../helpers/env";

async function verifyAuth(req: Request): Promise<string> {
    const authz = (req.headers["authorization"] || req.headers["Authorization"]) as string | undefined;
    if (!authz) throw new Error("Missing Authorization");
    const token = authz.replace(/^Bearer\s+/i, "").trim();
    const decoded = await auth.verifyIdToken(token);
    return decoded.uid;
}

export const generateSmartReplies = https.onRequest(async (req: Request, res: Response) => {
    try {
        const uid = process.env.FUNCTIONS_EMULATOR === "true" ? "local-test-user" : await verifyAuth(req);
        const { conversationId, tone = "neutral" } = req.body || {};
        if (!OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY");
        if (!conversationId) { res.status(400).json({ error: "conversationId is required" }); return; }

        const snap = await db.collection("conversations").doc(conversationId).collection("messages").orderBy("timestamp", "desc").limit(10).get();
        const parts: string[] = [];
        snap.forEach(d => { const m = d.data() as any; parts.push(`[${m.senderId}] ${m.text}`); });
        const context = parts.reverse().join("\n");

        const system = `Generate 3 reply suggestions in both languages (original and target). Tone: ${tone}. Return JSON array of {original, translated}.`;
        const prompt = `${system}\n\nConversation (recent):\n${context}\n\nReturn only JSON array.`;
        const completion = await openai.chat.completions.create({
            model: OPENAI_MODEL,
            messages: [{ role: "system", content: system }, { role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 200,
        });
        const raw = completion.choices?.[0]?.message?.content || "[]";
        let suggestions: Array<{ original: string; translated: string }> = [];
        try { suggestions = JSON.parse(raw.replace(/```json/i, "").replace(/```/g, "").trim()); } catch { }
        res.json({ suggestions, cached: false });
    } catch (e: any) {
        res.status(500).json({ error: e?.message || "generateSmartReplies failed" });
    }
});


