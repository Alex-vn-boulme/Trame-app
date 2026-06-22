import Link from "next/link";
import { Card } from "@/components/Card";
import { Icon } from "@/design/icons";
import { SourceFooter } from "@/components/SourceFooter";
import { ScreenHeader } from "@/features/views/ScreenHeader";
import { loadView } from "@/features/views/loadView";
import { paracetamolDose } from "@/domain/doses";
import { hhmm, relativeFr } from "@/lib/format";

export const dynamic = "force-dynamic";

/**
 * D2 Meds — médicaments & SOS.
 * Brief: "peux-tu lui en redonner ?" canonical question, dose at weight,
 * 24h timeline, daily max, urgent contacts.
 */
export default async function MedsPage() {
  const { supabase, householdId } = await loadView();

  const { data: child } = await supabase
    .from("children")
    .select("name, weight_kg, birth_date")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  // Last 24h of paracetamol-tagged medic entries.
  const since = new Date(Date.now() - 24 * 3_600_000).toISOString();
  const { data: medicEntries } = await supabase
    .from("entries")
    .select("id, payload, created_at")
    .eq("household_id", householdId)
    .eq("type", "medic")
    .gte("created_at", since)
    .order("created_at", { ascending: false });

  const paracetamolEntries = (medicEntries ?? []).filter((e) => {
    const name = (e.payload as { name?: string } | null)?.name?.toLowerCase() ?? "";
    return name.includes("doliprane") || name.includes("paracetamol") || name.includes("paracétamol");
  });
  const lastTaken = paracetamolEntries[0]
    ? new Date(paracetamolEntries[0].created_at)
    : null;

  const weight = child?.weight_kg ?? null;
  const dose = weight ? paracetamolDose({ weightKg: weight, lastTakenAt: lastTaken }) : null;

  return (
    <div className="flex min-h-dvh flex-col bg-bg pb-12">
      <ScreenHeader
        title="Médicaments"
        subtitle={child?.name ? `${child.name}${weight ? ` · ${weight} kg` : ""}` : undefined}
      />

      <main className="space-y-4 px-4 pt-4">
        {!weight && (
          <Card>
            <p className="font-serif text-[15px] text-ink">
              Renseigne le poids de {child?.name ?? "ton enfant"}.
            </p>
            <p className="mt-1 font-sans text-[12.5px] text-sub">
              Le calcul de dose nécessite le poids actuel.
            </p>
            <Link
              href="/settings"
              className="mt-3 inline-flex rounded-full bg-accent px-3.5 py-1.5 font-sans text-[12.5px] font-medium text-white"
            >
              Mettre à jour
            </Link>
          </Card>
        )}

        {dose && (
          <>
            {/* Canonical "peux-tu lui en redonner" card */}
            <Card>
              <p className="font-sans text-[11px] uppercase tracking-[0.04em] text-sub">
                Doliprane
              </p>
              <p className="mt-1 font-serif text-[19px] leading-tight text-ink">
                Peux-tu lui en redonner ?
              </p>

              <div className="mt-3 flex items-center gap-2">
                <span
                  className="relative inline-flex h-2.5 w-2.5 rounded-full"
                  style={{ background: dose.canGiveNow ? "var(--good)" : "var(--warn)" }}
                  aria-hidden
                >
                  {dose.canGiveNow && (
                    <span
                      className="absolute inset-0 animate-ping rounded-full opacity-70"
                      style={{ background: "var(--good)" }}
                    />
                  )}
                </span>
                <p
                  className="font-serif text-[16px] text-ink"
                  style={{ color: dose.canGiveNow ? "var(--good)" : "var(--warn)" }}
                >
                  {dose.canGiveNow ? "Oui — tu peux." : "Pas encore."}
                </p>
              </div>

              <p className="mt-2 font-sans text-[12.5px] text-sub">
                {lastTaken ? (
                  <>
                    Dernière prise {relativeFr(lastTaken)} ·{" "}
                    {dose.canGiveNow ? "délai mini respecté" : "encore quelques heures"}
                  </>
                ) : (
                  "Aucune prise dans les 24h passées."
                )}
              </p>

              <SourceFooter
                org="ANSM"
                title="RCP Doliprane suspension buvable 2,4 %"
                year={2023}
              />
            </Card>

            {/* 2 mini cards */}
            <div className="grid grid-cols-2 gap-2">
              <Card pad={14}>
                <p className="font-sans text-[10.5px] uppercase tracking-[0.04em] text-sub">
                  Dose au poids
                </p>
                <p className="mt-1 font-serif text-[22px] leading-none text-ink tabular-nums">
                  {dose.doseMl} ml
                </p>
                <p className="font-mono text-[11px] text-sub">
                  ({weight} kg × 15 mg/kg)
                </p>
              </Card>
              <Card pad={14}>
                <p className="font-sans text-[10.5px] uppercase tracking-[0.04em] text-sub">
                  Prochaine prise
                </p>
                <p className="mt-1 font-serif text-[22px] leading-none text-ink tabular-nums">
                  {dose.nextAllowedAt ? hhmm(dose.nextAllowedAt) : "—"}
                </p>
                <p className="font-mono text-[11px] text-sub">
                  max {dose.maxDailyMg / 1000}g/jour
                </p>
              </Card>
            </div>

            {/* CTA */}
            <Link
              href="/chat?prefill=Doliprane%20"
              className="flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 font-sans text-[13.5px] font-medium text-white"
            >
              <Icon name="check" size={16} />
              Enregistrer la prise
            </Link>
          </>
        )}

        {/* Active treatments */}
        <section>
          <h2 className="mb-2 font-sans text-[11px] uppercase tracking-[0.04em] text-sub">
            Traitements actifs
          </h2>
          <Card pad={12}>
            <ul className="space-y-1.5">
              <li className="flex items-center justify-between">
                <span className="font-serif text-[14px] text-ink">Vitamine D</span>
                <span className="font-mono text-[11.5px] text-sub">1200 UI · 1×/j</span>
              </li>
              {paracetamolEntries.length > 0 && (
                <li className="flex items-center justify-between">
                  <span className="font-serif text-[14px] text-ink">Doliprane (PRN)</span>
                  <span className="font-mono text-[11.5px] text-sub">
                    {paracetamolEntries.length}×/24h
                  </span>
                </li>
              )}
            </ul>
            <SourceFooter
              org="ANSM"
              title="Supplémentation en vitamine D chez le nourrisson"
              year={2022}
              compact
            />
          </Card>
        </section>

        {/* Urgence */}
        <section>
          <h2 className="mb-2 font-sans text-[11px] uppercase tracking-[0.04em] text-sub">
            Urgence
          </h2>
          <div className="space-y-1.5">
            <ContactRow href="tel:15" label="SAMU pédiatrique" sub="24h/24 · gratuit" color="#c94422" />
            <ContactRow href="tel:" label="Pédiatre" sub="Dr Renaud" color="var(--accent)" />
            <ContactRow href="tel:" label="SOS Allaitement" sub="Consultantes IBCLC" color="var(--good)" />
          </div>
          <SourceFooter
            org="SantePubliqueFrance"
            title="Numéros d'urgence"
            year={2024}
            compact
          />
        </section>
      </main>
    </div>
  );
}

function ContactRow({
  href,
  label,
  sub,
  color,
}: {
  href: string;
  label: string;
  sub: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl bg-card px-3 py-2.5"
      style={{ border: "0.5px solid var(--hair)" }}
    >
      <span
        className="inline-flex h-9 w-9 items-center justify-center rounded-full"
        style={{ background: "color-mix(in srgb, " + color + " 14%, transparent)", color }}
      >
        <Icon name="heart" size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-serif text-[14.5px] text-ink">{label}</p>
        <p className="font-sans text-[11.5px] text-sub">{sub}</p>
      </div>
      <span className="font-sans text-[12.5px] font-semibold" style={{ color }}>
        Appeler
      </span>
    </Link>
  );
}
