"use client";

import Link from "next/link";

type PrimaryButtonProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

const baseClass =
  "cta-pulse inline-flex min-h-[48px] items-center justify-center rounded-xl bg-brand-blue px-6 py-3 text-base font-semibold text-white shadow-glow transition hover:brightness-110 active:brightness-95 touch-manipulation";

/**
 * Links só com hash (#secao) não usam next/link — o router do App Router pode falhar
 * intermitentemente ao rolar na mesma página. Usamos âncora + scrollIntoView.
 */
export function PrimaryButton({ href, children, className }: PrimaryButtonProps) {
  const cn = `${baseClass} ${className ?? ""}`.trim();

  if (href.startsWith("#")) {
    return (
      <a
        href={href}
        className={cn}
        onClick={(e) => {
          e.preventDefault();
          const id = href.slice(1);
          const el = document.getElementById(id);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            try {
              window.history.replaceState(null, "", href);
            } catch {
              /* ignore */
            }
          } else {
            window.location.href = href;
          }
        }}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={cn}>
      {children}
    </Link>
  );
}
