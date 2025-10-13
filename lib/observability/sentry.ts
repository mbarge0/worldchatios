import { env } from "@/config/env";
import * as Sentry from "@sentry/nextjs";

let initialized = false;

export function initSentry(): void {
    if (initialized || !env.NEXT_PUBLIC_SENTRY_DSN) return;
    Sentry.init({
        dsn: env.NEXT_PUBLIC_SENTRY_DSN,
        tracesSampleRate: 0,
        replaysSessionSampleRate: 0,
    });
    initialized = true;
}

export function triggerTestError(): void {
    if (!initialized) return;
    Sentry.captureException(new Error("Sentry test event (client)"));
}


