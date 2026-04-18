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

const DEFAULT_WHATSAPP_E164 = "5562981042702";

/** Primeira letra maiúscula, demais minúsculas em cada palavra (João Silva, Hb20, Fiat Uno). */
function formatarNomeOuCarro(valor: string) {
  return valor
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
    .join(" ");
}

/** Ex.: 62991789193 → 62-99178-9193 (DDD + celular). Remove 55 inicial se houver. */
function formatarTelefoneDDD(valor: string) {
  let d = valor.replace(/\D/g, "");
  if (d.startsWith("55") && d.length >= 12) {
    d = d.slice(2);
  }
  if (d.length === 11) {
    return `${d.slice(0, 2)}-${d.slice(2, 7)}-${d.slice(7)}`;
  }
  if (d.length === 10) {
    return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6)}`;
  }
  if (d.length === 9) {
    return `${d.slice(0, 5)}-${d.slice(5)}`;
  }
  return valor.trim() || d;
}

function buildAccelerateWhatsAppUrl(phoneDigits: string, data: FormData) {
  const nomeFmt = formatarNomeOuCarro(data.nome);
  const carroFmt = formatarNomeOuCarro(data.modelo_carro);
  const telFmt = formatarTelefoneDDD(data.telefone);
  const linhaDados = `Nome : ${nomeFmt} / Telefone: ${telFmt} / Carro : ${carroFmt}`;
  const text = [
    "Olá! Acabei de mandar meu agendamento pelo site da Farolfix e queria alinhar direto com vocês.",
    "",
    linhaDados
  ].join("\n");
  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(text)}`;
}

export function BookingForm() {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successSnapshot, setSuccessSnapshot] = useState<FormData | null>(null);
  const ownerPhoneRaw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const ownerPhone = ownerPhoneRaw.replace(/\D/g, "") || DEFAULT_WHATSAPP_E164;
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
    setSuccessSnapshot(null);

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
      const enviado = { ...formData };
      setFormData(initialData);
      setSuccessSnapshot(enviado);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro inesperado.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function updateField<K extends keyof FormData>(field: K, value: FormData[K]) {
    setSuccessSnapshot(null);
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
          placeholder="Com DDD (ex.: 62999887766)"
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
      {successSnapshot ? (
        <div className="space-y-3 rounded-lg border border-emerald-500/35 bg-emerald-500/[0.08] p-4">
          <p className="text-sm leading-relaxed text-emerald-50">
            <strong className="font-semibold text-emerald-200">
              Pedido recebido com sucesso!{" "}
              <span aria-hidden className="inline">
                🚗✨
              </span>
            </strong>
          </p>
          <p className="text-sm leading-relaxed text-slate-300">
            Vamos entrar em contato para confirmar data e horário.
          </p>
          <p className="text-sm leading-relaxed text-slate-300">
            Para garantir seu horário mais rápido, clique abaixo e fale com a gente no WhatsApp agora.
          </p>
          <a
            href={buildAccelerateWhatsAppUrl(ownerPhone, successSnapshot)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/45 bg-emerald-950/50 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:border-emerald-400/55 hover:bg-emerald-900/45"
          >
            <svg className="h-5 w-5 shrink-0 text-emerald-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Falar no WhatsApp agora
          </a>
        </div>
      ) : null}

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
