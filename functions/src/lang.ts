export type ParticipantLanguages = Record<string, string>;

export type DecidedLangs = { fromLang: string; toLang: string } | null;

// Decide translation languages, preferring participantLanguages map, then fallbacks.
export function decideTranslationLanguages(
    participantLanguages: ParticipantLanguages,
    senderId: string,
    receiverId: string,
    fallbackSenderLang?: string,
    fallbackReceiverLang?: string
): DecidedLangs {
    const s = (participantLanguages?.[senderId] || fallbackSenderLang || "").toLowerCase().trim();
    const r = (participantLanguages?.[receiverId] || fallbackReceiverLang || "").toLowerCase().trim();
    if (!s || !r) return null;
    if (s === r) return null;
    return { fromLang: s, toLang: r };
}


