import { db } from "@/lib/db";
import { percentualConversao } from "@/lib/utils";
import type { AnalyticsRow, TimeseriesPoint } from "@/lib/types";

function formatarDia(dataIso: string): string {
  const data = new Date(dataIso);
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function formatarMes(dataIso: string): string {
  const data = new Date(dataIso);
  return data.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
}

function formatarAno(dataIso: string): string {
  return String(new Date(dataIso).getFullYear());
}

function agruparPor(
  rows: AnalyticsRow[],
  formatter: (dateIso: string) => string
): TimeseriesPoint[] {
  const mapa = new Map<string, TimeseriesPoint>();

  rows.forEach((row) => {
    const label = formatter(row.created_at);
    const atual = mapa.get(label) ?? { label, acessos: 0, agendamentos: 0 };

    if (row.tipo === "acesso") atual.acessos += 1;
    if (row.tipo === "agendamento") atual.agendamentos += 1;

    mapa.set(label, atual);
  });

  return Array.from(mapa.values());
}

export async function registrarEvento(tipo: "acesso" | "agendamento") {
  await db.query("insert into analytics (tipo) values ($1)", [tipo]);
}

export async function getDashboardData() {
  const [acessosResp, agendamentosResp, analyticsResp, statusResp, faturamentoResp] = await Promise.all([
    db.query("select count(*)::int as total from analytics where tipo = 'acesso'"),
    db.query("select count(*)::int as total from analytics where tipo = 'agendamento'"),
    db.query<AnalyticsRow>("select id, tipo, created_at from analytics order by created_at asc"),
    db.query(
      `select
         count(*) filter (where status = 'pendente')::int as pendentes,
         count(*) filter (where status = 'agendado')::int as agendados,
         count(*) filter (where status = 'executado')::int as executados
       from agendamentos`
    ),
    db.query(
      `with base as (
         select
           valor_servico,
           case
             when status = 'executado' then coalesce(executado_em, agendado_para, created_at)
             when status = 'agendado' then coalesce(agendado_para, created_at)
             else created_at
           end as referencia_data
         from agendamentos
         where status in ('agendado', 'executado')
       )
       select
         coalesce(
           sum(valor_servico) filter (
             where (referencia_data at time zone 'America/Sao_Paulo') >= date_trunc('week', now() at time zone 'America/Sao_Paulo')
               and (referencia_data at time zone 'America/Sao_Paulo') < date_trunc('week', now() at time zone 'America/Sao_Paulo') + interval '1 week'
           ),
           0
         )::float8 as semana,
         coalesce(
           sum(valor_servico) filter (
             where date_trunc('month', referencia_data at time zone 'America/Sao_Paulo') =
                   date_trunc('month', now() at time zone 'America/Sao_Paulo')
           ),
           0
         )::float8 as mes,
         coalesce(
           sum(valor_servico) filter (
             where date_trunc('year', referencia_data at time zone 'America/Sao_Paulo') =
                   date_trunc('year', now() at time zone 'America/Sao_Paulo')
           ),
           0
         )::float8 as ano
       from base`
    )
  ]);

  const analyticsRows = analyticsResp.rows;
  const acessos = acessosResp.rows[0]?.total ?? 0;
  const agendamentos = agendamentosResp.rows[0]?.total ?? 0;
  const pendentes = statusResp.rows[0]?.pendentes ?? 0;
  const agendados = statusResp.rows[0]?.agendados ?? 0;
  const executados = statusResp.rows[0]?.executados ?? 0;
  const faturamentoSemana = faturamentoResp.rows[0]?.semana ?? 0;
  const faturamentoMes = faturamentoResp.rows[0]?.mes ?? 0;
  const faturamentoAno = faturamentoResp.rows[0]?.ano ?? 0;

  return {
    cards: {
      acessos,
      agendamentos,
      conversao: percentualConversao(acessos, agendamentos),
      pendentes,
      agendados,
      executados,
      faturamentoSemana,
      faturamentoMes,
      faturamentoAno
    },
    diario: agruparPor(analyticsRows, formatarDia).slice(-14),
    mensal: agruparPor(analyticsRows, formatarMes).slice(-12),
    anual: agruparPor(analyticsRows, formatarAno).slice(-5)
  };
}
