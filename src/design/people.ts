/**
 * Static parent fixture for the design-time mock. In production these come
 * from `household_members` in Supabase (with their own colors + initials).
 * Used by Avatar atoms when no real data is yet wired up.
 */
export type ParentKey = "L" | "T";

export const PARENTS: Record<ParentKey, { id: ParentKey; name: string; color: string; initial: string }> = {
  L: { id: "L", name: "Léa", color: "#c96442", initial: "L" },
  T: { id: "T", name: "Thomas", color: "#5a7d4f", initial: "T" },
};
