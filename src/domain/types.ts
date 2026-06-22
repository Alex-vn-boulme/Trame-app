import { z } from "zod";

/**
 * Pia domain model — every object Pia creates is one of these discriminated
 * variants. The shape mirrors the brief §3 "Architecture des données" table
 * and is shared between client, server, and Postgres (via JSON column).
 */

export const ENTRY_TYPES = [
  "rdv",
  "course",
  "biberon",
  "change",
  "sieste",
  "medic",
  "admin",
  "jalon",
  "lecture",
  "note",
  "symptome",
] as const;

export type EntryType = (typeof ENTRY_TYPES)[number];

/** Visual color + icon by category. Used by CreatedCard, list grouping, etc. */
export const ENTRY_META: Record<EntryType, { label: string; color: string; icon: string }> = {
  rdv:      { label: "RDV",        color: "#7a6fc0", icon: "cal" },
  course:   { label: "Achat",      color: "var(--accent)", icon: "cart" },
  biberon:  { label: "Biberon",    color: "#3f8fb3", icon: "bottle" },
  change:   { label: "Change",     color: "#5a7d4f", icon: "diaper" },
  sieste:   { label: "Sieste",     color: "#7a6fc0", icon: "moon" },
  medic:    { label: "Médicament", color: "var(--accent)", icon: "heart" },
  admin:    { label: "Admin",      color: "#b67a2c", icon: "note" },
  jalon:    { label: "Jalon",      color: "var(--accent)", icon: "milestone" },
  lecture:  { label: "Lecture",    color: "var(--sub)", icon: "note" },
  note:     { label: "Note",       color: "var(--sub)", icon: "note" },
  symptome: { label: "Symptôme",   color: "#c94422", icon: "wave" },
};

// ─── Per-type payload schemas ──────────────────────────────────────────────
// All times are ISO-8601 strings (DB stores timestamptz). Numbers are kept
// optional when the LLM might not extract them — Pia confirms with the parent.

const RdvPayload = z.object({
  motif: z.string().optional(), // "échographie", "vaccin 2 mois", "consultation pédiatre"…
  praticien: z.string().optional(),
  lieu: z.string().optional(),
  date: z.string().datetime().optional(),
  durationMin: z.number().int().positive().optional(),
});

const CoursePayload = z.object({
  item: z.string(),
  qty: z.number().positive().optional(),
  store: z.string().optional(),
  priceEstimate: z.number().nonnegative().optional(),
  urgency: z.enum(["low", "normal", "high"]).default("normal"),
});

const BiberonPayload = z.object({
  volumeMl: z.number().int().positive().optional(),
  takenAt: z.string().datetime().optional(),
  durationMin: z.number().int().nonnegative().optional(),
  refused: z.boolean().default(false),
});

const ChangePayload = z.object({
  kind: z.enum(["pipi", "selle", "mixte"]),
  aspect: z.string().optional(),
  changedAt: z.string().datetime().optional(),
});

const SiestePayload = z.object({
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
  place: z.enum(["lit", "cododo", "poussette", "voiture", "autre"]).optional(),
});

const MedicPayload = z.object({
  name: z.string(),
  doseMg: z.number().positive().optional(),
  doseMl: z.number().positive().optional(),
  takenAt: z.string().datetime().optional(),
  nextAllowedAt: z.string().datetime().optional(),
});

const AdminPayload = z.object({
  kind: z.string(), // "déclaration naissance", "mutuelle", "carnet santé"…
  dueDate: z.string().datetime().optional(),
});

const JalonPayload = z.object({
  category: z.enum(["premiere-fois", "sante", "croissance", "autre"]),
  citation: z.string().optional(),
  photoPaths: z.array(z.string()).default([]),
});

const LecturePayload = z.object({
  title: z.string(),
  durationMin: z.number().int().positive().optional(),
  source: z.string().optional(),
});

const NotePayload = z.object({
  text: z.string(),
});

const SymptomePayload = z.object({
  description: z.string(),
  severity: z.enum(["info", "warn", "alert"]).default("info"),
  measuredValue: z.number().optional(),
  measuredUnit: z.string().optional(),
});

const PAYLOAD_SCHEMAS = {
  rdv: RdvPayload,
  course: CoursePayload,
  biberon: BiberonPayload,
  change: ChangePayload,
  sieste: SiestePayload,
  medic: MedicPayload,
  admin: AdminPayload,
  jalon: JalonPayload,
  lecture: LecturePayload,
  note: NotePayload,
  symptome: SymptomePayload,
} as const;

// ─── Base entry envelope ───────────────────────────────────────────────────

const BaseEntry = z.object({
  id: z.string().uuid().optional(), // assigned by DB
  householdId: z.string().uuid().optional(),
  childId: z.string().uuid().nullable().optional(),
  who: z.string().uuid().nullable().optional(),
  assignedTo: z.string().uuid().nullable().optional(),
  source: z.enum(["vocal", "text", "photo"]),
  confidence: z.number().min(0).max(1).optional(),
  linkedTo: z.array(z.string().uuid()).default([]),
  /** FK into `recommendations` table — REQUIRED when text/payload carries a
   *  medical reco (dose/seuil/délai/vaccin). Server-side validation rejects
   *  inserts that reference an unknown id. */
  recommendationId: z.string().nullable().optional(),
  status: z.enum(["open", "done", "snoozed", "ignored"]).default("open"),
  dueAt: z.string().datetime().nullable().optional(),
  doneAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime().optional(),
});

export const EntrySchema = z.discriminatedUnion("type", [
  BaseEntry.extend({ type: z.literal("rdv"),      payload: RdvPayload }),
  BaseEntry.extend({ type: z.literal("course"),   payload: CoursePayload }),
  BaseEntry.extend({ type: z.literal("biberon"),  payload: BiberonPayload }),
  BaseEntry.extend({ type: z.literal("change"),   payload: ChangePayload }),
  BaseEntry.extend({ type: z.literal("sieste"),   payload: SiestePayload }),
  BaseEntry.extend({ type: z.literal("medic"),    payload: MedicPayload }),
  BaseEntry.extend({ type: z.literal("admin"),    payload: AdminPayload }),
  BaseEntry.extend({ type: z.literal("jalon"),    payload: JalonPayload }),
  BaseEntry.extend({ type: z.literal("lecture"),  payload: LecturePayload }),
  BaseEntry.extend({ type: z.literal("note"),     payload: NotePayload }),
  BaseEntry.extend({ type: z.literal("symptome"), payload: SymptomePayload }),
]);

export type Entry = z.infer<typeof EntrySchema>;
export type EntryPayload<T extends EntryType> = z.infer<(typeof PAYLOAD_SCHEMAS)[T]>;

/** Loose schema for what the LLM returns — `payload` is unknown-but-shaped,
 *  validated per-type after a successful tag match. Used by /api/pia/extract.
 */
export const LLMEntrySchema = z.object({
  type: z.enum(ENTRY_TYPES),
  payload: z.record(z.string(), z.unknown()),
  childId: z.string().uuid().nullable().optional(),
  confidence: z.number().min(0).max(1),
  recommendationId: z.string().nullable().optional(),
});

export const LLMExtractionSchema = z.object({
  entries: z.array(LLMEntrySchema),
  assistantReply: z.string(),
});

export type LLMExtraction = z.infer<typeof LLMExtractionSchema>;
