import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { db } from "../helpers/env";

export const onConversationCreated = onDocumentCreated("conversations/{conversationId}", async (event: any) => {
    const { conversationId } = event.params || {};
    try {
        const snap = event.data;
        const data = snap ? (snap.data ? snap.data() : {}) : {};
        const participants: string[] = Array.isArray(data?.participants) ? data.participants : [];
        if (participants.length < 2) { return; }
        const convoRef = db.collection("conversations").doc(conversationId);
        const existing = (await convoRef.get()).data() as any || {};
        const existingMap = (existing.participantLanguages || {}) as Record<string, string>;
        const toFill: Record<string, string> = {};
        for (const uid of participants) {
            if (existingMap[uid]) continue;
            const uSnap = await db.collection("users").doc(uid).get();
            const d = uSnap.data() as any;
            const lang = (d?.language || d?.primaryLanguage || (Array.isArray(d?.languages) ? d.languages[0] : null) || "en") as string;
            toFill[uid] = (lang || "en").toLowerCase();
        }
        if (Object.keys(toFill).length > 0) {
            await convoRef.set({ participantLanguages: { ...existingMap, ...toFill } }, { merge: true });
            console.log("onConversationCreated: participantLanguages populated", { conversationId, toFill, participants });
        }
    } catch (err) {
        console.error("onConversationCreated: Failed to set participantLanguages", { conversationId, error: (err as any)?.message || err });
    }
});


