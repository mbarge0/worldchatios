"use client";

import { app } from "@/lib/firebase"; // make sure this points to your initialized Firebase app
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        const auth = getAuth(app);

        // Watch for changes in authentication state
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // Authenticated → send to main app route
                router.replace("/app");
            } else {
                // Not authenticated → send to login page
                router.replace("/login");
            }
        });

        return () => unsubscribe();
    }, [router]);

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="text-center">
                <h1 className="text-2xl font-semibold text-gray-700">
                    Redirecting…
                </h1>
                <p className="text-gray-500 mt-2">
                    Checking authentication status…
                </p>
            </div>
        </main>
    );
}