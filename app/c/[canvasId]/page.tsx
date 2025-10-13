"use client";

import { app } from "@/lib/firebase/client"; // make sure this points to your initialized Firebase app
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        const auth = getAuth(app);
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // ✅ Authenticated: send user to their default or last canvas
                // If you plan to store last-opened canvas in Firestore or localStorage, swap "default" for that ID
                router.replace("/c/default");
            } else {
                // 🚪 Unauthenticated: send user to login
                router.replace("/login");
            }
        });

        return () => unsubscribe();
    }, [router]);

    return (
        <main className="flex min-h-screen items-center justify-center">
            <h1 className="text-2xl font-semibold text-gray-700 animate-pulse">
                Loading workspace...
            </h1>
        </main>
    );
}