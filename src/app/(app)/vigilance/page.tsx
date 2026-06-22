import Link from "next/link";
import { Card } from "@/components/Card";
import { GrowthMini } from "@/components/GrowthMini";
import { Icon } from "@/design/icons";
import { Pill } from "@/components/Pill";
import { SourceFooter } from "@/components/SourceFooter";
import { ScreenHeader } from "@/features/views/ScreenHeader";
import { loadView } from "@/features/views/loadView";
import { detectPatterns } from "@/domain/vigilance-rules";
import { computeStage, formatStage } from "@/domain/stages";

export const dynamic = "force-dynamic";

const RECO_LABEL: Record<string, { org: string; title: string; year: number }> = {
  "has-constipation-nourrisson": {
    org: "HAS",
    title: "Constipation du nourrisson et du jeune enfant",
    year: 2023,
  },
  "has-troubles-oralite": {
    org: "HAS",
    title: "Troubles de l'oralité du jeune enfant",
    year: 2020,
  },
  "has-fievre-nourrisson-3m": {
    org: "HAS",
    title: "Prise en charge de la fièvre chez l'enfant",
    year: 2016,
  },
};

/**
 * D1 Vigilance — patterns détectés.
 * - Top alert card (highest severity pattern) with halo.
 * - List of secondary patterns.
 * - 2×2 grid: vaccins / allergies / pédiatre / ordonnances.
 * - Mini growth chart.
 */
