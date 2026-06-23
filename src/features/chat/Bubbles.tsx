import { Icon } from "@/design/icons";
import type { ParentKey } from "@/design/people";

/**
 * UserBubble — right-aligned, accent fill, BR-tip flat.
 * Voice = optional mic icon prefix + " · dicté" meta.
 * `showTime` hides the meta line on chained messages from the same sender.
 */
export function UserBubble({
  children,
  time,
  voice,
  who: _who = "L",
  showTime = true,
}: {
  children: React.ReactNode;
  time: string;
  voice?: boolean;
  who?: ParentKey;
  showTime?: boolean;
}) {
  return (
    <div className="flex flex-col items-end gap-1">
      <div
        className="flex max-w-[85%] items-start gap-2 bg-accent text-white"
        style={{
          borderRadius: "18px 18px 4px 18px",
          padding: "9px 13px",
          fontFamily: "var(--font-sans)",
          fontSize: 14,
          lineHeight: 1.4,
        }}
      >
        {voice && <Icon name="mic" size={13} className="opacity-80" />}
        <span>{children}</span>
      </div>
      {showTime && (
        <div className="mr-1 flex items-center gap-1">
          <span className="font-mono text-[10px] text-sub">
            {time}
            {voice ? " · dicté" : ""}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * PiaSay — left-aligned, soft fill, BL-tip flat.
 * Optional `summary` (smaller meta line under the message).
 */
export function PiaSay({
  children,
  summary,
}: {
  children: React.ReactNode;
  summary?: string;
}) {
  return (
    <div
      className="max-w-[86%] self-start bg-soft text-ink"
      style={{
        borderRadius: "18px 18px 18px 4px",
        padding: "9px 13px",
        fontFamily: "var(--font-sans)",
        fontSize: 13.5,
        lineHeight: 1.45,
      }}
    >
      {children}
      {summary && (
        <div className="mt-1 font-sans text-[11.5px] text-sub">{summary}</div>
      )}
    </div>
  );
}

export function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex justify-center">
      <span
        className="rounded-full bg-surface font-sans text-[10.5px] uppercase text-sub"
        style={{ padding: "2px 10px", letterSpacing: "0.05em" }}
      >
        {label}
      </span>
    </div>
  );
}
