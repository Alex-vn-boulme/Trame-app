/**
 * Pia service worker (Serwist).
 *
 * - Precaches the app shell on install.
 * - Runtime cache strategy for images / fonts / icons.
 * - Background sync queue for POST /api/pia/extract: if the parent dictates
 *   while offline, the request is queued and replayed when connectivity
 *   returns. Critical for nighttime feedings without coverage.
 * - Handles Web Push notifications fired by the vigilance cron.
 */
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { BackgroundSyncQueue, NetworkOnly, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
declare const self: ServiceWorkerGlobalScope;

type PushEventLike = { data: { json(): unknown; text(): string } | null; waitUntil(p: Promise<unknown>): void };
type NotifEventLike = { notification: Notification; waitUntil(p: Promise<unknown>): void };

const extractQueue = new BackgroundSyncQueue("pia-extract-queue", {
  maxRetentionTime: 24 * 60, // minutes — drop after 24h
});

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ url, request }) =>
        request.method === "POST" && url.pathname === "/api/pia/extract",
      handler: new NetworkOnly({
        plugins: [
          {
            fetchDidFail: async ({ request }) => {
              await extractQueue.pushRequest({ request });
            },
          },
        ],
      }),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();

// ─── Web Push ──────────────────────────────────────────────────────────────
self.addEventListener("push", (event: PushEvent) => {
  if (!event.data) return;
  let payload: { title: string; body: string; url?: string; tag?: string };
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Pia", body: event.data.text() };
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      tag: payload.tag,
      icon: "/icons/icon-192.png",
      badge: "/icons/badge-72.png",
      data: { url: payload.url ?? "/chat" },
    }),
  );
});

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();
  const url = (event.notification.data as { url?: string } | undefined)?.url ?? "/chat";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((windows: readonly WindowClient[]) => {
      const focused = windows.find((w) => w.url.includes(url));
      if (focused) return focused.focus();
      return self.clients.openWindow(url);
    }),
  );
});
