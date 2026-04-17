"use client";

import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replaceAll("-", "+").replaceAll("_", "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export function AdminPushManager() {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function init() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
      setSupported(true);

      const registration = await navigator.serviceWorker.register("/sw.js");
      const existing = await registration.pushManager.getSubscription();
      setEnabled(Boolean(existing));
    }

    init().catch(() => setMessage("Não foi possível inicializar notificações neste dispositivo."));
  }, []);

  async function habilitarNotificacoes() {
    setLoading(true);
    setMessage("");

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Permissão de notificação negada.");
      }

      const keyResponse = await fetch("/api/push");
      const keyBody = (await keyResponse.json()) as { publicKey?: string };
      if (!keyBody.publicKey) {
        throw new Error("Chave pública VAPID não configurada no servidor.");
      }

      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(keyBody.publicKey)
        }));

      const saveResponse = await fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription)
      });

      if (!saveResponse.ok) {
        const body = (await saveResponse.json()) as { error?: string };
        throw new Error(body.error ?? "Falha ao registrar notificações.");
      }

      setEnabled(true);
      setMessage("Notificações ativadas com sucesso.");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Não foi possível ativar notificações.";
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function desabilitarNotificacoes() {
    setLoading(true);
    setMessage("");

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        setEnabled(false);
        return;
      }

      await fetch("/api/push", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint })
      });

      await subscription.unsubscribe();
      setEnabled(false);
      setMessage("Notificações desativadas.");
    } catch {
      setMessage("Falha ao desativar notificações.");
    } finally {
      setLoading(false);
    }
  }

  if (!supported) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-black/40 p-4">
        <h2 className="text-lg font-semibold">Notificações no celular</h2>
        <p className="mt-2 text-sm text-slate-300">
          Este navegador não suporta notificações push. Use Chrome/Edge no Android para instalar o
          app.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-black/40 p-4">
      <h2 className="text-lg font-semibold">Notificações no celular</h2>
      <p className="mt-2 text-sm text-slate-300">
        Ative para receber alerta instantâneo quando um novo cliente solicitar agendamento.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading || enabled}
          onClick={habilitarNotificacoes}
          className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          Ativar notificações
        </button>
        <button
          type="button"
          disabled={loading || !enabled}
          onClick={desabilitarNotificacoes}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 disabled:opacity-60"
        >
          Desativar
        </button>
      </div>

      {message ? <p className="mt-3 text-sm text-slate-200">{message}</p> : null}
    </section>
  );
}
