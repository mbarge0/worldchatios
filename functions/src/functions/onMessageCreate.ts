import type { DocumentData, DocumentReference, DocumentSnapshot, Transaction } from "firebase-admin/firestore";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { db } from "../helpers/env";
import { translateWithCache } from "../helpers/translate";

type MessageDoc = {
    senderId: string;
    text: string;
    translations?: Record<string, string>;
};

export const onMessageCreate = onDocumentCreated("conversations/{conversationId}/messages/{messageId}", async (event: any) => {
    const { conversationId, messageId } = event.params || {};
    try {
        const snap = event.data;
        if (!snap) { console.log("onMessageCreate: No snapshot in event", { conversationId, messageId }); return; }
        const data = snap.data() as MessageDoc;
        if (!data || !data.senderId || !data.text) { console.log("onMessageCreate: Missing senderId or text", { conversationId, messageId }); return; }

        const messageRef: DocumentReference<DocumentData> = db.collection("conversations").doc(conversationId).collection("messages").doc(messageId);

        const convoRef = db.collection("conversations").doc(conversationId);
        const convoSnap = await convoRef.get();
        if (!convoSnap.exists) { console.log("onMessageCreate: Conversation not found", { conversationId }); return; }
        const convo = convoSnap.data() as any;
        const participants: string[] = Array.isArray(convo?.participants) ? convo.participants : [];
        const type: string = (convo?.type || "one-on-one") as string;
        const senderId: string = data.senderId;

        // Ensure participantLanguages exist for all participants
        const existingMap = (convo?.participantLanguages || {}) as Record<string, string>;
        const missing = participants.filter((p: string) => !existingMap[p]);
        if (missing.length > 0) {
            const updates: Record<string, any> = { participantLanguages: { ...existingMap } };
            const snaps = await Promise.all(missing.map(uid => db.collection("users").doc(uid).get()));
            snaps.forEach(s => {
                const uid = s.id;
                const d = s.data() as any;
                const lang = (d?.language || d?.primaryLanguage || (Array.isArray(d?.languages) ? d.languages[0] : null) || "en") as string;
                updates.participantLanguages[uid] = (lang || "en").toLowerCase();
            });
            await convoRef.set(updates, { merge: true });
        }

        const latestConvo = await convoRef.get();
        const participantLanguages = ((latestConvo.data() as any)?.participantLanguages || {}) as Record<string, string>;
        const senderLang = (participantLanguages[senderId] || "en").toLowerCase();

        const targets = new Set<string>();
        for (const uid of participants) {
            if (uid === senderId) continue;
            const lang = (participantLanguages[uid] || "en").toLowerCase();
            if (lang && lang !== senderLang) targets.add(lang);
        }
        if (targets.size === 0) { console.log("onMessageCreate: No target languages required"); return; }

        const messageSnap = await messageRef.get();
        const existingTranslations = (messageSnap.data() as MessageDoc | undefined)?.translations || {};
        const text = (data.text || "").trim();
        if (!text) { console.log("onMessageCreate: Empty text, skipping"); return; }

        const toTranslate = Array.from(targets).filter(l => !Object.prototype.hasOwnProperty.call(existingTranslations, l));
        console.log("onMessageCreate: Fanout", { type, conversationId, messageId, senderId, toLangs: toTranslate });
        const results = await Promise.all(toTranslate.map(async (toLang) => {
            try {
                const translated = await translateWithCache(senderLang, toLang, text);
                return { toLang, translated };
            } catch (e) {
                console.warn("onMessageCreate: translate failed", { toLang, error: (e as any)?.message || e });
                return { toLang, translated: "" };
            }
        }));

        const newTranslations: Record<string, string> = {};
        for (const r of results) if (r.translated) newTranslations[r.toLang] = r.translated;
        if (Object.keys(newTranslations).length === 0) return;

        await db.runTransaction(async (tx: Transaction) => {
            const cur = await tx.get(messageRef) as DocumentSnapshot<DocumentData>;
            const curData = cur.data() as MessageDoc | undefined;
            const curTranslations = (curData?.translations || {}) as Record<string, string>;
            const merged = { ...curTranslations, ...newTranslations };
            tx.set(messageRef, { translations: merged }, { merge: true });
        });
    } catch (err) {
        console.error("onMessageCreate: Failed to translate", { conversationId, messageId, error: (err as any)?.message || err });
    }
});


