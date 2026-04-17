import { NextResponse } from "next/server";
import {
  deletePushSubscription,
  getPublicVapidKey,
  savePushSubscription
} from "@/lib/push";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  return NextResponse.json({ publicKey: getPublicVapidKey() });
}

export async function POST(request: Request) {
  try {
    const authenticated = await isAdminAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const subscription = (await request.json()) as {
      endpoint: string;
      keys?: { p256dh?: string; auth?: string };
    };

    await savePushSubscription(subscription);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao registrar dispositivo para notificações.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authenticated = await isAdminAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = (await request.json()) as { endpoint?: string };
    await deletePushSubscription(body.endpoint ?? "");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
