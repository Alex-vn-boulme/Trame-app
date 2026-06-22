import { NextResponse } from "next/server";
import { generateText, tool } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/pia/recall  — natural-language search over the household corpus
 * + the recommendations RAG.
 *
 * Body: { question: string }
 * Returns: {
 *   answer: string,                           // Pia's reply
 *   citations: { entryId?, recoId? }[],       // surfaces in the UI
 *   linkedEntries: Array<{id, type, …}>,
 *   recommendations: Array<{id, org, title, year, url}>,
 * }
 *
 * The LLM gets two tools — search_entries (household-scoped) and
 * search_recommendations (public RAG). RLS enforces that entries never leak
 * across households even with the service role disabled — we use the user
 * session here.
 */
export const runtime = "nodejs";
export const maxDuration = 30;

const Body = z.object({ question: z.string().min(1).max(500) });

export async function POST(request: Request) {
  try {
    const body = Body.safeParse(await request.json());
    if (!body.success) {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const { data: member } = await supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", userData.user.id)
      .maybeSingle();
    if (!member?.household_id) {
      return NextResponse.json({ error: "no household" }, { status: 400 });
    }
    const householdId = member.household_id;

    const seenEntries = new Set<string>();
    const seenRecos = new Set<string>();

    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-6"),
      system: `Tu es Pia, agent de charge mentale parentale FR-FR.
Réponds à la question du parent en interrogeant les outils.
- Réponse courte (3-5 phrases max).
- Toujours citer la date absolue + relative + contexte d'âge si pertinent.
- Pour toute recommandation médicale, appelle search_recommendations et cite la source.
- N'invente JAMAIS de date, dose, ou seuil.`,
      prompt: body.data.question,
      tools: {
        search_entries: tool({
          description: "Recherche dans le corpus d'entrées du foyer (RDV, biberons, changes, médicaments, jalons…)",
          inputSchema: z.object({
            query: z.string().describe("mots-clés FR, par ex: 'otite' ou 'biberon refusé'"),
            types: z.array(z.string()).optional(),
            limit: z.number().int().min(1).max(20).default(5),
          }),
          execute: async ({ query, types, limit }) => {
            let q = supabase
              .from("entries")
              .select("id, type, payload, created_at, who")
              .eq("household_id", householdId)
              .order("created_at", { ascending: false })
              .limit(limit);
            if (types && types.length > 0) q = q.in("type", types);
            // Simple ILIKE on payload text — pgvector RAG is a Phase 5+ upgrade.
            q = q.textSearch("payload", query, { type: "websearch", config: "french" }).limit(limit);
            const { data, error } = await q;
            if (error) return { results: [], error: error.message };
            for (const r of data ?? []) seenEntries.add(r.id);
            return { results: data ?? [] };
          },
        }),
        search_recommendations: tool({
          description: "Cherche dans le corpus officiel (HAS, ANSM, OMS, Santé publique France, Carnet de santé…). À utiliser pour TOUTE reco médicale.",
          inputSchema: z.object({
            query: z.string(),
            category: z.string().optional(),
          }),
          execute: async ({ query, category }) => {
            let q = supabase
              .from("recommendations")
              .select("id, text, org, title, year, url, category");
            if (category) q = q.eq("category", category);
            q = q.or(`text.ilike.%${query}%,title.ilike.%${query}%`).limit(5);
            const { data, error } = await q;
            if (error) return { results: [], error: error.message };
            for (const r of data ?? []) seenRecos.add(r.id);
            return { results: data ?? [] };
          },
        }),
      },
    });

    // Fetch the cited rows for client rendering.
    const { data: linkedEntries } = seenEntries.size
      ? await supabase
          .from("entries")
          .select("id, type, payload, who, created_at")
          .in("id", Array.from(seenEntries))
      : { data: [] as unknown[] };

    const { data: recommendations } = seenRecos.size
      ? await supabase
          .from("recommendations")
          .select("id, text, org, title, year, url")
          .in("id", Array.from(seenRecos))
      : { data: [] as unknown[] };

    return NextResponse.json({
      answer: text,
      linkedEntries: linkedEntries ?? [],
      recommendations: recommendations ?? [],
    });
  } catch (err) {
    console.error("[pia/recall] unhandled", err);
    return NextResponse.json(
      { error: "internal", message: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
