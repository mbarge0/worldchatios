import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import OpenAIConstructor from "openai";

if (!getApps().length) initializeApp();

export const db = getFirestore();
export const fv = FieldValue;
export const auth = getAuth();

export const OPENAI_API_KEY: string = process.env.OPENAI_API_KEY || "";
export const OPENAI_MODEL: string = process.env.OPENAI_MODEL || "gpt-4o-mini";
export const openai = new OpenAIConstructor({ apiKey: OPENAI_API_KEY });


