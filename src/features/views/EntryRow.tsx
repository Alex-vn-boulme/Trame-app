"use client";

import { useState, useTransition } from "react";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/design/icons";
import type { EntryType } from "@/domain/types";
import {
  setEntryStatus,
  setEntryAssignee,
  updateEntryPayload,
  deleteEntry,
} from "./actions";

export type HouseholdMember = {
  userId: string;
  initial: string;
  name: string | null;
  color?: string | null;
};

type EditField = {
  key: string;
  label: string;
  type: "text" | "number" | "datetime-local";
};

function fieldsFor(type: EntryType): EditField[] {
  switch (type) {
    case "rdv":      return [
      { key: "motif",      label: "Motif",      type: "text" },
      { key: "date",       label: "Date/heure", type: "datetime-local" },
      { key: "praticien",  label: "Praticien",  type: "text" },
      { key: "lieu",       label: "Lieu",       type: "text" },
    ];
    case "course":   return [
      { key: "item",   label: "Article", type: "text" },
      { key: "qty",    label: "Quantité",type: "number" },
      { key: "store",  label: "Liste",   type: "text" },
    ];
    case "biberon":  return [
      { key: "volumeMl", label: "Volume (ml)", type: "number" },
      { key: "takenAt",  label: "Heure",       type: "datetime-local" },
    ];
    case "change":   return [
      { key: "changedAt", label: "Heure", type: "datetime-local" },
      { key: "aspect",    label: "Aspect", type: "text" },
    ];
    case "sieste":   return [
      { key: "startAt", label: "Début", type: "datetime-local" },
      { key: "endAt",   label: "Fin",   type: "datetime-local" },
    ];
    case "medic":    return [
      { key: "name",    label: "Médicament", type: "text" },
      { key: "doseMl",  label: "Dose (ml)",  type: "number" },
      { key: "takenAt", label: "Heure",      type: "datetime-local" },
    ];
    case "admin":    return [
      { key: "kind",    label: "Type",        type: "text" },
      { key: "dueDate", label: "Échéance",    type: "datetime-local" },
    ];
    case "jalon":    return [{ key: "citation", label: "Citation", type: "text" }];
    case "lecture":  return [{ key: "title",    label: "Titre",    type: "text" }];
    case "note":     return [{ key: "text",     label: "Note",     type: "text" }];
    case "symptome": return [
      { key: "description", label: "Description", type: "text" },
    ];
  }
}

const ASSIGNABLE: ReadonlySet<EntryType> = new Set(["rdv", "course", "admin"]);

