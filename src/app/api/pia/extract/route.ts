import { NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getOpenAI } from "@/lib/pia/openai";
import { loadPiaContext } from "@/lib/pia/context";
import { piaExtractSystem } from "@/lib/pia/prompts";
import { ENTRY_TYPES, LLMExtractionSchema } from "@/domain/types";
import type { Tone } from "@/components/ThemeProvider";

/**
 * POST /api/pia/extract
 *
 * Input (multipart/form-data):
 *   - text?: string         (typed message)
 *   - audio?: File          (voice memo, audio/webm or audio/mp4)
 *   - tone?: 'sobre'|'warm'|'drole'   (default 'warm')
 *
 * Pipeline:
 *   1. Auth + household resolution
 *   2. If audio → Whisper STT (fr) → text
 *   3. Insert user message
 *   4. Load context (child + recent entries)
 *   5. LLM structured extraction → { entries, assistantReply }
 *   6. RAG guard: reject any recommendation_id not in `recommendations` table
 *   7. Insert assistant message + entries
 *   8. Return { messageId, transcribedText, entries, assistantReply }
 *
 * Runtime: Node (Whisper File upload + Supabase Storage SDK are easier
 * outside Edge). 60s max for long dictations.
 */
export const runtime = "nodejs";
export const maxDuration = 60;