export default async function VigilancePage() {
  const { supabase, householdId } = await loadView();

  const { data: child } = await supabase
    .from("children")
    .select("id, name, birth_date, due_date, weight_kg")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const stageLabel = child && (child.birth_date || child.due_date)
    ? formatStage(
        computeStage({
          birthDate: child.birth_date ? new Date(child.birth_date) : null,
          dueDate: child.due_date ? new Date(child.due_date) : null,
        }),
        child.name,
      )
    : "Suivi";

  // Look back 7 days for pattern detection.
  const since = new Date(Date.now() - 7 * 24 * 3_600_000).toISOString();
  const { data: entries } = await supabase
    .from("entries")
    .select("id, type, payload, created_at, due_at, child_id")
    .eq("household_id", householdId)
    .gte("created_at", since)
    .in("type", ["change", "biberon", "symptome"]);

  const patterns = detectPatterns(
    (entries ?? []).map((e) => ({
      id: e.id,
      type: e.type,
      payload: e.payload,
      created_at: e.created_at,
      due_at: e.due_at,
      child_id: e.child_id,
    })),
    {
      birthDate: child?.birth_date ? new Date(child.birth_date) : null,
      weightKg: child?.weight_kg ?? null,
    },
  );

  const primary = patterns[0];
  const secondary = patterns.slice(1);

  // Weight history for growth chart.
  const { data: weights } = child?.id
    ? await supabase
        .from("weights")
        .select("measured_at, weight_kg")
        .eq("child_id", child.id)
        .order("measured_at", { ascending: true })
    : { data: [] as unknown[] };

  const measurements = (weights as { measured_at: string; weight_kg: number }[] | undefined)?.map((w) => {
    const ageMs = child?.birth_date ? +new Date(w.measured_at) - +new Date(child.birth_date) : 0;
    return { ageMonths: ageMs / (1000 * 60 * 60 * 24 * 30.4375), weightKg: w.weight_kg };
  }) ?? [];

  return (
    <div className="flex min-h-dvh flex-col bg-bg pb-12">
      <ScreenHeader
        title="Vigilance"
        subtitle={stageLabel}
        right={
          <Link
            href="tel:15"
            aria-label="Appeler le 15"
            className="rounded-full font-sans text-[12px] font-semibold"
            style={{
              background: "color-mix(in srgb, #c94422 14%, transparent)",
              color: "#c94422",
              padding: "6px 14px",
            }}
          >
            SOS · 15
          </Link>
        }
      />

      <main className="space-y-4 px-4 pt-4">
        {/* Primary alert */}
        {primary && (
          <div
            className="rounded-[18px] bg-card"
            style={{
              border: "0.5px solid var(--hair)",
              boxShadow:
                primary.severity === "alert"
                  ? "0 0 0 3px color-mix(in srgb, var(--warn) 10%, transparent)"
                  : undefined,
              padding: 16,
            }}
          >
            <div
              className="mb-2 -mx-4 -mt-4 px-4 py-2"
              style={{
                background: primary.severity === "alert"
                  ? "color-mix(in srgb, var(--warn) 10%, transparent)"
                  : "var(--soft)",
              }}
            >
              <Pill
                color={primary.severity === "alert" ? "var(--warn)" : "var(--sub)"}
                bg="transparent"
              >
                <Icon name="flame" size={11} />
                À surveiller
              </Pill>
            </div>
            <p className="font-serif text-[17px] leading-tight text-ink">{primary.title}</p>
            {primary.body && (
              <p className="mt-1 font-sans text-[13.5px] text-sub">{primary.body}</p>
            )}
            <div className="mt-3 flex gap-2">
              <Link
                href="/chat"
                className="rounded-full bg-accent px-3.5 py-1.5 font-sans text-[12.5px] font-medium text-white"
              >
                Demander à Pia
              </Link>
              <Link
                href="tel:15"
                className="rounded-full px-3.5 py-1.5 font-sans text-[12.5px] font-medium"
                style={{ border: "0.5px solid var(--hair)", color: "var(--ink)" }}
              >
                Pédiatre
              </Link>
            </div>
            {primary.recommendationId && RECO_LABEL[primary.recommendationId] ? (
              <SourceFooter
                org={RECO_LABEL[primary.recommendationId].org}
                title={RECO_LABEL[primary.recommendationId].title}
                year={RECO_LABEL[primary.recommendationId].year}
              />
            ) : (
              <SourceFooter heuristic />
            )}
          </div>
        )}

        {/* Secondary patterns */}
        {secondary.length > 0 && (
          <section>
            <h2 className="mb-2 font-sans text-[11px] uppercase tracking-[0.04em] text-sub">
              Aussi à surveiller
            </h2>
            <div className="space-y-1.5">
              {secondary.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-xl bg-card px-3 py-2.5"
                  style={{ border: "0.5px solid var(--hair)" }}
                >
                  <span
                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                    style={{
                      background: "color-mix(in srgb, var(--warn) 14%, transparent)",
                      color: "var(--warn)",
                    }}
                  >
                    <Icon name="wave" size={13} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-serif text-[14px] text-ink">{p.title}</p>
                    {p.body && (
                      <p className="truncate font-sans text-[11.5px] text-sub">{p.body}</p>
                    )}
                  </div>
                  <Icon name="arrow" size={14} className="text-sub" />
                </div>
              ))}
            </div>
          </section>
        )}

        {!primary && (
          <Card>
            <p className="text-center font-serif text-[15px] text-ink">
              Tout va bien aujourd&apos;hui.
            </p>
            <p className="mt-1 text-center font-sans text-[12.5px] text-sub">
              Pia surveille en continu — les seuils HAS sont actifs.
            </p>
            <SourceFooter org="HAS" title="Suivi du nourrisson 0-2 ans" year={2024} compact />
          </Card>
        )}

        {/* 2×2 grid */}
        <section>
          <h2 className="mb-2 font-sans text-[11px] uppercase tracking-[0.04em] text-sub">
            Carnet de santé
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <CarnetTile icon="heart" label="Vaccins" href="/anticipation" />
            <CarnetTile icon="wave" label="Allergies" href="/recall?q=allergies" />
            <CarnetTile icon="cal" label="Pédiatre" href="tel:15" />
            <CarnetTile icon="note" label="Ordonnances" href="/recall?q=ordonnance" />
          </div>
        </section>

        {/* Growth chart */}
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <p className="font-sans text-[11px] uppercase tracking-[0.04em] text-sub">
              Courbe de poids
            </p>
            {child?.weight_kg && (
              <p className="font-mono text-[12px] text-ink">{child.weight_kg} kg</p>
            )}
          </div>
          <GrowthMini measurements={measurements} />
          <SourceFooter
            org="CarnetDeSante"
            title="Courbes de croissance — modèle officiel"
            year={2024}
            compact
          />
        </Card>
      </main>
    </div>
  );
}

function CarnetTile({ icon, label, href }: { icon: "heart" | "wave" | "cal" | "note"; label: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-1 rounded-2xl bg-card px-3 py-3 text-ink"
      style={{ border: "0.5px solid var(--hair)" }}
    >
      <Icon name={icon} size={16} className="text-sub" />
      <span className="font-sans text-[12.5px]">{label}</span>
    </Link>
  );
}
