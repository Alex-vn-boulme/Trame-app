import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/design/icons";
import type { EntryType } from "@/domain/types";
import { CATEGORY_META } from "./categoryMeta";
import type { Field } from "./extractFields";

/** Types where it makes sense to assign a person ("pour Thomas"). Other
 *  types (biberon, change, sieste…) are about the child by default. */
const ASSIGNABLE: ReadonlySet<EntryType> = new Set(["rdv", "course", "admin"]);

/** Each entry type lands in a default view — used for the "Voir →" link. */
function viewFor(type: EntryType): string {
  switch (type) {
    case "course":   return "/courses";
    case "rdv":      return "/todo";
    case "admin":    return "/todo";
    case "biberon":
    case "change":
    case "sieste":   return "/tracking";
    case "medic":    return "/meds";
    case "symptome": return "/vigilance";
    case "jalon":
    case "lecture":  return "/logbook";
    case "note":     return "/recall";
  }
}

export function CreatedCard({
  entryId,
  type,
  title,
  fields,
  creator,
  assignee,
  soft = false,
}: {
  entryId?: string;
  type: EntryType;
  title: string;
  fields?: Field[];
  /** Display info for the parent who created the entry. */
  creator?: { initial: string; name?: string | null; color?: string | null };
  /** Display info for the parent the entry is assigned to. Only used on
   *  assignable types — falsy → "à assigner" prompt on those types. */
  assignee?: { initial: string; name?: string | null; color?: string | null } | null;
  soft?: boolean;
}) {
  const meta = CATEGORY_META[type];
  const showAssign = ASSIGNABLE.has(type);
  const viewHref = entryId ? `${viewFor(type)}#entry-${entryId}` : viewFor(type);

  return (
    <div
      className="flex max-w-[88%] flex-col gap-1.5 self-start rounded-[14px]"
      style={{
        background: soft ? `color-mix(in srgb, ${meta.color} 10%, transparent)` : "var(--card)",
        border: `0.5px solid ${soft ? `color-mix(in srgb, ${meta.color} 40%, transparent)` : "var(--hair)"}`,
        padding: "10px 12px",
      }}
    >
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

      <p
        className="font-serif text-[15px] leading-[1.25] text-ink"
        style={{ letterSpacing: "-0.01em" }}
      >
        {title}
      </p>

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

      <div
        className="mt-1 flex items-center gap-1.5"
        style={{ paddingTop: 6, borderTop: "0.5px solid var(--hair)" }}
      >
        {creator && (
          <span className="inline-flex items-center gap-1">
            <Avatar initial={creator.initial} color={creator.color ?? undefined} size={14} />
            <span className="font-sans text-[11px] text-sub">
              par {creator.name ?? creator.initial}
            </span>
          </span>
        )}

        {showAssign && (
          <span className="font-sans text-[11px] text-sub">
            {assignee ? (
              <>· pour <span className="font-medium text-ink">{assignee.name ?? assignee.initial}</span></>
            ) : (
              <Link href={viewHref} className="text-accent">· à assigner</Link>
            )}
          </span>
        )}

        <Link
          href={viewHref}
          className="ml-auto font-sans text-[11.5px] font-semibold"
          style={{ color: meta.color }}
        >
          Voir →
        </Link>
      </div>
    </div>
  );
}
