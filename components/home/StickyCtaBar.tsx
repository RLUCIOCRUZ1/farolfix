"use client";

import { PrimaryButton } from "@/components/home/PrimaryButton";

/** CTA fixo inferior — repete o convite sem o usuário precisar rolar de volta ao topo. */
export function StickyCtaBar() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-700/90 bg-[#05070d]/95 py-3 shadow-[0_-12px_40px_rgba(0,0,0,0.55)] backdrop-blur-md supports-[padding-bottom:env(safe-area-inset-bottom)]:pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
      role="region"
      aria-label="Atendimento rápido"
    >
      <div className="container-default flex justify-center px-4">
        <PrimaryButton
          href="#agendamento"
          className="w-full max-w-lg shadow-glow md:w-auto md:min-w-[300px]"
        >
          Solicitar atendimento
        </PrimaryButton>
      </div>
    </div>
  );
}
