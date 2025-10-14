"use client";

import AuthHeader from '@/components/layout/AuthHeader';
import { app } from "@/lib/firebase/client";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        const auth = getAuth(app);
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // ✅ Redirect to your first canvas route
                router.replace("/c/default");
            } else {
                // ✅ Not logged in → go to login page
                router.replace("/login");
            }
        });

        return () => unsubscribe();
    }, [router]);

    return (
        <main className="flex min-h-screen flex-col">
            <header className="flex items-center justify-end border-b bg-white/90 backdrop-blur px-6 h-[52px] lg:h-14">
                <AuthHeader />
            </header>
            <div className="flex-1 flex items-center justify-center">
                <h1 className="text-3xl font-bold text-center">Loading workspace...</h1>
            </div>
        </main>
    );
}