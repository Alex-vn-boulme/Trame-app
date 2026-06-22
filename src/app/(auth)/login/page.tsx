import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthForm } from "../AuthForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect(sp.redirect ?? "/chat");

  return (
    <>
      <AuthForm mode="login" redirectTo={sp.redirect} errorMessage={sp.error} />
      <p className="mt-6 text-center font-sans text-[13px] text-sub">
        Pas encore de compte ?{" "}
        <Link href="/signup" className="text-accent underline underline-offset-4">
          Créer un compte
        </Link>
      </p>
    </>
  );
}
