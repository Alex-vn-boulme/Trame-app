"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/design/icons";

const TABS = [
  { href: "/chat",      label: "Chat",   icon: "chat" as const },
  { href: "/dashboard", label: "Accueil",icon: "home" as const },
  { href: "/todo",      label: "À faire",icon: "list" as const },
  { href: "/courses",   label: "Courses",icon: "cart" as const },
  { href: "/settings",  label: "Réglages", icon: "sparkle" as const },
];

export function BottomNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 border-t border-hair bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80"
      style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
    >
      <ul className="flex items-stretch justify-around px-2 pt-2">
        {TABS.map((t) => {
          const active = pathname === t.href || pathname.startsWith(t.href + "/");
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 font-sans text-[10.5px] ${
                  active ? "text-accent" : "text-sub"
                }`}
              >
                <Icon name={t.icon} size={20} />
                <span>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
