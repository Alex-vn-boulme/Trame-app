import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChildForm } from "./ChildForm";

export const dynamic = "force-dynamic";

export default async function OnboardingChildPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  // If the user is already in a household with at least one child, skip ahead.
  const { data: existingChildren } = await supabase
    .from("children")
    .select("id")
    .limit(1);
  if (existingChildren && existingChildren.length > 0) {
    redirect("/chat");
  }

  return (
    <div className="flex-1 flex flex-col">
      <header className="mb-8">
        <p className="font-sans text-[11px] uppercase tracking-[0.04em] text-sub mb-2">
          Étape 1 sur 2
        </p>
        <h1 className="font-serif text-[28px] leading-[1.1] tracking-[-0.01em] text-ink">
          Parle-moi de ton enfant.
        </h1>
        <p className="font-sans text-[14px] text-sub mt-2">
          Pia adapte tout — vocabulaire, vigilance, suggestions — à l&apos;âge ou au stade
          de grossesse.
        </p>
      </header>
      <ChildForm />
    </div>
  );
}
