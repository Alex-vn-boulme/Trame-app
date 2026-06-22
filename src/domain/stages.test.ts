import { describe, expect, it } from "vitest";
import { computeStage, formatStage } from "./stages";

describe("computeStage", () => {
  const now = new Date("2026-05-25T12:00:00Z");

  it("returns pregnancy stage from due date (S24 = 16 weeks before due)", () => {
    // S20 = 20 weeks ago start, due in 20 weeks
    const dueDate = new Date("2026-10-12T00:00:00Z"); // ~20 weeks after now
    const s = computeStage({ dueDate, now });
    expect(s.kind).toBe("pregnancy");
    if (s.kind === "pregnancy") {
      // 40 - 20 weeks remaining = 20 weeks pregnant
      expect(s.weeks).toBeGreaterThanOrEqual(19);
      expect(s.weeks).toBeLessThanOrEqual(21);
    }
  });

  it("returns newborn (< 90 days)", () => {
    const birth = new Date("2026-04-25T12:00:00Z"); // 30 days ago
    const s = computeStage({ birthDate: birth, now });
    expect(s.kind).toBe("newborn");
    if (s.kind === "newborn") expect(s.days).toBe(30);
  });

  it("returns infant for 3-12 months", () => {
    const birth = new Date("2025-11-25T12:00:00Z"); // ~6 months ago
    const s = computeStage({ birthDate: birth, now });
    expect(s.kind).toBe("infant");
    if (s.kind === "infant") expect(s.months).toBeGreaterThanOrEqual(5);
  });

  it("returns toddler for 12m+", () => {
    const birth = new Date("2024-05-25T12:00:00Z"); // ~24 months ago
    const s = computeStage({ birthDate: birth, now });
    expect(s.kind).toBe("toddler");
    if (s.kind === "toddler") expect(s.months).toBeGreaterThanOrEqual(23);
  });

  it("throws when neither birthDate nor dueDate is provided", () => {
    expect(() => computeStage({ now })).toThrow();
  });
});

describe("formatStage", () => {
  it("formats pregnancy with week number", () => {
    expect(formatStage({ kind: "pregnancy", weeks: 24 }, "Lucie")).toBe("Lucie · S24");
  });
  it("formats newborn with J-day under 1 month", () => {
    expect(formatStage({ kind: "newborn", days: 15 }, "Lucie")).toBe("Lucie · J15");
  });
  it("formats newborn over 30 days as months", () => {
    expect(formatStage({ kind: "newborn", days: 40 }, "Lucie")).toBe("Lucie · 1 mois");
  });
  it("formats infant/toddler in months", () => {
    expect(formatStage({ kind: "infant", months: 6 }, "Mateo")).toBe("Mateo · 6 mois");
    expect(formatStage({ kind: "toddler", months: 18 }, "Mateo")).toBe("Mateo · 18 mois");
  });
});
