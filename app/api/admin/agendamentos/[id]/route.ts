import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { atualizarAgendamento, excluirAgendamento } from "@/services/agendamentos";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      nome?: string;
      endereco?: string;
      telefone?: string;
      modelo_carro?: string;
      observacao?: string;
      valor_servico?: number;
      agendado_para?: string;
    };

    const result = await atualizarAgendamento(id, {
      nome: body.nome ?? "",
      endereco: body.endereco ?? "",
      telefone: body.telefone ?? "",
      modelo_carro: body.modelo_carro ?? "",
      observacao: body.observacao,
      valor_servico: body.valor_servico,
      agendado_para: body.agendado_para
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao atualizar agendamento.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    await excluirAgendamento(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao excluir agendamento.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
