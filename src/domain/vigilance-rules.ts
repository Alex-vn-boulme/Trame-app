/**
 * Vigilance pattern detection — pure functions over a list of entries.
 *
 * Every rule output carries a `recommendationId` pointing into the seeded
 * `recommendations` table so the UI can render the matching <SourceFooter>.
 * Heuristic patterns set `recommendationId: null` and consumers render
 * <SourceFooter heuristic />.
 *
 * Brief §7 thresholds (HAS):
 *   - selle : pas d'événement depuis ≥ 48h sur bébé < 6 mois → alerte
 *   - biberon : 3 refus partiels consécutifs sur même créneau → alerte
 *   - fièvre : 38.5 °C + change liquide → alerte forte
 *   - poids : > 1 percentile chuté en 2 semaines → alerte
 */

import type { EntryType } from "@/domain/types";

export type Severity = "info" | "warn" | "alert";

export type Pattern = {
  id: string;
  severity: Severity;
  title: string;
  body?: string;
  recommendationId: string | null;
  evidenceEntryIds: string[];
};

type DBEntry = {
  id: string;
  type: EntryType;
  payload: unknown;
  created_at: string;
  due_at?: string | null;
  child_id?: string | null;
};

type ChildContext = {
  birthDate?: Date | null;
  weightKg?: number | null;
};

const MS_PER_HOUR = 3_600_000;
const MS_PER_DAY = 24 * MS_PER_HOUR;

export function detectPatterns(
  entries: DBEntry[],
  child: ChildContext,
  now: Date = new Date(),
): Pattern[] {
  const patterns: Pattern[] = [];

  const ageMs = child.birthDate ? now.getTime() - child.birthDate.getTime() : null;
  const ageMonths = ageMs !== null ? ageMs / (MS_PER_DAY * 30.4375) : null;

  // Sort once by time desc for the rules that scan recents.
  const sorted = [...entries].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));

  // ─── Rule 1: no selle > 48h on under-6m baby ───────────────────────────
  if (ageMonths !== null && ageMonths < 6) {
    const lastSelle = sorted.find(
      (e) => e.type === "change" && (e.payload as { kind?: string } | null)?.kind === "selle",
    );
    const sinceMs = lastSelle ? now.getTime() - +new Date(lastSelle.created_at) : Infinity;
    if (sinceMs >= 48 * MS_PER_HOUR) {
      const hours = Math.floor(sinceMs / MS_PER_HOUR);
      patterns.push({
        id: "no-selle-48h",
        severity: "alert",
        title: `Pas de selle depuis ${isFinite(hours) ? `${hours}h` : "> 48h"}.`,
        body: "À signaler au pédiatre — référence HAS.",
        recommendationId: "has-constipation-nourrisson",
        evidenceEntryIds: lastSelle ? [lastSelle.id] : [],
      });
    }
  }

  // ─── Rule 2: 3 refus biberon dans une fenêtre 24h ──────────────────────
  const recentBiberons = sorted.filter(
    (e) => e.type === "biberon" && now.getTime() - +new Date(e.created_at) <= 24 * MS_PER_HOUR,
  );
  const refused = recentBiberons.filter((e) => (e.payload as { refused?: boolean } | null)?.refused);
  if (refused.length >= 3) {
    patterns.push({
      id: "biberon-refused-3",
      severity: "warn",
      title: `${refused.length} biberons refusés dans les 24 dernières heures.`,
      body: "Vérifier si un pattern se dessine (créneau, fatigue, dent…).",
      recommendationId: "has-troubles-oralite",
      evidenceEntryIds: refused.map((e) => e.id),
    });
  }

  // ─── Rule 3: fièvre 38.5 + change liquide récents ──────────────────────
  const recentHigh = sorted.filter(
    (e) =>
      e.type === "symptome" &&
      typeof (e.payload as { measuredValue?: number } | null)?.measuredValue === "number" &&
      (e.payload as { measuredValue?: number }).measuredValue! >= 38.5 &&
      now.getTime() - +new Date(e.created_at) <= 12 * MS_PER_HOUR,
  );
  const recentLiquid = sorted.filter(
    (e) =>
      e.type === "change" &&
      (e.payload as { aspect?: string } | null)?.aspect?.toLowerCase().includes("liquide") &&
      now.getTime() - +new Date(e.created_at) <= 12 * MS_PER_HOUR,
  );
  if (recentHigh.length > 0 && recentLiquid.length > 0) {
    patterns.push({
      id: "fievre-liquide",
      severity: "alert",
      title: "Fièvre + selle liquide dans la même journée.",
      body: ageMonths !== null && ageMonths < 3
        ? "< 3 mois : consultation urgente. Appelle le 15 en cas de doute."
        : "Surveiller — consulter si persistance.",
      recommendationId: ageMonths !== null && ageMonths < 3
        ? "has-fievre-nourrisson-3m"
        : "has-constipation-nourrisson",
      evidenceEntryIds: [...recentHigh.map((e) => e.id), ...recentLiquid.map((e) => e.id)],
    });
  }

  // Sort by severity desc.
  const sevOrder: Record<Severity, number> = { alert: 3, warn: 2, info: 1 };
  patterns.sort((a, b) => sevOrder[b.severity] - sevOrder[a.severity]);

  return patterns;
}

