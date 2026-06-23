import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/design/icons";
import { Card } from "@/components/Card";
import { ScreenHeader } from "@/features/views/ScreenHeader";
import { CATEGORY_META } from "@/features/chat/categoryMeta";
import { entryTitle } from "@/features/chat/extractFields";
import { loadView } from "@/features/views/loadView";
import { computeStage, formatStage } from "@/domain/stages";
import { hhmm, dateFr, durationFr } from "@/lib/format";
import type { EntryType } from "@/domain/types";

export const dynamic = "force-dynamic";

/**
 * B5 Tracking — journée post-naissance. 3 stat cards (biberon / change / sieste)
 * + timeline of today's events + 3 quick-add buttons that deep-link to the
 * chat with a prefilled prompt.
 */
export default async function TrackingPage() {
  const { supabase, householdId } = await loadView();

  const { data: child } = await supabase
    .from("children")
    .select("name, birth_date, due_date")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  const stageLabel = child && (child.birth_date || child.due_date)
    ? formatStage(
        computeStage({
          birthDate: child.birth_date ? new Date(child.birth_date) : null,
          dueDate: child.due_date ? new Date(child.due_date) : null,
        }),
        child.name,
      )
    : "Suivi";

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: entries } = await supabase
    .from("entries")
    .select("id, type, payload, who, created_at")
    .eq("household_id", householdId)
    .gte("created_at", todayStart.toISOString())
    .in("type", ["biberon", "change", "sieste"])
    .order("created_at", { ascending: false })
    .limit(60);

  const biberons = (entries ?? []).filter((e) => e.type === "biberon");
  const biberonsMl = biberons.reduce((sum, e) => {
    const v = (e.payload as Record<string, unknown> | null)?.volumeMl;
    return sum + (typeof v === "number" ? v : 0);
  }, 0);
  const changes = (entries ?? []).filter((e) => e.type === "change");
  const siestes = (entries ?? []).filter((e) => e.type === "sieste");

  const totalSiesteMs = siestes.reduce((acc, s) => {
    const p = (s.payload ?? {}) as Record<string, unknown>;
    if (typeof p.startAt === "string" && typeof p.endAt === "string") {
      return acc + (new Date(p.endAt).getTime() - new Date(p.startAt).getTime());
    }
    return acc;
  }, 0);

  return (
    <div className="flex min-h-dvh flex-col bg-bg pb-32">
      <ScreenHeader title={stageLabel} subtitle={dateFr(new Date())} />

      <main className="px-4 pt-4">
        {/* 3 stat cards */}
        <div className="grid grid-cols-3 gap-2">
          <StatCard
            icon="bottle"
            label={biberonsMl > 0 ? `${biberons.length} biberons` : "biberons"}
            value={biberonsMl > 0 ? `${biberonsMl} ml` : String(biberons.length)}
            color="#3f8fb3"
          />
          <StatCard icon="diaper" label="changes" value={String(changes.length)} color="var(--good)" />
          <StatCard
            icon="moon"
            label="sieste"
            value={totalSiesteMs > 0 ? durationFr(totalSiesteMs) : "—"}
            color="#7a6fc0"
          />
        </div>

        {/* Timeline */}
        <section className="mt-5">
          <h2 className="mb-2 font-sans text-[11px] uppercase tracking-[0.04em] text-sub">
            Aujourd&apos;hui
          </h2>
          {(entries ?? []).length === 0 ? (
            <p
              className="rounded-xl bg-card px-3 py-6 text-center font-sans text-[13px] text-sub"
              style={{ border: "0.5px solid var(--hair)" }}
            >
              Rien encore. Tape sur un raccourci en bas pour commencer.
            </p>
          ) : (
            <ol className="space-y-1.5">
              {(entries ?? []).map((e) => {
                const meta = CATEGORY_META[e.type as EntryType];
                return (
                  <li
                    key={e.id}
                    className="flex items-center gap-3 rounded-xl bg-card px-3 py-2.5"
                    style={{ border: "0.5px solid var(--hair)" }}
                  >
                    <span className="w-12 shrink-0 font-mono text-[12px] text-sub">
                      {hhmm(new Date(e.created_at))}
                    </span>
                    <span
                      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        background: `color-mix(in srgb, ${meta.color} 14%, transparent)`,
                        color: meta.color,
                      }}
                    >
                      <Icon name={meta.icon} size={13} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-serif text-[14px] text-ink">
                        {entryTitle(e.type as EntryType, e.payload)}
                      </p>
                    </div>
                    {typeof e.who === "string" && (
                      <Avatar who={e.who === "T" ? "T" : "L"} size={16} />
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </main>

      {/* Quick-add bottom bar */}
      <div
        className="fixed inset-x-0 bottom-0 mx-auto flex max-w-[430px] gap-2 bg-surface px-4"
        style={{
          paddingTop: 10,
          paddingBottom: "max(env(safe-area-inset-bottom), 14px)",
          borderTop: "0.5px solid var(--hair)",
        }}
      >
        <QuickAdd icon="bottle" label="Biberon" href="/chat?prefill=Biberon%20de%20" />
        <QuickAdd icon="diaper" label="Change" href="/chat?prefill=Change%20" />
        <QuickAdd icon="moon" label="Sieste" href="/chat?prefill=Sieste%20" />
        <Link
          href="/chat"
          aria-label="Pia"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white"
          style={{
            background: "var(--accent)",
            boxShadow: "0 6px 20px color-mix(in srgb, var(--accent) 35%, transparent)",
          }}
        >
          <Icon name="sparkle" size={18} />
        </Link>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: "bottle" | "diaper" | "moon"; label: string; value: string; color: string }) {
  return (
    <Card pad={12}>
      <div className="flex items-center gap-1.5">
        <span
          className="inline-flex h-5 w-5 items-center justify-center rounded-md"
          style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}
        >
          <Icon name={icon} size={11} />
        </span>
        <span className="font-sans text-[10.5px] uppercase tracking-[0.04em] text-sub">
          {label}
        </span>
      </div>
      <p className="mt-2 font-serif text-[22px] leading-none text-ink tabular-nums">{value}</p>
    </Card>
  );
}

function QuickAdd({ icon, label, href }: { icon: "bottle" | "diaper" | "moon"; label: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex flex-1 flex-col items-center justify-center rounded-2xl bg-card py-2.5 text-ink"
      style={{ border: "0.5px solid var(--hair)" }}
    >
      <Icon name={icon} size={18} className="text-sub" />
      <span className="mt-1 font-sans text-[11px]">{label}</span>
    </Link>
  );
}
