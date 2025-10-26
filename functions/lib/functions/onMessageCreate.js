"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onMessageCreate = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const env_1 = require("../helpers/env");
const translate_1 = require("../helpers/translate");
exports.onMessageCreate = (0, firestore_1.onDocumentCreated)("conversations/{conversationId}/messages/{messageId}", async (event) => {
    const { conversationId, messageId } = event.params || {};
    try {
        const snap = event.data;
        if (!snap) {
            console.log("onMessageCreate: No snapshot in event", { conversationId, messageId });
            return;
        }
        const data = snap.data();
        if (!data || !data.senderId || !data.text) {
            console.log("onMessageCreate: Missing senderId or text", { conversationId, messageId });
            return;
        }
        const messageRef = env_1.db.collection("conversations").doc(conversationId).collection("messages").doc(messageId);
        const convoRef = env_1.db.collection("conversations").doc(conversationId);
        const convoSnap = await convoRef.get();
        if (!convoSnap.exists) {
            console.log("onMessageCreate: Conversation not found", { conversationId });
            return;
        }
        const convo = convoSnap.data();
        const participants = Array.isArray(convo?.participants) ? convo.participants : [];
        const type = (convo?.type || "one-on-one");
        const senderId = data.senderId;
        // Ensure participantLanguages exist for all participants
        const existingMap = (convo?.participantLanguages || {});
        const missing = participants.filter((p) => !existingMap[p]);
        if (missing.length > 0) {
            const updates = { participantLanguages: { ...existingMap } };
            const snaps = await Promise.all(missing.map(uid => env_1.db.collection("users").doc(uid).get()));
            snaps.forEach(s => {
                const uid = s.id;
                const d = s.data();
                const lang = (d?.language || d?.primaryLanguage || (Array.isArray(d?.languages) ? d.languages[0] : null) || "en");
                updates.participantLanguages[uid] = (lang || "en").toLowerCase();
            });
            await convoRef.set(updates, { merge: true });
        }
        const latestConvo = await convoRef.get();
        const participantLanguages = (latestConvo.data()?.participantLanguages || {});
        const senderLang = (participantLanguages[senderId] || "en").toLowerCase();
        const targets = new Set();
        for (const uid of participants) {
            if (uid === senderId)
                continue;
            const lang = (participantLanguages[uid] || "en").toLowerCase();
            if (lang && lang !== senderLang)
                targets.add(lang);
        }
        if (targets.size === 0) {
            console.log("onMessageCreate: No target languages required");
            return;
        }
        const messageSnap = await messageRef.get();
        const existingTranslations = messageSnap.data()?.translations || {};
        const text = (data.text || "").trim();
        if (!text) {
            console.log("onMessageCreate: Empty text, skipping");
            return;
        }
        const toTranslate = Array.from(targets).filter(l => !Object.prototype.hasOwnProperty.call(existingTranslations, l));
        console.log("onMessageCreate: Fanout", { type, conversationId, messageId, senderId, toLangs: toTranslate });
        const results = await Promise.all(toTranslate.map(async (toLang) => {
            try {
                const translated = await (0, translate_1.translateWithCache)(senderLang, toLang, text);
                return { toLang, translated };
            }
            catch (e) {
                console.warn("onMessageCreate: translate failed", { toLang, error: e?.message || e });
                return { toLang, translated: "" };
            }
        }));
        const newTranslations = {};
        for (const r of results)
            if (r.translated)
                newTranslations[r.toLang] = r.translated;
        if (Object.keys(newTranslations).length === 0)
            return;
        await env_1.db.runTransaction(async (tx) => {
            const cur = await tx.get(messageRef);
            const curData = cur.data();
            const curTranslations = (curData?.translations || {});
            const merged = { ...curTranslations, ...newTranslations };
            tx.set(messageRef, { translations: merged }, { merge: true });
        });
    }
    catch (err) {
        console.error("onMessageCreate: Failed to translate", { conversationId, messageId, error: err?.message || err });
    }
});
