/**
 * Seed “European friends” demo group with three demo users and initial messages.
 *
 * Usage (with GOOGLE_APPLICATION_CREDENTIALS or Emulator):
 *   $ export GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccount.json
 *   $ npx ts-node scripts/seedGroupDemo.ts
 *
 * If using the Firebase Emulator Suite locally:
 *   $ export FIRESTORE_EMULATOR_HOST=localhost:8080
 *   $ npx ts-node scripts/seedGroupDemo.ts
 */

import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

type DemoUser = { uid: string; displayName: string; primaryLanguage: string; avatarUrl?: string };

async function main() {
    if (!getApps().length) {
        try {
            initializeApp({ credential: applicationDefault() });
        } catch {
            initializeApp();
        }
    }
    const db = getFirestore();

    const users: DemoUser[] = [
        { uid: "demo-en", displayName: "Alice", primaryLanguage: "en" },
        { uid: "demo-it", displayName: "Marco", primaryLanguage: "it" },
        { uid: "demo-fr", displayName: "Chloé", primaryLanguage: "fr" },
    ];

    console.log("Seeding users…");
    for (const u of users) {
        await db.collection("users").doc(u.uid).set(
            {
                displayName: u.displayName,
                languages: [u.primaryLanguage],
                primaryLanguage: u.primaryLanguage,
                avatarUrl: u.avatarUrl ?? null,
                createdAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
        );
    }

    const participants = users.map(u => u.uid).sort();
    const participantLanguages = users.reduce<Record<string, string>>((acc, u) => {
        acc[u.uid] = u.primaryLanguage;
        return acc;
    }, {});

    console.log("Creating group conversation…");
    const convoRef = await db.collection("conversations").add({
        type: "group",
        title: "European friends",
        participants,
        participantLanguages,
        createdAt: FieldValue.serverTimestamp(),
        lastMessage: "",
        lastMessageAt: FieldValue.serverTimestamp(),
    });

    const messages = [
        { senderId: "demo-en", text: "Hi friends! How are you?" },
        { senderId: "demo-it", text: "Ciao a tutti! Sto bene, grazie." },
        { senderId: "demo-fr", text: "Salut tout le monde ! Je vais très bien." },
    ];

    console.log("Adding initial messages…");
    for (const m of messages) {
        await convoRef.collection("messages").add({
            senderId: m.senderId,
            text: m.text,
            timestamp: FieldValue.serverTimestamp(),
            status: "sent",
            readBy: [],
        });
    }

    // Update lastMessage / lastMessageAt to the last seeded message
    await convoRef.set(
        { lastMessage: messages[messages.length - 1].text, lastMessageAt: FieldValue.serverTimestamp() },
        { merge: true }
    );

    console.log("✅ Demo conversation created:", convoRef.id);
    console.log("Participants:", participants);
    console.log("Open this conversation in the app to verify real-time translation and voice.");
}

main().catch(err => {
    console.error("Seed failed:", err);
    process.exit(1);
});


