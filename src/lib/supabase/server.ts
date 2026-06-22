import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client for RSC, route handlers, and Server Actions.
 * Reads / writes session cookies via Next.js cookies() (async in Next 15+).
 *
 * In RSCs, setAll is a no-op (cookies are read-only there). The middleware
 * (`/middleware.ts`) is responsible for actually rotating the session.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component — middleware handles rotation.
          }
        },
      },
    },
  );
}

/**
 * Admin client — uses the service role key. Bypasses RLS. Use only from
 * trusted server contexts (route handlers, cron jobs). Never expose.
 */
export function createAdminClient() {
  const { createClient: createSjsClient } = require("@supabase/supabase-js") as typeof import("@supabase/supabase-js");
  return createSjsClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
