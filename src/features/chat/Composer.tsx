"use client";

import { useRef, useState } from "react";
import { Icon, type IconName } from "@/design/icons";
import { MicButton } from "./MicButton";

const SHORTCUTS: { icon: IconName; label: string; prefill: string }[] = [
  { icon: "bottle", label: "Biberon", prefill: "Biberon de " },
  { icon: "diaper", label: "Change", prefill: "Change " },
  { icon: "moon",   label: "Sieste",  prefill: "Sieste de " },
  { icon: "cal",    label: "RDV",     prefill: "RDV " },
  { icon: "cart",   label: "Achat",   prefill: "Achat : " },
];

/**
 * Sticky composer at the bottom of the chat. Three input modes:
 *   1. Type and tap send → POST text
 *   2. Hold mic → record audio → POST audio
 *   3. Tap a shortcut → prefill the textarea with a category seed
 *
 * The textarea is auto-resizing (single line up to 4 visible lines).
 */
export function Composer({
  onText,
  onAudio,
  pending,
}: {
  onText: (text: string) => void;
  onAudio: (blob: Blob, durationMs: number, mimeType: string) => void;
  pending: boolean;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  function autosize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  }

  function send() {
    const v = value.trim();
    if (!v || pending) return;
    onText(v);
    setValue("");
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (el) el.style.height = "auto";
    });
  }

  function applyShortcut(prefill: string) {
    setValue((v) => (v ? v : prefill));
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
        autosize();
      }
    });
  }

  return (
    <div
      className="border-t bg-surface"
      style={{
        borderColor: "var(--hair)",
        paddingTop: 8,
        paddingLeft: 12,
        paddingRight: 12,
        paddingBottom: "max(14px, env(safe-area-inset-bottom))",
      }}
    >
      <div className="no-scrollbar mb-2 flex gap-1.5 overflow-x-auto">
        {SHORTCUTS.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => applyShortcut(s.prefill)}
            disabled={pending}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-card font-sans text-[11.5px] font-medium text-ink"
            style={{
              padding: "5px 10px 5px 8px",
              border: "0.5px solid var(--hair)",
            }}
          >
            <Icon name={s.icon} size={12} className="text-sub" />
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex items-end gap-2">
        <div
          className="flex flex-1 items-center gap-2 rounded-[22px] bg-card"
          style={{
            padding: "10px 14px",
            border: "0.5px solid var(--hair)",
          }}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              autosize();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                send();
              }
            }}
            disabled={pending}
            placeholder="Dictez ou écrivez n'importe quoi…"
            rows={1}
            inputMode="text"
            className="flex-1 resize-none bg-transparent font-sans text-[14px] leading-[1.4] text-ink placeholder:text-sub focus:outline-none disabled:opacity-60"
            style={{ maxHeight: 132 }}
          />
          {value.trim().length > 0 && (
            <button
              type="button"
              onClick={send}
              disabled={pending}
              aria-label="Envoyer"
              className="rounded-full p-1 text-accent disabled:opacity-50"
            >
              <Icon name="send" size={18} />
            </button>
          )}
        </div>

        <MicButton onRecorded={onAudio} disabled={pending} size={44} />
      </div>
    </div>
  );
}
