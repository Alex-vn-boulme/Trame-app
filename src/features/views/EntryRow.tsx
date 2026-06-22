"use client";

import { useTransition } from "react";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/design/icons";
import { setEntryStatus } from "./actions";

/**
 * Checkable row used by Todo and "Pia propose" lists.
 * Optimistic-by-RSC-revalidation — the Server Action does the DB write,
 * and revalidatePath refreshes the page. Acceptable for MVP; later phase
 * can wire useOptimistic for an instant flip.
 */
export function EntryRow({
  id,
  title,
  meta,
  who,
  status,
  proposed,
  accentDot,
}: {
  id: string;
  title: string;
  meta?: string;
  who?: string;
  status: "open" | "done" | "snoozed" | "ignored";
  proposed?: boolean;
  accentDot?: string;
}) {
  const [pending, start] = useTransition();
  const checked = status === "done";

  function toggle() {
    start(() => setEntryStatus(id, checked ? "open" : "done"));
  }

  return (
    <div
      className={`flex items-center gap-3 rounded-xl bg-card px-3 py-2.5 ${
        pending ? "opacity-50" : ""
      }`}
      style={{ border: "0.5px solid var(--hair)" }}
    >
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={checked}
        aria-label={checked ? "Marquer à faire" : "Marquer fait"}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
        style={{
          border: checked ? "0.5px solid transparent" : "0.5px solid var(--hair)",
          background: checked ? "var(--good)" : "transparent",
        }}
      >
        {checked ? (
          <Icon name="check" size={14} className="text-white" strokeWidth={2.4} />
        ) : proposed ? (
          <Icon name="sparkle" size={12} className="text-accent" />
        ) : (
          accentDot && (
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: accentDot }}
            />
          )
        )}
      </button>
      <div className="min-w-0 flex-1">
        <p
          className={`truncate font-serif text-[14.5px] leading-tight text-ink ${
            checked ? "line-through opacity-60" : ""
          }`}
        >
          {title}
        </p>
        {meta && <p className="font-sans text-[11.5px] text-sub">{meta}</p>}
      </div>
      {who && <Avatar who={who === "T" ? "T" : "L"} size={18} />}
    </div>
  );
}
