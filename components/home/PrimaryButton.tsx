import Link from "next/link";

type PrimaryButtonProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export function PrimaryButton({ href, children, className }: PrimaryButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-12 items-center justify-center rounded-xl bg-brand-blue px-6 py-3 text-base font-semibold text-white shadow-glow transition hover:brightness-110 ${className ?? ""}`}
    >
      {children}
    </Link>
  );
}
