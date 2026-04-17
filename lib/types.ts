export type TipoAnalytics = "acesso" | "agendamento";

export type AgendamentoInput = {
  nome: string;
  endereco: string;
  telefone: string;
  modelo_carro: string;
};

export type AgendamentoStatus = "pendente" | "agendado" | "executado";

export type AnalyticsRow = {
  id: string;
  tipo: TipoAnalytics;
  created_at: string;
};

export type AgendamentoRow = {
  id: string;
  nome: string;
  endereco: string;
  telefone: string;
  modelo_carro: string;
  status: AgendamentoStatus;
  agendado_para: string | null;
  executado_em: string | null;
  observacao: string | null;
  valor_servico: number;
  created_at: string;
};

export type TimeseriesPoint = {
  label: string;
  acessos: number;
  agendamentos: number;
};

export type PushSubscriptionRow = {
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
};
