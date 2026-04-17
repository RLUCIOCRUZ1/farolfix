import Image from "next/image";
import { AccessTracker } from "@/components/home/AccessTracker";
import { BeforeAfterGallery } from "@/components/home/BeforeAfterGallery";
import { BookingForm } from "@/components/home/BookingForm";
import { PrimaryButton } from "@/components/home/PrimaryButton";
import { formatarMoeda } from "@/lib/utils";

const valorServico = formatarMoeda(200);

export default function HomePage() {
  return (
    <main>
      <AccessTracker />

      <section className="relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(10,132,255,0.25),transparent_60%)]" />
        <div className="container-default relative flex flex-col items-center gap-5 py-14 text-center md:py-20">
          <Image
            src="/logo-farolfix.png"
            alt="Logo oficial Farolfix"
            width={300}
            height={188}
            priority
            className="h-auto w-48 drop-shadow-[0_0_25px_rgba(10,132,255,0.35)] md:w-64"
          />

          <h1 className="max-w-2xl text-3xl font-extrabold leading-tight md:text-5xl">
            Seu farol como novo, sem sair de casa
          </h1>
          <p className="max-w-xl text-sm text-slate-300 md:text-lg">
            Atendimento automotivo premium em domicílio para recuperar brilho, visibilidade e
            segurança.
          </p>
          <PrimaryButton href="#agendamento">Agendar Serviço</PrimaryButton>
        </div>
      </section>

      <section className="container-default py-12">
        <h2 className="section-title">Serviços</h2>
        <p className="section-subtitle">
          Polimento técnico para remoção de amarelado e restauração da transparência dos faróis.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            "Polimento de farol",
            "Remoção de amarelado",
            "Restauração de transparência"
          ].map((item) => (
            <div key={item} className="rounded-xl border border-slate-800 bg-black/40 p-4">
              <p className="font-semibold">{item}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            { titulo: "Segurança", desc: "Melhor visibilidade noturna e em dias de chuva." },
            { titulo: "Estética", desc: "Visual renovado e valorização do veículo." },
            { titulo: "Economia", desc: "Mais barato que trocar o farol completo." }
          ].map((item) => (
            <div key={item.titulo} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <p className="font-semibold text-brand-blue">{item.titulo}</p>
              <p className="mt-1 text-sm text-slate-300">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-800 bg-black/40">
        <div className="container-default py-12">
          <h2 className="section-title">Valores</h2>
          <p className="section-subtitle">Transparência total para você decidir rápido.</p>

          <div className="mt-5 max-w-xl rounded-2xl border-2 border-brand-blue/60 bg-[radial-gradient(circle_at_top,rgba(10,132,255,0.2),rgba(2,6,23,0.9))] p-6 shadow-glow">
            <p className="text-xs uppercase tracking-[0.18em] text-brand-blue/80">Investimento</p>
            <p className="price-pulse mt-2 text-5xl font-extrabold leading-none text-brand-blue md:text-6xl">
              {valorServico}
            </p>
            <p className="mt-3 inline-flex rounded-full border border-slate-600 bg-black/40 px-3 py-1 text-sm text-slate-200">
              Valor para Goiânia e região
            </p>
          </div>
        </div>
      </section>

      <section className="container-default py-12">
        <h2 className="section-title">Como Funciona</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {[
            "1. Você agenda",
            "2. Vamos até você",
            "3. Executamos o serviço",
            "4. Farol renovado"
          ].map((step) => (
            <div key={step} className="rounded-xl border border-slate-800 bg-black/40 p-4 text-sm">
              {step}
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-800 bg-black/40">
        <div className="container-default py-12">
          <h2 className="section-title">Antes e Depois</h2>
          <p className="section-subtitle">Resultados reais do processo de revitalização.</p>
          <div className="mt-5">
            <BeforeAfterGallery />
          </div>
        </div>
      </section>

      <section id="agendamento" className="container-default py-12">
        <h2 className="section-title">Agendamento</h2>
        <p className="section-subtitle">
          Preencha os dados e nossa equipe entra em contato para confirmar seu atendimento.
        </p>
        <div className="mt-5 max-w-xl">
          <BookingForm />
        </div>
      </section>
    </main>
  );
}
