"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { asEntryShape } from "@/features/chat/extractFields";
import type { EntryType } from "@/domain/types";

export type RealtimeEntry = {
  id: string;
  type: EntryType;
  payload: unknown;
  who: string | null;
  recommendationId: string | null;
};

/**
 * Reusable hook — subscribes to INSERT/UPDATE/DELETE on `entries` filtered
 * by household. Returns a live array. Used by Dashboard, Todo, Tracking
 * pages where the chat itself isn't on screen.
 *
 * Initial rows must be passed in by the caller (typically from RSC) so we
 * stay hydration-safe.
 */
export function useRealtimeEntries(householdId: string, initial: RealtimeEntry[]) {
  const [entries, setEntries] = useState<RealtimeEntry[]>(initial);

  useEffect(() => {
    const supabase = createClient();
    const ch = supabase
      .channel(`entries:${householdId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "entries", filter: `household_id=eq.${householdId}` },
        (payload) => {
          const shape = asEntryShape(payload.new);
          if (!shape) return;
          setEntries((prev) => (prev.some((e) => e.id === shape.id) ? prev : [...prev, {
            id: shape.id,
            type: shape.type,
            payload: shape.payload,
            who: shape.who ?? null,
            recommendationId: shape.recommendation_id ?? null,
          }]));
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "entries", filter: `household_id=eq.${householdId}` },
        (payload) => {
          const shape = asEntryShape(payload.new);
          if (!shape) return;
          setEntries((prev) => prev.map((e) => (e.id === shape.id ? {
            id: shape.id,
            type: shape.type,
            payload: shape.payload,
            who: shape.who ?? null,
            recommendationId: shape.recommendation_id ?? null,
          } : e)));
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "entries", filter: `household_id=eq.${householdId}` },
        (payload) => {
          const id = (payload.old as Record<string, unknown>).id;
          if (typeof id !== "string") return;
          setEntries((prev) => prev.filter((e) => e.id !== id));
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(ch);
    };
  }, [householdId]);

  return entries;
}
