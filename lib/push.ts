import webpush from "web-push";
import { db } from "@/lib/db";
import type { PushSubscriptionRow } from "@/lib/types";

type PushSubscriptionInput = {
  endpoint: string;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
};

type PushMessage = {
  title: string;
  body: string;
  url?: string;
};

function getVapidConfig() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:admin@farolfix.com";

  if (!publicKey || !privateKey) {
    return null;
  }

  return { publicKey, privateKey, subject };
}

function validarSubscription(subscription: PushSubscriptionInput) {
  if (!subscription.endpoint) {
    throw new Error("Subscription inválida: endpoint ausente.");
  }

  if (!subscription.keys?.p256dh || !subscription.keys?.auth) {
    throw new Error("Subscription inválida: chaves p256dh/auth ausentes.");
  }
}

export function getPublicVapidKey() {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
}

export async function savePushSubscription(subscription: PushSubscriptionInput) {
  validarSubscription(subscription);
  await db.query(
    `insert into push_subscriptions (endpoint, p256dh, auth)
     values ($1, $2, $3)
     on conflict (endpoint)
     do update set p256dh = excluded.p256dh, auth = excluded.auth`,
    [subscription.endpoint, subscription.keys!.p256dh, subscription.keys!.auth]
  );
}

export async function deletePushSubscription(endpoint: string) {
  if (!endpoint) return;
  await db.query("delete from push_subscriptions where endpoint = $1", [endpoint]);
}

export async function sendPushToAll(message: PushMessage) {
  const vapid = getVapidConfig();
  if (!vapid) return;

  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);
  const payload = JSON.stringify(message);

  const subscriptions = await db.query<PushSubscriptionRow>(
    "select endpoint, p256dh, auth, created_at from push_subscriptions"
  );

  await Promise.all(
    subscriptions.rows.map(async (item) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: item.endpoint,
            keys: {
              p256dh: item.p256dh,
              auth: item.auth
            }
          },
          payload
        );
      } catch (error) {
        const statusCode =
          typeof error === "object" && error && "statusCode" in error
            ? Number((error as { statusCode?: number }).statusCode)
            : undefined;

        if (statusCode === 404 || statusCode === 410) {
          await deletePushSubscription(item.endpoint);
        }
      }
    })
  );
}
