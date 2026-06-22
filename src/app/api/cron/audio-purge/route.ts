import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * /api/cron/audio-purge — runs daily at 3h.
 *
 * Deletes audio blobs older than 90 days from the `audio` Storage bucket.
 * The `messages.audio_path` column keeps the historical reference so the
 * UI can show "audio expiré · garde le texte transcrit".
 *
 * The retention window matches the brief's RGPD posture: short-lived voice,
 * persistent transcript.
 */
export const runtime = "nodejs";
export const maxDuration = 60;

const RETENTION_DAYS = 90;

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "service role key not configured" }, { status: 500 });
  }

  const admin = createAdminClient();
  const cutoffIso = new Date(Date.now() - RETENTION_DAYS * 24 * 3_600_000).toISOString();

  // Pull stale paths from messages (audio_path is the storage key).
  const { data: stale } = await admin
    .from("messages")
    .select("id, audio_path")
    .lt("created_at", cutoffIso)
    .not("audio_path", "is", null)
    .limit(500);

  if (!stale || stale.length === 0) {
    return NextResponse.json({ deleted: 0 });
  }

  const paths = stale
    .map((m) => m.audio_path)
    .filter((p): p is string => typeof p === "string");

  const { error: rmErr } = await admin.storage.from("audio").remove(paths);
  if (rmErr) {
    console.error("[cron/audio-purge] storage remove failed", rmErr);
    return NextResponse.json({ error: "storage_failed" }, { status: 500 });
  }

  // Null out the references so we don't try again.
  await admin
    .from("messages")
    .update({ audio_path: null })
    .in("id", stale.map((m) => m.id));

  return NextResponse.json({ deleted: paths.length });
}
