import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthForm } from "../AuthForm";

export const dynamic = "force-dynamic";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/onboarding/child");

  return (
    <>
      <AuthForm mode="signup" errorMessage={sp.error} />
      <p className="mt-6 text-center font-sans text-[13px] text-sub">
        Déjà inscrit ?{" "}
        <Link href="/login" className="text-accent underline underline-offset-4">
          Se connecter
        </Link>
      </p>
    </>
  );
}
