import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatStream } from "@/features/chat/ChatStream";
import { asEntryShape, entryTitle, extractFields } from "@/features/chat/extractFields";
import type { FeedItem } from "@/features/chat/types";

export const dynamic = "force-dynamic";

/**
 * A1 ChatInputCreate — accueil. RSC fetches the last 50 messages + their
 * derived entry cards, then hands off to <ChatStream> (client) for the
 * realtime feed + composer.
 */
export default async function ChatPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const { data: member } = await supabase
    .from("household_members")
    .select("household_id, initial")
    .eq("user_id", userData.user.id)
    .maybeSingle();
  if (!member?.household_id) redirect("/onboarding/child");
  const householdId = member.household_id;
  const myInitial = member.initial ?? "L";

  // Map household member user_ids → display info so we can show
  // "par {creator}" / "pour {assignee}" on each card.
  const { data: members } = await supabase
    .from("household_members")
    .select("user_id, initial, display_name, color")
    .eq("household_id", householdId);
  const memberById = new Map<string, { initial: string; name: string | null; color: string | null }>();
  for (const m of members ?? []) {
    memberById.set(m.user_id, { initial: m.initial ?? "?", name: m.display_name, color: m.color });
  }

  // Pull last 50 messages and their created entries.
  const { data: messages } = await supabase
    .from("messages")
    .select("id, role, text, audio_path, created_at, user_id, entries_created")
    .eq("household_id", householdId)
    .order("created_at", { ascending: true })
    .limit(50);

  const entryIds = (messages ?? []).flatMap((m) =>
    Array.isArray(m.entries_created) ? (m.entries_created as string[]) : [],
  );

  const { data: entries } = entryIds.length
    ? await supabase
        .from("entries")
        .select("id, type, payload, who, assigned_to, recommendation_id")
        .in("id", entryIds)
    : { data: [] as unknown[] };

  const entryById = new Map<
    string,
    NonNullable<ReturnType<typeof asEntryShape>> & { assignedTo: string | null }
  >();
  for (const e of entries ?? []) {
    const shape = asEntryShape(e);
    if (!shape) continue;
    const row = e as Record<string, unknown>;
    const assignedTo = typeof row.assigned_to === "string" ? row.assigned_to : null;
    entryById.set(shape.id, { ...shape, assignedTo });
  }

  const feed: FeedItem[] = [];
  for (const m of messages ?? []) {
    if (m.role === "user") {
      feed.push({
        kind: "user",
        id: m.id,
        text: m.text ?? "",
        createdAt: m.created_at,
        voice: !!m.audio_path,
        who: myInitial,
      });
    } else if (m.role === "assistant") {
      const linked = Array.isArray(m.entries_created) ? (m.entries_created as string[]) : [];
      feed.push({
        kind: "pia",
        id: m.id,
        text: m.text ?? "",
        createdAt: m.created_at,
        summary: linked.length > 0
          ? `${linked.length} élément${linked.length > 1 ? "s" : ""} classé${linked.length > 1 ? "s" : ""}`
          : undefined,
      });
      for (const eid of linked) {
        const e = entryById.get(eid);
        if (!e) continue;
        const creator = e.who ? memberById.get(e.who) : null;
        const assignee = e.assignedTo ? memberById.get(e.assignedTo) : null;
        feed.push({
          kind: "card",
          id: e.id,
          entryType: e.type,
          title: entryTitle(e.type, e.payload),
          fields: extractFields(e.type, e.payload),
          creatorInitial: creator?.initial,
          creatorName: creator?.name ?? null,
          creatorColor: creator?.color ?? null,
          assigneeInitial: assignee?.initial ?? null,
          assigneeName: assignee?.name ?? null,
          assigneeColor: assignee?.color ?? null,
          createdAt: m.created_at,
        });
      }
    }
  }

  const chatMembers = (members ?? []).map((m) => ({
    userId: m.user_id,
    initial: m.initial ?? "?",
    name: m.display_name,
    color: m.color,
  }));

  return (
    <ChatStream
      householdId={householdId}
      initialFeed={feed}
      myInitial={myInitial}
      members={chatMembers}
    />
  );
}
