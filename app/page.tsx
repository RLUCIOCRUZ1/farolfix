import Image from "next/image";
import { AccessTracker } from "@/components/home/AccessTracker";
import { BookingForm } from "@/components/home/BookingForm";
import { GallerySectionClient } from "@/components/home/GallerySectionClient";
import { SocialProofSectionClient } from "@/components/home/SocialProofSectionClient";
import { InvestimentoPaymentMethods } from "@/components/home/InvestimentoPaymentMethods";
import { PrimaryButton } from "@/components/home/PrimaryButton";
import { WhatsAppCta } from "@/components/home/WhatsAppCta";
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
          <div className="flex flex-wrap items-center justify-center">
            <span className="rounded-full border-2 border-brand-blue/70 bg-brand-blue/15 px-4 py-2 text-sm font-semibold text-brand-blue shadow-glow md:px-5 md:text-base">
              Garantia de 1 ano
            </span>
          </div>
          <PrimaryButton href="#agendamento">Solicitar atendimento</PrimaryButton>
        </div>
      </section>

      <section className="container-default py-12">
        <h2 className="section-title">Vantagens</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            {
              titulo: "Recupera transparência original",
              desc: "Devolve o aspecto limpo e o brilho de fábrica ao acrílico."
            },
            {
              titulo: "Evita reprovação em vistoria",
              desc: "Faróis opacos ou amarelados costumam ser motivo de reprovação."
            },
            {
              titulo: "Mais barato que trocar o farol",
              desc: "Economia em relação à troca do conjunto completo."
            }
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
          <h2 className="section-title">Antes e Depois</h2>
          <p className="section-subtitle">Resultados reais do processo de revitalização.</p>
          <div className="mt-5">
            <GallerySectionClient />
          </div>
        </div>
      </section>

      <SocialProofSectionClient />

      <section className="border-y border-slate-800 bg-black/40">
        <div className="container-default py-12">
          <h2 className="section-title">Investimento</h2>
          <p className="section-subtitle">Transparência total para você decidir rápido.</p>

          <div className="mt-5 max-w-xl rounded-2xl border-2 border-brand-blue/60 bg-[radial-gradient(circle_at_top,rgba(10,132,255,0.2),rgba(2,6,23,0.9))] p-6 shadow-glow">
            <p className="price-pulse text-5xl font-extrabold leading-none text-brand-blue md:text-6xl">
              {valorServico}
            </p>
            <p className="mt-3 inline-flex rounded-full border border-slate-600 bg-black/40 px-3 py-1 text-sm text-slate-200">
              Valor para Goiânia e região
            </p>
            <div className="mt-4 space-y-1 text-xs text-slate-300 md:text-sm">
              <p>Esse valor já contempla o polimento do par de faróis.</p>
              <p>
                Atendimento em domicílio para até 20 km; acima disso, aplicamos uma taxa de
                deslocamento combinada com você antes da visita.
              </p>
            </div>
            <InvestimentoPaymentMethods />
          </div>
        </div>
      </section>

      <section
        id="agendamento"
        className="container-default scroll-mt-6 py-12 md:scroll-mt-8"
      >
        <div className="w-full max-w-xl">
          <h2 className="section-title">Agendamento</h2>
          <p className="section-subtitle">
            Preencha os dados e nossa equipe entrará em contato para confirmar seu atendimento.
          </p>
          <div className="mt-5 space-y-6">
            <BookingForm />
            <WhatsAppCta />
          </div>
        </div>
      </section>
    </main>
  );
}
