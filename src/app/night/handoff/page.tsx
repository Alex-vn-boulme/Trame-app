import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/design/icons";
import { Card } from "@/components/Card";
import { SourceFooter } from "@/components/SourceFooter";
import { loadView } from "@/features/views/loadView";
import { hhmm, durationFr } from "@/lib/format";

export const dynamic = "force-dynamic";

/**
 * C2 MorningHandoff — résumé matin 7:18.
 * Gradient header + 3 stats + NightTimeline (deferred — placeholder) + insight + vocal note.
 */
export default async function MorningHandoffPage() {
  const { supabase, householdId, userId } = await loadView();

  // Pull last night's entries (22h yesterday → 7h today).
  const night = new Date();
  night.setHours(7, 0, 0, 0);
  const lastNightStart = new Date(night);
  lastNightStart.setHours(22, 0, 0, 0);
  lastNightStart.setDate(lastNightStart.getDate() - 1);

  const { data: entries } = await supabase
    .from("entries")
    .select("id, type, payload, who, created_at")
    .eq("household_id", householdId)
    .gte("created_at", lastNightStart.toISOString())
    .lt("created_at", night.toISOString())
    .order("created_at", { ascending: true });

  const biberons = (entries ?? []).filter((e) => e.type === "biberon");
  const changes = (entries ?? []).filter((e) => e.type === "change");
  const siestes = (entries ?? []).filter((e) => e.type === "sieste");
  const totalSleepMs = siestes.reduce((acc, s) => {
    const p = (s.payload ?? {}) as Record<string, unknown>;
    if (typeof p.startAt === "string" && typeof p.endAt === "string") {
      return acc + (+new Date(p.endAt) - +new Date(p.startAt));
    }
    return acc;
  }, 0);

  // Identify who was on duty (the parent OTHER than current user, if any).
  const otherEntries = (entries ?? []).filter((e) => e.who && e.who !== userId);
  const onDutyInitial = otherEntries[0]?.who === userId ? "L" : "T";

  return (
    <div className="flex min-h-dvh flex-col bg-bg pb-12">
      <header
        className="px-4"
        style={{
          paddingTop: "max(env(safe-area-inset-top), 28px)",
          paddingBottom: 24,
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--accent) 10%, transparent) 0%, var(--bg) 100%)",
        }}
      >
        <Link href="/chat" aria-label="Retour" className="-ml-1.5 flex h-8 w-8 items-center justify-center text-sub">
          <Icon name="arrow" size={18} className="rotate-180" />
        </Link>
        <h1 className="mt-2 font-serif text-[28px] leading-[1.05] tracking-[-0.02em] text-ink">
          Bonjour.
        </h1>
        <p className="mt-1 font-serif text-[18px] leading-tight text-ink">
          {onDutyInitial === "T" ? "Thomas" : "Léa"} a tenu la nuit. Voici son résumé.
        </p>
      </header>

      <main className="space-y-4 px-4">
        {/* 3 stats card */}
        <Card>
          <div className="grid grid-cols-3 divide-x" style={{ borderColor: "var(--hair)" }}>
            <Stat label="biberons" value={String(biberons.length)} />
            <Stat label="changes" value={String(changes.length)} />
            <Stat label="sommeil" value={totalSleepMs > 0 ? durationFr(totalSleepMs) : "—"} />
          </div>
        </Card>

        {/* Frise (placeholder) */}
        <Card pad={12}>
          <p className="font-sans text-[11px] uppercase tracking-[0.04em] text-sub">
            Frise 22h → 7h
          </p>
          <NightTimelinePlaceholder
            startMs={+lastNightStart}
            endMs={+night}
            events={(entries ?? []).map((e) => ({
              t: +new Date(e.created_at),
              type: e.type,
            }))}
          />
        </Card>

        {/* Insight Pia */}
        <div
          className="rounded-2xl"
          style={{
            background: "color-mix(in srgb, var(--accent) 10%, transparent)",
            border: "0.5px solid color-mix(in srgb, var(--accent) 30%, transparent)",
            padding: 16,
          }}
        >
          <div className="flex items-center gap-2">
            <Icon name="sparkle" size={14} className="text-accent" />
            <span className="font-sans text-[10.5px] font-semibold uppercase tracking-[0.04em] text-accent">
              Pia · observation
            </span>
          </div>
          <p className="mt-1.5 font-serif text-[15px] leading-tight text-ink">
            {biberons.length >= 3
              ? "Plus de biberons que la nuit dernière. Pas de signal d'alerte — possible poussée de croissance."
              : "Nuit globalement calme — sieste cumulée correcte pour cet âge."}
          </p>
          <SourceFooter heuristic />
        </div>

        {/* Vocal note quoted */}
        {(entries ?? []).find((e) => e.type === "note") && (
          <Card>
            <p className="font-serif text-[14.5px] italic leading-tight text-ink">
              «{" "}
              {((entries ?? []).find((e) => e.type === "note")?.payload as { text?: string })?.text ?? "…"}
              {" »"}
            </p>
            <p className="mt-2 font-mono text-[10.5px] text-sub">
              {hhmm(new Date((entries ?? []).find((e) => e.type === "note")!.created_at))} · note
            </p>
          </Card>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2 text-center">
      <p className="font-serif text-[22px] leading-none text-ink tabular-nums">{value}</p>
      <p className="mt-1 font-sans text-[10.5px] uppercase tracking-[0.04em] text-sub">{label}</p>
    </div>
  );
}

function NightTimelinePlaceholder({
  startMs,
  endMs,
  events,
}: {
  startMs: number;
  endMs: number;
  events: { t: number; type: string }[];
}) {
  const span = endMs - startMs;
  return (
    <div className="relative mt-3 h-8 w-full rounded-md bg-soft">
      {events.map((ev, i) => (
        <span
          key={i}
          className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full"
          style={{
            left: `${((ev.t - startMs) / span) * 100}%`,
            background:
              ev.type === "biberon" ? "#3f8fb3" :
              ev.type === "change" ? "var(--good)" :
              ev.type === "sieste" ? "#7a6fc0" :
              "var(--accent)",
          }}
          aria-label={ev.type}
        />
      ))}
      <span className="absolute bottom-0 left-1 font-mono text-[10px] text-sub">22h</span>
      <span className="absolute bottom-0 right-1 font-mono text-[10px] text-sub">7h</span>
    </div>
  );
}

// Avatar import kept to allow drop-in reuse; suppress unused warning.
void Avatar;
