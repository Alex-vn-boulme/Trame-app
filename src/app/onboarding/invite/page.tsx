import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InviteForm } from "./InviteForm";

export const dynamic = "force-dynamic";

export default async function OnboardingInvitePage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  return (
    <div className="flex-1 flex flex-col">
      <header className="mb-8">
        <p className="font-sans text-[11px] uppercase tracking-[0.04em] text-sub mb-2">
          Étape 2 sur 2
        </p>
        <h1 className="font-serif text-[28px] leading-[1.1] tracking-[-0.01em] text-ink">
          Invite ton co-parent.
        </h1>
        <p className="font-sans text-[14px] text-sub mt-2">
          Tout ce que tu dictes à Pia est partagé en temps réel avec ton co-parent.
          Aucun double-emploi.
        </p>
      </header>

      <InviteForm />

      <div className="mt-6 text-center">
        <Link
          href="/chat"
          className="font-sans text-[13px] text-sub underline underline-offset-4"
        >
          Plus tard, aller au chat
        </Link>
      </div>
    </div>
  );
}
