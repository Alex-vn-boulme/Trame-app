import Link from "next/link";
import { Icon } from "@/design/icons";

/**
 * Shared header for the secondary view screens (Dashboard, Todo, Courses…).
 * Back arrow → /chat, big serif title, optional subtitle, optional right slot.
 */
export function ScreenHeader({
  title,
  subtitle,
  backTo = "/chat",
  right,
}: {
  title: string;
  subtitle?: string;
  backTo?: string;
  right?: React.ReactNode;
}) {
  return (
    <header
      className="bg-surface px-4"
      style={{
        paddingTop: "max(env(safe-area-inset-top), 16px)",
        paddingBottom: 14,
        borderBottom: "0.5px solid var(--hair)",
      }}
    >
      <div className="flex items-center gap-2">
        <Link
          href={backTo}
          aria-label="Retour"
          className="-ml-1.5 flex h-9 w-9 items-center justify-center rounded-full text-sub"
        >
          <Icon name="arrow" size={18} className="rotate-180" />
        </Link>
        {right && <div className="ml-auto">{right}</div>}
      </div>
      <h1 className="mt-2 font-serif text-[28px] leading-[1.05] tracking-[-0.01em] text-ink">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1 font-sans text-[12.5px] text-sub">{subtitle}</p>
      )}
    </header>
  );
}
