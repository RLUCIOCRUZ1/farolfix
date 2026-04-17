import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendPushToAll } from "@/lib/push";

export async function POST() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const vapidOk = Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() && process.env.VAPID_PRIVATE_KEY?.trim()
  );

  let inscricoes = 0;
  try {
    const r = await db.query<{ c: string }>("select count(*)::text as c from push_subscriptions");
    inscricoes = Number(r.rows[0]?.c ?? 0);
  } catch {
    inscricoes = -1;
  }

  if (!vapidOk) {
    return NextResponse.json({
      ok: false,
      inscricoes,
      mensagem:
        "Chaves VAPID ausentes na Vercel. Adicione NEXT_PUBLIC_VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY (rode: npx web-push generate-vapid-keys) e faça redeploy."
    });
  }

  await sendPushToAll({
    title: "Farolfix — teste",
    body: "Se você viu esta notificação, o push está funcionando.",
    url: "/admin"
  });

  return NextResponse.json({
    ok: true,
    inscricoes,
    mensagem:
      inscricoes === 0
        ? "VAPID ok, mas nenhum aparelho inscrito. Toque em Ativar notificações neste celular e tente de novo."
        : inscricoes < 0
          ? "Não foi possível ler push_subscriptions. Confira se o SQL do Neon criou essa tabela."
          : `Tentativa de envio para ${inscricoes} dispositivo(s). Verifique a gaveta de notificações.`
  });
}
