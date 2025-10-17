import { initializeApp } from "firebase/app";
import { collection, deleteDoc, doc, getDocs, getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCryLKhdP31mbvmQFIGWTqR2U-Zd1Nl8Pc",
    authDomain: "collab-convas.firebaseapp.com",
    databaseURL: "https://collab-convas-default-rtdb.firebaseio.com",
    projectId: "collab-convas",
    storageBucket: "collab-convas.firebasestorage.app",
    messagingSenderId: "859899210811",
    appId: "1:859899210811:web:2389c83c7d125dae58001e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteShapesBatch() {
    const shapesRef = collection(db, "shapes");
    const snapshot = await getDocs(shapesRef);

    let count = 0;

    for (const shape of snapshot.docs) {
        // 👇 Customize what to keep here
        const data = shape.data();

        // Example: delete all shapes except the first 5
        if (count >= 5) {
            await deleteDoc(doc(db, "shapes", shape.id));
            console.log(`🗑️ Deleted shape ${shape.id}`);
        } else {
            console.log(`✅ Keeping shape ${shape.id}`);
        }

        count++;
    }

    console.log("✨ Cleanup complete");
}

deleteShapesBatch().catch(console.error);