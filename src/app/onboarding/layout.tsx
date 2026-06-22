import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { PageShell } from "@/components/PageShell";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingLayout({ children }: { children: ReactNode }) {
  // Defense-in-depth (proxy already gates, but CVE-2025-29927 reminds us
  // to re-verify auth in protected segments).
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login?redirect=/onboarding/child");

  return <PageShell className="px-6 py-8">{children}</PageShell>;
}
