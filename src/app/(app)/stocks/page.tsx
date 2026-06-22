import Link from "next/link";
import { Card } from "@/components/Card";
import { Icon } from "@/design/icons";
import { Pill } from "@/components/Pill";
import { SourceFooter } from "@/components/SourceFooter";
import { StockGauge } from "@/components/StockGauge";
import { ScreenHeader } from "@/features/views/ScreenHeader";
import { loadView } from "@/features/views/loadView";

export const dynamic = "force-dynamic";

/**
 * F2 Stocks — featured card + consumption breakdown + reorder CTA + list.
 */
export default async function StocksPage() {
  const { supabase, householdId } = await loadView();

  const { data: stocks } = await supabase
    .from("stocks")
    .select("id, item, unit, current_qty, daily_consumption, reorder_url, reorder_price, updated_at")
    .eq("household_id", householdId);

  // Featured = the stock with the fewest days remaining.
  const enriched = (stocks ?? []).map((s) => {
    const daysLeft = s.daily_consumption && s.daily_consumption > 0
      ? Math.floor(s.current_qty / s.daily_consumption)
      : null;
    return { ...s, daysLeft };
  });
  enriched.sort((a, b) => (a.daysLeft ?? Infinity) - (b.daysLeft ?? Infinity));
  const featured = enriched[0];

  return (
    <div className="flex min-h-dvh flex-col bg-bg pb-12">
      <ScreenHeader title="Stocks" subtitle="Pia anticipe ce qu'il manque" />

      <main className="space-y-4 px-4 pt-4">
        {!featured && (
          <Card>
            <p className="font-serif text-[15px] text-ink">Aucun stock suivi pour le moment.</p>
            <p className="mt-1 font-sans text-[12.5px] text-sub">
              Pia commence à suivre dès que tu mentionnes un achat récurrent (couches, lait infantile, lingettes…).
            </p>
          </Card>
        )}

        {featured && (
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-sans text-[10.5px] uppercase tracking-[0.04em] text-sub">
                  Prochain à recommander
                </p>
                <p className="mt-1 font-serif text-[18px] text-ink">{featured.item}</p>
              </div>
              {featured.daysLeft !== null && featured.daysLeft <= 3 && (
                <Pill color="var(--warn)" bg="color-mix(in srgb, var(--warn) 12%, transparent)">
                  {featured.daysLeft} jour{featured.daysLeft > 1 ? "s" : ""} restant{featured.daysLeft > 1 ? "s" : ""}
                </Pill>
              )}
            </div>
            <div className="mt-3">
              <StockGauge filled={Math.round(featured.current_qty)} total={14} />
              <p className="mt-1 font-mono text-[11px] text-sub">
                {Math.round(featured.current_qty)} {featured.unit} en stock
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-soft px-3 py-2.5">
                <p className="font-sans text-[10.5px] uppercase tracking-[0.04em] text-sub">
                  Consommation
                </p>
                <p className="mt-0.5 font-serif text-[15px] text-ink">
                  {featured.daily_consumption ?? "—"}/jour
                </p>
              </div>
              <div className="rounded-xl bg-soft px-3 py-2.5">
                <p className="font-sans text-[10.5px] uppercase tracking-[0.04em] text-sub">
                  À prévoir
                </p>
                <p className="mt-0.5 font-serif text-[15px] text-ink">
                  Bientôt taille +1
                </p>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              {featured.reorder_url && (
                <Link
                  href={featured.reorder_url}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-accent px-4 py-2.5 font-sans text-[13px] font-medium text-white"
                >
                  <Icon name="cart" size={14} />
                  Re-commander {featured.reorder_price ? `· ${featured.reorder_price}€` : ""}
                </Link>
              )}
              <Link
                href="/chat?prefill=Stock%20"
                className="flex items-center justify-center rounded-full px-3 py-2.5 font-sans text-[13px] text-ink"
                style={{ border: "0.5px solid var(--hair)" }}
              >
                Ajuster
              </Link>
            </div>
            <SourceFooter heuristic />
          </Card>
        )}

        <section>
          <h2 className="mb-2 font-sans text-[11px] uppercase tracking-[0.04em] text-sub">
            Tous les stocks suivis
          </h2>
          <div className="space-y-1.5">
            {enriched.slice(1).map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 rounded-xl bg-card px-3 py-2.5"
                style={{ border: "0.5px solid var(--hair)" }}
              >
                <Icon name="cart" size={16} className="text-sub" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-serif text-[14px] text-ink">{s.item}</p>
                  <p className="font-sans text-[11.5px] text-sub">
                    {s.current_qty} {s.unit}
                  </p>
                </div>
                {s.daysLeft !== null && (
                  <span
                    className="font-mono text-[11px]"
                    style={{ color: s.daysLeft <= 3 ? "var(--warn)" : "var(--sub)" }}
                  >
                    {s.daysLeft}j
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        <Card pad={12}>
          <p className="font-sans text-[10.5px] uppercase tracking-[0.04em] text-sub">
            Comment je sais
          </p>
          <p className="mt-1 font-serif text-[13.5px] leading-tight text-ink">
            Tu m&apos;as dit combien tu en utilises par jour. Je décompte au fil des changes et biberons.
          </p>
        </Card>
      </main>
    </div>
  );
}
