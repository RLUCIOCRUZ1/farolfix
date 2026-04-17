import { db } from "@/lib/db";
import { sendPushToAll } from "@/lib/push";
import type { AgendamentoInput, AgendamentoRow } from "@/lib/types";
import { sanitizePhone } from "@/lib/utils";
import { registrarEvento } from "@/services/analytics";

const AGENDAMENTO_SELECT = `
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
`;

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

  try {
    const pushReport = await sendPushToAll({
      title: "Novo agendamento Farolfix",
      body: `${payload.nome} solicitou atendimento para ${payload.modelo_carro}.`,
      url: "/admin"
    });
    if (pushReport.status === "skipped") {
      console.warn("[agendamento] Push não enviado:", pushReport.reason);
    } else if (pushReport.failed > 0) {
      console.warn(
        "[agendamento] Push falhou em alguns aparelhos; os demais podem ter recebido.",
        pushReport
      );
    }
  } catch (err) {
    console.error("[agendamento] Erro inesperado ao enviar push:", err);
  }

  return { ok: true };
}

export async function getRecentAgendamentos(limit = 20) {
  const response = await db.query<AgendamentoRow>(
    `select
       ${AGENDAMENTO_SELECT}
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
     returning ${AGENDAMENTO_SELECT}`,
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
     returning ${AGENDAMENTO_SELECT}`,
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
       ${AGENDAMENTO_SELECT}
     from agendamentos
     where id = $1`,
    [id]
  );

  return response.rows[0] ?? null;
}

export async function atualizarAgendamento(
  id: string,
  payload: {
    nome: string;
    endereco: string;
    telefone: string;
    modelo_carro: string;
    observacao?: string;
    valor_servico?: number;
    agendado_para?: string;
  }
) {
  validarPayload(payload);

  const valorServico =
    payload.valor_servico && payload.valor_servico > 0 ? payload.valor_servico : 200;
  const agendadoParaIso = payload.agendado_para?.trim()
    ? toUtcDateTimeLocal(payload.agendado_para)
    : null;

  const response = await db.query<AgendamentoRow>(
    `update agendamentos
     set nome = $2,
         endereco = $3,
         telefone = $4,
         modelo_carro = $5,
         observacao = $6,
         valor_servico = $7,
         agendado_para = coalesce($8, agendado_para),
         status = case when $8 is not null then 'agendado' else status end,
         executado_em = case when $8 is not null then null else executado_em end
     where id = $1
     returning ${AGENDAMENTO_SELECT}`,
    [
      id,
      payload.nome.trim(),
      payload.endereco.trim(),
      sanitizePhone(payload.telefone),
      payload.modelo_carro.trim(),
      payload.observacao?.trim() || null,
      valorServico,
      agendadoParaIso
    ]
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

export async function excluirAgendamento(id: string) {
  const response = await db.query<{ id: string }>(
    "delete from agendamentos where id = $1 returning id",
    [id]
  );

  if (!response.rows[0]) {
    throw new Error("Agendamento não encontrado.");
  }

  return response.rows[0];
}
