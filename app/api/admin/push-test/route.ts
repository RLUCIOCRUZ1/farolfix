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

  const report = await sendPushToAll({
    title: "Farolfix — teste",
    body: "Se você viu esta notificação, o push está funcionando.",
    url: "/admin"
  });

  if (report.status === "skipped" && report.reason === "no-subscriptions") {
    return NextResponse.json({
      ok: false,
      inscricoes: 0,
      mensagem:
        "Nenhum aparelho inscrito no banco. Abra o /admin neste celular, toque em Ativar notificações e aceite a permissão."
    });
  }

  if (report.status === "skipped" && report.reason === "no-vapid") {
    return NextResponse.json({
      ok: false,
      inscricoes,
      mensagem:
        "O servidor ainda não enxerga as chaves VAPID (redeploy após salvar as variáveis ou confira os nomes)."
    });
  }

  if (report.status === "sent" && report.failed > 0) {
    return NextResponse.json(
      {
        ok: false,
        inscricoes,
        enviados: report.succeeded,
        falhas: report.failed,
        mensagem: `O servidor tentou enviar, mas falhou (${report.failed}/${report.attempted}). Detalhe: ${report.firstError ?? "erro desconhecido"}. Geralmente o par de chaves VAPID mudou: em /admin use Desativar e depois Ativar notificações de novo.`
      },
      { status: 422 }
    );
  }

  const okCount = report.status === "sent" ? report.succeeded : 0;
  return NextResponse.json({
    ok: true,
    inscricoes,
    enviados: okCount,
    falhas: 0,
    mensagem: `Envio concluído para ${okCount} dispositivo(s). Minimize o app ou bloqueie a tela e abra a gaveta de notificações — com o app aberto em primeiro plano o Android às vezes não mostra banner.`
  });
}
