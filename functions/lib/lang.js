"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decideTranslationLanguages = decideTranslationLanguages;
// Decide translation languages, preferring participantLanguages map, then fallbacks.
function decideTranslationLanguages(participantLanguages, senderId, receiverId, fallbackSenderLang, fallbackReceiverLang) {
    const s = (participantLanguages?.[senderId] || fallbackSenderLang || "").toLowerCase().trim();
    const r = (participantLanguages?.[receiverId] || fallbackReceiverLang || "").toLowerCase().trim();
    if (!s || !r)
        return null;
    if (s === r)
        return null;
    return { fromLang: s, toLang: r };
}
