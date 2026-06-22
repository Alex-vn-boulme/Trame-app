"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const ACCENT_FALLBACK = "#c96442";
const SAGE_FALLBACK = "#5a7d4f";

const Schema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("born"),
    name: z.string().trim().min(1).max(40),
    birth_date: z.string().min(1),  // YYYY-MM-DD
    weight_kg: z.string().optional(),
  }),
  z.object({
    mode: z.literal("pregnancy"),
    name: z.string().trim().min(1).max(40),
    due_date: z.string().min(1),
  }),
]);

type Result = { ok: true } | { ok: false; error: string };

/**
 * Creates the household + initial child for the signed-in user.
 *
 * Strategy: if the user has no household yet, create one and add them as the
 * first member. Otherwise add the new child to their existing household.
 *
 * The "L" initial / accent color are defaults for the first parent — they
 * can be customized later in /settings.
 */
export async function createChildAction(formData: FormData): Promise<Result> {
  const parsed = Schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Formulaire invalide." };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false, error: "Session expirée." };
  const userId = userData.user.id;

  // Find or create a household.
  let householdId: string;
  const { data: existing } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing?.household_id) {
    householdId = existing.household_id;
  } else {
    const initial = (userData.user.email?.[0] ?? "L").toUpperCase();
    const { data: rpcId, error: rpcErr } = await supabase.rpc(
      "create_household_with_member",
      {
        p_name: "Foyer Pia",
        p_initial: initial,
        p_color: ACCENT_FALLBACK,
        p_display_name: userData.user.email?.split("@")[0] ?? null,
      },
    );
    if (rpcErr || !rpcId) {
      console.error("[onboarding] create_household_with_member failed", rpcErr);
      return { ok: false, error: "Impossible de créer le foyer." };
    }
    householdId = rpcId as string;
  }

  // Insert the child.
  const childErr =
    parsed.data.mode === "born"
      ? (
          await supabase.from("children").insert({
            household_id: householdId,
            name: parsed.data.name,
            birth_date: parsed.data.birth_date,
            due_date: null,
            weight_kg: parsed.data.weight_kg ? Number(parsed.data.weight_kg) : null,
          })
        ).error
      : (
          await supabase.from("children").insert({
            household_id: householdId,
            name: parsed.data.name,
            birth_date: null,
            due_date: parsed.data.due_date,
            weight_kg: null,
          })
        ).error;

  if (childErr) {
    console.error("[onboarding] children insert failed", childErr);
    return { ok: false, error: "Impossible d'enregistrer l'enfant." };
  }

  return { ok: true };
}

// Suppress unused-import warning for now — SAGE_FALLBACK is reserved for the
// invited co-parent default color (used in /onboarding/invite).
void SAGE_FALLBACK;
