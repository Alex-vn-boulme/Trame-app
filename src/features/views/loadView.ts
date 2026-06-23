import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { HouseholdMember } from "./EntryRow";

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

  const { data: rawMembers } = await supabase
    .from("household_members")
    .select("user_id, initial, display_name, color")
    .eq("household_id", member.household_id);

  const members: HouseholdMember[] = (rawMembers ?? []).map((m) => ({
    userId: m.user_id,
    initial: m.initial ?? "?",
    name: m.display_name,
    color: m.color,
  }));
  const memberByUserId = new Map(members.map((m) => [m.userId, m] as const));

  return {
    supabase,
    householdId: member.household_id,
    userId: userData.user.id,
    myInitial: member.initial ?? "L",
    members,
    memberByUserId,
  };
}
