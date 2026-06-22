import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client. Singleton across the app — re-use the same
 * instance to keep realtime subscriptions stable.
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY at runtime.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
