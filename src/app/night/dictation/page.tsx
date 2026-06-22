"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/design/icons";
import { hhmm } from "@/lib/format";
import { MicButton } from "@/features/chat/MicButton";

/**
 * C1 NightDictation — AMOLED 03:42.
 * Mega 96×96 mic button with triple-halo, mute haptics by passing nothing
 * (parent component triggers the API in the same flow as the day chat).
 */
export default function NightDictationPage() {
  const [now, setNow] = useState<Date>(() => new Date());
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  async function onRecorded(blob: Blob, _ms: number, mimeType: string) {
    const fd = new FormData();
    fd.append("audio", new File([blob], "voice.webm", { type: mimeType }));
    setInfo("Enregistrement envoyé…");
    try {
      const res = await fetch("/api/pia/extract", { method: "POST", body: fd });
      if (res.ok) setInfo("Pia a noté.");
      else setInfo("Hum, raté. Réessaie ?");
    } catch {
      setInfo("Hors-ligne — sera renvoyé à la reconnexion.");
    }
    setTimeout(() => setInfo(null), 4000);
  }

  return (
    <div
      className="flex min-h-dvh flex-col items-center"
      style={{ background: "#0a0a07", color: "#f3efe4" }}
    >
      <header className="flex w-full items-center justify-between px-5 pt-12 pb-6">
        <Link href="/chat" aria-label="Quitter le mode nuit" className="text-sub opacity-60">
          <Icon name="arrow" size={20} className="rotate-180" />
        </Link>
        <span className="font-sans text-[10.5px] uppercase tracking-[0.06em] text-sub opacity-60">
          mode nuit · son coupé
        </span>
        <span className="w-5" aria-hidden />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-16 text-center">
        <p
          className="font-serif text-[56px] leading-none text-ink"
          style={{ fontWeight: 300, letterSpacing: "-0.05em" }}
        >
          {hhmm(now)}
        </p>
        <p className="mt-1 font-sans text-[12px] uppercase tracking-[0.08em] text-sub opacity-70">
          {now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
        </p>

        <div className="mt-12">
          <MicButton onRecorded={onRecorded} size={96} />
        </div>

        <p className="mt-6 font-sans text-[12.5px] text-sub opacity-70">
          tap pour dicter · maintien pour main-libre
        </p>
        {info && (
          <p
            role="status"
            className="mt-4 rounded-full px-3 py-1 font-sans text-[11.5px] text-ink"
            style={{ background: "rgba(243,239,228,0.06)" }}
          >
            {info}
          </p>
        )}

        <div className="mt-12 flex gap-3 opacity-80">
          {(["bottle", "diaper", "moon"] as const).map((i) => (
            <button
              key={i}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-sans text-[12px] text-ink"
              style={{ border: "0.5px solid rgba(243,239,228,0.12)" }}
            >
              <Icon name={i} size={13} />
              {i === "bottle" ? "Biberon" : i === "diaper" ? "Change" : "Sieste"}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
