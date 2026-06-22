import type { ReactNode } from "react";
import { PageShell } from "@/components/PageShell";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <PageShell className="justify-center px-6">
      <div className="mb-10 text-center">
        <p className="font-serif text-[36px] leading-[1] tracking-[-0.02em] text-ink">Pia</p>
        <p className="font-sans text-[13px] text-sub mt-1">
          L&apos;agent de charge mentale parentale.
        </p>
      </div>
      {children}
    </PageShell>
  );
}
