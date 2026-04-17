import Image from "next/image";

const itens = [
  { src: "/mock/antes-1.svg", alt: "Antes do polimento 1", legenda: "Antes" },
  { src: "/mock/depois-1.svg", alt: "Depois do polimento 1", legenda: "Depois" },
  { src: "/mock/antes-2.svg", alt: "Antes do polimento 2", legenda: "Antes" },
  { src: "/mock/depois-2.svg", alt: "Depois do polimento 2", legenda: "Depois" }
];

export function BeforeAfterGallery() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {itens.map((item, index) => (
        <figure
          key={item.src}
          className="overflow-hidden rounded-xl border border-slate-800 bg-black/40"
        >
          <Image
            src={item.src}
            alt={item.alt}
            width={400}
            height={300}
            className="h-36 w-full object-cover md:h-40"
            loading={index === 0 ? "eager" : "lazy"}
            priority={index === 0}
          />
          <figcaption className="border-t border-slate-800 p-2 text-center text-xs uppercase tracking-wide text-slate-200">
            {item.legenda}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
