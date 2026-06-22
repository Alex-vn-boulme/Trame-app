import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Shared boot for secondary view RSCs: resolves the user's household or
 * redirects them through auth/onboarding. Returns a ready-to-query
 * `supabase` server client + the householdId.
 */
export async function loadView() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const { data: member } = await supabase
    .from("household_members")
    .select("household_id, initial")
    .eq("user_id", userData.user.id)
    .maybeSingle();
  if (!member?.household_id) redirect("/onboarding/child");

  return {
    supabase,
    householdId: member.household_id,
    userId: userData.user.id,
    myInitial: member.initial ?? "L",
  };
}
