import OpenAI from "openai";

/**
 * Lazy OpenAI client — instantiating at module scope would crash the
 * build, since Next.js evaluates modules during static generation before
 * runtime env vars are available.
 */
let _client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!_client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set.");
    }
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}
