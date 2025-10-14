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
    const shapes: any[] = []
    const now = Date.now()
    // 80 rectangles in a grid
    const cols = 10
    const rows = 8
    const cellW = 120
    const cellH = 90
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            shapes.push({
                type: "rect",
                x: 100 + c * (cellW + 20),
                y: 100 + r * (cellH + 20),
                width: cellW,
                height: cellH,
                rotation: 0,
                fill: "#E5E7EB",
                stroke: "#94A3B8",
                opacity: 1,
                zIndex: r * cols + c,
                updatedAt: now,
            })
        }
    }
    // 20 text nodes
    for (let i = 0; i < 20; i++) {
        shapes.push({
            type: "text",
            x: 200 + (i % 10) * 180,
            y: 50 + Math.floor(i / 10) * 40,
            width: 200,
            height: 40,
            rotation: 0,
            text: `Text ${i + 1}`,
            fontSize: 18,
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: "normal",
            textAlign: "left",
            lineHeight: 1.2,
            fill: "#111827",
            opacity: 1,
            zIndex: rows * cols + i,
            updatedAt: now,
        })
    }
    console.log(`🪄 Seeding ${shapes.length} shapes...`);

    try {
        await setDoc(canvasRef, { createdAt: Date.now() });
        for (const s of shapes) {
            await addDoc(collection(canvasRef, "shapes"), s);
        }
        console.log(`✅ Seeded Firestore: /canvases/default with ${shapes.length} shapes.`);
    } catch (err: any) {
        console.error("❌ Firestore write error:", err.message);
    }
}

seed().then(() => process.exit(0));