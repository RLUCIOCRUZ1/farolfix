import { db } from "@/lib/db";
import { sendPushToAll } from "@/lib/push";
import type { AgendamentoInput, AgendamentoRow } from "@/lib/types";
import { registrarEvento } from "@/services/analytics";

function validarPayload(payload: AgendamentoInput) {
  if (!payload.nome || !payload.endereco || !payload.telefone || !payload.modelo_carro) {
    throw new Error("Preencha todos os campos obrigatórios.");
  }
}

export async function criarAgendamento(payload: AgendamentoInput) {
  validarPayload(payload);

  await db.query(
    "insert into agendamentos (nome, endereco, telefone, modelo_carro) values ($1, $2, $3, $4)",
    [payload.nome, payload.endereco, payload.telefone, payload.modelo_carro]
  );

  await registrarEvento("agendamento");

  // A notificação não pode bloquear o agendamento em caso de falha.
  await sendPushToAll({
    title: "Novo agendamento Farolfix",
    body: `${payload.nome} solicitou atendimento para ${payload.modelo_carro}.`,
    url: "/admin"
  }).catch(() => undefined);

  return { ok: true };
}

export async function getRecentAgendamentos(limit = 20) {
  const response = await db.query<AgendamentoRow>(
    `select
       id,
       nome,
       endereco,
       telefone,
       modelo_carro,
       status,
       agendado_para,
       executado_em,
       observacao,
       valor_servico::float8 as valor_servico,
       created_at
     from agendamentos
     order by created_at desc
     limit $1`,
    [limit]
  );

  return response.rows;
}

function toUtcDateTimeLocal(input: string) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Data/hora inválida.");
  }
  return date.toISOString();
}

function addMinutes(dateIso: string, minutes: number) {
  const date = new Date(dateIso);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
}

function formatGoogleDate(dateIso: string) {
  return dateIso.replace(/[-:]/g, "").split(".")[0] + "Z";
}

function gerarGoogleCalendarUrl(agendamento: AgendamentoRow) {
  if (!agendamento.agendado_para) return null;

  const startIso = new Date(agendamento.agendado_para).toISOString();
  const endIso = addMinutes(startIso, 90);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Atendimento Farolfix - ${agendamento.nome}`,
    dates: `${formatGoogleDate(startIso)}/${formatGoogleDate(endIso)}`,
    details: `Cliente: ${agendamento.nome}\nTelefone: ${agendamento.telefone}\nCarro: ${agendamento.modelo_carro}\nObservação: ${agendamento.observacao ?? "-"}`,
    location: agendamento.endereco
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export async function agendarAtendimento(input: {
  id: string;
  agendadoPara: string;
  observacao?: string;
}) {
  const agendadoParaIso = toUtcDateTimeLocal(input.agendadoPara);

  const response = await db.query<AgendamentoRow>(
    `update agendamentos
     set status = 'agendado',
         agendado_para = $2,
         observacao = $3
     where id = $1
     returning
       id,
       nome,
       endereco,
       telefone,
       modelo_carro,
       status,
       agendado_para,
       executado_em,
       observacao,
       valor_servico::float8 as valor_servico,
       created_at`,
    [input.id, agendadoParaIso, input.observacao?.trim() || null]
  );

  if (!response.rows[0]) {
    throw new Error("Agendamento não encontrado.");
  }

  const agendamento = response.rows[0];
  return {
    agendamento,
    calendarUrl: gerarGoogleCalendarUrl(agendamento)
  };
}

export async function marcarAgendamentoComoExecutado(id: string) {
  const response = await db.query<AgendamentoRow>(
    `update agendamentos
     set status = 'executado',
         executado_em = now()
     where id = $1
     returning
       id,
       nome,
       endereco,
       telefone,
       modelo_carro,
       status,
       agendado_para,
       executado_em,
       observacao,
       valor_servico::float8 as valor_servico,
       created_at`,
    [id]
  );

  if (!response.rows[0]) {
    throw new Error("Agendamento não encontrado.");
  }

  return response.rows[0];
}

export async function getAgendamentoById(id: string) {
  const response = await db.query<AgendamentoRow>(
    `select
       id,
       nome,
       endereco,
       telefone,
       modelo_carro,
       status,
       agendado_para,
       executado_em,
       observacao,
       valor_servico::float8 as valor_servico,
       created_at
     from agendamentos
     where id = $1`,
    [id]
  );

  return response.rows[0] ?? null;
}
