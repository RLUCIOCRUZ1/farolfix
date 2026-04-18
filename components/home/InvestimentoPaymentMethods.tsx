/** Ícones enxutos para formas de pagamento (SVG inline, cor herdada). */

function IconDinheiro({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 8a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V8z"
      />
      <path strokeLinecap="round" d="M8 12h4M8 16h8" />
      <circle cx="16" cy="10" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconPix({ className }: { className?: string }) {
  /* Estilo “QR” leve, comum para Pix / pagamento instantâneo */
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <path strokeLinecap="round" d="M14 14h3v3M17 14v4M14 17h4" />
    </svg>
  );
}

/** Cartões débito + crédito (duas cartas sobrepostas). */
function IconCartoesDebitoCredito({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="6" y="8" width="15" height="10" rx="1.5" strokeOpacity="0.4" />
      <rect x="3" y="5" width="15" height="10" rx="1.5" />
      <path strokeLinecap="round" d="M3 9.5h15" />
    </svg>
  );
}

const iconClass = "h-5 w-5 shrink-0 text-brand-blue";

const itens = [
  { Icon: IconDinheiro, texto: "Dinheiro" },
  { Icon: IconPix, texto: "Pix" },
  { Icon: IconCartoesDebitoCredito, texto: "Cartões de débito e crédito" }
] as const;

export function InvestimentoPaymentMethods() {
  return (
    <div className="mt-6 border-t border-slate-700/80 pt-5">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-blue/90">
        Formas de pagamento
      </p>
      <ul className="mt-3 flex list-none flex-col gap-3 sm:flex-row sm:gap-4">
        {itens.map(({ Icon, texto }) => (
          <li
            key={texto}
            className="flex min-w-0 flex-1 items-start gap-2.5 text-sm leading-snug text-slate-300 md:text-base"
          >
            <Icon className={`${iconClass} mt-0.5`} />
            <span className="flex min-w-0 flex-1 items-start gap-1.5">
              <span className="mt-[0.35em] shrink-0 font-medium leading-none text-slate-500" aria-hidden>
                *
              </span>
              <span className="min-w-0">{texto}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
