"use client";

import { useEffect } from "react";

const KEY = "farolfix_access_tracked";

export function AccessTracker() {
  useEffect(() => {
    const ac = new AbortController();

    async function registrar() {
      try {
        if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(KEY)) {
          return;
        }
      } catch {
        /* sessionStorage indisponível (modo restrito) */
      }

      try {
        const res = await fetch("/api/track-access", {
          method: "POST",
          credentials: "same-origin",
          keepalive: true,
          signal: ac.signal
        });
        const body = (await res.json().catch(() => ({}))) as { ok?: boolean };
        if (res.ok && body.ok) {
          try {
            sessionStorage.setItem(KEY, "1");
          } catch {
            /* ignora */
          }
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        /* falha de rede ou 500: não grava KEY — novo carregamento tenta de novo */
      }
    }

    void registrar();

    return () => ac.abort();
  }, []);

  return null;
}
