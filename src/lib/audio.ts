/**
 * Web MediaRecorder wrapper — push-to-talk audio capture for the chat composer.
 *
 * Strategy:
 *   - Single shared MediaStream (cached after first permission grant).
 *   - audio/webm;codecs=opus when supported, falls back to MIME defaults.
 *   - Recording yields a `Blob` ready to POST to /api/pia/extract.
 *
 * iOS Safari caveats:
 *   - getUserMedia requires HTTPS or localhost.
 *   - When the PWA is NOT installed to the home screen, mic permission is
 *     re-prompted every session. When installed, it persists.
 *   - MediaRecorder is supported since iOS 14.3.
 */

let cachedStream: MediaStream | null = null;

export async function getMicStream(): Promise<MediaStream> {
  if (cachedStream && cachedStream.active) return cachedStream;
  const s = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });
  cachedStream = s;
  return s;
}

export function pickMimeType(): string | undefined {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  for (const t of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) return t;
  }
  return undefined;
}

export type Recorder = {
  start: () => void;
  stop: () => Promise<{ blob: Blob; durationMs: number; mimeType: string }>;
  cancel: () => void;
  recorder: MediaRecorder;
};

export async function createRecorder(): Promise<Recorder> {
  const stream = await getMicStream();
  const mimeType = pickMimeType();
  const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  const chunks: BlobPart[] = [];
  let startedAt = 0;

  rec.addEventListener("dataavailable", (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  });

  return {
    recorder: rec,
    start: () => {
      chunks.length = 0;
      startedAt = performance.now();
      rec.start(250); // emit chunks every 250ms so the blob is ready quickly on stop
    },
    stop: () =>
      new Promise((resolve) => {
        rec.addEventListener(
          "stop",
          () => {
            const blob = new Blob(chunks, { type: rec.mimeType || mimeType || "audio/webm" });
            resolve({
              blob,
              durationMs: Math.round(performance.now() - startedAt),
              mimeType: rec.mimeType || mimeType || "audio/webm",
            });
          },
          { once: true },
        );
        rec.stop();
      }),
    cancel: () => {
      try {
        if (rec.state !== "inactive") rec.stop();
      } catch {
        // already stopped
      }
      chunks.length = 0;
    },
  };
}

/** Release the shared mic stream — call on logout / tab visibility loss. */
export function releaseMic(): void {
  if (cachedStream) {
    for (const t of cachedStream.getTracks()) t.stop();
    cachedStream = null;
  }
}
