import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/session";

/**
 * Next.js 16 proxy entry. Runs on Node.js runtime only.
 *
 * Responsibilities:
 *   1. Refresh the Supabase session cookie (so RSCs see a live user).
 *   2. Redirect unauthenticated users away from app routes to /login.
 *
 * SECURITY NOTE (CVE-2025-29927): proxy must never be the *only* auth gate.
 * Every protected RSC / Server Action / Route Handler re-checks
 * `supabase.auth.getUser()` and queries through RLS-enforced tables.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Run on all routes except static assets and PWA-served files.
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|manifest\\.webmanifest|sw\\.js|icons|splash).*)",
  ],
};
