import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/design/icons";
import { Pill } from "@/components/Pill";
import { Card } from "@/components/Card";
import { hhmm, dateLongFr } from "@/lib/format";
import { computeStage, formatStage } from "@/domain/stages";
import { CATEGORY_META } from "@/features/chat/categoryMeta";
import { entryTitle } from "@/features/chat/extractFields";
import { EntryRow } from "@/features/views/EntryRow";
import { loadView } from "@/features/views/loadView";
import { ENTRY_TYPES, type EntryType } from "@/domain/types";

export const dynamic = "force-dynamic";

/**
 * B1 Dashboard — accueil briefing.
 * Brief: sobre header + carte briefing Pia + grille MiniCard (RDV + bébé) +
 * "Tout à faire · partagé" par catégorie + "Pia propose · aujourd'hui".
 */
export default async function DashboardPage() {
  const { supabase, householdId, userId, members, memberByUserId } = await loadView();
  const me = memberByUserId.get(userId);
  const greetingName = me?.name?.split(/[ .]/)[0] ?? me?.initial ?? "";

  // Child (for stage in header).
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
    : "Pia";

  // Counts of open entries by category.
  const { data: openEntries } = await supabase
    .from("entries")
    .select("id, type, payload, due_at, who, status, recommendation_id, created_at")
    .eq("household_id", householdId)
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(60);

  const counts = new Map<EntryType, { total: number; latest: { id: string; title: string; who?: string } | null }>();
  for (const t of ENTRY_TYPES) counts.set(t, { total: 0, latest: null });
  for (const e of openEntries ?? []) {
    if (!ENTRY_TYPES.includes(e.type)) continue;
    const c = counts.get(e.type)!;
    c.total++;
    if (!c.latest) {
      c.latest = {
        id: e.id,
        title: entryTitle(e.type, e.payload),
        who: typeof e.who === "string" ? e.who : undefined,
      };
    }
  }

  // Next RDV.
  const nextRdv = (openEntries ?? []).find((e) => e.type === "rdv");

  // Today's metrics for the briefing card.
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const { data: todayEntries } = await supabase
    .from("entries")
    .select("type, payload")
    .eq("household_id", householdId)
    .gte("created_at", todayStart.toISOString());
  const todayBiberon = (todayEntries ?? []).filter((e) => e.type === "biberon").length;
  const todayChange = (todayEntries ?? []).filter((e) => e.type === "change").length;


  return (
    <div className="flex min-h-dvh flex-col bg-bg pb-32">
      <header
        className="bg-surface px-4"
        style={{
          paddingTop: "max(env(safe-area-inset-top), 18px)",
          paddingBottom: 18,
        }}
      >
        <p className="font-sans text-[11px] uppercase tracking-[0.06em] text-sub">
          {dateLongFr(new Date())}
        </p>
        <div className="mt-2 flex items-start justify-between gap-3">
          <h1 className="font-serif text-[28px] leading-[1.05] tracking-[-0.02em] text-ink">
            Bonjour{greetingName ? ` ${greetingName}` : ""}.
          </h1>
          <span className="inline-flex">
            {members.map((m, i) => (
              <span key={m.userId} style={{ marginLeft: i ? -9 : 0 }}>
                <Avatar initial={m.initial} color={m.color ?? undefined} size={26} ring />
              </span>
            ))}
          </span>
        </div>
        <p className="mt-1 font-sans text-[12.5px] text-sub">{stageLabel}</p>
      </header>

      <main className="space-y-4 px-4 pt-4">
        {/* Briefing card */}
        <Card>
          <div className="mb-2 flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
              style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
            >
              <Icon name="sparkle" size={11} />
              <span className="font-sans text-[10.5px] font-semibold uppercase tracking-[0.02em]">
                Pia · briefing
              </span>
            </span>
            <span className="ml-auto font-mono text-[11px] text-sub">{hhmm(new Date())}</span>
          </div>
          <p className="font-serif text-[16px] leading-tight text-ink">
            Tu as <span className="font-mono font-semibold">{todayBiberon}</span> biberon{todayBiberon > 1 ? "s" : ""} et{" "}
            <span className="font-mono font-semibold">{todayChange}</span> change{todayChange > 1 ? "s" : ""} aujourd&apos;hui.
            {(openEntries?.length ?? 0) > 0 && (
              <> Il reste <span className="font-mono font-semibold">{openEntries!.length}</span> élément
              {openEntries!.length > 1 ? "s" : ""} en attente.</>
            )}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Link
              href="/todo"
              className="rounded-full bg-soft px-3 py-1 font-sans text-[12px] text-ink"
            >
              Voir tout à faire
            </Link>
            <Link
              href="/tracking"
              className="rounded-full bg-soft px-3 py-1 font-sans text-[12px] text-ink"
            >
              Journée bébé
            </Link>
          </div>
        </Card>

        {/* Mini cards grid */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/todo" className="block">
            <Card pad={14}>
              <p className="font-sans text-[10.5px] uppercase tracking-[0.04em] text-sub">Prochain RDV</p>
              <p className="mt-1 truncate font-serif text-[15px] text-ink">
                {nextRdv ? entryTitle(nextRdv.type, nextRdv.payload) : "—"}
              </p>
              <p className="font-mono text-[11px] text-sub">
                {nextRdv?.due_at ? new Date(nextRdv.due_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "à programmer"}
              </p>
            </Card>
          </Link>
          <Link href="/vigilance" className="block">
            <Card pad={14}>
              <p className="font-sans text-[10.5px] uppercase tracking-[0.04em] text-sub">Bébé</p>
              <p className="mt-1 truncate font-serif text-[15px] text-ink">{stageLabel}</p>
              <p className="font-mono text-[11px] text-sub">tout va bien</p>
            </Card>
          </Link>
        </div>

        {/* À faire · partagé */}
        <section>
          <header className="mb-2 flex items-center justify-between">
            <h2 className="font-sans text-[11px] uppercase tracking-[0.04em] text-sub">
              Tout à faire · partagé
            </h2>
            <Link href="/todo" className="font-sans text-[11.5px] text-accent">
              Tout voir →
            </Link>
          </header>
          <div className="space-y-1.5">
            {ENTRY_TYPES.filter((t) => (counts.get(t)?.total ?? 0) > 0)
              .slice(0, 5)
              .map((t) => {
                const c = counts.get(t)!;
                const meta = CATEGORY_META[t];
                if (!c.latest) return null;
                return (
                  <div
                    key={t}
                    className="flex items-center gap-3 rounded-xl bg-card px-3 py-2.5"
                    style={{ border: "0.5px solid var(--hair)" }}
                  >
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
                      <p className="truncate font-serif text-[14px] text-ink">{c.latest.title}</p>
                      <p className="font-sans text-[11.5px] text-sub">{meta.label}</p>
                    </div>
                    <Pill color="var(--sub)" bg="var(--soft)">
                      <span className="font-mono">{c.total}</span>
                    </Pill>
                    {c.latest.who && <Avatar who={c.latest.who === "T" ? "T" : "L"} size={16} />}
                  </div>
                );
              })}
            {ENTRY_TYPES.every((t) => (counts.get(t)?.total ?? 0) === 0) && (
              <p className="rounded-xl bg-card px-3 py-4 text-center font-sans text-[12.5px] text-sub" style={{ border: "0.5px solid var(--hair)" }}>
                Rien à faire pour le moment. Demande à Pia.
              </p>
            )}
          </div>
        </section>

        {/* Pia propose · aujourd'hui */}
        <section>
          <header className="mb-2 flex items-center justify-between">
            <h2 className="font-sans text-[11px] uppercase tracking-[0.04em] text-sub">
              Pia propose · aujourd&apos;hui
            </h2>
          </header>
          <div className="space-y-1.5">
            {(openEntries ?? [])
              .filter((e) => e.type === "note" || e.type === "admin")
              .slice(0, 3)
              .map((e) => (
                <EntryRow
                  key={e.id}
                  id={e.id}
                  type={e.type as EntryType}
                  title={entryTitle(e.type, e.payload)}
                  meta={CATEGORY_META[e.type as EntryType].label}
                  payload={(e.payload as Record<string, unknown>) ?? {}}
                  status={e.status}
                  proposed
                  creator={typeof e.who === "string" ? memberByUserId.get(e.who) ?? null : null}
                  members={members}
                />
              ))}
            {(openEntries ?? []).filter((e) => e.type === "note" || e.type === "admin").length === 0 && (
              <p className="rounded-xl bg-card px-3 py-4 text-center font-sans text-[12.5px] text-sub" style={{ border: "0.5px solid var(--hair)" }}>
                Pia n&apos;a rien à proposer pour aujourd&apos;hui.
              </p>
            )}
          </div>
        </section>
      </main>

      {/* FAB → chat */}
      <Link
        href="/chat"
        aria-label="Discuter avec Pia"
        className="fixed bottom-6 right-6 z-10 flex h-14 w-14 items-center justify-center rounded-full text-white"
        style={{
          background: "var(--accent)",
          boxShadow: "0 12px 30px color-mix(in srgb, var(--accent) 45%, transparent)",
        }}
      >
        <Icon name="sparkle" size={22} />
      </Link>
    </div>
  );
}
