"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const StatusSchema = z.enum(["open", "done", "snoozed", "ignored"]);

function revalidateViews() {
  revalidatePath("/todo");
  revalidatePath("/courses");
  revalidatePath("/dashboard");
  revalidatePath("/tracking");
  revalidatePath("/chat");
}

export async function setEntryStatus(entryId: string, status: z.infer<typeof StatusSchema>) {
  const parsed = StatusSchema.safeParse(status);
  if (!parsed.success) throw new Error("invalid status");

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("unauthorized");

  const { error } = await supabase
    .from("entries")
    .update({
      status: parsed.data,
      done_at: parsed.data === "done" ? new Date().toISOString() : null,
    })
    .eq("id", entryId);

  if (error) {
    console.error("[setEntryStatus]", error);
    throw new Error(error.message);
  }

  revalidateViews();
}

/** Assign an entry to a household member (or unassign with userId=null). */
export async function setEntryAssignee(entryId: string, userId: string | null) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("unauthorized");

  if (userId) {
    // Verify the target user is in the same household as the entry.
    const { data: entry } = await supabase
      .from("entries")
      .select("household_id")
      .eq("id", entryId)
      .maybeSingle();
    if (!entry) throw new Error("entry not found");

    const { data: member } = await supabase
      .from("household_members")
      .select("user_id")
      .eq("household_id", entry.household_id)
      .eq("user_id", userId)
      .maybeSingle();
    if (!member) throw new Error("user not in household");
  }

  const { error } = await supabase
    .from("entries")
    .update({ assigned_to: userId })
    .eq("id", entryId);

  if (error) {
    console.error("[setEntryAssignee]", error);
    throw new Error(error.message);
  }

  revalidateViews();
}

/** Merge-patch the JSONB payload of an entry. Pass `null` for a key to delete it. */
export async function updateEntryPayload(
  entryId: string,
  patch: Record<string, string | number | null>,
) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("unauthorized");

  const { data: current, error: readErr } = await supabase
    .from("entries")
    .select("payload")
    .eq("id", entryId)
    .maybeSingle();
  if (readErr || !current) throw new Error(readErr?.message ?? "entry not found");

  const merged: Record<string, unknown> = { ...(current.payload as Record<string, unknown>) };
  for (const [k, v] of Object.entries(patch)) {
    if (v === null || v === "") delete merged[k];
    else merged[k] = v;
  }

  const { error } = await supabase
    .from("entries")
    .update({ payload: merged })
    .eq("id", entryId);

  if (error) {
    console.error("[updateEntryPayload]", error);
    throw new Error(error.message);
  }

  revalidateViews();
}

/** Force-insert a previously-skipped duplicate. The extract pipeline drops
 *  near-duplicates by default; this lets the user override that decision
 *  via a chip in the chat. */
export async function forceInsertEntry(input: {
  type: string;
  payload: Record<string, unknown>;
  assignedTo: string | null;
  source: "vocal" | "text";
}) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("unauthorized");

  const { data: member } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();
  if (!member?.household_id) throw new Error("no household");

  const { data: child } = await supabase
    .from("children")
    .select("id")
    .eq("household_id", member.household_id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { data: inserted, error } = await supabase
    .from("entries")
    .insert({
      household_id: member.household_id,
      child_id: child?.id ?? null,
      type: input.type,
      payload: input.payload,
      who: userData.user.id,
      assigned_to: input.assignedTo,
      source: input.source,
      confidence: 1,
      recommendation_id: null,
    })
    .select("id")
    .single();
  if (error) {
    console.error("[forceInsertEntry]", error);
    throw new Error(error.message);
  }
  revalidateViews();
  return inserted.id;
}

/** Hard-delete an entry. RLS already restricts to household members. */
export async function deleteEntry(entryId: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("unauthorized");

  const { error } = await supabase.from("entries").delete().eq("id", entryId);
  if (error) {
    console.error("[deleteEntry]", error);
    throw new Error(error.message);
  }
  revalidateViews();
}
