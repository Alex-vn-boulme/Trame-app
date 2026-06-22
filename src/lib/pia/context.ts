import type { SupabaseClient } from "@supabase/supabase-js";
import { computeStage, formatStage } from "@/domain/stages";

/**
 * Loads everything Pia needs to know about *this* household before extraction:
 * - active child (the only one for MVP — multi-child comes later)
 * - last 5 entries (so Pia can resolve relative refs: "le même biberon que tout à l'heure")
 *
 * Kept light on purpose — extraction is per-message, we don't need the full
 * corpus, just enough to disambiguate.
 */

export type PiaContext = {
  childId: string | null;
  childName: string | null;
  weightKg: number | null;
  stageLabel: string | null;
  recentEntries: { type: string; payload: unknown; created_at: string }[];
};

export async function loadPiaContext(
  supabase: SupabaseClient,
  householdId: string,
): Promise<PiaContext> {
  const { data: children } = await supabase
    .from("children")
    .select("id, name, birth_date, due_date, weight_kg")
    .order("created_at", { ascending: true })
    .limit(1);
  const child = children?.[0] ?? null;

  let stageLabel: string | null = null;
  if (child && (child.birth_date || child.due_date)) {
    const stage = computeStage({
      birthDate: child.birth_date ? new Date(child.birth_date) : null,
      dueDate: child.due_date ? new Date(child.due_date) : null,
    });
    stageLabel = formatStage(stage, child.name).split(" · ")[1] ?? null;
  }

  const { data: recent } = await supabase
    .from("entries")
    .select("type, payload, created_at")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false })
    .limit(5);

  return {
    childId: child?.id ?? null,
    childName: child?.name ?? null,
    weightKg: child?.weight_kg ?? null,
    stageLabel,
    recentEntries: recent ?? [],
  };
}
