import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { detectPatterns } from "@/domain/vigilance-rules";
import { householdMemberIds, sendPushToUsers } from "@/lib/push";

/**
 * Vercel Cron — runs every 4h (vercel.json).
 *
 * Iterates all households, runs vigilance rules, and:
 *   - inserts `entries(type='symptome', recommendation_id=...)` for new patterns
 *   - sends Web Push to all household members
 *
 * Uses the admin client to bypass RLS — every read/write is household-scoped
 * inside the loop. Auth is Vercel-Cron's `Authorization: Bearer ${CRON_SECRET}`.
 */
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "service role key not configured" }, { status: 500 });
  }

  const admin = createAdminClient();

  // Iterate households (small N in MVP — full pagination later).
  const { data: households, error: hhErr } = await admin.from("households").select("id").limit(1000);
  if (hhErr) {
    console.error("[cron/vigilance] households fetch failed", hhErr);
    return NextResponse.json({ error: "fetch_failed" }, { status: 500 });
  }

  const since = new Date(Date.now() - 7 * 24 * 3_600_000).toISOString();
  let patternsCreated = 0;

  for (const hh of households ?? []) {
    const { data: child } = await admin
      .from("children")
      .select("id, birth_date, weight_kg")
      .eq("household_id", hh.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!child) continue;

    const { data: entries } = await admin
      .from("entries")
      .select("id, type, payload, created_at, child_id")
      .eq("household_id", hh.id)
      .gte("created_at", since);

    const patterns = detectPatterns(
      (entries ?? []).map((e) => ({
        id: e.id,
        type: e.type,
        payload: e.payload,
        created_at: e.created_at,
        child_id: e.child_id,
      })),
      {
        birthDate: child.birth_date ? new Date(child.birth_date) : null,
        weightKg: child.weight_kg,
      },
    );

    for (const p of patterns) {
      // Idempotency: skip if a same-pattern symptome was created in the last 12h.
      const recent = (entries ?? []).find(
        (e) =>
          e.type === "symptome" &&
          (e.payload as { description?: string } | null)?.description === p.title &&
          Date.now() - +new Date(e.created_at) <= 12 * 3_600_000,
      );
      if (recent) continue;

      const { error: insErr } = await admin.from("entries").insert({
        household_id: hh.id,
        child_id: child.id,
        type: "symptome",
        payload: {
          description: p.title,
          severity: p.severity,
        },
        source: "text",
        recommendation_id: p.recommendationId,
      });
      if (insErr) {
        console.error("[cron/vigilance] symptome insert failed", insErr);
        continue;
      }
      patternsCreated++;

      // Notify both co-parents on alert-severity patterns only.
      if (p.severity === "alert") {
        const userIds = await householdMemberIds(admin, hh.id);
        await sendPushToUsers(admin, userIds, {
          title: "Pia · à surveiller",
          body: p.title,
          url: "/vigilance",
          tag: `vigilance-${p.id}`,
        });
      }
    }
  }

  return NextResponse.json({ households: households?.length ?? 0, patternsCreated });
}
