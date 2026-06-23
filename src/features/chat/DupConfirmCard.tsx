"use client";

import { useTransition } from "react";
import { Icon } from "@/design/icons";
import type { EntryType } from "@/domain/types";
import { CATEGORY_META } from "./categoryMeta";
import { forceInsertEntry } from "@/features/views/actions";

/**
 * Inline chip that appears in the chat when /extract detected a near-duplicate
 * and skipped it. Lets the user override the auto-skip with one tap.
 */
export function DupConfirmCard({
  type,
  reason,
  payload,
  assignedTo,
  source,
  onResolved,
}: {
  type: EntryType;
  reason: string;
  payload: Record<string, unknown>;
  assignedTo: string | null;
  source: "vocal" | "text";
  onResolved: () => void;
}) {
  const [pending, start] = useTransition();
  const meta = CATEGORY_META[type];

  function force() {
    start(async () => {
      try {
        await forceInsertEntry({ type, payload, assignedTo, source });
        onResolved();
      } catch (e) {
        console.error("[dup-confirm] forceInsert failed", e);
      }
    });
  }

  return (
    <div
      className="flex max-w-[88%] flex-col gap-1.5 self-start rounded-[14px]"
      style={{
        background: `color-mix(in srgb, ${meta.color} 8%, transparent)`,
        border: `0.5px dashed color-mix(in srgb, ${meta.color} 50%, transparent)`,
        padding: "8px 10px",
      }}
    >
      <div className="flex items-center gap-1.5">
        <Icon name="sparkle" size={11} className="text-sub" />
        <span className="font-sans text-[11px] text-sub">Doublon détecté</span>
      </div>
      <p className="font-serif text-[13.5px] leading-tight text-ink">
        {reason}.
      </p>
      <div className="mt-1 flex gap-2">
        <button
          type="button"
          onClick={force}
          disabled={pending}
          className="rounded-md px-2.5 py-1 font-sans text-[11.5px] font-semibold text-white"
          style={{ background: meta.color }}
        >
          {pending ? "Ajout…" : "Ajouter quand même"}
        </button>
        <button
          type="button"
          onClick={onResolved}
          disabled={pending}
          className="rounded-md px-2.5 py-1 font-sans text-[11.5px] text-sub"
        >
          Ignorer
        </button>
      </div>
    </div>
  );
}
