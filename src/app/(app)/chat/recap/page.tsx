import Link from "next/link";
import { redirect } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/design/icons";
import { Pill } from "@/components/Pill";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_META } from "@/features/chat/categoryMeta";
import { entryTitle } from "@/features/chat/extractFields";
import { hhmm } from "@/lib/format";
import { ENTRY_TYPES, type EntryType } from "@/domain/types";

export const dynamic = "force-dynamic";

/**
 * A2 ChatInputRecap — synthèse de tout ce que Pia a classé aujourd'hui.
 * RSC query: entries where created_at::date = today, grouped by type.
 * Brief: "14 éléments classés · en 11 messages · 2'40" de dictée" header.
 */
export default async function RecapPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const { data: member } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();
  if (!member?.household_id) redirect("/onboarding/child");
  const householdId = member.household_id;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayIso = todayStart.toISOString();

  // Today's entries — grouped client-side.
  const { data: entries } = await supabase
    .from("entries")
    .select("id, type, payload, who, created_at")
    .eq("household_id", householdId)
    .gte("created_at", todayIso)
    .order("created_at", { ascending: true });

  // Today's messages — count + sum audio duration for the meta line.
  const { data: messages } = await supabase
    .from("messages")
    .select("id, role, audio_duration_ms")
    .eq("household_id", householdId)
    .gte("created_at", todayIso);

  const totalEntries = entries?.length ?? 0;
  const userMsgCount = (messages ?? []).filter((m) => m.role === "user").length;
  const dictationMs = (messages ?? []).reduce(
    (acc, m) => acc + (typeof m.audio_duration_ms === "number" ? m.audio_duration_ms : 0),
    0,
  );

  // Group entries by type.
  type Item = { id: string; title: string; sub: string; who: string };
  const groups = new Map<EntryType, Item[]>();
  for (const t of ENTRY_TYPES) groups.set(t, []);
  for (const e of entries ?? []) {
    if (!ENTRY_TYPES.includes(e.type)) continue;
    const list = groups.get(e.type)!;
    const created = new Date(e.created_at);
    list.push({
      id: e.id,
      title: entryTitle(e.type, e.payload),
      sub: hhmm(created),
      who: typeof e.who === "string" ? e.who : "L",
    });
  }
  const orderedGroups = ENTRY_TYPES
    .map((t) => ({ type: t, items: groups.get(t) ?? [] }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <header
        className="bg-surface px-4"
        style={{
          paddingTop: "max(env(safe-area-inset-top), 16px)",
          paddingBottom: 14,
          borderBottom: "0.5px solid var(--hair)",
        }}
      >
        <div className="flex items-center justify-between">
          <Link
            href="/chat"
            className="flex h-8 w-8 items-center justify-center rounded-full text-sub"
            aria-label="Retour au chat"
          >
            <Icon name="arrow" size={18} className="rotate-180" />
          </Link>
          <Pill color="var(--sub)" bg="var(--soft)">Aujourd&apos;hui</Pill>
        </div>
        <h1
          className="mt-3 font-serif text-[28px] leading-[1.05] tracking-[-0.02em] text-ink"
        >
          {totalEntries} élément{totalEntries > 1 ? "s" : ""} classé{totalEntries > 1 ? "s" : ""}
        </h1>
        <p className="mt-1 font-sans text-[12px] text-sub">
          en <span className="font-mono">{userMsgCount}</span> message{userMsgCount > 1 ? "s" : ""}
          {dictationMs > 0 && (
            <>
              {" · "}
              <span className="font-mono">{formatDictationDuration(dictationMs)}</span>
              {" "}de dictée
            </>
          )}
        </p>
      </header>

      {/* Category chip row */}
      {orderedGroups.length > 0 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pt-3 pb-1">
          {orderedGroups.map((g) => {
            const meta = CATEGORY_META[g.type];
            return (
              <a
                key={g.type}
                href={`#group-${g.type}`}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-card"
                style={{
                  padding: "5px 11px 5px 8px",
                  border: "0.5px solid var(--hair)",
                  color: meta.color,
                }}
              >
                <Icon name={meta.icon} size={12} />
                <span className="font-sans text-[11.5px] font-medium text-ink">{meta.label}</span>
                <span className="font-mono text-[11px] text-sub">{g.items.length}</span>
              </a>
            );
          })}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32">
        {orderedGroups.length === 0 && (
          <p className="mt-8 text-center font-sans text-[13px] text-sub">
            Rien classé aujourd&apos;hui pour le moment.
          </p>
        )}

        {orderedGroups.map((g) => {
          const meta = CATEGORY_META[g.type];
          return (
            <section key={g.type} id={`group-${g.type}`} className="mb-6">
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
                <span className="font-sans text-[11.5px] uppercase tracking-[0.04em] text-ink">
                  {meta.label}
                </span>
                <span className="ml-auto font-mono text-[12px] text-sub">{g.items.length}</span>
              </header>
              <ul className="space-y-1.5">
                {g.items.map((it) => (
                  <li
                    key={it.id}
                    className="flex items-center gap-2 rounded-xl bg-card px-3 py-2.5"
                    style={{ border: "0.5px solid var(--hair)" }}
                  >
                    <span
                      className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: meta.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-serif text-[14px] leading-tight text-ink">
                        {it.title}
                      </p>
                      <p className="font-mono text-[10.5px] text-sub">{it.sub}</p>
                    </div>
                    <Avatar who={it.who === "T" ? "T" : "L"} size={16} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      {/* FAB plein largeur — "Continuer à dicter" */}
      <div
        className="absolute inset-x-0 bottom-0 mx-auto flex max-w-[430px] justify-center bg-gradient-to-t from-bg to-transparent"
        style={{
          paddingTop: 24,
          paddingBottom: "max(env(safe-area-inset-bottom), 14px)",
          paddingLeft: 16,
          paddingRight: 16,
        }}
      >
        <Link
          href="/chat"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 font-sans text-[14px] font-medium text-white"
          style={{ boxShadow: "0 10px 28px color-mix(in srgb, var(--accent) 35%, transparent)" }}
        >
          <Icon name="mic" size={16} />
          Continuer à dicter à Pia
        </Link>
      </div>
    </div>
  );
}

function formatDictationDuration(ms: number): string {
  const sec = Math.round(ms / 1000);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s}s`;
  return `${m}'${String(s).padStart(2, "0")}`;
}
