"use client";

import { Fragment, useMemo, useState } from "react";
import type { AgendamentoRow, AgendamentoStatus } from "@/lib/types";
import { normalizeBrazilPhone } from "@/lib/utils";

type RecentBookingsProps = {
  items: AgendamentoRow[];
};

type EditFormData = {
  nome: string;
  telefone: string;
  modelo_carro: string;
  observacao: string;
  valor_servico: string;
  agendado_para: string;
};

function formatDate(dateIso: string) {
  return new Date(dateIso).toLocaleString("pt-BR");
}

function getWhatsAppUrl(telefone: string) {
  const normalized = normalizeBrazilPhone(telefone);
  if (!normalized) return "";
  return `https://api.whatsapp.com/send?phone=${normalized}`;
}

function formatDateTime(dateIso: string | null) {
  if (!dateIso) return "-";
  return new Date(dateIso).toLocaleString("pt-BR");
}

function toInputDateTime(dateIso: string | null) {
  if (!dateIso) return "";
  const date = new Date(dateIso);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function getStatusLabel(status: AgendamentoStatus) {
  if (status === "executado") return "Executado";
  if (status === "agendado") return "Agendado";
  return "Pendente";
}

function getStatusClasses(status: AgendamentoStatus) {
  if (status === "executado") return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
  if (status === "agendado") return "bg-blue-500/20 text-blue-300 border-blue-500/40";
  return "bg-amber-500/20 text-amber-300 border-amber-500/40";
}

export function RecentBookings({ items }: RecentBookingsProps) {
  const [rows, setRows] = useState(items);
  const [openScheduleId, setOpenScheduleId] = useState<string | null>(null);
  const [openEditId, setOpenEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormData>({
    nome: "",
    telefone: "",
    modelo_carro: "",
    observacao: "",
    valor_servico: "200",
    agendado_para: ""
  });
  const [agendadoPara, setAgendadoPara] = useState("");
  const [observacao, setObservacao] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [calendarUrlById, setCalendarUrlById] = useState<Record<string, string>>({});

  const hasRows = useMemo(() => rows.length > 0, [rows]);

  function openSchedule(item: AgendamentoRow) {
    setOpenScheduleId(item.id);
    setOpenEditId(null);
    setAgendadoPara(toInputDateTime(item.agendado_para));
    setObservacao(item.observacao ?? "");
    setError("");
    setFeedback("");
  }

  function openEdit(item: AgendamentoRow) {
    setOpenEditId(item.id);
    setOpenScheduleId(null);
    setEditForm({
      nome: item.nome,
      telefone: item.telefone,
      modelo_carro: item.modelo_carro,
      observacao: item.observacao ?? "",
      valor_servico: String(item.valor_servico ?? 200),
      agendado_para: toInputDateTime(item.agendado_para)
    });
    setError("");
    setFeedback("");
  }

  function updateRow(updated: AgendamentoRow) {
    setRows((current) => current.map((item) => (item.id === updated.id ? updated : item)));
  }

  async function handleSchedule(item: AgendamentoRow) {
    setLoadingId(item.id);
    setError("");
    setFeedback("");

    try {
      const response = await fetch(`/api/admin/agendamentos/${item.id}/agendar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agendadoPara, observacao })
      });

      const body = (await response.json()) as {
        error?: string;
        agendamento?: AgendamentoRow;
        calendarUrl?: string | null;
      };

      if (!response.ok || !body.agendamento) {
        throw new Error(body.error ?? "Falha ao agendar atendimento.");
      }

      updateRow(body.agendamento);
      setOpenScheduleId(null);
      setFeedback("Agendamento salvo com sucesso.");

      if (body.calendarUrl) {
        setCalendarUrlById((current) => ({ ...current, [item.id]: body.calendarUrl! }));
        window.open(body.calendarUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao salvar agendamento.";
      setError(message);
    } finally {
      setLoadingId(null);
    }
  }

  async function handleExecutar(item: AgendamentoRow) {
    setLoadingId(item.id);
    setError("");
    setFeedback("");

    try {
      const response = await fetch(`/api/admin/agendamentos/${item.id}/executar`, {
        method: "POST"
      });

      const body = (await response.json()) as { error?: string; agendamento?: AgendamentoRow };
      if (!response.ok || !body.agendamento) {
        throw new Error(body.error ?? "Falha ao marcar como executado.");
      }

      updateRow(body.agendamento);
      setFeedback("Atendimento marcado como executado.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar status.";
      setError(message);
    } finally {
      setLoadingId(null);
    }
  }

  async function handleEditar(item: AgendamentoRow) {
    setLoadingId(item.id);
    setError("");
    setFeedback("");

    try {
      const response = await fetch(`/api/admin/agendamentos/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          valor_servico: Number(editForm.valor_servico),
          agendado_para: editForm.agendado_para
        })
      });

      const body = (await response.json()) as {
        error?: string;
        agendamento?: AgendamentoRow;
        calendarUrl?: string | null;
      };
      if (!response.ok || !body.agendamento) {
        throw new Error(body.error ?? "Falha ao atualizar agendamento.");
      }

      updateRow(body.agendamento);
      setOpenEditId(null);
      setFeedback("Dados do cliente atualizados com sucesso.");

      if (body.calendarUrl) {
        setCalendarUrlById((current) => ({ ...current, [item.id]: body.calendarUrl! }));
        window.open(body.calendarUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao editar agendamento.";
      setError(message);
    } finally {
      setLoadingId(null);
    }
  }

  async function handleExcluir(item: AgendamentoRow) {
    const confirmado = window.confirm(
      `Deseja realmente excluir o agendamento de ${item.nome}? Essa ação não pode ser desfeita.`
    );
    if (!confirmado) return;

    setLoadingId(item.id);
    setError("");
    setFeedback("");

    try {
      const response = await fetch(`/api/admin/agendamentos/${item.id}`, {
        method: "DELETE"
      });

      const body = (await response.json()) as { error?: string; ok?: boolean };
      if (!response.ok || !body.ok) {
        throw new Error(body.error ?? "Falha ao excluir agendamento.");
      }

      setRows((current) => current.filter((row) => row.id !== item.id));
      setOpenEditId((current) => (current === item.id ? null : current));
      setOpenScheduleId((current) => (current === item.id ? null : current));
      setFeedback("Agendamento excluído com sucesso.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao excluir agendamento.";
      setError(message);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-black/40 p-4">
      <h2 className="text-lg font-semibold">Agendamentos recentes</h2>

      {feedback ? <p className="mt-3 text-sm text-emerald-400">{feedback}</p> : null}
      {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}

      {!hasRows ? (
        <p className="mt-3 text-sm text-slate-300">Nenhum agendamento recebido até agora.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-300">
                <th className="px-2 py-2 font-medium">Cliente</th>
                <th className="px-2 py-2 font-medium">Telefone</th>
                <th className="px-2 py-2 font-medium">Carro</th>
                <th className="px-2 py-2 font-medium">Status</th>
                <th className="px-2 py-2 font-medium">Data</th>
                <th className="px-2 py-2 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => {
                const isOpen = openScheduleId === item.id;
                const isEditing = openEditId === item.id;
                const isLoading = loadingId === item.id;
                const calendarUrl = calendarUrlById[item.id];

                return (
                  <Fragment key={item.id}>
                    <tr className="border-b border-slate-900">
                      <td className="px-2 py-2">{item.nome}</td>
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-2">
                          <a href={`tel:${item.telefone}`} className="text-brand-blue hover:underline">
                            {item.telefone}
                          </a>
                          <a
                            href={getWhatsAppUrl(item.telefone)}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Abrir WhatsApp de ${item.nome}`}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-black transition hover:brightness-110"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="h-4 w-4 fill-current"
                              aria-hidden="true"
                            >
                              <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.57 2 2.13 6.44 2.13 11.9c0 1.75.46 3.45 1.33 4.95L2 22l5.27-1.38a9.87 9.87 0 0 0 4.76 1.22h.01c5.47 0 9.91-4.44 9.91-9.9a9.8 9.8 0 0 0-2.9-7.03Zm-7.01 15.2h-.01a8.2 8.2 0 0 1-4.17-1.14l-.3-.18-3.13.82.84-3.05-.2-.31a8.18 8.18 0 0 1-1.27-4.35c0-4.53 3.69-8.22 8.24-8.22a8.2 8.2 0 0 1 5.83 2.41 8.16 8.16 0 0 1 2.4 5.81c0 4.54-3.69 8.22-8.23 8.22Zm4.5-6.16c-.24-.12-1.42-.7-1.65-.78-.22-.08-.39-.12-.55.12-.16.24-.63.78-.77.94-.14.16-.29.18-.53.06-.24-.12-1.02-.37-1.94-1.18-.72-.64-1.2-1.42-1.34-1.66-.14-.24-.02-.36.1-.48.1-.1.24-.26.35-.39.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.33-.75-1.82-.2-.49-.4-.42-.55-.43h-.47c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.61.57.25 1.02.4 1.37.5.58.18 1.1.15 1.52.09.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.47-.28Z" />
                            </svg>
                          </a>
                        </div>
                      </td>
                      <td className="px-2 py-2">{item.modelo_carro}</td>
                      <td className="px-2 py-2">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${getStatusClasses(item.status)}`}
                          >
                            {getStatusLabel(item.status)}
                          </span>
                          {item.status === "agendado" ? (
                            <p className="text-xs text-slate-300">
                              {formatDateTime(item.agendado_para)}
                            </p>
                          ) : null}
                          {item.status === "executado" ? (
                            <p className="text-xs text-slate-300">
                              {formatDateTime(item.executado_em)}
                            </p>
                          ) : null}
                          {item.observacao ? (
                            <p className="text-xs text-slate-400">Obs: {item.observacao}</p>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-2 py-2 text-slate-300">{formatDate(item.created_at)}</td>
                      <td className="px-2 py-2">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openSchedule(item)}
                            className="rounded-md border border-slate-700 px-3 py-1 text-xs hover:border-brand-blue"
                          >
                            Agendar
                          </button>

                          <button
                            type="button"
                            onClick={() => handleExecutar(item)}
                            disabled={isLoading || item.status === "executado"}
                            className="rounded-md border border-emerald-700 px-3 py-1 text-xs text-emerald-300 disabled:opacity-40"
                          >
                            Executado
                          </button>

                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            className="rounded-md border border-slate-700 px-3 py-1 text-xs hover:border-brand-blue"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => handleExcluir(item)}
                            disabled={isLoading}
                            className="rounded-md border border-red-700 px-3 py-1 text-xs text-red-300 disabled:opacity-40"
                          >
                            Excluir
                          </button>

                          {item.status === "agendado" ? (
                            <a
                              href={
                                calendarUrl ??
                                `/api/admin/agendamentos/${item.id}/calendario`
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-md border border-blue-700 px-3 py-1 text-xs text-blue-300"
                            >
                              Calendário
                            </a>
                          ) : null}
                        </div>
                      </td>
                    </tr>

                    {isOpen ? (
                      <tr className="border-b border-slate-900/70 bg-slate-950/40">
                        <td colSpan={6} className="px-3 py-3">
                          <div className="grid gap-3 md:grid-cols-3">
                            <label className="text-sm">
                              <span className="mb-1 block text-slate-300">Cliente</span>
                              <input
                                value={item.nome}
                                disabled
                                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-200"
                              />
                            </label>

                            <label className="text-sm">
                              <span className="mb-1 block text-slate-300">Telefone</span>
                              <input
                                value={item.telefone}
                                disabled
                                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-200"
                              />
                            </label>

                            <label className="text-sm">
                              <span className="mb-1 block text-slate-300">Carro</span>
                              <input
                                value={item.modelo_carro}
                                disabled
                                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-200"
                              />
                            </label>
                          </div>

                          <div className="mt-3 grid gap-3 md:grid-cols-2">
                            <label className="text-sm">
                              <span className="mb-1 block text-slate-300">Dia e horário do atendimento</span>
                              <input
                                type="datetime-local"
                                required
                                value={agendadoPara}
                                onChange={(e) => setAgendadoPara(e.target.value)}
                                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-brand-blue"
                              />
                            </label>
                            <label className="text-sm">
                              <span className="mb-1 block text-slate-300">Observação</span>
                              <input
                                value={observacao}
                                onChange={(e) => setObservacao(e.target.value)}
                                placeholder="Ex.: cliente pediu chegada após 18h"
                                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-brand-blue"
                              />
                            </label>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleSchedule(item)}
                              disabled={isLoading || !agendadoPara}
                              className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                            >
                              {isLoading ? "Salvando..." : "Salvar agendamento"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setOpenScheduleId(null)}
                              className="rounded-lg border border-slate-700 px-4 py-2 text-sm"
                            >
                              Cancelar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : null}

                    {isEditing ? (
                      <tr className="border-b border-slate-900/70 bg-slate-950/40">
                        <td colSpan={6} className="px-3 py-3">
                          <div className="grid gap-3 md:grid-cols-2">
                            <label className="text-sm">
                              <span className="mb-1 block text-slate-300">Nome do cliente</span>
                              <input
                                value={editForm.nome}
                                onChange={(e) =>
                                  setEditForm((current) => ({ ...current, nome: e.target.value }))
                                }
                                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-brand-blue"
                              />
                            </label>
                            <label className="text-sm">
                              <span className="mb-1 block text-slate-300">Telefone</span>
                              <input
                                value={editForm.telefone}
                                onChange={(e) =>
                                  setEditForm((current) => ({
                                    ...current,
                                    telefone: e.target.value
                                  }))
                                }
                                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-brand-blue"
                              />
                            </label>
                            <label className="text-sm">
                              <span className="mb-1 block text-slate-300">Modelo do carro</span>
                              <input
                                value={editForm.modelo_carro}
                                onChange={(e) =>
                                  setEditForm((current) => ({
                                    ...current,
                                    modelo_carro: e.target.value
                                  }))
                                }
                                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-brand-blue"
                              />
                            </label>
                            <label className="text-sm">
                              <span className="mb-1 block text-slate-300">Valor do serviço (R$)</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={editForm.valor_servico}
                                onChange={(e) =>
                                  setEditForm((current) => ({
                                    ...current,
                                    valor_servico: e.target.value
                                  }))
                                }
                                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-brand-blue"
                              />
                            </label>
                            <label className="text-sm">
                              <span className="mb-1 block text-slate-300">Observação</span>
                              <input
                                value={editForm.observacao}
                                onChange={(e) =>
                                  setEditForm((current) => ({
                                    ...current,
                                    observacao: e.target.value
                                  }))
                                }
                                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-brand-blue"
                              />
                            </label>
                            <label className="text-sm">
                              <span className="mb-1 block text-slate-300">Reagendar (dia e horário)</span>
                              <input
                                type="datetime-local"
                                value={editForm.agendado_para}
                                onChange={(e) =>
                                  setEditForm((current) => ({
                                    ...current,
                                    agendado_para: e.target.value
                                  }))
                                }
                                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-brand-blue"
                              />
                            </label>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditar(item)}
                              disabled={
                                isLoading ||
                                !editForm.nome.trim() ||
                                !editForm.telefone.trim() ||
                                !editForm.modelo_carro.trim()
                              }
                              className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                            >
                              {isLoading ? "Salvando..." : "Salvar edição"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setOpenEditId(null)}
                              className="rounded-lg border border-slate-700 px-4 py-2 text-sm"
                            >
                              Cancelar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
