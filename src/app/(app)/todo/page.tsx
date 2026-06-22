import { Icon } from "@/design/icons";
import { ScreenHeader } from "@/features/views/ScreenHeader";
import { CATEGORY_META } from "@/features/chat/categoryMeta";
import { entryTitle, extractFields } from "@/features/chat/extractFields";
import { EntryRow } from "@/features/views/EntryRow";
import { loadView } from "@/features/views/loadView";
import { ENTRY_TYPES, type EntryType } from "@/domain/types";

export const dynamic = "force-dynamic";

/**
 * B2 Todo — tout à faire, partagé entre co-parents. Grouped by category.
 */
export default async function TodoPage() {
  const { supabase, householdId } = await loadView();

  const { data: entries } = await supabase
    .from("entries")
    .select("id, type, payload, who, status, due_at, created_at")
    .eq("household_id", householdId)
    .eq("status", "open")
    .order("due_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(120);

  const groups = new Map<EntryType, typeof entries>();
  for (const t of ENTRY_TYPES) groups.set(t, []);
  for (const e of entries ?? []) {
    if (!ENTRY_TYPES.includes(e.type)) continue;
    groups.get(e.type)!.push(e);
  }
  const visible = ENTRY_TYPES.filter((t) => (groups.get(t) ?? []).length > 0);

  return (
    <div className="flex min-h-dvh flex-col bg-bg pb-12">
      <ScreenHeader
        title="Tout à faire"
        subtitle={`${entries?.length ?? 0} élément${(entries?.length ?? 0) > 1 ? "s" : ""} partagé${(entries?.length ?? 0) > 1 ? "s" : ""}`}
      />

      <main className="px-4 pt-4">
        {visible.length === 0 && (
          <EmptyMessage>Rien à faire. Demande à Pia ou écris au chat.</EmptyMessage>
        )}
        {visible.map((t) => {
          const items = groups.get(t) ?? [];
          const meta = CATEGORY_META[t];
          return (
            <section key={t} className="mb-5">
              <header className="mb-2 flex items-center gap-2">
                <span
                  className="inline-flex h-5 w-5 items-center justify-center rounded-md"
                  style={{
                    background: `color-mix(in srgb, ${meta.color} 14%, transparent)`,
                    color: meta.color,
                  }}
                >
                  <Icon name={meta.icon} size={11} />
                </span>
                <span className="font-sans text-[11px] uppercase tracking-[0.04em] text-ink">
                  {meta.label}
                </span>
                <span className="ml-auto font-mono text-[11px] text-sub">{items.length}</span>
              </header>
              <div className="space-y-1.5">
                {items.map((e) => {
                  const fields = extractFields(t, e.payload);
                  const meta = fields.length
                    ? fields
                        .slice(0, 2)
                        .map((f) => `${f.k} ${f.v}`)
                        .join(" · ")
                    : undefined;
                  return (
                    <EntryRow
                      key={e.id}
                      id={e.id}
                      title={entryTitle(t, e.payload)}
                      meta={meta}
                      who={typeof e.who === "string" ? e.who : undefined}
                      status={e.status}
                      accentDot={CATEGORY_META[t].color}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}

function EmptyMessage({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="rounded-xl bg-card px-3 py-6 text-center font-sans text-[13px] text-sub"
      style={{ border: "0.5px solid var(--hair)" }}
    >
      {children}
    </p>
  );
}
