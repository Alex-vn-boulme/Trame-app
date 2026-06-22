import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { computeStage } from "@/domain/stages";
import { householdMemberIds, sendPushToUsers } from "@/lib/push";

/**
 * /api/cron/anticipation — runs daily at 6h (vercel.json).
 *
 * For each household with at least one child, picks up to 3 recommendations
 * relevant to the child's current stage, inserts them as `note` entries
 * with `recommendation_id` so the UI can render <SourceFooter>. Idempotent:
 * skips recos already proposed in the last 7 days.
 */
export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_PER_DAY = 3;
const REPROPOSE_WINDOW_MS = 7 * 24 * 3_600_000;

function ageBucket(stage: ReturnType<typeof computeStage>): { categories: string[]; ageLabel: string } {
  if (stage.kind === "pregnancy") {
    return { categories: ["grossesse", "admin"], ageLabel: `S${stage.weeks}` };
  }
  if (stage.kind === "newborn") {
    return { categories: ["admin", "vaccins", "vigilance", "alimentation"], ageLabel: `J${stage.days}` };
  }
  return {
    categories: ["vaccins", "developpement", "vigilance", "alimentation"],
    ageLabel: `${stage.months}m`,
  };
}

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "service role key not configured" }, { status: 500 });
  }

  const admin = createAdminClient();

  const { data: households, error: hhErr } = await admin
    .from("households")
    .select("id")
    .limit(1000);
  if (hhErr) {
    console.error("[cron/anticipation] households fetch failed", hhErr);
    return NextResponse.json({ error: "fetch_failed" }, { status: 500 });
  }

  const cutoff = new Date(Date.now() - REPROPOSE_WINDOW_MS).toISOString();
  let inserted = 0;
  let pushed = 0;

  for (const hh of households ?? []) {
    const { data: child } = await admin
      .from("children")
      .select("id, birth_date, due_date")
      .eq("household_id", hh.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!child) continue;

    let stage: ReturnType<typeof computeStage>;
    try {
      stage = computeStage({
        birthDate: child.birth_date ? new Date(child.birth_date) : null,
        dueDate: child.due_date ? new Date(child.due_date) : null,
      });
    } catch {
      continue;
    }

    const { categories } = ageBucket(stage);

    // Recommendations matching the stage.
    const { data: recos } = await admin
      .from("recommendations")
      .select("id, text")
      .in("category", categories)
      .limit(20);
    if (!recos || recos.length === 0) continue;

    // Already-proposed reco ids in the last window.
    const { data: alreadyProposed } = await admin
      .from("entries")
      .select("recommendation_id")
      .eq("household_id", hh.id)
      .eq("type", "note")
      .gte("created_at", cutoff);
    const proposedSet = new Set(
      (alreadyProposed ?? [])
        .map((e) => e.recommendation_id)
        .filter((id): id is string => typeof id === "string"),
    );

    const fresh = recos.filter((r) => !proposedSet.has(r.id)).slice(0, MAX_PER_DAY);
    if (fresh.length === 0) continue;

    const rows = fresh.map((r) => ({
      household_id: hh.id,
      child_id: child.id,
      type: "note" as const,
      payload: { text: r.text, pia_suggested: true },
      source: "text" as const,
      recommendation_id: r.id,
    }));
    const { error: insErr } = await admin.from("entries").insert(rows);
    if (insErr) {
      console.error("[cron/anticipation] insert failed", insErr);
      continue;
    }
    inserted += rows.length;

    // Single push per household with a summary.
    const userIds = await householdMemberIds(admin, hh.id);
    const { sent } = await sendPushToUsers(admin, userIds, {
      title: "Pia · suggestions du jour",
      body: `${rows.length} idée${rows.length > 1 ? "s" : ""} adaptée${rows.length > 1 ? "s" : ""} à ce stade.`,
      url: "/anticipation",
      tag: "anticipation-daily",
    });
    pushed += sent;
  }

  return NextResponse.json({ households: households?.length ?? 0, inserted, pushed });
}
