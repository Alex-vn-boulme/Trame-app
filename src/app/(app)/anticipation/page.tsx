import Link from "next/link";
import { Card } from "@/components/Card";
import { Icon } from "@/design/icons";
import { Pill } from "@/components/Pill";
import { SourceFooter } from "@/components/SourceFooter";
import { ScreenHeader } from "@/features/views/ScreenHeader";
import { loadView } from "@/features/views/loadView";
import { computeStage, formatStage } from "@/domain/stages";

export const dynamic = "force-dynamic";

/**
 * F1 Anticipation — header semaine/âge + featured card + suggestion list
 * + "Je penserai à te rappeler" projection.
 *
 * MVP: suggestions are derived from the recommendations table filtered by
 * the current child's stage. Full Pia anticipation (cron-driven) is a Phase 5+
 * enhancement.
 */
export default async function AnticipationPage() {
  const { supabase, householdId } = await loadView();

  const { data: child } = await supabase
    .from("children")
    .select("name, birth_date, due_date")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const stage = child && (child.birth_date || child.due_date)
    ? computeStage({
        birthDate: child.birth_date ? new Date(child.birth_date) : null,
        dueDate: child.due_date ? new Date(child.due_date) : null,
      })
    : null;
  const stageLabel = stage && child ? formatStage(stage, child.name) : "";

  // Featured suggestion — pregnancy week ≥ 37: valise mater. Otherwise next vaccine.
  let featured: { title: string; body: string; org: string; recoTitle: string; year: number } | null = null;
  if (stage?.kind === "pregnancy" && stage.weeks >= 35) {
    featured = {
      title: "Préparer la valise maternité",
      body: "On entre dans la dernière ligne droite. Mets ce qu'il faut pour toi, bébé, le sortir aller-retour mater.",
      org: "Maternité",
      recoTitle: "Livret patient — recommandation locale",
      year: 2024,
    };
  } else if (stage?.kind === "infant" || stage?.kind === "toddler") {
    featured = {
      title: "Prochain examen médical obligatoire",
      body: "9 examens dans la première année. Vérifie le calendrier dans ton carnet de santé.",
      org: "HAS",
      recoTitle: "Suivi du nourrisson 0-2 ans",
      year: 2024,
    };
  } else {
    featured = {
      title: "Déclaration de naissance",
      body: "Dans les 5 jours après la naissance, à la mairie du lieu de l'accouchement.",
      org: "ServicePublic",
      recoTitle: "Déclaration de naissance",
      year: 2025,
    };
  }

  // Secondary suggestions filtered by stage.
  type Reco = { id: string; text: string; org: string | null; title: string | null; year: number | null; category: string };
  const { data: recsRaw } = await supabase
    .from("recommendations")
    .select("id, text, org, title, year, category, applies_to")
    .in("category", stage?.kind === "pregnancy" ? ["grossesse", "admin"] : ["vaccins", "vigilance", "developpement", "admin"])
    .limit(8);
  const secondaries = (recsRaw ?? []) as Reco[];

  return (
    <div className="flex min-h-dvh flex-col bg-bg pb-12">
      <ScreenHeader
        title={stage?.kind === "pregnancy" ? `Semaine ${stage.weeks}` : "Anticipation"}
        subtitle={stageLabel || "On regarde devant"}
      />

      <main className="space-y-4 px-4 pt-4">
        <Card>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <Pill color="var(--accent)" bg="var(--accent-soft)">
                <Icon name="flame" size={11} />
                Priorité
              </Pill>
              <p className="mt-2 font-serif text-[19px] leading-tight text-ink">
                {featured.title}
              </p>
              <p className="mt-1 font-sans text-[13.5px] text-sub">{featured.body}</p>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Link
              href="/chat?prefill=Pour%20la%20valise%20"
              className="rounded-full bg-accent px-3.5 py-2 font-sans text-[12.5px] font-medium text-white"
            >
              Demander à Pia
            </Link>
            <Link
              href="/todo"
              className="rounded-full px-3.5 py-2 font-sans text-[12.5px] text-ink"
              style={{ border: "0.5px solid var(--hair)" }}
            >
              Ajouter au To-Do
            </Link>
          </div>
          <SourceFooter
            org={featured.org}
            title={featured.recoTitle}
            year={featured.year}
          />
        </Card>

        <section>
          <h2 className="mb-2 font-sans text-[11px] uppercase tracking-[0.04em] text-sub">
            Pia te propose
          </h2>
          <div className="space-y-2">
            {secondaries.map((r) => (
              <Card key={r.id} pad={12}>
                <div className="flex items-start gap-3">
                  <span
                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      background: "var(--accent-soft)",
                      color: "var(--accent)",
                    }}
                  >
                    <Icon name="sparkle" size={13} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-serif text-[14px] leading-tight text-ink">{r.text}</p>
                    <div className="mt-2 flex gap-1.5">
                      <button
                        type="button"
                        className="rounded-full bg-soft px-3 py-1 font-sans text-[11.5px] text-ink"
                      >
                        Ajouter
                      </button>
                      <button
                        type="button"
                        className="rounded-full px-3 py-1 font-sans text-[11.5px] text-sub"
                        style={{ border: "0.5px solid var(--hair)" }}
                      >
                        Plus tard
                      </button>
                      <button
                        type="button"
                        className="rounded-full px-3 py-1 font-sans text-[11.5px] text-sub"
                        style={{ border: "0.5px solid var(--hair)" }}
                      >
                        Ignorer
                      </button>
                    </div>
                  </div>
                </div>
                {r.org && (
                  <SourceFooter
                    org={r.org}
                    title={r.title ?? undefined}
                    year={r.year ?? undefined}
                    compact
                  />
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* "Je penserai à te rappeler" — projection */}
        <section>
          <h2 className="mb-2 font-sans text-[11px] uppercase tracking-[0.04em] text-sub">
            Je penserai à te rappeler
          </h2>
          <div className="space-y-1.5">
            {(stage?.kind === "pregnancy"
              ? [
                  { delay: "~J0", title: "Déclaration de naissance (mairie)" },
                  { delay: "~J5", title: "Rattachement Sécurité sociale" },
                  { delay: "~J8", title: "1er examen médical obligatoire" },
                  { delay: "~M2", title: "Vaccins (DTCa-Hib-Hépatite B, Pneumocoque)" },
                ]
              : [
                  { delay: "Bientôt", title: "Prochain examen obligatoire" },
                  { delay: "+1 mois", title: "Renouvellement vit. D" },
                ]
            ).map((r) => (
              <div
                key={r.delay + r.title}
                className="flex items-center gap-3 rounded-xl bg-card px-3 py-2.5"
                style={{ border: "0.5px solid var(--hair)" }}
              >
                <Icon name="clock" size={14} className="text-sub" />
                <span className="w-16 shrink-0 font-mono text-[11.5px] text-sub">{r.delay}</span>
                <p className="min-w-0 flex-1 truncate font-serif text-[13.5px] text-ink">
                  {r.title}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
