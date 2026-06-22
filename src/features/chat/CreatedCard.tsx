import { Avatar } from "@/components/Avatar";
import { Icon } from "@/design/icons";
import type { EntryType } from "@/domain/types";
import { CATEGORY_META } from "./categoryMeta";
import type { Field } from "./extractFields";

/**
 * The inline card Pia drops into the chat each time it classifies a new
 * entry. Brief A1 spec: badge catégorie + champs extraits + footer "pour X"
 * with Modifier / Voir → actions.
 *
 * `soft` variant = tinted background using the category color at 10% — used
 * when the entry is still pending some clarification (e.g. RDV à programmer).
 */
export function CreatedCard({
  type,
  title,
  fields,
  who,
  soft = false,
  onEdit,
  onOpen,
}: {
  type: EntryType;
  title: string;
  fields?: Field[];
  /** Initial of the parent who created the entry. */
  who?: string;
  soft?: boolean;
  onEdit?: () => void;
  onOpen?: () => void;
}) {
  const meta = CATEGORY_META[type];
  return (
    <div
      className="flex max-w-[88%] flex-col gap-1.5 self-start rounded-[14px]"
      style={{
        background: soft ? `color-mix(in srgb, ${meta.color} 10%, transparent)` : "var(--card)",
        border: `0.5px solid ${soft ? `color-mix(in srgb, ${meta.color} 40%, transparent)` : "var(--hair)"}`,
        padding: "10px 12px",
      }}
    >
      {/* Header — badge + check */}
      <div className="flex items-center gap-1.5">
        <span
          className="inline-flex items-center gap-[5px] rounded-full"
          style={{
            padding: "2px 7px 2px 5px",
            background: `color-mix(in srgb, ${meta.color} 12%, transparent)`,
            color: meta.color,
          }}
        >
          <Icon name={meta.icon} size={11} />
          <span
            className="font-sans text-[10.5px] font-semibold uppercase"
            style={{ letterSpacing: "0.02em" }}
          >
            {meta.label}
          </span>
        </span>
        <span className="ml-auto font-sans text-[10.5px] text-sub">créé</span>
        <Icon name="check" size={12} strokeWidth={2.2} className="text-good" />
      </div>

      {/* Title */}
      <p
        className="font-serif text-[15px] leading-[1.25] text-ink"
        style={{ letterSpacing: "-0.01em" }}
      >
        {title}
      </p>

      {/* Extracted fields */}
      {fields && fields.length > 0 && (
        <div className="mt-0.5 flex flex-wrap gap-1">
          {fields.map((f, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-md bg-soft font-sans text-[11px]"
              style={{ padding: "2px 7px" }}
            >
              <span className="text-sub opacity-70">{f.k}</span>
              <span className="font-medium text-ink">{f.v}</span>
            </span>
          ))}
        </div>
      )}

      {/* Footer — author + actions */}
      <div
        className="mt-1 flex items-center gap-1.5"
        style={{ paddingTop: 6, borderTop: "0.5px solid var(--hair)" }}
      >
        {who && (
          <>
            <Avatar
              who={who === "T" ? "T" : "L"}
              size={14}
            />
            <span className="font-sans text-[11px] text-sub">
              pour {who === "T" ? "Thomas" : "Léa"}
            </span>
          </>
        )}
        <div className="ml-auto flex gap-2">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="font-sans text-[11.5px] text-sub"
            >
              Modifier
            </button>
          )}
          <button
            type="button"
            onClick={onOpen}
            className="font-sans text-[11.5px] font-semibold"
            style={{ color: meta.color }}
          >
            Voir →
          </button>
        </div>
      </div>
    </div>
  );
}
