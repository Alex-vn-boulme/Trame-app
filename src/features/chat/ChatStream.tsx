"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/design/icons";
import { Pill } from "@/components/Pill";
import { hhmm } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { Bubbles } from "./BubblesIndex";
import { Composer } from "./Composer";
import { CreatedCard } from "./CreatedCard";
import { asEntryShape, entryTitle, extractFields, isEntryType } from "./extractFields";
import type { ExtractResponse, FeedItem } from "./types";

type Props = {
  householdId: string;
  initialFeed: FeedItem[];
  myInitial: string;
};

/**
 * The chat surface. Renders the chronological feed, the composer, and wires
 * realtime updates from Supabase + optimistic rendering for user messages.
 */
export function ChatStream({ householdId, initialFeed, myInitial }: Props) {
  const [feed, setFeed] = useState<FeedItem[]>(initialFeed);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom on new item.
  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [feed.length]);

  // Realtime — Subscribe to entries + messages INSERTs for this household.
  useEffect(() => {
    const supabase = createClient();
    const ch = supabase
      .channel(`household:${householdId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `household_id=eq.${householdId}` },
        (payload) => {
          const m = payload.new as Record<string, unknown>;
          const id = typeof m.id === "string" ? m.id : null;
          if (!id) return;
          const text = typeof m.text === "string" ? m.text : "";
          const createdAt = typeof m.created_at === "string" ? m.created_at : new Date().toISOString();
          setFeed((prev) => {
            if (prev.some((f) => f.id === id)) return prev; // already optimistically present
            if (m.role === "user") {
              return [
                ...prev,
                { kind: "user", id, text, createdAt, voice: !!m.audio_path, who: myInitial },
              ];
            }
            if (m.role === "assistant") {
              const count = Array.isArray(m.entries_created) ? m.entries_created.length : 0;
              return [
                ...prev,
                {
                  kind: "pia",
                  id,
                  text,
                  createdAt,
                  summary: count > 0
                    ? `${count} élément${count > 1 ? "s" : ""} classé${count > 1 ? "s" : ""}`
                    : undefined,
                },
              ];
            }
            return prev;
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "entries", filter: `household_id=eq.${householdId}` },
        (payload) => {
          const e = asEntryShape(payload.new);
          if (!e) return;
          setFeed((prev) => {
            if (prev.some((f) => f.id === e.id)) return prev;
            return [
              ...prev,
              {
                kind: "card",
                id: e.id,
                entryType: e.type,
                title: entryTitle(e.type, e.payload),
                fields: extractFields(e.type, e.payload),
                who: e.who ?? undefined,
                createdAt: new Date().toISOString(),
              },
            ];
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(ch);
    };
  }, [householdId, myInitial]);

  async function sendText(text: string) {
    setError(null);
    setPending(true);
    const pendingId = `pending-${crypto.randomUUID()}`;
    const pendingPiaId = `pending-pia-${crypto.randomUUID()}`;
    setFeed((prev) => [
      ...prev,
      { kind: "pending-user", id: pendingId, text, voice: false, createdAt: new Date().toISOString() },
      { kind: "pending-pia", id: pendingPiaId, createdAt: new Date().toISOString() },
    ]);
    try {
      const fd = new FormData();
      fd.append("text", text);
      const res = await fetch("/api/pia/extract", { method: "POST", body: fd });
      if (!res.ok) throw new Error(`extract failed (${res.status})`);
      const json = (await res.json()) as ExtractResponse;
      replacePending(pendingId, pendingPiaId, json, text, false);
    } catch (err) {
      console.error("[chat] sendText failed", err);
      setError("Pia n'a pas pu enregistrer ça. Réessaie ?");
      setFeed((prev) => prev.filter((f) => f.id !== pendingId && f.id !== pendingPiaId));
    } finally {
      setPending(false);
    }
  }

  async function sendAudio(blob: Blob, _durationMs: number, mimeType: string) {
    setError(null);
    setPending(true);
    const pendingId = `pending-${crypto.randomUUID()}`;
    const pendingPiaId = `pending-pia-${crypto.randomUUID()}`;
    setFeed((prev) => [
      ...prev,
      { kind: "pending-user", id: pendingId, text: "…dictée en cours", voice: true, createdAt: new Date().toISOString() },
      { kind: "pending-pia", id: pendingPiaId, createdAt: new Date().toISOString() },
    ]);
    try {
      const ext = mimeType.includes("mp4") ? "mp4" : "webm";
      const fd = new FormData();
      fd.append("audio", new File([blob], `voice.${ext}`, { type: mimeType }));
      const res = await fetch("/api/pia/extract", { method: "POST", body: fd });
      if (!res.ok) throw new Error(`extract failed (${res.status})`);
      const json = (await res.json()) as ExtractResponse;
      replacePending(pendingId, pendingPiaId, json, json.transcribedText, true);
    } catch (err) {
      console.error("[chat] sendAudio failed", err);
      setError("La dictée n'a pas pu être traitée. Réessaie ?");
      setFeed((prev) => prev.filter((f) => f.id !== pendingId && f.id !== pendingPiaId));
    } finally {
      setPending(false);
    }
  }

  function replacePending(
    pendingId: string,
    pendingPiaId: string,
    json: ExtractResponse,
    userText: string,
    voice: boolean,
  ) {
    setFeed((prev) => {
      const withoutPending = prev.filter((f) => f.id !== pendingId && f.id !== pendingPiaId);
      const now = new Date().toISOString();
      const next: FeedItem[] = [
        ...withoutPending,
        {
          kind: "user",
          id: json.userMessageId,
          text: userText,
          createdAt: now,
          voice,
          who: myInitial,
        },
      ];
      if (json.assistantReply) {
        next.push({
          kind: "pia",
          id: json.assistantMessageId ?? `assistant-${json.userMessageId}`,
          text: json.assistantReply,
          createdAt: now,
          summary: json.entries.length > 0
            ? `${json.entries.length} élément${json.entries.length > 1 ? "s" : ""} classé${json.entries.length > 1 ? "s" : ""}`
            : undefined,
        });
      }
      for (const [i, entry] of json.entries.entries()) {
        if (!isEntryType(entry.type)) continue;
        next.push({
          kind: "card",
          id: json.entryIds[i] ?? `entry-${json.userMessageId}-${i}`,
          entryType: entry.type,
          title: entryTitle(entry.type, entry.payload),
          fields: extractFields(entry.type, entry.payload),
          who: myInitial,
          createdAt: now,
        });
      }
      return next;
    });
  }

  const groupedByDate = useMemo(() => {
    const groups: { day: string; items: FeedItem[] }[] = [];
    const dayLabel = (iso: string) => {
      const d = new Date(iso);
      const today = new Date();
      const sameDay = d.toDateString() === today.toDateString();
      if (sameDay) {
        return `Aujourd'hui · ${d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}`;
      }
      return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
    };
    for (const item of feed) {
      const label = dayLabel(item.createdAt);
      const last = groups[groups.length - 1];
      if (!last || last.day !== label) groups.push({ day: label, items: [item] });
      else last.items.push(item);
    }
    return groups;
  }, [feed]);

  return (
    <div className="flex h-dvh flex-col bg-bg">
      {/* Header */}
      <header
        className="flex items-center gap-2.5 bg-surface"
        style={{
          paddingTop: "max(env(safe-area-inset-top), 16px)",
          paddingBottom: 10,
          paddingLeft: 16,
          paddingRight: 16,
          borderBottom: "0.5px solid var(--hair)",
        }}
      >
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full text-white"
          style={{ background: "var(--accent)" }}
        >
          <Icon name="sparkle" size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-serif text-[16px] font-medium text-ink">Pia</p>
          <p className="font-sans text-[11px] text-sub">vous dictez · je classe</p>
        </div>
        <Pill color="var(--good)" bg="color-mix(in srgb, var(--good) 12%, transparent)">
          <span
            className="inline-block rounded-full"
            style={{ width: 5, height: 5, background: "var(--good)" }}
          />
          en ligne
        </Pill>
      </header>

      {/* Feed */}
      <div
        ref={scrollerRef}
        className="flex-1 overflow-y-auto"
        style={{ paddingTop: 14, paddingBottom: 8 }}
      >
        <div className="flex flex-col gap-2.5 px-3.5">
          {feed.length === 0 && <EmptyState />}
          {groupedByDate.map((g) => (
            <div key={g.day} className="flex flex-col gap-2.5">
              <Bubbles.DateSeparator label={g.day} />
              {g.items.map((it) => (
                <FeedItemView key={it.id} item={it} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Error toast */}
      {error && (
        <div
          role="alert"
          className="mx-3 mb-1 rounded-xl bg-card px-3 py-2 font-sans text-[12.5px] text-[color:#c94422]"
          style={{ border: "0.5px solid color-mix(in srgb, #c94422 30%, transparent)" }}
        >
          {error}
        </div>
      )}

      <Composer onText={sendText} onAudio={sendAudio} pending={pending} />
    </div>
  );
}

function FeedItemView({ item }: { item: FeedItem }) {
  switch (item.kind) {
    case "user":
      return (
        <Bubbles.UserBubble time={hhmm(new Date(item.createdAt))} voice={item.voice} who={item.who === "T" ? "T" : "L"}>
          {item.text}
        </Bubbles.UserBubble>
      );
    case "pending-user":
      return (
        <div className="flex flex-col items-end gap-1 opacity-60">
          <Bubbles.UserBubble time={hhmm(new Date(item.createdAt))} voice={item.voice}>
            {item.text}
          </Bubbles.UserBubble>
        </div>
      );
    case "pia":
      return <Bubbles.PiaSay summary={item.summary}>{item.text}</Bubbles.PiaSay>;
    case "pending-pia":
      return (
        <Bubbles.PiaSay>
          <span className="inline-flex gap-1">
            <Dot delay="0ms" />
            <Dot delay="120ms" />
            <Dot delay="240ms" />
          </span>
        </Bubbles.PiaSay>
      );
    case "card":
      return (
        <CreatedCard
          type={item.entryType}
          title={item.title}
          fields={item.fields}
          who={item.who}
        />
      );
  }
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-sub"
      style={{ animationDelay: delay }}
    />
  );
}

function EmptyState() {
  return (
    <div className="mx-auto mt-12 max-w-[280px] text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "var(--accent-soft)" }}>
        <Avatar size={24} />
        <span className="sr-only">Bienvenue</span>
      </div>
      <p className="font-serif text-[18px] leading-tight text-ink">
        Dis-moi tout, en vrac.
      </p>
      <p className="mt-1 font-sans text-[13px] text-sub">
        Biberon, RDV, achat à faire — je classe au fur et à mesure. Maintiens
        le micro pour dicter, ou écris.
      </p>
    </div>
  );
}
