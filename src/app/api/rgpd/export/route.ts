import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/rgpd/export — full dump of the signed-in user's household data
 * as a downloadable JSON. RGPD art. 15 (droit d'accès).
 *
 * Returned shape mirrors the DB layout so the file is self-documenting.
 * Audio blobs are NOT included (paths only) — they'd bloat the export and
 * are already subject to the 90-day TTL purge.
 */
export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = userData.user.id;

  const { data: member } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (!member?.household_id) {
    return NextResponse.json({ error: "no_household" }, { status: 400 });
  }
  const householdId = member.household_id;

  // Each query is RLS-bounded by the user's session — no service role needed.
  const [
    { data: household },
    { data: members },
    { data: children },
    { data: weights },
    { data: entries },
    { data: messages },
    { data: stocks },
    { data: reminders },
  ] = await Promise.all([
    supabase.from("households").select("*").eq("id", householdId).maybeSingle(),
    supabase.from("household_members").select("*").eq("household_id", householdId),
    supabase.from("children").select("*").eq("household_id", householdId),
    supabase.from("weights").select("*"),
    supabase.from("entries").select("*").eq("household_id", householdId),
    supabase.from("messages").select("*").eq("household_id", householdId),
    supabase.from("stocks").select("*").eq("household_id", householdId),
    supabase.from("scheduled_reminders").select("*").eq("household_id", householdId),
  ]);

  const dump = {
    exportedAt: new Date().toISOString(),
    rgpdArticle: "art.15 — droit d'accès",
    user: {
      id: userId,
      email: userData.user.email,
    },
    household,
    members,
    children,
    weights,
    entries,
    messages,
    stocks,
    scheduledReminders: reminders,
  };

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(dump, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="pia-export-${date}.json"`,
      "cache-control": "no-store",
    },
  });
}
