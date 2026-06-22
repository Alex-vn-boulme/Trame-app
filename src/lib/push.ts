/**
 * Web Push helpers — server-side send via `web-push` lib.
 *
 * VAPID keys must be configured in env. Generate locally with:
 *   pnpm dlx web-push generate-vapid-keys --json
 *
 * Falls back to a no-op + console.warn if VAPID isn't configured (lets local
 * dev run without forcing the user to set up Web Push immediately).
 */

import type { SupabaseClient } from "@supabase/supabase-js";

// Lazy require so build doesn't crash if web-push native deps are flaky.
type WebPushModule = typeof import("web-push");
let _webPush: WebPushModule | null = null;

function getWebPush(): WebPushModule | null {
  if (_webPush) return _webPush;
  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  _webPush = require("web-push") as WebPushModule;
  _webPush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:pia@example.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );
  return _webPush;
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

/**
 * Send a push to every device subscribed for these users. Dead subscriptions
 * (HTTP 410/404) are pruned from the DB so we don't keep retrying them.
 */
export async function sendPushToUsers(
  admin: SupabaseClient,
  userIds: string[],
  payload: PushPayload,
): Promise<{ sent: number; pruned: number }> {
  if (userIds.length === 0) return { sent: 0, pruned: 0 };
  const wp = getWebPush();
  if (!wp) {
    console.warn("[push] VAPID not configured — skipping send", { userIds: userIds.length });
    return { sent: 0, pruned: 0 };
  }

  const { data: subs, error } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .in("user_id", userIds);
  if (error || !subs) {
    console.error("[push] could not load subscriptions", error);
    return { sent: 0, pruned: 0 };
  }

  let sent = 0;
  let pruned = 0;
  const json = JSON.stringify(payload);

  for (const sub of subs) {
    try {
      await wp.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        json,
      );
      sent++;
    } catch (err: unknown) {
      const status = (err as { statusCode?: number } | null)?.statusCode;
      if (status === 410 || status === 404) {
        await admin.from("push_subscriptions").delete().eq("id", sub.id);
        pruned++;
      } else {
        console.error("[push] send failed", { id: sub.id, status, err });
      }
    }
  }
  return { sent, pruned };
}

/**
 * Resolve all user ids in a household — used so a vigilance alert reaches
 * both co-parents at once.
 */
export async function householdMemberIds(admin: SupabaseClient, householdId: string): Promise<string[]> {
  const { data, error } = await admin
    .from("household_members")
    .select("user_id")
    .eq("household_id", householdId);
  if (error || !data) return [];
  return data.map((r) => r.user_id);
}
