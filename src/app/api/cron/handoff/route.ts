import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { householdMemberIds, sendPushToUsers } from "@/lib/push";

/**
 * /api/cron/handoff — runs daily at 7h (vercel.json).
 *
 * For every household where the last night (22h prev → 7h today) saw
 * activity, sends a Web Push so the partner who was off-duty can open the
 * C2 MorningHandoff screen directly. The handoff screen itself queries DB
 * live — we just fire the notification here.
 */
export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "service role key not configured" }, { status: 500 });
  }

  const admin = createAdminClient();

  const morning = new Date();
  morning.setHours(7, 0, 0, 0);
  const lastNight = new Date(morning);
  lastNight.setHours(22, 0, 0, 0);
  lastNight.setDate(lastNight.getDate() - 1);

  const { data: households } = await admin.from("households").select("id").limit(1000);
  let pushed = 0;

  for (const hh of households ?? []) {
    // Count last-night entries to skip silent households.
    const { count } = await admin
      .from("entries")
      .select("id", { count: "exact", head: true })
      .eq("household_id", hh.id)
      .gte("created_at", lastNight.toISOString())
      .lt("created_at", morning.toISOString());
    if (!count || count === 0) continue;

    const userIds = await householdMemberIds(admin, hh.id);
    const { sent } = await sendPushToUsers(admin, userIds, {
      title: "Pia · bonjour",
      body: `${count} événement${count > 1 ? "s" : ""} cette nuit. Le résumé est prêt.`,
      url: "/night/handoff",
      tag: "morning-handoff",
    });
    pushed += sent;
  }

  return NextResponse.json({ households: households?.length ?? 0, pushed });
}
