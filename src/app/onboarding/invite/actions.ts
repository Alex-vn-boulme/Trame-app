"use server";

import { z } from "zod";
import { createAdminClient, createClient } from "@/lib/supabase/server";

const Schema = z.object({
  email: z.string().email(),
});

type Result = { ok: true; message: string } | { ok: false; error: string };

/**
 * Sends a magic-link invitation to the co-parent. When they click the link
 * and sign in, the auth callback exchanges the code for a session. To bind
 * them to the existing household we store the household id in the invitation
 * metadata and resolve it on the next sign-in via a server action (TODO).
 *
 * For Phase 1 MVP, we use Supabase Admin `inviteUserByEmail` with a redirect
 * carrying the household id. The receiver lands on /onboarding/accept which
 * runs `household_members.insert(...)`.
 */
export async function inviteCoparentAction(formData: FormData): Promise<Result> {
  const parsed = Schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: "Email invalide." };

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false, error: "Session expirée." };

  // Resolve the inviter's household.
  const { data: member } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();
  if (!member?.household_id) {
    return { ok: false, error: "Crée d'abord un profil enfant." };
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      ok: false,
      error: "Invitation non configurée — variable SUPABASE_SERVICE_ROLE_KEY manquante.",
    };
  }

  const admin = createAdminClient();
  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback?next=/onboarding/accept&hh=${member.household_id}`;

  const { error } = await admin.auth.admin.inviteUserByEmail(parsed.data.email, {
    redirectTo,
    data: { invited_to_household: member.household_id },
  });

  if (error) {
    console.error("[onboarding/invite] inviteUserByEmail failed", error);
    return { ok: false, error: error.message };
  }

  return {
    ok: true,
    message: `Invitation envoyée à ${parsed.data.email}. Ce sera prêt dès qu'iel cliquera.`,
  };
}
