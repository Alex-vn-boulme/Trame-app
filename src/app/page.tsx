import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[430px] flex-col items-center justify-center gap-8 px-6 py-12 text-center">
      <div className="space-y-2">
        <h1 className="font-serif text-[42px] leading-[1.05] tracking-[-0.02em] text-ink">Pia</h1>
        <p className="font-sans text-[15px] text-sub">
          L&apos;agent de charge mentale parentale.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Link
          href="/dev/atoms"
          className="font-sans text-[13px] text-accent underline underline-offset-4"
        >
          → /dev/atoms (QA design system)
        </Link>
        <Link
          href="/login"
          className="font-sans text-[13px] text-sub underline underline-offset-4"
        >
          → /login (à venir)
        </Link>
      </div>

      <p className="font-mono text-[10px] tracking-[0.05em] text-sub uppercase">
        Phase 0 · fondations
      </p>
    </main>
  );
}
