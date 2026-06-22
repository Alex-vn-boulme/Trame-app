import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient, createClient } from "@/lib/supabase/server";

/**
 * POST /api/rgpd/delete — removes the signed-in user's account.
 *
 * RGPD art. 17 (droit à l'effacement). Strategy:
 *   - Drop the user from household_members.
 *   - If they were the last member, cascade-delete the household
 *     (which cascades children, entries, messages, stocks, reminders).
 *   - Delete the auth.users record (requires service-role key).
 *
 * Confirmation body: { confirm: "DELETE-MY-ACCOUNT" } so a misclick can't
 * trigger irreversible loss.
 */
export const runtime = "nodejs";
export const maxDuration = 30;

const Body = z.object({ confirm: z.literal("DELETE-MY-ACCOUNT") });

export async function POST(request: Request) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "service role key not configured" }, { status: 500 });
  }

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "missing_confirmation" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = userData.user.id;
  const admin = createAdminClient();

  // Find households this user belongs to.
  const { data: memberships } = await admin
    .from("household_members")
    .select("household_id")
    .eq("user_id", userId);

  // Remove the user from each household.
  await admin.from("household_members").delete().eq("user_id", userId);

  // For each household, if no members remain, drop the whole household.
  for (const m of memberships ?? []) {
    const { count } = await admin
      .from("household_members")
      .select("user_id", { count: "exact", head: true })
      .eq("household_id", m.household_id);
    if (!count || count === 0) {
      await admin.from("households").delete().eq("id", m.household_id);
    }
  }

  // Drop push subscriptions explicitly (cascade handles this, but be defensive).
  await admin.from("push_subscriptions").delete().eq("user_id", userId);

  // Finally, delete the auth user.
  const { error: authErr } = await admin.auth.admin.deleteUser(userId);
  if (authErr) {
    console.error("[rgpd/delete] auth.admin.deleteUser failed", authErr);
    return NextResponse.json({ error: "auth_delete_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
