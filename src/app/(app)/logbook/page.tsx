import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/design/icons";
import { ScreenHeader } from "@/features/views/ScreenHeader";
import { CATEGORY_META } from "@/features/chat/categoryMeta";
import { entryTitle } from "@/features/chat/extractFields";
import { loadView } from "@/features/views/loadView";
import { hhmm } from "@/lib/format";
import { computeStage, formatStage } from "@/domain/stages";
import type { EntryType } from "@/domain/types";

export const dynamic = "force-dynamic";

/**
 * E2 Logbook — carnet de bord. Vertical timeline grouped by month.
 * Filters: Tout / Premières fois / Santé / Croissance / Photos.
 */
type FilterKey = "all" | "first" | "health" | "growth" | "photos";

export default async function LogbookPage({
  searchParams,
}: {
  searchParams: Promise<{ f?: FilterKey }>;
}) {
  const { supabase, householdId } = await loadView();
  const sp = await searchParams;
  const filter: FilterKey = (sp.f ?? "all") as FilterKey;

  const { data: child } = await supabase
    .from("children")
    .select("name, birth_date")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const typesByFilter: Record<FilterKey, EntryType[] | null> = {
    all: null,
    first: ["jalon"],
    health: ["medic", "symptome"],
    growth: ["jalon"],
    photos: ["jalon"],
  };
  const types = typesByFilter[filter];

  let q = supabase
    .from("entries")
    .select("id, type, payload, who, created_at, child_id")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false })
    .limit(200);
  if (types) q = q.in("type", types);
  const { data: entries } = await q;

  // Group by YYYY-MM.
  const groups = new Map<string, typeof entries>();
  for (const e of entries ?? []) {
    const key = new Date(e.created_at).toLocaleDateString("fr-FR", { year: "numeric", month: "long" });
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(e);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-bg pb-32">
      <ScreenHeader
        title="Carnet"
        subtitle={child?.name ?? undefined}
        right={
          <Link
            href="/api/logbook/export"
            className="rounded-full bg-card px-3 py-1.5 font-sans text-[11.5px] text-ink"
            style={{ border: "0.5px solid var(--hair)" }}
          >
            Export PDF
          </Link>
        }
      />

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pt-3 pb-1">
        {(["all", "first", "health", "growth", "photos"] as FilterKey[]).map((f) => (
          <Link
            key={f}
            href={`/logbook?f=${f}`}
            className={`inline-flex shrink-0 rounded-full px-3 py-1.5 font-sans text-[11.5px] ${
              filter === f ? "bg-accent text-white" : "bg-card text-ink"
            }`}
            style={{ border: filter === f ? "0.5px solid transparent" : "0.5px solid var(--hair)" }}
          >
            {f === "all" ? "Tout" : f === "first" ? "Premières fois" : f === "health" ? "Santé" : f === "growth" ? "Croissance" : "Photos"}
          </Link>
        ))}
      </div>

      <main className="px-4 pt-4">
        {groups.size === 0 && (
          <p
            className="rounded-xl bg-card px-3 py-6 text-center font-sans text-[13px] text-sub"
            style={{ border: "0.5px solid var(--hair)" }}
          >
            Aucun jalon enregistré pour ce filtre.
          </p>
        )}
        {Array.from(groups.entries()).map(([month, itemsMaybe]) => {
          const items = itemsMaybe ?? [];
          return (
          <section key={month} className="mb-6">
            <header className="mb-3 flex items-baseline justify-between">
              <h2 className="font-serif text-[18px] capitalize text-ink">{month}</h2>
              {items.length > 0 && child?.birth_date && (
                <span className="font-mono text-[11px] text-sub">
                  {formatStage(
                    computeStage({ birthDate: new Date(child.birth_date), now: new Date(items[0].created_at) }),
                    "",
                  ).replace(/^ · /, "")}
                </span>
              )}
            </header>
            <div className="relative">
              <div
                className="absolute bottom-0 left-[19px] top-0 w-px"
                style={{ background: "var(--hair)" }}
                aria-hidden
              />
              <ol className="space-y-3">
                {items.map((e) => {
                  const meta = CATEGORY_META[e.type as EntryType];
                  return (
                    <li key={e.id} className="relative flex gap-3 pl-12">
                      <span
                        className="absolute left-0 top-1 flex h-9 w-9 items-center justify-center rounded-full bg-card"
                        style={{
                          border: "0.5px solid var(--hair)",
                          color: meta.color,
                          boxShadow: "0 0 0 4px var(--bg)",
                        }}
                      >
                        <Icon name={meta.icon} size={14} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="font-serif text-[14.5px] leading-tight text-ink">
                            {entryTitle(e.type as EntryType, e.payload)}
                          </p>
                          <span className="font-mono text-[10.5px] text-sub">
                            {hhmm(new Date(e.created_at))}
                          </span>
                        </div>
                        {(() => {
                          const c = (e.payload as { citation?: string } | null)?.citation;
                          return typeof c === "string" ? (
                            <p className="mt-0.5 font-serif text-[12.5px] italic text-sub">« {c} »</p>
                          ) : null;
                        })()}
                        {typeof e.who === "string" && (
                          <Avatar who={e.who === "T" ? "T" : "L"} size={12} className="mt-1" />
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </section>
          );
        })}
      </main>

      <Link
        href="/chat?prefill=Jalon%20"
        aria-label="Ajouter un jalon"
        className="fixed bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full text-white"
        style={{
          background: "var(--accent)",
          boxShadow: "0 10px 28px color-mix(in srgb, var(--accent) 35%, transparent)",
        }}
      >
        <Icon name="plus" size={20} />
      </Link>
    </div>
  );
}
