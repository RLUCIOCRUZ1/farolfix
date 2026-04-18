"use client";

import { useEffect, useState } from "react";
import type { SocialProofItem } from "@/lib/types";

function StatHighlight() {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-brand-blue/40 bg-gradient-to-br from-brand-blue/20 via-slate-900/90 to-slate-950 px-4 py-3 shadow-[0_0_40px_-12px_rgba(10,132,255,0.55)] sm:w-auto sm:px-5 sm:py-3.5 md:min-w-0">
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand-blue/25 blur-2xl"
        aria-hidden
      />
      <div className="relative flex flex-row flex-wrap items-center gap-x-3 gap-y-1.5 sm:gap-x-4">
        <p className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-blue/90">
          Confiança acumulada
        </p>
        <span className="hidden h-8 w-px shrink-0 bg-brand-blue/35 sm:block" aria-hidden />
        <p className="min-w-0 text-base font-semibold leading-tight text-slate-100 sm:text-lg">
          <span className="font-mono text-xl font-black tracking-tight text-white sm:text-2xl md:text-3xl">
            <span className="text-brand-blue">+</span>
            <span className="text-white"> de 300</span>
          </span>{" "}
          <span className="font-medium text-slate-200">faróis revitalizados</span>
        </p>
      </div>
    </div>
  );
}

function ChatBubbleDecor({ className }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute opacity-[0.07] ${className ?? ""}`}
      aria-hidden
    >
      <svg width="120" height="80" viewBox="0 0 120 80" fill="currentColor" className="text-emerald-400">
        <path d="M8 12h44a8 8 0 018 8v28a8 8 0 01-8 8H20L8 68V48a8 8 0 01-8-8V20a8 8 0 018-8z" />
      </svg>
    </div>
  );
}

function ProofCard({ item, index }: { item: SocialProofItem; index: number }) {
  const tilt = index % 3 === 0 ? "-rotate-[1.5deg]" : index % 3 === 1 ? "rotate-[1.5deg]" : "rotate-0";

  return (
    <article
      className={`mb-5 break-inside-avoid ${tilt} transition-transform duration-300 hover:z-10 hover:scale-[1.02] hover:rotate-0`}
    >
      <div className="rounded-[1.75rem] bg-gradient-to-b from-slate-600/35 via-slate-800/50 to-slate-950 p-[3px] shadow-xl shadow-black/40">
        <div className="overflow-hidden rounded-[1.65rem] bg-[#07080c] ring-1 ring-white/[0.06]">
          <div className="flex items-center gap-1.5 border-b border-white/[0.06] bg-slate-950/80 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-red-500/90" />
            <span className="h-2 w-2 rounded-full bg-amber-400/90" />
            <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-[10px] font-medium tracking-wide text-slate-500">
              conversa · cliente real
            </span>
          </div>
          <div className="relative bg-[#0c0e14]">
            <img
              src={item.src}
              alt={item.legenda || "Depoimento de cliente"}
              className="w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
          {item.legenda ? (
            <p className="border-t border-white/[0.06] px-3 py-2.5 text-xs italic leading-relaxed text-slate-400">
              {item.legenda}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function SocialProofSectionClient() {
  const [items, setItems] = useState<SocialProofItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/public/social-proof", { cache: "no-store", credentials: "same-origin" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((body: { items?: SocialProofItem[] }) => {
        if (cancelled) return;
        const list = body?.items?.filter((i) => Boolean(i?.src)) ?? [];
        setItems(list);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      className="relative overflow-hidden border-y border-slate-800 bg-[#030508]"
      aria-labelledby="social-proof-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(10,132,255,0.12),transparent_50%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h1v1H0z' fill='%23fff'/%3E%3C/svg%3E")`,
          backgroundSize: "24px 24px"
        }}
      />
      <ChatBubbleDecor className="left-[4%] top-[12%]" />
      <ChatBubbleDecor className="bottom-[18%] right-[6%] scale-125 text-brand-blue" />

      <div className="container-default relative py-12 md:py-14">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-10">
          <div className="max-w-xl">
            <h2 id="social-proof-heading" className="section-title">
              O que chega no nosso WhatsApp
            </h2>
            <p className="section-subtitle mt-2 max-w-lg">
              Elogios e feedbacks reais — sem roteiro, direto da conversa com quem já confiou na
              Farolfix.
            </p>
          </div>
          <StatHighlight />
        </div>

        {items === null ? (
          <div className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3" aria-busy="true">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="mb-5 break-inside-avoid animate-pulse rounded-[1.75rem] border border-slate-800 bg-slate-900/50"
              >
                <div className="h-8 border-b border-slate-800 bg-slate-950/80" />
                <div className="aspect-[9/16] max-h-[320px] bg-slate-900/60 md:max-h-[380px]" />
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3">
            {items.map((item, index) => (
              <ProofCard key={item.id} item={item} index={index} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
