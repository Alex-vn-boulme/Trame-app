import type { EntryType } from "@/domain/types";
import type { Field } from "./extractFields";

/** Local message representation used by ChatStream — flattens DB rows and
 *  the inline entry cards into a single chronological list. */
export type FeedItem =
  | { kind: "user"; id: string; text: string; createdAt: string; voice: boolean; who: string }
  | { kind: "pia"; id: string; text: string; createdAt: string; summary?: string }
  | { kind: "card"; id: string; entryType: EntryType; title: string; fields: Field[]; who?: string; createdAt: string }
  | { kind: "pending-user"; id: string; text: string; voice: boolean; createdAt: string }
  | { kind: "pending-pia"; id: string; createdAt: string };

export type ExtractResponse = {
  userMessageId: string;
  transcribedText: string;
  assistantMessageId: string | null;
  assistantReply: string;
  entries: Array<{
    type: EntryType;
    payload: unknown;
    confidence: number;
    recommendationId?: string | null;
  }>;
  entryIds: string[];
};
