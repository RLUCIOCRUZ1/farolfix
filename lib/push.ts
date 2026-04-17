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

export type SendPushReport =
  | { status: "skipped"; reason: "no-vapid" | "no-subscriptions" }
  | {
      status: "sent";
      attempted: number;
      succeeded: number;
      failed: number;
      firstError?: string;
    };

function formatWebPushError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "body" in error) {
    const b = (error as { body?: string }).body;
    if (typeof b === "string" && b.length > 0 && b.length < 500) return b;
  }
  if (typeof error === "object" && error && "statusCode" in error) {
    return `HTTP ${String((error as { statusCode?: number }).statusCode)}`;
  }
  return String(error);
}

function getVapidConfig() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  const subject = process.env.VAPID_SUBJECT?.trim() || "mailto:admin@farolfix.com";

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
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() ?? "";
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

export async function sendPushToAll(message: PushMessage): Promise<SendPushReport> {
  const vapid = getVapidConfig();
  if (!vapid) {
    console.error(
      "[push] VAPID não configurado. Defina NEXT_PUBLIC_VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY (ex.: npx web-push generate-vapid-keys)."
    );
    return { status: "skipped", reason: "no-vapid" };
  }

  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);
  const payload = JSON.stringify(message);

  const subscriptions = await db.query<PushSubscriptionRow>(
    "select endpoint, p256dh, auth, created_at from push_subscriptions"
  );

  if (subscriptions.rows.length === 0) {
    console.warn("[push] Nenhum dispositivo inscrito (tabela push_subscriptions vazia). Ative no /admin.");
    return { status: "skipped", reason: "no-subscriptions" };
  }

  const rows = subscriptions.rows;
  const outcomes = await Promise.all(
    rows.map(async (item) => {
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
        return { ok: true as const };
      } catch (error) {
        console.error("[push] Falha ao enviar para endpoint:", item.endpoint.slice(0, 48), error);
        const statusCode =
          typeof error === "object" && error && "statusCode" in error
            ? Number((error as { statusCode?: number }).statusCode)
            : undefined;

        if (statusCode === 404 || statusCode === 410) {
          await deletePushSubscription(item.endpoint);
        }
        return { ok: false as const, error: formatWebPushError(error) };
      }
    })
  );

  const succeeded = outcomes.filter((o) => o.ok).length;
  const failed = outcomes.length - succeeded;
  const firstErr = outcomes.find((o) => !o.ok && "error" in o) as { ok: false; error: string } | undefined;

  return {
    status: "sent",
    attempted: rows.length,
    succeeded,
    failed,
    firstError: firstErr?.error
  };
}
