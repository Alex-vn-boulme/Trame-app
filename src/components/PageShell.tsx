import type { ReactNode } from "react";

/**
 * Mobile-first shell: caps content at 430px (iPhone 14 Pro logical width),
 * centers it, and reserves safe-area insets so the composer / FAB don't
 * collide with the home indicator on iOS.
 */
export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`mx-auto flex min-h-dvh max-w-[430px] flex-col bg-bg ${className ?? ""}`}
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {children}
    </div>
  );
}
