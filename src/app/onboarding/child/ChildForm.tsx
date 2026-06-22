"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/design/icons";
import { createChildAction } from "./actions";

type Mode = "born" | "pregnancy";

export function ChildForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("born");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(formData: FormData) {
    setError(null);
    start(async () => {
      const res = await createChildAction(formData);
      if (res.ok) {
        router.push("/onboarding/invite");
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form action={submit} className="space-y-5">
      <input type="hidden" name="mode" value={mode} />

      <div className="grid grid-cols-2 gap-2">
        <ModeButton selected={mode === "born"} onClick={() => setMode("born")}>
          Déjà né
        </ModeButton>
        <ModeButton selected={mode === "pregnancy"} onClick={() => setMode("pregnancy")}>
          En attente
        </ModeButton>
      </div>

      <Field name="name" label="Prénom" placeholder="Lucie, Mateo…" disabled={pending} />

      {mode === "born" ? (
        <>
          <Field
            name="birth_date"
            label="Date de naissance"
            type="date"
            disabled={pending}
            required
          />
          <Field
            name="weight_kg"
            label="Poids actuel (kg)"
            type="number"
            step="0.01"
            min="0.5"
            max="40"
            placeholder="3.40"
            disabled={pending}
            optional
          />
        </>
      ) : (
        <Field
          name="due_date"
          label="Date prévue d'accouchement"
          type="date"
          disabled={pending}
          required
        />
      )}

      {error && (
        <p className="font-sans text-[12.5px] text-[color:#c94422]" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 font-sans text-[14px] font-medium text-white disabled:opacity-60"
      >
        {pending ? "…" : (
          <>
            Continuer <Icon name="arrow" size={16} />
          </>
        )}
      </button>
    </form>
  );
}

function ModeButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-2xl py-3 font-sans text-[14px] ${
        selected ? "bg-accent text-white" : "bg-card text-ink"
      }`}
      style={{ border: selected ? "0.5px solid transparent" : "0.5px solid var(--hair)" }}
    >
      {children}
    </button>
  );
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
  disabled,
  required,
  optional,
  step,
  min,
  max,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  optional?: boolean;
  step?: string;
  min?: string;
  max?: string;
}) {
  return (
    <label className="block">
      <span className="font-sans text-[11px] uppercase tracking-[0.04em] text-sub mb-1 block">
        {label}
        {optional && <span className="lowercase tracking-normal"> · optionnel</span>}
      </span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        required={required && !optional}
        step={step}
        min={min}
        max={max}
        className="w-full rounded-2xl bg-card px-4 py-3 font-sans text-[14.5px] text-ink placeholder:text-sub focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-60"
        style={{ border: "0.5px solid var(--hair)" }}
      />
    </label>
  );
}
