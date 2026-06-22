"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/design/icons";
import { Card } from "@/components/Card";
import { SourceFooter } from "@/components/SourceFooter";
import { hhmm, relativeFr } from "@/lib/format";

type Recommendation = { id: string; org: string; title: string; year: number; url: string | null };
type LinkedEntry = { id: string; type: string; payload: unknown; created_at: string };
type RecallResponse = {
  answer: string;
  recommendations: Recommendation[];
  linkedEntries: LinkedEntry[];
};

const SUGGESTIONS = [
  "Quand a-t-elle eu sa première otite ?",
  "Dernier RDV chez le pédiatre ?",
  "Combien de biberons cette semaine ?",
  "Quand la dernière prise de Doliprane ?",
];

export function RecallSearch() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<RecallResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(text: string) {
    const q = text.trim();
    if (!q) return;
    setError(null);
    setResponse(null);
    start(async () => {
      try {
        const res = await fetch("/api/pia/recall", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q }),
        });
        if (!res.ok) throw new Error(`recall ${res.status}`);
        const json = (await res.json()) as RecallResponse;
        setResponse(json);
      } catch (err) {
        console.error(err);
        setError("Pia n'a pas pu chercher. Réessaie ?");
      }
    });
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(query);
        }}
        className="flex items-center gap-2 rounded-2xl bg-card"
        style={{ padding: "10px 14px", border: "0.5px solid var(--hair)" }}
      >
        <Icon name="sparkle" size={16} className="text-accent" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cherche dans la mémoire…"
          className="flex-1 bg-transparent font-sans text-[14px] text-ink placeholder:text-sub focus:outline-none"
          disabled={pending}
        />
        {query && (
          <button
            type="submit"
            aria-label="Chercher"
            disabled={pending}
            className="text-accent"
          >
            <Icon name="arrow" size={16} />
          </button>
        )}
      </form>

      {!response && !pending && (
        <section>
          <p className="mb-2 font-sans text-[11px] uppercase tracking-[0.04em] text-sub">
            Suggestions
          </p>
          <div className="flex flex-col gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setQuery(s);
                  submit(s);
                }}
                className="rounded-xl bg-card px-3 py-2.5 text-left font-serif text-[13.5px] text-ink"
                style={{ border: "0.5px solid var(--hair)" }}
              >
                {s}
              </button>
            ))}
          </div>
        </section>
      )}

      {pending && (
        <p className="text-center font-sans text-[12.5px] text-sub">Pia cherche…</p>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-card px-3 py-2 font-sans text-[12.5px] text-[color:#c94422]"
          style={{ border: "0.5px solid color-mix(in srgb, #c94422 30%, transparent)" }}
        >
          {error}
        </p>
      )}

      {response && (
        <Card>
          <p className="whitespace-pre-line font-serif text-[15px] leading-[1.45] text-ink">
            {response.answer}
          </p>

          {response.linkedEntries.length > 0 && (
            <div className="mt-3 space-y-1">
              <p className="font-sans text-[10.5px] uppercase tracking-[0.04em] text-sub">
                Trouvé dans ton historique
              </p>
              <ul className="space-y-1">
                {response.linkedEntries.slice(0, 4).map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center gap-2 rounded-lg bg-soft px-2.5 py-1.5"
                  >
                    <span className="font-mono text-[10.5px] text-sub">
                      {relativeFr(new Date(e.created_at))} · {hhmm(new Date(e.created_at))}
                    </span>
                    <span className="ml-auto font-sans text-[11px] text-ink">{e.type}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {response.recommendations.map((r) => (
            <SourceFooter
              key={r.id}
              org={r.org}
              title={r.title}
              year={r.year}
              url={r.url ?? undefined}
            />
          ))}
        </Card>
      )}
    </div>
  );
}
