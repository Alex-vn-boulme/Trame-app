import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/push/subscribe — store the browser's PushSubscription so the
 * cron jobs can target this device. Idempotent on endpoint.
 *
 * DELETE same path — unsubscribe (when user disables notifications).
 */
export const runtime = "nodejs";

const Schema = z.object({
  endpoint: z.string().url(),
  keys: z.object({ p256dh: z.string(), auth: z.string() }),
  userAgent: z.string().optional(),
});

export async function POST(request: Request) {
  const body = Schema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Upsert on (user_id, endpoint).
  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        user_id: userData.user.id,
        endpoint: body.data.endpoint,
        p256dh: body.data.keys.p256dh,
        auth: body.data.keys.auth,
        user_agent: body.data.userAgent ?? null,
      },
      { onConflict: "endpoint" },
    );
  if (error) {
    console.error("[push/subscribe] upsert failed", error);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const endpoint = url.searchParams.get("endpoint");
  if (!endpoint) return NextResponse.json({ error: "endpoint required" }, { status: 400 });

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", userData.user.id)
    .eq("endpoint", endpoint);
  if (error) {
    console.error("[push/subscribe DELETE] failed", error);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
