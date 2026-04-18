import { redirect } from "next/navigation";
import { AdminCharts } from "@/components/admin/AdminCharts";
import { AdminGalleryManager } from "@/components/admin/AdminGalleryManager";
import { AdminSocialProofManager } from "@/components/admin/AdminSocialProofManager";
import { AdminPushManager } from "@/components/admin/AdminPushManager";
import { RecentBookings } from "@/components/admin/RecentBookings";
import { StatCard } from "@/components/admin/StatCard";
import { isAdminAuthenticated } from "@/lib/auth";
import { formatarMoeda } from "@/lib/utils";
import { getDashboardData } from "@/services/analytics";
import { getRecentAgendamentos } from "@/services/agendamentos";
import { getGalleryImages } from "@/services/gallery";
import { getSocialProofImages } from "@/services/social-proof";
import { logoutAdmin } from "./actions";

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    redirect("/admin/login");
  }

  const [dashboard, recentAgendamentos, galleryImages, socialProofItems] = await Promise.all([
    getDashboardData(),
    getRecentAgendamentos(),
    getGalleryImages({ includeInactive: true }),
    getSocialProofImages({ includeInactive: true })
  ]);

  return (
    <main className="container-default space-y-5 py-8">
      <header className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-black/40 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Farolfix</h1>
          <p className="text-sm text-slate-300">
            Métricas em tempo real. No celular, instale esta página como app para receber alertas.
          </p>
        </div>
        <form action={logoutAdmin}>
          <button
            type="submit"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:border-brand-blue"
          >
            Sair
          </button>
        </form>
      </header>

      <section className="grid gap-3 md:grid-cols-3">
        <StatCard title="Total de acessos" value={String(dashboard.cards.acessos)} />
        <StatCard title="Total de agendamentos" value={String(dashboard.cards.agendamentos)} />
        <StatCard title="Taxa de conversão (%)" value={String(dashboard.cards.conversao)} />
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <StatCard title="Agendamentos pendentes" value={String(dashboard.cards.pendentes)} />
        <StatCard title="Agendamentos agendados" value={String(dashboard.cards.agendados)} />
        <StatCard title="Agendamentos executados" value={String(dashboard.cards.executados)} />
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <StatCard
          title="Faturamento estimado (semana)"
          value={formatarMoeda(dashboard.cards.faturamentoSemana)}
        />
        <StatCard
          title="Faturamento estimado (mês)"
          value={formatarMoeda(dashboard.cards.faturamentoMes)}
        />
        <StatCard
          title="Faturamento estimado (ano)"
          value={formatarMoeda(dashboard.cards.faturamentoAno)}
        />
      </section>

      <AdminPushManager />
      <AdminGalleryManager initialImages={galleryImages} />
      <AdminSocialProofManager initialItems={socialProofItems} />
      <RecentBookings items={recentAgendamentos} />
      <AdminCharts title="Diário (últimos 14 períodos)" data={dashboard.diario} />
      <AdminCharts title="Mensal (últimos 12 períodos)" data={dashboard.mensal} />
      <AdminCharts title="Anual (últimos 5 períodos)" data={dashboard.anual} />
    </main>
  );
}
