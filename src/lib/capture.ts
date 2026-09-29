import { initCapture, type CaptureController } from "@replayio/self-healing-capture";
import type { Member } from "@/types";

let capture: CaptureController | undefined;

/**
 * Initialize Self Healing session capture — production builds only.
 *
 * Captured sessions POST to our own Netlify Function, which holds the Self
 * Healing credential server-side; the browser bundle never sees an API key.
 * Dev builds stay capture-free, preserving the repo's capture policy.
 * Must run before the first render so capture sees the whole session.
 */
export function initSelfHealingCapture(): void {
  if (import.meta.env.PROD) {
    capture = initCapture({
      orgId: "o-250JSR-na1",
      endpoint: "/api/self-healing/session",
      onError: (error) => console.error("Session capture failed", error),
    });
  }
}

/**
 * Attach the app's current user to the captured session. The app has no
 * backend auth — the user comes from the local user context (the account
 * chip in the sidebar). No-op outside production.
 */
export function identifyCurrentUser(user: Pick<Member, "id" | "name" | "email">): void {
  capture?.identify({ id: user.id, name: user.name, email: user.email });
}
