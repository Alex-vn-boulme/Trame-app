import { describe, expect, it } from "vitest";
import { detectPatterns } from "./vigilance-rules";

const now = new Date("2026-05-25T18:00:00Z");
const recentChange = (kind: "pipi" | "selle", hoursAgo: number) => ({
  id: `change-${hoursAgo}`,
  type: "change" as const,
  payload: { kind },
  created_at: new Date(now.getTime() - hoursAgo * 3_600_000).toISOString(),
});
const recentBiberon = (refused: boolean, hoursAgo: number) => ({
  id: `biberon-${hoursAgo}`,
  type: "biberon" as const,
  payload: { refused },
  created_at: new Date(now.getTime() - hoursAgo * 3_600_000).toISOString(),
});

describe("detectPatterns — selle 48h", () => {
  it("flags alert when last selle is >48h on baby <6m", () => {
    const birthDate = new Date("2026-02-25T00:00:00Z"); // ~3 months
    const patterns = detectPatterns([recentChange("selle", 55)], { birthDate }, now);
    const p = patterns.find((x) => x.id === "no-selle-48h");
    expect(p).toBeDefined();
    expect(p?.severity).toBe("alert");
    expect(p?.recommendationId).toBe("has-constipation-nourrisson");
  });

  it("does not flag when child is over 6 months", () => {
    const birthDate = new Date("2025-09-25T00:00:00Z"); // ~8 months
    const patterns = detectPatterns([recentChange("selle", 55)], { birthDate }, now);
    expect(patterns.find((x) => x.id === "no-selle-48h")).toBeUndefined();
  });

  it("does not flag when a recent selle exists", () => {
    const birthDate = new Date("2026-02-25T00:00:00Z");
    const patterns = detectPatterns([recentChange("selle", 12)], { birthDate }, now);
    expect(patterns.find((x) => x.id === "no-selle-48h")).toBeUndefined();
  });
});

describe("detectPatterns — biberon refused", () => {
  it("flags warn when 3+ refused biberons in 24h", () => {
    const entries = [
      recentBiberon(true, 1),
      recentBiberon(true, 6),
      recentBiberon(true, 12),
      recentBiberon(false, 18),
    ];
    const patterns = detectPatterns(entries, {}, now);
    const p = patterns.find((x) => x.id === "biberon-refused-3");
    expect(p?.severity).toBe("warn");
    expect(p?.evidenceEntryIds.length).toBe(3);
  });

  it("does not flag with only 2 refused", () => {
    const entries = [recentBiberon(true, 1), recentBiberon(true, 6)];
    const patterns = detectPatterns(entries, {}, now);
    expect(patterns.find((x) => x.id === "biberon-refused-3")).toBeUndefined();
  });
});
