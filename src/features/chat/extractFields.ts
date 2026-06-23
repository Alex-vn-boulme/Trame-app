/**
 * Convert an entry payload + type into the short {key, value} pairs displayed
 * as chips on a CreatedCard. Keeps the chat compact — full detail lives on
 * the dedicated screen accessible via "Voir →".
 */
import type { EntryType } from "@/domain/types";
import { hhmm } from "@/lib/format";

export type Field = { k: string; v: string };

export function extractFields(type: EntryType, payload: unknown): Field[] {
  const p = (payload ?? {}) as Record<string, unknown>;
  const fields: Field[] = [];

  switch (type) {
    case "biberon": {
      if (typeof p.takenAt === "string") fields.push({ k: "à", v: hhmm(new Date(p.takenAt)) });
      if (typeof p.durationMin === "number") fields.push({ k: "durée", v: `${p.durationMin} min` });
      if (p.refused === true) fields.push({ k: "refusé", v: "oui" });
      else if (p.refused === false) fields.push({ k: "fini", v: "oui" });
      break;
    }
    case "change": {
      if (typeof p.changedAt === "string") fields.push({ k: "à", v: hhmm(new Date(p.changedAt)) });
      if (typeof p.aspect === "string") fields.push({ k: "aspect", v: p.aspect });
      break;
    }
    case "rdv": {
      if (typeof p.motif === "string") fields.push({ k: "motif", v: p.motif });
      if (typeof p.praticien === "string") fields.push({ k: "qui", v: p.praticien });
      if (typeof p.lieu === "string") fields.push({ k: "où", v: p.lieu });
      if (typeof p.date === "string") fields.push({ k: "quand", v: new Date(p.date).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" }) });
      break;
    }
    case "course": {
      if (typeof p.store === "string") fields.push({ k: "liste", v: p.store });
      if (typeof p.priceEstimate === "number") fields.push({ k: "~", v: `${p.priceEstimate}€` });
      if (p.urgency === "high") fields.push({ k: "urgence", v: "haute" });
      break;
    }
    case "sieste": {
      if (typeof p.startAt === "string") fields.push({ k: "début", v: hhmm(new Date(p.startAt)) });
      if (typeof p.endAt === "string") fields.push({ k: "fin", v: hhmm(new Date(p.endAt)) });
      if (typeof p.place === "string") fields.push({ k: "lieu", v: p.place });
      break;
    }
    case "medic": {
      if (typeof p.doseMl === "number") fields.push({ k: "dose", v: `${p.doseMl} ml` });
      if (typeof p.takenAt === "string") fields.push({ k: "à", v: hhmm(new Date(p.takenAt)) });
      if (typeof p.nextAllowedAt === "string") fields.push({ k: "prochaine", v: hhmm(new Date(p.nextAllowedAt)) });
      break;
    }
    case "admin": {
      if (typeof p.kind === "string") fields.push({ k: "type", v: p.kind });
      if (typeof p.dueDate === "string") fields.push({ k: "avant", v: new Date(p.dueDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) });
      break;
    }
    case "jalon":
    case "lecture":
    case "note":
    case "symptome":
      // Title is enough — no chip clutter.
      break;
  }
  return fields;
}

export function entryTitle(type: EntryType, payload: unknown): string {
  const p = (payload ?? {}) as Record<string, unknown>;
  switch (type) {
    case "biberon": {
      const ml = typeof p.volumeMl === "number" ? `${p.volumeMl} ml` : "Biberon";
      return `Biberon · ${ml}`;
    }
    case "change": {
      const kind = typeof p.kind === "string" ? p.kind : "";
      return kind ? `Change · ${kind}` : "Change";
    }
    case "rdv":
      if (typeof p.motif === "string") return `RDV · ${p.motif}`;
      if (typeof p.praticien === "string") return `RDV · ${p.praticien}`;
      return "Rendez-vous";
    case "course":
      return typeof p.item === "string" ? p.item : "Course";
    case "sieste":
      return "Sieste";
    case "medic":
      return typeof p.name === "string" ? `Médicament · ${p.name}` : "Médicament";
    case "admin":
      return typeof p.kind === "string" ? `Admin · ${p.kind}` : "Admin";
    case "jalon":
      return typeof p.citation === "string" ? p.citation : "Jalon";
    case "lecture":
      return typeof p.title === "string" ? p.title : "Lecture";
    case "note":
      return typeof p.text === "string" ? p.text : "Note";
    case "symptome":
      return typeof p.description === "string" ? p.description : "Symptôme";
  }
}

export function isEntryType(value: unknown): value is EntryType {
  return typeof value === "string" && [
    "rdv","course","biberon","change","sieste","medic","admin","jalon","lecture","note","symptome",
  ].includes(value);
}

export function asEntryShape(row: unknown): { id: string; type: EntryType; payload: unknown; who?: string | null; recommendation_id?: string | null } | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  if (typeof r.id !== "string" || !isEntryType(r.type)) return null;
  return {
    id: r.id,
    type: r.type,
    payload: r.payload,
    who: typeof r.who === "string" ? r.who : null,
    recommendation_id: typeof r.recommendation_id === "string" ? r.recommendation_id : null,
  };
}

