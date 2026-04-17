"use client";

import { useState } from "react";

type FormData = {
  nome: string;
  telefone: string;
  modelo_carro: string;
};

const initialData: FormData = {
  nome: "",
  telefone: "",
  modelo_carro: ""
};

export function BookingForm() {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const ownerPhoneRaw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const ownerPhone = ownerPhoneRaw.replace(/\D/g, "");
  const fallbackMessage = `Olá, Farolfix! Tive um problema ao concluir o agendamento pelo aplicativo e gostaria de agendar atendimento.\n\nNome: ${formData.nome || "-"}\nTelefone: ${formData.telefone || "-"}\nCarro: ${formData.modelo_carro || "-"}`;
  const fallbackWhatsAppUrl = ownerPhone
    ? `https://api.whatsapp.com/send?phone=${ownerPhone}&text=${encodeURIComponent(fallbackMessage)}`
    : "";
  const camposObrigatoriosPreenchidos =
    formData.nome.trim().length >= 3 &&
    formData.telefone.replace(/\D/g, "").length >= 8 &&
    formData.modelo_carro.trim().length >= 2;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/agendamentos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Não foi possível enviar o agendamento.");
      }

      await response.json();
      setFormData(initialData);
      setSuccess(
        "Agendamento recebido com sucesso. Nossa equipe vai entrar em contato para confirmar os detalhes."
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro inesperado.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function updateField<K extends keyof FormData>(field: K, value: FormData[K]) {
    setFormData((current) => ({ ...current, [field]: value }));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-slate-800 bg-black/40 p-4">
      <label className="block text-sm">
        <span className="mb-1 block text-slate-200">Nome</span>
        <input
          required
          minLength={3}
          value={formData.nome}
          onChange={(e) => updateField("nome", e.target.value)}
          placeholder="Seu nome completo"
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-base outline-none focus:border-brand-blue"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block text-slate-200">Telefone</span>
        <input
          required
          minLength={8}
          value={formData.telefone}
          onChange={(e) => updateField("telefone", e.target.value)}
          placeholder="Com DDD (ex.: 62999887766) ou só o celular (completa com 62)"
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-base outline-none focus:border-brand-blue"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block text-slate-200">Modelo do carro</span>
        <input
          required
          minLength={2}
          value={formData.modelo_carro}
          onChange={(e) => updateField("modelo_carro", e.target.value)}
          placeholder="Ex.: Gol, HB20, Corolla"
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-base outline-none focus:border-brand-blue"
        />
      </label>

      {error ? (
        <div className="space-y-2 rounded-lg border border-red-500/40 bg-red-500/10 p-3">
          <p className="text-sm text-red-300">{error}</p>
          <button
            type="submit"
            disabled={loading || !camposObrigatoriosPreenchidos}
            className="w-full rounded-lg bg-brand-blue px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Tentando novamente..." : "Tentar novamente"}
          </button>
          {fallbackWhatsAppUrl ? (
            <a
              href={fallbackWhatsAppUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-500/50 bg-emerald-500/20 px-3 py-2 text-sm font-semibold text-emerald-200 hover:brightness-110"
            >
              Deseja falar no WhatsApp?
            </a>
          ) : null}
        </div>
      ) : null}
      {success ? <p className="text-sm text-emerald-400">{success}</p> : null}

      <button
        type="submit"
        disabled={loading || !camposObrigatoriosPreenchidos}
        className="w-full rounded-xl bg-brand-blue px-4 py-3 text-base font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Enviando..." : "Quero agendar"}
      </button>
    </form>
  );
}
