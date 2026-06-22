import type { CSSProperties, ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Padding in px. Brief uses 14–18 typically. */
  pad?: number;
};

/**
 * Standard soft card — paper-cream background, hair border, no shadow.
 * Brief §4: rayon 16–22, padding 14–18, border 0.5px solid hair.
 */
export function Card({ children, className, style, pad = 16 }: CardProps) {
  return (
    <div
      className={`bg-card rounded-[18px] ${className ?? ""}`}
      style={{
        padding: pad,
        border: "0.5px solid var(--hair)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