export function EntryRow({
  id,
  type,
  title,
  meta,
  payload,
  status,
  proposed,
  accentDot,
  creator,
  assignee,
  members,
}: {
  id: string;
  type: EntryType;
  title: string;
  meta?: string;
  payload?: Record<string, unknown>;
  status: "open" | "done" | "snoozed" | "ignored";
  proposed?: boolean;
  accentDot?: string;
  creator?: HouseholdMember | null;
  assignee?: HouseholdMember | null;
  members?: HouseholdMember[];
}) {
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState(false);
  const checked = status === "done";

  function toggle() {
    start(() => setEntryStatus(id, checked ? "open" : "done"));
  }

  return (
    <div
      id={`entry-${id}`}
      className={`flex flex-col gap-2 rounded-xl bg-card px-3 py-2.5 ${
        pending ? "opacity-50" : ""
      }`}
      style={{ border: "0.5px solid var(--hair)" }}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          disabled={pending}
          aria-pressed={checked}
          aria-label={checked ? "Marquer à faire" : "Marquer fait"}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
          style={{
            border: checked ? "0.5px solid transparent" : "0.5px solid var(--hair)",
            background: checked ? "var(--good)" : "transparent",
          }}
        >
          {checked ? (
            <Icon name="check" size={14} className="text-white" strokeWidth={2.4} />
          ) : proposed ? (
            <Icon name="sparkle" size={12} className="text-accent" />
          ) : (
            accentDot && (
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: accentDot }}
              />
            )
          )}
        </button>

        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          aria-label="Modifier"
          className="group min-w-0 flex-1 cursor-pointer text-left"
        >
          <p
            className={`truncate font-serif text-[14.5px] leading-tight text-ink ${
              checked ? "line-through opacity-60" : ""
            }`}
          >
            {title}
            <Icon name="note" size={11} className="ml-1 inline-block align-middle text-sub opacity-40 group-hover:opacity-100" />
          </p>
          {meta && <p className="font-sans text-[11.5px] text-sub">{meta}</p>}
        </button>

        {ASSIGNABLE.has(type) && members && members.length > 0 ? (
          <select
            value={assignee?.userId ?? ""}
            onChange={(e) => {
              const v = e.target.value || null;
              start(() => setEntryAssignee(id, v));
            }}
            disabled={pending}
            aria-label="Assigner à"
            className="rounded-md bg-soft px-1.5 py-0.5 font-sans text-[11px] text-sub"
          >
            <option value="">— non assigné —</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.name ?? m.initial}
              </option>
            ))}
          </select>
        ) : (
          creator && <Avatar initial={creator.initial} color={creator.color ?? undefined} size={18} />
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!confirm("Supprimer cette entrée ?")) return;
            start(() => deleteEntry(id));
          }}
          disabled={pending}
          aria-label="Supprimer"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-sub hover:bg-soft hover:text-red-600"
        >
          <Icon name="plus" size={14} className="rotate-45" strokeWidth={2} />
        </button>
      </div>

      {editing && (
        <InlineEditor
          entryId={id}
          type={type}
          payload={payload ?? {}}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(local: string): string {
  // <input type="datetime-local"> returns "YYYY-MM-DDTHH:mm" without timezone;
  // JS Date parses it as browser-local. We persist as ISO UTC (column is timestamptz).
  const d = new Date(local);
  return d.toISOString();
}

function InlineEditor({
  entryId,
  type,
  payload,
  onClose,
}: {
  entryId: string;
  type: EntryType;
  payload: Record<string, unknown>;
  onClose: () => void;
}) {
  const fields = fieldsFor(type);
  const [pending, start] = useTransition();
  const [values, setValues] = useState<Record<string, string>>(() => {
    const o: Record<string, string> = {};
    for (const f of fields) {
      const v = payload[f.key];
      if (typeof v === "string") {
        o[f.key] = f.type === "datetime-local" ? toDatetimeLocal(v) : v;
      } else if (typeof v === "number") {
        o[f.key] = String(v);
      } else {
        o[f.key] = "";
      }
    }
    return o;
  });

  function save() {
    const patch: Record<string, string | number | null> = {};
    for (const f of fields) {
      const raw = values[f.key];
      if (raw === "" || raw === undefined) {
        patch[f.key] = null;
      } else if (f.type === "number") {
        const n = Number(raw);
        patch[f.key] = isNaN(n) ? null : n;
      } else if (f.type === "datetime-local") {
        patch[f.key] = fromDatetimeLocal(raw);
      } else {
        patch[f.key] = raw;
      }
    }
    start(async () => {
      await updateEntryPayload(entryId, patch);
      onClose();
    });
  }

  function remove() {
    if (!confirm("Supprimer cette entrée ?")) return;
    start(async () => {
      await deleteEntry(entryId);
      onClose();
    });
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-soft p-2.5">
      {fields.map((f) => (
        <label key={f.key} className="flex flex-col gap-0.5">
          <span className="font-sans text-[11px] text-sub">{f.label}</span>
          <input
            type={f.type}
            value={values[f.key] ?? ""}
            onChange={(e) => setValues((s) => ({ ...s, [f.key]: e.target.value }))}
            disabled={pending}
            className="rounded-md bg-card px-2 py-1 font-sans text-[13px] text-ink outline-none focus:ring-2 focus:ring-accent"
            style={{ border: "0.5px solid var(--hair)" }}
          />
        </label>
      ))}
      <div className="mt-1 flex items-center gap-2">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="rounded-md bg-accent px-3 py-1 font-sans text-[12px] font-semibold text-white"
        >
          Enregistrer
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="font-sans text-[12px] text-sub"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          className="ml-auto font-sans text-[12px] text-red-600"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}
