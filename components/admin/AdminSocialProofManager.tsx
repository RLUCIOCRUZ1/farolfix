"use client";

import { useState } from "react";
import type { SocialProofAdminItem } from "@/lib/types";

type AdminSocialProofManagerProps = {
  initialItems: SocialProofAdminItem[];
};

async function compressImageToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const maxWidth = 1200;
  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Não foi possível processar a imagem.");

  context.drawImage(bitmap, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.85);
}

export function AdminSocialProofManager({ initialItems }: AdminSocialProofManagerProps) {
  const [items, setItems] = useState(initialItems);
  const [file, setFile] = useState<File | null>(null);
  const [legenda, setLegenda] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("Selecione uma imagem (print da conversa, elogio etc.).");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const imageData = await compressImageToDataUrl(file);
      const response = await fetch("/api/admin/social-proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ imageData, legenda })
      });

      const body = (await response.json()) as { error?: string; item?: SocialProofAdminItem };
      if (!response.ok || !body.item) {
        throw new Error(body.error ?? "Falha ao enviar.");
      }

      setItems((current) => [body.item!, ...current]);
      setFile(null);
      setLegenda("");
      setSuccess("Imagem publicada na seção de provas sociais da página inicial.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao enviar.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Remover esta imagem das provas sociais?");
    if (!confirmed) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/social-proof/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      const body = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !body.ok) {
        throw new Error(body.error ?? "Falha ao excluir.");
      }
      setItems((current) => current.filter((item) => item.id !== id));
      setSuccess("Item removido.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao excluir.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(id: string, ativo: boolean) {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/social-proof/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ativo: !ativo })
      });
      const body = (await response.json()) as { error?: string; item?: SocialProofAdminItem };
      if (!response.ok || !body.item) {
        throw new Error(body.error ?? "Falha ao atualizar.");
      }
      setItems((current) =>
        current.map((item) => (item.id === id ? { ...item, ativo: body.item!.ativo } : item))
      );
      setSuccess(ativo ? "Oculto na página inicial." : "Visível na página inicial.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-black/40 p-4">
      <h2 className="text-lg font-semibold">Provas sociais (conversas / elogios)</h2>
      <p className="mt-1 text-sm text-slate-400">
        Envie prints de WhatsApp ou telas de feedback. Elas aparecem na home, abaixo de Antes e
        Depois. Texto opcional aparece como observação abaixo da imagem.
      </p>

      <div className="mt-4 rounded-xl border border-slate-700/80 bg-slate-950/40 p-3">
        <label className="text-xs text-slate-500">Observação / legenda (opcional)</label>
        <input
          value={legenda}
          onChange={(e) => setLegenda(e.target.value)}
          placeholder='Ex.: "Cliente de Goiânia — jan/2026"'
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-brand-blue"
        />
      </div>

      <form onSubmit={handleUpload} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-1.5 file:text-sm file:text-slate-200"
        />
        <button
          type="submit"
          disabled={loading || !file}
          className="rounded-lg bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Enviar print"}
        </button>
      </form>

      {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
      {success ? <p className="mt-3 text-sm text-emerald-400">{success}</p> : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500 sm:col-span-2 lg:col-span-3">Nenhuma imagem ainda.</p>
        ) : (
          items.map((item) => (
            <article
              key={item.id}
              className={`rounded-xl border p-2 ${
                item.ativo ? "border-slate-800 bg-slate-950/50" : "border-slate-800/60 bg-slate-950/30 opacity-70"
              }`}
            >
              <img src={item.src} alt="" className="h-36 w-full rounded-md object-cover" />
              <p className="mt-2 min-h-8 text-xs text-slate-300">{item.legenda || "—"}</p>
              <p className="text-[10px] uppercase tracking-wide text-slate-500">
                {item.ativo ? "Visível no site" : "Oculto"}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleToggle(item.id, item.ativo)}
                  disabled={loading}
                  className="rounded-md border border-slate-600 px-3 py-1 text-xs text-slate-200 hover:border-brand-blue disabled:opacity-40"
                >
                  {item.ativo ? "Ocultar" : "Mostrar"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  disabled={loading}
                  className="rounded-md border border-red-800 px-3 py-1 text-xs text-red-300 disabled:opacity-40"
                >
                  Excluir
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
