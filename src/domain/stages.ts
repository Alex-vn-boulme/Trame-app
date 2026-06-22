/**
 * Stage calculation — derives the parental stage from birth/due date,
 * driving suggestion catalogs, vigilance thresholds, and Pia's vocabulary.
 *
 * Brief §1 principle 5: "Adaptatif au stade.
 *   Pré-naissance (S20–S40), nouveau-né (J0–M3),
 *   nourrisson (M3–M12), enfant (12m+)."
 */

export type Stage =
  | { kind: "pregnancy"; weeks: number }                       // S20..S40
  | { kind: "newborn"; days: number }                          // J0..M3
  | { kind: "infant"; months: number }                         // M3..M12
  | { kind: "toddler"; months: number };                       // 12m+

export type StageInput = {
  birthDate?: Date | null;
  dueDate?: Date | null;
  now?: Date;
};

const MS_PER_DAY = 86_400_000;
const DAYS_PER_WEEK = 7;
const DAYS_PER_MONTH = 30.4375; // average gregorian month
const PREGNANCY_TOTAL_WEEKS = 40;

export function computeStage({ birthDate, dueDate, now = new Date() }: StageInput): Stage {
  if (birthDate) {
    const days = Math.floor((now.getTime() - birthDate.getTime()) / MS_PER_DAY);
    if (days < 0) {
      // birth date in the future — treat as pregnancy approximation
      return { kind: "pregnancy", weeks: Math.max(1, PREGNANCY_TOTAL_WEEKS + Math.floor(days / DAYS_PER_WEEK)) };
    }
    const months = days / DAYS_PER_MONTH;
    if (days < 90) return { kind: "newborn", days };
    if (months < 12) return { kind: "infant", months: Math.floor(months) };
    return { kind: "toddler", months: Math.floor(months) };
  }
  if (dueDate) {
    // weeks of amenorrhea (SA): full 40w pregnancy ending at dueDate
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / MS_PER_DAY);
    const weeksRemaining = daysUntilDue / DAYS_PER_WEEK;
    const weeks = Math.max(1, Math.min(PREGNANCY_TOTAL_WEEKS, PREGNANCY_TOTAL_WEEKS - Math.floor(weeksRemaining)));
    return { kind: "pregnancy", weeks };
  }
  throw new Error("computeStage requires birthDate or dueDate");
}

export function formatStage(stage: Stage, name: string): string {
  switch (stage.kind) {
    case "pregnancy":
      return `${name} · S${stage.weeks}`;
    case "newborn": {
      const months = Math.floor(stage.days / DAYS_PER_MONTH);
      return months >= 1 ? `${name} · ${months} mois` : `${name} · J${stage.days}`;
    }
    case "infant":
    case "toddler":
      return `${name} · ${stage.months} mois`;
  }
}
