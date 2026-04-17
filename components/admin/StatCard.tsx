type StatCardProps = {
  title: string;
  value: string;
};

export function StatCard({ title, value }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-black/40 p-4">
      <p className="text-sm text-slate-300">{title}</p>
      <p className="mt-2 text-3xl font-bold text-brand-blue">{value}</p>
    </article>
  );
}
