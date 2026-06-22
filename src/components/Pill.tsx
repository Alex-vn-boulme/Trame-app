import type { CSSProperties, ReactNode } from "react";

type PillProps = {
  children: ReactNode;
  color?: string;
  bg?: string;
  className?: string;
  style?: CSSProperties;
};

/**
 * Small rounded label. Color + bg are explicit to support the brief's
 * "badge category" pattern where each entry type owns its own tint.
 */
export function Pill({ children, color, bg, className, style }: PillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-sans text-[11px] font-medium tracking-[0.01em] ${
        className ?? ""
      }`}
      style={{
        padding: "3px 8px",
        color,
        background: bg,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
