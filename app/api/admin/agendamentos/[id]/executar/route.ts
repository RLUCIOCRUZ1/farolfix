import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { marcarAgendamentoComoExecutado } from "@/services/agendamentos";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const agendamento = await marcarAgendamentoComoExecutado(id);
    return NextResponse.json({ agendamento });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao marcar como executado.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
