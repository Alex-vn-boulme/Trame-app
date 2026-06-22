"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const StatusSchema = z.enum(["open", "done", "snoozed", "ignored"]);

/**
 * Server Action — toggle an entry's status.
 * Used by Todo checkboxes, Courses "achetée" markers, Pia proposals.
 */
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

  revalidatePath("/todo");
  revalidatePath("/courses");
  revalidatePath("/dashboard");
}
