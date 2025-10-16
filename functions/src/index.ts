import * as functions from "firebase-functions";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const openaiProxy = functions.https.onRequest(async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
    }

    try {
        const { messages } = req.body;
        if (!Array.isArray(messages)) {
            res.status(400).json({ error: "Invalid request body" });
            return;
        }

        const completion = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
        });

        res.status(200).json({
            message: completion.choices[0].message,
            usage: completion.usage,
        });
    } catch (error: any) {
        console.error("OpenAI Proxy Error:", error);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
});