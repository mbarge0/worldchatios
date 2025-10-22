#!/usr/bin/env ts-node

import * as admin from 'firebase-admin';

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error('Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON.');
    process.exit(1);
}

const conversationId = process.argv[2];
const senderId = process.argv[3];
const count = Number(process.argv[4] || 20);

if (!conversationId || !senderId) {
    console.error('Usage: burst-messages <conversationId> <senderId> [count=20]');
    process.exit(1);
}

(async () => {
    admin.initializeApp();
    const db = admin.firestore();
    const convoRef = db.collection('conversations').doc(conversationId);
    const batchSize = 10;
    let remaining = count;
    while (remaining > 0) {
        const toSend = Math.min(batchSize, remaining);
        const batch = db.batch();
        for (let i = 0; i < toSend; i++) {
            const msgRef = convoRef.collection('messages').doc();
            batch.set(msgRef, {
                senderId,
                text: `burst-${Date.now()}-${remaining}-${i}`,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                status: 'sent'
            });
        }
        batch.update(convoRef, {
            lastMessage: 'burst',
            lastMessageAt: admin.firestore.FieldValue.serverTimestamp()
        });
        await batch.commit();
        remaining -= toSend;
        await new Promise((r) => setTimeout(r, 100));
    }
    console.log(`Sent ${count} messages to ${conversationId}`);
    process.exit(0);
})();
