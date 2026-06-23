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
  date: z.string().datetime({ offset: true }).optional(),
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
  takenAt: z.string().datetime({ offset: true }).optional(),
  durationMin: z.number().int().nonnegative().optional(),
  refused: z.boolean().default(false),
});

const ChangePayload = z.object({
  kind: z.enum(["pipi", "selle", "mixte"]),
  aspect: z.string().optional(),
  changedAt: z.string().datetime({ offset: true }).optional(),
});

const SiestePayload = z.object({
  startAt: z.string().datetime({ offset: true }).optional(),
  endAt: z.string().datetime({ offset: true }).optional(),
  place: z.enum(["lit", "cododo", "poussette", "voiture", "autre"]).optional(),
});

const MedicPayload = z.object({
  name: z.string(),
  doseMg: z.number().positive().optional(),
  doseMl: z.number().positive().optional(),
  takenAt: z.string().datetime({ offset: true }).optional(),
  nextAllowedAt: z.string().datetime({ offset: true }).optional(),
});

const AdminPayload = z.object({
  kind: z.string(), // "déclaration naissance", "mutuelle", "carnet santé"…
  dueDate: z.string().datetime({ offset: true }).optional(),
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
  dueAt: z.string().datetime({ offset: true }).nullable().optional(),
  doneAt: z.string().datetime({ offset: true }).nullable().optional(),
  createdAt: z.string().datetime({ offset: true }).optional(),
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

/** Discriminated schema sent to the LLM via Output.object() — exposes each
 *  payload's exact shape so the model can fill it. A loose `z.record` payload
 *  causes models to return `{}` because the JSON Schema gives no signal of
 *  what's expected.
 *
 *  Anthropic structured output caps optional fields at 24 across the whole
 *  schema. We use slim per-type payloads here keeping only the fields most
 *  commonly dictated. Rare fields (praticien, store, place, doseMg…) can be
 *  filled by the user later via inline edit. childId + recommendationId are
 *  set server-side post-extract.
 */
const LLMBase = z.object({
  confidence: z.number().min(0).max(1),
});

/** Free-text assignee — LLM extracts the bare name as dictated ("Thomas",
 *  "Léa"…). Server-side we resolve it to a household_members.user_id by
 *  fuzzy match against display_name / initial. */
const Assignee = z.string().optional();

const LLMRdvPayload     = RdvPayload.pick({ motif: true, date: true }).extend({ assignee: Assignee });
const LLMCoursePayload  = CoursePayload.pick({ item: true, qty: true }).extend({ assignee: Assignee });
const LLMBiberonPayload = BiberonPayload.pick({ volumeMl: true, takenAt: true });
const LLMChangePayload  = ChangePayload.pick({ kind: true, changedAt: true });
const LLMSiestePayload  = SiestePayload.pick({ startAt: true, endAt: true });
const LLMMedicPayload   = MedicPayload.pick({ name: true, doseMl: true, takenAt: true });
const LLMAdminPayload   = AdminPayload.pick({ kind: true, dueDate: true }).extend({ assignee: Assignee });
const LLMJalonPayload   = z.object({
  category: z.enum(["premiere-fois", "sante", "croissance", "autre"]),
  citation: z.string().optional(),
});
const LLMLecturePayload = LecturePayload.pick({ title: true, source: true });
const LLMSymptomePayload = z.object({
  description: z.string(),
  severity: z.enum(["info", "warn", "alert"]),
});

export const LLMEntrySchema = z.discriminatedUnion("type", [
  LLMBase.extend({ type: z.literal("rdv"),      payload: LLMRdvPayload }),
  LLMBase.extend({ type: z.literal("course"),   payload: LLMCoursePayload }),
  LLMBase.extend({ type: z.literal("biberon"),  payload: LLMBiberonPayload }),
  LLMBase.extend({ type: z.literal("change"),   payload: LLMChangePayload }),
  LLMBase.extend({ type: z.literal("sieste"),   payload: LLMSiestePayload }),
  LLMBase.extend({ type: z.literal("medic"),    payload: LLMMedicPayload }),
  LLMBase.extend({ type: z.literal("admin"),    payload: LLMAdminPayload }),
  LLMBase.extend({ type: z.literal("jalon"),    payload: LLMJalonPayload }),
  LLMBase.extend({ type: z.literal("lecture"),  payload: LLMLecturePayload }),
  LLMBase.extend({ type: z.literal("note"),     payload: NotePayload }),
  LLMBase.extend({ type: z.literal("symptome"), payload: LLMSymptomePayload }),
]);

export const LLMExtractionSchema = z.object({
  entries: z.array(LLMEntrySchema),
  assistantReply: z.string(),
});

export type LLMExtraction = z.infer<typeof LLMExtractionSchema>;
