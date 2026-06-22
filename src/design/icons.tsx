/**
 * Pia icon set — line icons, 24x24 viewBox, 1.6 stroke, round caps/joins.
 * Ported from design_handoff/design_handoff_pia/ui.jsx.
 *
 * Usage: <Icon name="bottle" size={20} className="text-accent" />
 * Color comes from `currentColor`, so wrap with text-* utility on parent.
 */

type IconName =
  | "bottle"
  | "diaper"
  | "moon"
  | "cal"
  | "cart"
  | "milestone"
  | "chat"
  | "mic"
  | "send"
  | "plus"
  | "check"
  | "sparkle"
  | "clock"
  | "flame"
  | "home"
  | "belly"
  | "heart"
  | "note"
  | "list"
  | "arrow"
  | "wave";

type IconProps = {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
};

export function Icon({ name, size = 20, strokeWidth = 1.6, className }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
  switch (name) {
    case "bottle":
      return (
        <svg {...common}>
          <path d="M9 3h6M10 3v2.5c0 .7-.3 1.3-.8 1.8L8 8.5C7.3 9.2 7 10.1 7 11v7a3 3 0 003 3h4a3 3 0 003-3v-7c0-.9-.3-1.8-1-2.5l-1.2-1.2c-.5-.5-.8-1.1-.8-1.8V3" />
          <path d="M7 13h10" />
        </svg>
      );
    case "diaper":
      return (
        <svg {...common}>
          <path d="M3 9c4 0 7 3 9 3s5-3 9-3v3c0 4-4 8-9 8s-9-4-9-8V9z" />
          <path d="M9 13l1 3M15 13l-1 3" />
        </svg>
      );
    case "moon":
      return (
        <svg {...common}>
          <path d="M20 14.5A8 8 0 119.5 4 6.5 6.5 0 0020 14.5z" />
        </svg>
      );
    case "cal":
      return (
        <svg {...common}>
          <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
          <path d="M3.5 10h17M8 3v4M16 3v4" />
        </svg>
      );
    case "cart":
      return (
        <svg {...common}>
          <path d="M3 4h2l2.5 11.5a2 2 0 002 1.5h7.5a2 2 0 002-1.5L20.5 8H7" />
          <circle cx="10" cy="20" r="1.2" />
          <circle cx="17" cy="20" r="1.2" />
        </svg>
      );
    case "milestone":
      return (
        <svg {...common}>
          <path d="M12 3v18M5 6h11l-2 3 2 3H5z" />
        </svg>
      );
    case "chat":
      return (
        <svg {...common}>
          <path d="M4 6a3 3 0 013-3h10a3 3 0 013 3v8a3 3 0 01-3 3h-6l-4 3v-3H7a3 3 0 01-3-3V6z" />
        </svg>
      );
    case "mic":
      return (
        <svg {...common}>
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M5 11a7 7 0 0014 0M12 18v3" />
        </svg>
      );
    case "send":
      return (
        <svg {...common}>
          <path d="M4 12l16-8-6 16-3-7-7-1z" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="M5 12l4 4 10-10" />
        </svg>
      );
    case "sparkle":
      return (
        <svg {...common}>
          <path d="M12 3l1.8 4.7L18 9.5l-4.2 1.8L12 16l-1.8-4.7L6 9.5l4.2-1.8L12 3z" />
          <path d="M19 16l.8 2 2 .8-2 .8L19 22l-.8-2-2-.8 2-.8L19 16z" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7v5l3.5 2" />
        </svg>
      );
    case "flame":
      return (
        <svg {...common}>
          <path d="M12 3c1 4 4 5 4 9a4 4 0 11-8 0c0-2 1-3 1.5-4 .5 1.5 1.5 2 1.5 2 0-3 1-5 1-7z" />
        </svg>
      );
    case "home":
      return (
        <svg {...common}>
          <path d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1v-9z" />
        </svg>
      );
    case "belly":
      return (
        <svg {...common}>
          <path d="M9 5c-3 0-5 2-5 5 0 1.5.7 3 1.8 4.2A6 6 0 0011.5 16h.5c4.4 0 7-3 7-6.5S16.4 3 12 3 9 5 9 5z" />
          <circle cx="11.5" cy="10" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <path d="M12 20s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.5-7 10-7 10z" />
        </svg>
      );
    case "note":
      return (
        <svg {...common}>
          <path d="M5 4h11l3 3v13a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z" />
          <path d="M16 4v3h3M8 12h7M8 16h5" />
        </svg>
      );
    case "list":
      return (
        <svg {...common}>
          <path d="M8 6h12M8 12h12M8 18h12" />
          <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" />
          <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
          <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );
    case "wave":
      return (
        <svg {...common}>
          <path d="M3 14c2 0 2-4 4-4s2 4 4 4 2-4 4-4 2 4 4 4" />
        </svg>
      );
  }
}

export type { IconName };
