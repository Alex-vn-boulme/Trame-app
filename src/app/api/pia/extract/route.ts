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

    // ── 5. RAG guard: validate every recommendation_id exists ────────────
    const recIds = Array.from(
      new Set(
        extraction.entries
          .map((e) => e.recommendationId)
          .filter((id): id is string => typeof id === "string" && id.length > 0),
      ),
    );
    if (recIds.length > 0) {
      const { data: validRecs } = await supabase
        .from("recommendations")
        .select("id")
        .in("id", recIds);
      const validSet = new Set((validRecs ?? []).map((r) => r.id));
      // Strip any hallucinated id rather than failing the whole request.
      extraction.entries = extraction.entries.map((e) =>
        e.recommendationId && !validSet.has(e.recommendationId)
          ? { ...e, recommendationId: null }
          : e,
      );
    }

    // ── 6. Insert assistant message + entries ────────────────────────────
    const admin = process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : supabase;

    const source: "vocal" | "text" = audio instanceof File ? "vocal" : "text";
    const entryRows = extraction.entries
      .filter((e) => ENTRY_TYPES.includes(e.type))
      .map((e) => ({
        household_id: householdId,
        child_id: e.childId ?? ctx.childId,
        type: e.type,
        payload: e.payload,
        who: userId,
        source,
        confidence: e.confidence,
        recommendation_id: e.recommendationId ?? null,
      }));

    let insertedIds: string[] = [];
    if (entryRows.length > 0) {
      const { data: inserted, error: insErr } = await admin
        .from("entries")
        .insert(entryRows)
        .select("id");
      if (insErr) {
        console.error("[pia/extract] entries insert failed", insErr);
      } else {
        insertedIds = (inserted ?? []).map((r) => r.id);
      }
    }

    const { data: piaMsg } = await supabase
      .from("messages")
      .insert({
        household_id: householdId,
        role: "assistant",
        text: extraction.assistantReply,
        entries_created: insertedIds,
      })
      .select("id, created_at")
      .single();

    return NextResponse.json({
      userMessageId: userMsg.id,
      transcribedText,
      assistantMessageId: piaMsg?.id ?? null,
      assistantReply: extraction.assistantReply,
      entries: extraction.entries,
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
