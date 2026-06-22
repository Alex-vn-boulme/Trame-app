import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/BottomNav";

/**
 * App-scoped layout (auth gate). Per CVE-2025-29927 we never trust proxy
 * as the sole auth check — we re-verify `auth.getUser()` here and route
 * unauthenticated users to /login.
 *
 * Also funnels users who haven't completed onboarding back through it.
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const { data: member } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();
  if (!member?.household_id) redirect("/onboarding/child");

  return (
    <>
      <div className="pb-[68px]">{children}</div>
      <BottomNav />
    </>
  );
}
