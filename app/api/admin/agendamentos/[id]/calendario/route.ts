import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAgendamentoById } from "@/services/agendamentos";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function toIcsDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export async function GET(_request: Request, context: RouteContext) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await context.params;
  const agendamento = await getAgendamentoById(id);

  if (!agendamento || !agendamento.agendado_para) {
    return NextResponse.json({ error: "Agendamento sem data marcada." }, { status: 404 });
  }

  const start = new Date(agendamento.agendado_para);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 90);

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Farolfix//Agendamento//PT-BR",
    "BEGIN:VEVENT",
    `UID:${agendamento.id}@farolfix`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:Atendimento Farolfix - ${agendamento.nome}`,
    `DESCRIPTION:Cliente: ${agendamento.nome}\\nTelefone: ${agendamento.telefone}\\nCarro: ${agendamento.modelo_carro}\\nObservação: ${agendamento.observacao ?? "-"}`,
    `LOCATION:${agendamento.endereco?.trim() || "Atendimento em domicílio (endereço a combinar)"}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename=\"agendamento-${agendamento.id}.ics\"`
    }
  });
}
