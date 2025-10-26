"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onConversationCreated = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const env_1 = require("../helpers/env");
exports.onConversationCreated = (0, firestore_1.onDocumentCreated)("conversations/{conversationId}", async (event) => {
    const { conversationId } = event.params || {};
    try {
        const snap = event.data;
        const data = snap ? (snap.data ? snap.data() : {}) : {};
        const participants = Array.isArray(data?.participants) ? data.participants : [];
        if (participants.length < 2) {
            return;
        }
        const convoRef = env_1.db.collection("conversations").doc(conversationId);
        const existing = (await convoRef.get()).data() || {};
        const existingMap = (existing.participantLanguages || {});
        const toFill = {};
        for (const uid of participants) {
            if (existingMap[uid])
                continue;
            const uSnap = await env_1.db.collection("users").doc(uid).get();
            const d = uSnap.data();
            const lang = (d?.language || d?.primaryLanguage || (Array.isArray(d?.languages) ? d.languages[0] : null) || "en");
            toFill[uid] = (lang || "en").toLowerCase();
        }
        if (Object.keys(toFill).length > 0) {
            await convoRef.set({ participantLanguages: { ...existingMap, ...toFill } }, { merge: true });
            console.log("onConversationCreated: participantLanguages populated", { conversationId, toFill, participants });
        }
    }
    catch (err) {
        console.error("onConversationCreated: Failed to set participantLanguages", { conversationId, error: err?.message || err });
    }
});
