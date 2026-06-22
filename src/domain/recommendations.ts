import { z } from "zod";

/**
 * Mirror of `recommendations` table — the RAG corpus Pia is allowed to cite.
 * Brief §4 "Source des recommandations" — règle d'or.
 *
 * Adding a new reco:
 * 1. Insert in supabase/seed/recommendations.sql
 * 2. Reference the `id` from a `recommendation_id` column on an entry, OR
 *    from a `<SourceFooter org=... title=... year=...>` in a screen.
 *
 * The LLM is NEVER allowed to fabricate a Recommendation outside of this set.
 */

export const RecommendationOrg = z.enum([
  "HAS",
  "ANSM",
  "OMS",
  "SantePubliqueFrance",
  "CarnetDeSante",
  "PMI",
  "CNGOF",
  "SFP",
  "AFPA",
  "ServicePublic",
]);

export const RecommendationCategory = z.enum([
  "doses",
  "vaccins",
  "vigilance",
  "admin",
  "grossesse",
  "croissance",
  "alimentation",
  "developpement",
  "urgence",
]);

export const RecommendationSchema = z.object({
  id: z.string(),                              // e.g. "ansm-doliprane-suspension-2023"
  text: z.string(),                            // what Pia says ("dose 15 mg/kg max 60 mg/kg/24h")
  type: z.enum(["official", "heuristic"]),
  org: RecommendationOrg.nullable(),
  title: z.string().nullable(),
  year: z.number().int().nullable(),
  url: z.string().url().nullable(),
  excerpt: z.string().max(400).nullable(),
  appliesTo: z
    .object({
      ageMin: z.string().nullable(),           // "0d", "2m", "12m"
      ageMax: z.string().nullable(),
      condition: z.string().nullable(),
    })
    .nullable(),
  category: RecommendationCategory,
});

export type Recommendation = z.infer<typeof RecommendationSchema>;
export type RecommendationOrgValue = z.infer<typeof RecommendationOrg>;
