import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { agendarAtendimento } from "@/services/agendamentos";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = (await request.json()) as { agendadoPara?: string; observacao?: string };

    if (!body.agendadoPara) {
      return NextResponse.json({ error: "Data/hora obrigatória." }, { status: 400 });
    }

    const result = await agendarAtendimento({
      id,
      agendadoPara: body.agendadoPara,
      observacao: body.observacao
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao salvar agendamento.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
