/**
 * Medication dose calculator — TS-pure, never delegates to LLM.
 *
 * Brief §6 (D2 Meds): "Calcul dose au poids" doit afficher la valeur exacte
 * et la prochaine prise possible. Source unique : ANSM RCP du médicament.
 *
 * Each entry here is bound to a `recommendationId` so the consumer screen
 * is forced to render the corresponding <SourceFooter>.
 */

export type DoseInput = {
  weightKg: number;
  lastTakenAt?: Date | null;
  now?: Date;
};

export type DoseOutput = {
  /** Suggested unit dose for the parent. */
  doseMl: number;
  /** Daily maximum based on weight (informational). */
  maxDailyMg: number;
  /** Earliest time the next dose may be given. null if unknown. */
  nextAllowedAt: Date | null;
  /** Whether parent may give a dose right now. */
  canGiveNow: boolean;
  /** Time since last dose, ms. null if no prior dose. */
  msSinceLast: number | null;
  /** FK into recommendations — consumer MUST render SourceFooter. */
  recommendationId: string;
};

const MS_PER_HOUR = 3_600_000;

/** Paracétamol (Doliprane suspension buvable 2,4 %) — ANSM RCP.
 *  - Dose unitaire : 15 mg/kg
 *  - Suspension : 24 mg/mL → mL = (kg × 15) / 24
 *  - Délai minimum entre deux prises : 6 h (4 h si fièvre élevée selon avis méd.)
 *  - Maximum 60 mg/kg/24h
 */
export function paracetamolDose({ weightKg, lastTakenAt, now = new Date() }: DoseInput): DoseOutput {
  if (weightKg <= 0) throw new Error("weightKg must be > 0");

  const unitDoseMg = weightKg * 15;
  const doseMl = round1(unitDoseMg / 24);
  const maxDailyMg = weightKg * 60;
  const minIntervalMs = 6 * MS_PER_HOUR;

  let nextAllowedAt: Date | null = null;
  let canGiveNow = true;
  let msSinceLast: number | null = null;

  if (lastTakenAt) {
    msSinceLast = now.getTime() - lastTakenAt.getTime();
    nextAllowedAt = new Date(lastTakenAt.getTime() + minIntervalMs);
    canGiveNow = msSinceLast >= minIntervalMs;
  }

  return {
    doseMl,
    maxDailyMg,
    nextAllowedAt,
    canGiveNow,
    msSinceLast,
    recommendationId: "ansm-doliprane-suspension-buvable",
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