const ToneSchema = z.enum(["sobre", "warm", "drole"]).default("warm");

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const text = (formData.get("text") as string | null)?.trim() ?? "";
    const audio = formData.get("audio");
    const tone: Tone = ToneSchema.parse(formData.get("tone") ?? "warm");

    if (!text && !(audio instanceof File)) {
      return NextResponse.json({ error: "text or audio required" }, { status: 400 });
    }

    // ── Auth ─────────────────────────────────────────────────────────────
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
      return NextResponse.json({ error: "no household — finish onboarding" }, { status: 400 });
    }
    const householdId = member.household_id;

    // ── 1. Transcribe audio if present ───────────────────────────────────
    let transcribedText = text;
    let audioPath: string | null = null;
    let audioDurationMs: number | null = null;

    if (audio instanceof File && audio.size > 0) {
      const buf = await audio.arrayBuffer();
      audioPath = `${householdId}/${crypto.randomUUID()}.webm`;
      const { error: upErr } = await supabase.storage
        .from("audio")
        .upload(audioPath, buf, { contentType: audio.type || "audio/webm", upsert: false });
      if (upErr) {
        console.error("[pia/extract] audio upload failed", upErr);
        // Fall through — we can still try Whisper directly on the buffer.
      }

      const oai = getOpenAI();
      const file = new File([buf], audio.name || "voice.webm", { type: audio.type || "audio/webm" });
      const tr = await oai.audio.transcriptions.create({
        model: "whisper-1",
        file,
        language: "fr",
        response_format: "verbose_json",
      });
      transcribedText = (tr.text ?? "").trim();
      audioDurationMs = "duration" in tr && typeof tr.duration === "number"
        ? Math.round(tr.duration * 1000)
        : null;

      if (!transcribedText) {
        return NextResponse.json({
          error: "transcription_empty",
          message: "Pia n'a rien capté de cette dictée.",
        }, { status: 422 });
      }
    }

    // ── 2. Insert user message ───────────────────────────────────────────
    const { data: userMsg, error: userMsgErr } = await supabase
      .from("messages")
      .insert({
        household_id: householdId,
        user_id: userId,
        role: "user",
        text: transcribedText,
        audio_path: audioPath,
        audio_duration_ms: audioDurationMs,
      })
      .select("id, created_at")
      .single();
    if (userMsgErr || !userMsg) {
      console.error("[pia/extract] user message insert failed", userMsgErr);
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }

    // ── 3. Load context for the LLM ──────────────────────────────────────
    const ctx = await loadPiaContext(supabase, householdId);

    // ── 4. Structured LLM extraction ─────────────────────────────────────
    const system = piaExtractSystem({
      tone,
      date: new Date().toISOString(),
      childName: ctx.childName ?? undefined,
      stageLabel: ctx.stageLabel ?? undefined,
      weightKg: ctx.weightKg,
    });

    // AI SDK v6: generateObject was removed — use generateText with Output.object().
    // Direct Anthropic provider — reads ANTHROPIC_API_KEY from env.
    const { output: extraction } = await generateText({
      model: anthropic("claude-haiku-4-5"),
      output: Output.object({ schema: LLMExtractionSchema }),
      system,
      prompt: transcribedText,
      temperature: 0.2,
    });

    console.log("[pia/extract] LLM output", JSON.stringify(extraction, null, 2));

    const admin = process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : supabase;

    // ── 5a. Resolve free-text `assignee` → user_id via household_members.
    //    LLM gives "Thomas" / "Léa" / "moi" — we map to a real user_id.
    const { data: hmRows } = await admin
      .from("household_members")
      .select("user_id, initial, display_name")
      .eq("household_id", householdId);
    // Build label → user_id with multiple aliases per member:
    //  - exact display_name ("alexandre.boulme")
    //  - first name token ("alexandre", "boulme")
    //  - prefixes of first name (down to 3 chars) so "alex" matches "alexandre"
    //  - initial ("A")
    const memberByLabel = new Map<string, string>();
    function add(label: string | null | undefined, id: string) {
      if (!label) return;
      memberByLabel.set(label.toLowerCase().trim(), id);
    }
    for (const m of hmRows ?? []) {
      const id = m.user_id;
      add(m.initial, id);
      add(m.display_name, id);
      if (m.display_name) {
        for (const token of m.display_name.split(/[.\s_-]+/).filter(Boolean)) {
          add(token, id);
          // also register all prefixes ≥ 3 chars ("alex" → "alexandre")
          for (let len = Math.min(token.length, 8); len >= 3; len--) {
            add(token.slice(0, len), id);
          }
        }
      }
    }
    function resolveAssignee(name: string | undefined): string | null {
      if (!name) return null;
      const norm = name.toLowerCase().trim();
      if (norm === "moi" || norm === "je" || norm === "moi-même") return userId;
      return memberByLabel.get(norm) ?? null;
    }

    // ── 5b. Recommendation linking is deferred (LLM schema would exceed
    //    Anthropic's 24-optional-fields cap); a follow-up pass against the
    //    `recommendations` table can backfill matches.

    // ── 6. Insert assistant message + entries ────────────────────────────

    const source: "vocal" | "text" = audio instanceof File ? "vocal" : "text";
    const entryRows = extraction.entries
      .filter((e) => ENTRY_TYPES.includes(e.type))
      .map((e) => {
        // Strip `assignee` out of payload before insert — it's not a real
        // payload field, just a transport hint from the LLM.
        const rawPayload = (e.payload ?? {}) as Record<string, unknown>;
        const { assignee, ...cleanPayload } = rawPayload;
        const assignedTo = resolveAssignee(typeof assignee === "string" ? assignee : undefined);

        // Per-type defaults — fill in sensible values the LLM doesn't dictate.
        if (e.type === "course" && typeof cleanPayload.qty !== "number") {
          cleanPayload.qty = 1;
        }

        return {
          household_id: householdId,
          child_id: ctx.childId,
          type: e.type,
          payload: cleanPayload,
          who: userId,
          assigned_to: assignedTo,
          source,
          confidence: e.confidence,
          recommendation_id: null,
        };
      });

    // ── 6b. Duplicate guard ──────────────────────────────────────────────
    // Time-bearing types: skip if same type within ±WINDOW_MIN minutes.
    // Courses: skip if an OPEN course with the same item (case-insensitive)
    // already exists. Lets the parent re-dictate without spamming the list.
    type RowToInsert = (typeof entryRows)[number];
    const TIME_KEYS: Partial<Record<RowToInsert["type"], { key: string; windowMin: number }>> = {
      biberon: { key: "takenAt",   windowMin: 15 },
      change:  { key: "changedAt", windowMin: 10 },
      sieste:  { key: "startAt",   windowMin: 30 },
      medic:   { key: "takenAt",   windowMin: 30 },
      rdv:     { key: "date",      windowMin: 60 },
    };

    function normItem(s: unknown): string {
      return typeof s === "string" ? s.toLowerCase().replace(/\s+/g, " ").trim() : "";
    }

    // Pre-fetch open courses once (cheaper than one query per LLM-emitted course).
    const courseNorms = entryRows
      .filter((r) => r.type === "course")
      .map((r) => normItem((r.payload as Record<string, unknown>).item))
      .filter(Boolean);
    const existingOpenCourseItems = new Set<string>();
    if (courseNorms.length > 0) {
      const { data: openCourses } = await admin
        .from("entries")
        .select("payload")
        .eq("household_id", householdId)
        .eq("type", "course")
        .eq("status", "open");
      for (const c of openCourses ?? []) {
        const item = normItem((c.payload as Record<string, unknown> | null)?.item);
        if (item) existingOpenCourseItems.add(item);
      }
    }

    const skippedDuplicates: string[] = [];
    const rowsToInsert: RowToInsert[] = [];
    for (const row of entryRows) {
      // Course dedup by item name.
      if (row.type === "course") {
        const item = normItem((row.payload as Record<string, unknown>).item);
        if (item && existingOpenCourseItems.has(item)) {
          skippedDuplicates.push(`course:${item}`);
          continue;
        }
        if (item) existingOpenCourseItems.add(item); // also dedupe within this batch
        rowsToInsert.push(row);
        continue;
      }
      // Time dedup for the other types.
      const cfg = TIME_KEYS[row.type];
      const ts = cfg ? (row.payload as Record<string, unknown>)[cfg.key] : undefined;
      if (!cfg || typeof ts !== "string") {
        rowsToInsert.push(row);
        continue;
      }
      const t = new Date(ts).getTime();
      if (isNaN(t)) {
        rowsToInsert.push(row);
        continue;
      }
      const lo = new Date(t - cfg.windowMin * 60_000).toISOString();
      const hi = new Date(t + cfg.windowMin * 60_000).toISOString();
      const { data: near } = await admin
        .from("entries")
        .select(`id, payload->>${cfg.key} as ts`)
        .eq("household_id", householdId)
        .eq("type", row.type)
        .neq("status", "ignored")
        .gte(`payload->>${cfg.key}`, lo)
        .lte(`payload->>${cfg.key}`, hi)
        .limit(1);
      if ((near ?? []).length > 0) {
        skippedDuplicates.push(`${row.type}@${ts}`);
        continue;
      }
      rowsToInsert.push(row);
    }
    if (skippedDuplicates.length > 0) {
      console.log("[pia/extract] skipped near-duplicates", skippedDuplicates);
    }

    let insertedIds: string[] = [];
    if (rowsToInsert.length > 0) {
      const { data: inserted, error: insErr } = await admin
        .from("entries")
        .insert(rowsToInsert)
        .select("id");
      if (insErr) {
        console.error("[pia/extract] entries insert failed", insErr);
      } else {
        insertedIds = (inserted ?? []).map((r) => r.id);
      }
    }

    const dupNote =
      skippedDuplicates.length > 0
        ? ` (déjà noté il y a peu — j'ignore le doublon)`
        : "";
    const finalReply = extraction.assistantReply + dupNote;

    const { data: piaMsg } = await supabase
      .from("messages")
      .insert({
        household_id: householdId,
        role: "assistant",
        text: finalReply,
        entries_created: insertedIds,
      })
      .select("id, created_at")
      .single();

    return NextResponse.json({
      userMessageId: userMsg.id,
      transcribedText,
      assistantMessageId: piaMsg?.id ?? null,
      assistantReply: finalReply,
      entries: rowsToInsert.map((r) => ({
        type: r.type,
        payload: r.payload,
        confidence: r.confidence,
        recommendationId: r.recommendation_id,
        assignedTo: r.assigned_to,
      })),
      entryIds: insertedIds,
    });
  } catch (err) {
    console.error("[pia/extract] unhandled", err);
    return NextResponse.json(
      { error: "internal", message: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
