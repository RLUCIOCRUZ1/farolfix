import { NextResponse } from "next/server";
import { sanitizePhone } from "@/lib/utils";
import { criarAgendamento } from "@/services/agendamentos";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      nome: string;
      telefone: string;
      modelo_carro: string;
    };

    const payload = {
      nome: body.nome?.trim(),
      telefone: sanitizePhone(body.telefone ?? ""),
      modelo_carro: body.modelo_carro?.trim()
    };

    const result = await criarAgendamento(payload);
    return NextResponse.json(result);
  } catch (error) {
    const raw = error instanceof Error ? error.message : "Erro interno ao criar agendamento.";
    console.error("[api/agendamentos]", error);
    const isDbMissing = /DATABASE_URL|ECONNREFUSED|password authentication failed/i.test(raw);
    const message = isDbMissing
      ? "O agendamento online não está disponível no momento. Use o botão para WhatsApp nesta tela, se estiver visível, ou tente mais tarde."
      : raw;
    return NextResponse.json({ error: message }, { status: isDbMissing ? 503 : 400 });
  }
}
