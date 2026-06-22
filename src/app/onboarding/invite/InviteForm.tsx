"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/design/icons";
import { inviteCoparentAction } from "./actions";

export function InviteForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(formData: FormData) {
    setError(null);
    setInfo(null);
    start(async () => {
      const res = await inviteCoparentAction(formData);
      if (res.ok) {
        setInfo(res.message);
        setTimeout(() => {
          router.push("/chat");
          router.refresh();
        }, 1500);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form action={submit} className="space-y-4">
      <label className="block">
        <span className="font-sans text-[11px] uppercase tracking-[0.04em] text-sub mb-1 block">
          Email du co-parent
        </span>
        <input
          name="email"
          type="email"
          autoComplete="off"
          placeholder="thomas@example.com"
          required
          disabled={pending}
          className="w-full rounded-2xl bg-card px-4 py-3 font-sans text-[14.5px] text-ink placeholder:text-sub focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-60"
          style={{ border: "0.5px solid var(--hair)" }}
        />
      </label>

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
        {pending ? "Envoi…" : (
          <>
            Envoyer l&apos;invitation <Icon name="send" size={16} />
          </>
        )}
      </button>
    </form>
  );
}
