/**
 * Per-category visual meta for the chat surface — used by CreatedCard,
 * Recap groups, Dashboard mini-cards. Single source of truth so colors
 * and icons stay consistent across screens.
 */
import type { IconName } from "@/design/icons";
import type { EntryType } from "@/domain/types";

export type CategoryMeta = {
  label: string;
  icon: IconName;
  /** Solid color used for badges, icon, "Voir →" link. */
  color: string;
};

export const CATEGORY_META: Record<EntryType, CategoryMeta> = {
  rdv:      { label: "RDV",        icon: "cal",       color: "#7a6fc0" },
  course:   { label: "Course",     icon: "cart",      color: "var(--accent)" },
  biberon:  { label: "Biberon",    icon: "bottle",    color: "#3f8fb3" },
  change:   { label: "Change",     icon: "diaper",    color: "var(--good)" },
  sieste:   { label: "Sieste",     icon: "moon",      color: "#7a6fc0" },
  medic:    { label: "Médicament", icon: "heart",     color: "var(--accent)" },
  admin:    { label: "Admin",      icon: "note",      color: "var(--warn)" },
  jalon:    { label: "Jalon",      icon: "milestone", color: "var(--accent)" },
  lecture:  { label: "Lecture",    icon: "note",      color: "var(--sub)" },
  note:     { label: "Note",       icon: "note",      color: "var(--sub)" },
  symptome: { label: "Symptôme",   icon: "wave",      color: "#c94422" },
};
