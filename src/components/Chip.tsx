import type { CSSProperties, ReactNode } from "react";

type ChipProps = {
  children: ReactNode;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
  style?: CSSProperties;
  icon?: ReactNode;
};

/**
 * Chip — used for category filters, composer shortcuts, suggestion CTAs.
 * Two visual states: idle (border hair, soft bg) and selected (accent).
 */
export function Chip({ children, onClick, selected, className, icon, style }: ChipProps) {
  const isButton = !!onClick;
  const Tag = isButton ? "button" : "span";
  return (
    <Tag
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full font-sans text-[12.5px] ${
        selected
          ? "bg-accent text-white"
          : "bg-soft text-ink"
      } ${className ?? ""}`}
      style={{
        padding: "6px 12px",
        border: selected ? "0.5px solid transparent" : "0.5px solid var(--hair)",
        ...style,
      }}
      type={isButton ? "button" : undefined}
    >
      {icon}
      {children}
    </Tag>
  );
}
