import { env } from "@/config/env";
import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getDatabase, type Database } from "firebase/database";
import { getFirestore, type Firestore } from "firebase/firestore";

let app: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let firestoreInstance: Firestore | undefined;
let rtdbInstance: Database | undefined;

export function getFirebaseApp(): FirebaseApp {
    if (!app) {
        const config = {
            apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
            databaseURL: env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
        };
        app = getApps().length ? getApps()[0]! : initializeApp(config);
    }
    return app;
}

export function getAuthClient(): Auth {
    if (!authInstance) authInstance = getAuth(getFirebaseApp());
    return authInstance;
}

export function getFirestoreDb(): Firestore {
    if (!firestoreInstance) firestoreInstance = getFirestore(getFirebaseApp());
    return firestoreInstance;
}

export function getRealtimeDb(): Database {
    if (!rtdbInstance) rtdbInstance = getDatabase(getFirebaseApp());
    return rtdbInstance;
}


