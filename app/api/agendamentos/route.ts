import { NextResponse } from "next/server";
import { sanitizePhone } from "@/lib/utils";
import { criarAgendamento } from "@/services/agendamentos";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      nome: string;
      endereco: string;
      telefone: string;
      modelo_carro: string;
    };

    const payload = {
      nome: body.nome?.trim(),
      endereco: body.endereco?.trim(),
      telefone: sanitizePhone(body.telefone ?? ""),
      modelo_carro: body.modelo_carro?.trim()
    };

    const result = await criarAgendamento(payload);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno ao criar agendamento.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
