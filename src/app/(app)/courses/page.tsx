import { Icon } from "@/design/icons";
import { Avatar } from "@/components/Avatar";
import { Pill } from "@/components/Pill";
import { ScreenHeader } from "@/features/views/ScreenHeader";
import { EntryRow } from "@/features/views/EntryRow";
import { loadView } from "@/features/views/loadView";

export const dynamic = "force-dynamic";

type CourseEntry = {
  id: string;
  payload: unknown;
  who: string | null;
  assigned_to: string | null;
  status: "open" | "done" | "snoozed" | "ignored";
  created_at: string;
};

/**
 * B3 CoursesList — dense list of `course` entries, grouped by store.
 */
export default async function CoursesPage() {
  const { supabase, householdId, members, memberByUserId } = await loadView();

  const { data: entries } = await supabase
    .from("entries")
    .select("id, payload, who, assigned_to, status, created_at")
    .eq("household_id", householdId)
    .eq("type", "course")
    .neq("status", "ignored")
    .order("created_at", { ascending: false })
    .limit(200);

  const byStore = new Map<string, CourseEntry[]>();
  for (const e of (entries ?? []) as CourseEntry[]) {
    const p = (e.payload ?? {}) as Record<string, unknown>;
    const store = typeof p.store === "string" && p.store.length > 0 ? p.store : "Sans liste";
    if (!byStore.has(store)) byStore.set(store, []);
    byStore.get(store)!.push(e);
  }
  const stores = Array.from(byStore.keys()).sort();

  const totalOpen = (entries ?? []).filter((e) => e.status === "open").length;

  return (
    <div className="flex min-h-dvh flex-col bg-bg pb-12">
      <ScreenHeader
        title="Courses"
        subtitle={`${totalOpen} à acheter`}
        right={
          <Pill color="var(--sub)" bg="var(--soft)">
            <Icon name="cart" size={11} />
            <span className="font-mono">{entries?.length ?? 0}</span>
          </Pill>
        }
      />

      <main className="px-4 pt-4">
        {stores.length === 0 && (
          <p
            className="rounded-xl bg-card px-3 py-6 text-center font-sans text-[13px] text-sub"
            style={{ border: "0.5px solid var(--hair)" }}
          >
            Aucune course en attente.
          </p>
        )}
        {stores.map((store) => {
          const list = byStore.get(store) ?? [];
          return (
            <section key={store} className="mb-5">
              <header className="mb-2 flex items-center gap-2">
                <span className="font-sans text-[11px] uppercase tracking-[0.04em] text-ink">
                  {store}
                </span>
                <span className="ml-auto font-mono text-[11px] text-sub">{list.length}</span>
              </header>
              <div className="space-y-1">
                {list.map((e) => {
                  const p = (e.payload ?? {}) as Record<string, unknown>;
                  const item = typeof p.item === "string" ? p.item : "Course";
                  const price = typeof p.priceEstimate === "number" ? `~${p.priceEstimate}€` : null;
                  const qty = typeof p.qty === "number" ? `×${p.qty}` : null;
                  const urgency = p.urgency;
                  const metaParts = [qty, price].filter(Boolean) as string[];
                  return (
                    <div key={e.id} className="flex items-center gap-2">
                      <div className="flex-1">
                        <EntryRow
                          id={e.id}
                          type="course"
                          title={item}
                          meta={metaParts.length ? metaParts.join(" · ") : undefined}
                          payload={p}
                          status={e.status}
                          creator={e.who ? memberByUserId.get(e.who) ?? null : null}
                          assignee={e.assigned_to ? memberByUserId.get(e.assigned_to) ?? null : null}
                          members={members}
                        />
                      </div>
                      {urgency === "high" && (
                        <Pill color="var(--warn)" bg="color-mix(in srgb, var(--warn) 12%, transparent)">
                          urgent
                        </Pill>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Members hint */}
        <p className="mt-2 text-center font-sans text-[11px] text-sub">
          <Avatar who="L" size={12} /> <Avatar who="T" size={12} /> visibles en temps réel
        </p>
      </main>
    </div>
  );
}
