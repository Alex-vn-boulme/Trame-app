"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/design/icons";

type Mode = "login" | "signup";

export function AuthForm({
  mode,
  redirectTo,
  errorMessage,
}: {
  mode: Mode;
  redirectTo?: string;
  errorMessage?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(errorMessage ?? null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(formData: FormData) {
    const e = String(formData.get("email") ?? "").trim();
    const p = String(formData.get("password") ?? "");
    if (!e || !p) {
      setError("Email et mot de passe requis.");
      return;
    }
    setError(null);
    setInfo(null);

    start(async () => {
      const supabase = createClient();
      if (mode === "login") {
        const { error: err } = await supabase.auth.signInWithPassword({ email: e, password: p });
        if (err) {
          setError(err.message);
          return;
        }
        router.push(redirectTo ?? "/chat");
        router.refresh();
      } else {
        const { error: err, data } = await supabase.auth.signUp({
          email: e,
          password: p,
          options: { emailRedirectTo: `${location.origin}/auth/callback` },
        });
        if (err) {
          setError(err.message);
          return;
        }
        if (data.user && data.session) {
          // No email confirmation required — go straight to onboarding.
          router.push("/onboarding/child");
          router.refresh();
        } else {
          setInfo(`Confirme ton inscription via le lien envoyé à ${e}.`);
        }
      }
    });
  }

  return (
    <form action={submit} className="space-y-3">
      <Field
        name="email"
        type="email"
        autoComplete="email"
        placeholder="Adresse email"
        value={email}
        onChange={setEmail}
        disabled={pending}
      />
      <Field
        name="password"
        type="password"
        autoComplete={mode === "login" ? "current-password" : "new-password"}
        placeholder={mode === "login" ? "Mot de passe" : "Mot de passe (8 caractères min)"}
        value={password}
        onChange={setPassword}
        disabled={pending}
        minLength={mode === "signup" ? 8 : undefined}
      />
      {error && (
        <p className="font-sans text-[12.5px] text-[color:#c94422]" role="alert">
          {error}
        </p>
      )}
      {info && (
        <p className="font-sans text-[12.5px] text-good" role="status">
          {info}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 font-sans text-[14px] font-medium text-white disabled:opacity-60"
      >
        {pending ? (
          "…"
        ) : (
          <>
            {mode === "login" ? "Se connecter" : "Créer mon compte"}
            <Icon name="arrow" size={16} />
          </>
        )}
      </button>
    </form>
  );
}

function Field({
  name,
  type,
  autoComplete,
  placeholder,
  value,
  onChange,
  disabled,
  minLength,
}: {
  name: string;
  type: string;
  autoComplete: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  minLength?: number;
}) {
  return (
    <input
      name={name}
      type={type}
      autoComplete={autoComplete}
      placeholder={placeholder}
      value={value}
      minLength={minLength}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      required
      className="w-full rounded-2xl bg-card px-4 py-3.5 font-sans text-[14.5px] text-ink placeholder:text-sub focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-60"
      style={{ border: "0.5px solid var(--hair)" }}
    />
  );
}
