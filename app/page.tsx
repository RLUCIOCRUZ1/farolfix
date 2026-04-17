import Image from "next/image";
import { AccessTracker } from "@/components/home/AccessTracker";
import { BeforeAfterGallery } from "@/components/home/BeforeAfterGallery";
import { BookingForm } from "@/components/home/BookingForm";
import { PrimaryButton } from "@/components/home/PrimaryButton";
import { formatarMoeda } from "@/lib/utils";
import { getGalleryImages } from "@/services/gallery";

const valorServico = formatarMoeda(200);

/** Sempre lê a galeria no Neon em tempo de requisição (uploads não ficam presos no HTML do build). */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const galleryItems = await getGalleryImages().catch((err) => {
    console.error("[gallery] Falha ao carregar galeria na home:", err);
    return [
      {
        id: "fallback-antes-depois-01",
        src: "/gallery/antes-depois-01.png",
        legenda: "Resultado real Farolfix",
        kind: "image" as const
      }
    ];
  });

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
          <PrimaryButton href="#agendamento">Agendar Serviço</PrimaryButton>
        </div>
      </section>

      <section className="container-default py-12">
        <h2 className="section-title">Serviços</h2>
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
            <div className="mt-4 space-y-1 text-xs text-slate-300 md:text-sm">
              <p>Esse valor já contempla o polimento do par de faróis.</p>
              <p>
                Atendimento em domicílio para até 20 km; acima disso, aplicamos uma taxa de
                deslocamento combinada com você antes da visita.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-default py-12">
        <h2 className="section-title">Como Funciona</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "1. Você agenda",
              desc: "Preenche em menos de 1 minuto.",
              icon: "CAL"
            },
            {
              title: "2. Vamos até você",
              desc: "Atendimento rápido no seu endereço.",
              icon: "MOB"
            },
            {
              title: "3. Executamos o serviço",
              desc: "Polimento técnico com acabamento premium.",
              icon: "FIX"
            },
            {
              title: "4. Farol renovado",
              desc: "Brilho, transparência e segurança de volta.",
              icon: "NEW"
            }
          ].map((step, index) => (
            <article
              key={step.title}
              className="group rounded-xl border border-slate-800 bg-black/40 p-4 text-sm transition duration-300 hover:-translate-y-1 hover:border-brand-blue/60 hover:bg-slate-900/60"
            >
              <div className="flex items-center justify-between">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-blue/40 bg-gradient-to-br from-brand-blue/30 to-slate-900 text-sm font-extrabold tracking-wider text-brand-blue shadow-glow transition duration-300 group-hover:scale-105">
                  {step.icon}
                </div>
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-brand-blue/70">
                  Etapa {index + 1}
                </span>
              </div>
              <p className="mt-3 font-semibold">{step.title}</p>
              <p className="mt-1 text-xs text-slate-300">{step.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-800 bg-black/40">
        <div className="container-default py-12">
          <h2 className="section-title">Antes e Depois</h2>
          <p className="section-subtitle">Resultados reais do processo de revitalização.</p>
          <div className="mt-5">
            <BeforeAfterGallery items={galleryItems} />
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
