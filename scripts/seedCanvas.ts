import 'dotenv/config';
import { initializeApp } from "firebase/app";
import { addDoc, collection, doc, getFirestore, setDoc } from "firebase/firestore";

// --- Debug-safe configuration ---
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!,
};

// Check for missing envs
for (const [key, value] of Object.entries(firebaseConfig)) {
    if (!value) {
        console.error(`❌ Missing Firebase config: ${key}`);
        process.exit(1);
    }
}

console.log("✅ Firebase config looks good:", firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
    const canvasRef = doc(db, "canvases/default");

    const shape = {
        type: "rect",
        x: 150,
        y: 150,
        width: 200,
        height: 120,
        rotation: 0,
        fill: "#cccccc",
        stroke: "#000000",
        opacity: 1,
        zIndex: 1,
        lockedBy: null,
        updatedAt: Date.now(),
    };

    console.log("🪄 Seeding shape object:", shape);

    try {
        await setDoc(canvasRef, { createdAt: Date.now() });
        await addDoc(collection(canvasRef, "shapes"), shape);
        console.log("✅ Seeded Firestore: /canvases/default with one shape.");
    } catch (err: any) {
        console.error("❌ Firestore write error:", err.message);
    }
}

seed().then(() => process.exit(0));