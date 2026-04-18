"use client";

import { useEffect } from "react";

const KEY = "farolfix_access_tracked";

/** Sobrevive ao remount do React Strict Mode (evita 2× POST no dev). */
let fetchJaDisparado = false;

/**
 * Registra um acesso na tabela `analytics` (tipo acesso), no máximo 1x por aba (sessionStorage)
 * e com deduplicação por cookie na API.
 *
 * Não usa AbortController no cleanup: no React Strict Mode o abort cancelava o fetch antes
 * de concluir em alguns cenários, deixando o total de acessos em 0.
 */
export function AccessTracker() {
  useEffect(() => {
    if (fetchJaDisparado) {
      return;
    }
    fetchJaDisparado = true;

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
          cache: "no-store",
          keepalive: true,
          headers: { Accept: "application/json" }
        });

        const body = (await res.json().catch(() => ({}))) as { ok?: boolean };
        if (res.ok && body.ok) {
          try {
            sessionStorage.setItem(KEY, "1");
          } catch {
            /* ignora */
          }
        }
      } catch {
        /* falha de rede ou 500: não grava KEY — novo carregamento tenta de novo */
      }
    }

    void registrar();
  }, []);

  return null;
}
