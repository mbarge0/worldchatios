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

export const askAI = https.onRequest(async (req: Request, res: Response) => {
    try {
        const uid = process.env.FUNCTIONS_EMULATOR === "true" ? "local-test-user" : await verifyAuth(req);
        const { conversationId, question } = req.body || {};
        if (!OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY");
        if (!conversationId || !question) { res.status(400).json({ error: "conversationId and question are required" }); return; }

        // Pull brief recent context (optional)
        const snap = await db.collection("conversations").doc(conversationId).collection("messages").orderBy("timestamp", "desc").limit(20).get();
        const parts: string[] = [];
        snap.forEach(d => { const m = d.data() as any; parts.push(`[${m.senderId}] ${m.text}`); });
        const context = parts.reverse().join("\n");

        const system = "You are a language learning assistant. Explain vocabulary, grammar, idioms, and cultural context clearly.";
        const prompt = `${system}\n\nConversation (recent):\n${context}\n\nUser question: ${question}`;

        const completion = await openai.chat.completions.create({
            model: OPENAI_MODEL,
            messages: [{ role: "system", content: system }, { role: "user", content: prompt }],
            temperature: 0.5,
            max_tokens: 300,
        });
        const answer = completion.choices?.[0]?.message?.content || "";
        res.json({ answer, cached: false });
    } catch (e: any) {
        res.status(500).json({ error: e?.message || "askAI failed" });
    }
});


