import { describe, expect, it } from "vitest";
import { paracetamolDose } from "./doses";

/**
 * Critical safety tests — these guard the dose calculation.
 * Brief §1.6 — règle d'or : toute reco doit citer sa source.
 * Each result must surface the ANSM RCP id so consumer UI can render
 * <SourceFooter />.
 */
describe("paracetamolDose", () => {
  it("computes 15 mg/kg unit dose converted to ml (24 mg/mL)", () => {
    // 3 kg → 45 mg → ~1.9 ml
    expect(paracetamolDose({ weightKg: 3 }).doseMl).toBeCloseTo(1.9, 1);
    // 5 kg → 75 mg → ~3.1 ml
    expect(paracetamolDose({ weightKg: 5 }).doseMl).toBeCloseTo(3.1, 1);
    // 8 kg → 120 mg → ~5.0 ml
    expect(paracetamolDose({ weightKg: 8 }).doseMl).toBeCloseTo(5.0, 1);
  });

  it("computes 60 mg/kg daily max", () => {
    expect(paracetamolDose({ weightKg: 5 }).maxDailyMg).toBe(300);
    expect(paracetamolDose({ weightKg: 12.5 }).maxDailyMg).toBe(750);
  });

  it("allows giving when no prior dose", () => {
    const r = paracetamolDose({ weightKg: 5 });
    expect(r.canGiveNow).toBe(true);
    expect(r.nextAllowedAt).toBeNull();
    expect(r.msSinceLast).toBeNull();
  });

  it("blocks within 6h of last dose", () => {
    const now = new Date("2026-05-25T18:00:00Z");
    const fiveHoursAgo = new Date("2026-05-25T13:00:00Z");
    const r = paracetamolDose({ weightKg: 5, lastTakenAt: fiveHoursAgo, now });
    expect(r.canGiveNow).toBe(false);
    expect(r.nextAllowedAt?.toISOString()).toBe("2026-05-25T19:00:00.000Z");
  });

  it("allows giving exactly at 6h", () => {
    const now = new Date("2026-05-25T19:00:00Z");
    const sixHoursAgo = new Date("2026-05-25T13:00:00Z");
    const r = paracetamolDose({ weightKg: 5, lastTakenAt: sixHoursAgo, now });
    expect(r.canGiveNow).toBe(true);
  });

  it("includes the ANSM recommendation id (RGPD source guarantee)", () => {
    const r = paracetamolDose({ weightKg: 5 });
    expect(r.recommendationId).toBe("ansm-doliprane-suspension-buvable");
  });

  it("rejects non-positive weight", () => {
    expect(() => paracetamolDose({ weightKg: 0 })).toThrow();
    expect(() => paracetamolDose({ weightKg: -1 })).toThrow();
  });
});
