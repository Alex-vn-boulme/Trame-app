"use client";

import { useRef, useState, type PointerEvent } from "react";
import { Icon } from "@/design/icons";
import { createRecorder, type Recorder } from "@/lib/audio";

/**
 * Push-to-talk mic button.
 *
 * - pointerdown → start MediaRecorder (after acquiring permission)
 * - pointerup / pointerleave → stop + emit blob
 * - Tap (no hold) is treated as start-record-toggle: tap to start, tap again
 *   to send. Long-press is the default UX for one-shot dictation.
 *
 * iOS pointer events: a touch-and-release on the SAME element fires
 * pointerdown → pointerup. pointercancel fires on scroll/gesture interrupt.
 */
export function MicButton({
  onRecorded,
  disabled,
  size = 44,
}: {
  onRecorded: (blob: Blob, durationMs: number, mimeType: string) => void;
  disabled?: boolean;
  size?: number;
}) {
  const [state, setState] = useState<"idle" | "recording" | "starting" | "stopping" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<Recorder | null>(null);
  const startedRef = useRef<number>(0);

  async function start() {
    if (disabled) return;
    setError(null);
    setState("starting");
    try {
      const r = await createRecorder();
      recorderRef.current = r;
      startedRef.current = performance.now();
      r.start();
      setState("recording");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "micro indisponible");
      console.error("[MicButton] start failed", err);
    }
  }

  async function stop() {
    const r = recorderRef.current;
    if (!r) return;
    setState("stopping");
    try {
      const result = await r.stop();
      // Drop sub-300ms presses (accidental tap).
      if (result.durationMs >= 300) {
        onRecorded(result.blob, result.durationMs, result.mimeType);
      }
    } finally {
      recorderRef.current = null;
      setState("idle");
    }
  }

  function onDown(e: PointerEvent<HTMLButtonElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    void start();
  }
  function onUp(e: PointerEvent<HTMLButtonElement>) {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // capture already released
    }
    void stop();
  }
  function onCancel() {
    if (recorderRef.current) {
      recorderRef.current.cancel();
      recorderRef.current = null;
      setState("idle");
    }
  }

  const recording = state === "recording";

  return (
    <button
      type="button"
      onPointerDown={onDown}
      onPointerUp={onUp}
      onPointerCancel={onCancel}
      disabled={disabled || state === "starting" || state === "stopping"}
      aria-label={recording ? "Relâcher pour envoyer" : "Maintenir pour dicter"}
      aria-pressed={recording}
      className="relative flex items-center justify-center rounded-full text-white disabled:opacity-60"
      style={{
        width: size,
        height: size,
        background: "var(--accent)",
        boxShadow: recording
          ? "0 0 0 6px color-mix(in srgb, var(--accent) 15%, transparent), 0 8px 24px color-mix(in srgb, var(--accent) 50%, transparent)"
          : "0 6px 20px color-mix(in srgb, var(--accent) 35%, transparent)",
        transition: "box-shadow 120ms ease-out, transform 120ms ease-out",
        transform: recording ? "scale(1.05)" : "scale(1)",
      }}
      title={error ?? undefined}
    >
      <Icon name="mic" size={Math.round(size * 0.45)} />
      {recording && (
        <span className="sr-only">Enregistrement en cours</span>
      )}
    </button>
  );
}
