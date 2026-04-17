"use client";

import { useMemo, useState } from "react";
import type { GalleryImageItem } from "@/lib/types";
import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl, isDirectVideoUrl } from "@/lib/gallery-media";

type BeforeAfterGalleryProps = {
  items: GalleryImageItem[];
};

function GalleryMainMedia({ item }: { item: GalleryImageItem }) {
  if (item.kind === "video") {
    const embed = getYouTubeEmbedUrl(item.src);
    if (embed) {
      return (
        <div className="relative aspect-video w-full bg-black">
          <iframe
            title={item.legenda}
            src={embed}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      );
    }
    if (isDirectVideoUrl(item.src)) {
      return (
        <video
          src={item.src}
          controls
          playsInline
          className="h-[260px] w-full object-contain bg-slate-950 md:h-[420px]"
        />
      );
    }
    return (
      <div className="flex h-[200px] items-center justify-center bg-slate-900 px-4 text-center text-sm text-slate-400 md:h-[320px]">
        URL de vídeo não suportada. Use um link do YouTube ou arquivo .mp4 público (https).
      </div>
    );
  }

  return (
    <img
      src={item.src}
      alt={item.legenda}
      className="h-[260px] w-full object-contain bg-slate-950 md:h-[420px]"
      loading="eager"
    />
  );
}

function GalleryThumb({ item }: { item: GalleryImageItem }) {
  if (item.kind === "video") {
    const yt = getYouTubeThumbnailUrl(item.src);
    if (yt) {
      return (
        <span className="relative block h-20 w-28">
          <img src={yt} alt="" className="h-20 w-28 object-cover" loading="lazy" />
          <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-lg text-white">
            ▶
          </span>
        </span>
      );
    }
    return (
      <div className="flex h-20 w-28 items-center justify-center bg-slate-900 text-[10px] text-slate-400">
        Vídeo
      </div>
    );
  }

  return <img src={item.src} alt={item.legenda} className="h-20 w-28 object-cover" loading="lazy" />;
}

export function BeforeAfterGallery({ items }: BeforeAfterGalleryProps) {
  const gallery = useMemo(() => items.filter((item) => Boolean(item.src)), [items]);
  const [selectedId, setSelectedId] = useState(gallery[0]?.id ?? "");
  const selected = gallery.find((item) => item.id === selectedId) ?? gallery[0];

  if (!selected) {
    return (
      <div className="rounded-xl border border-slate-800 bg-black/40 p-4 text-sm text-slate-300">
        Em breve adicionaremos imagens reais de antes e depois.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <figure className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-800 bg-black/40">
        <GalleryMainMedia item={selected} />
        <figcaption className="border-t border-slate-800 p-3 text-sm text-slate-200">
          {selected.legenda}
        </figcaption>
      </figure>

      <div className="mx-auto flex max-w-3xl gap-2 overflow-x-auto pb-1">
        {gallery.map((item) => {
          const isSelected = item.id === selected.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              className={`min-w-28 overflow-hidden rounded-lg border transition ${
                isSelected
                  ? "border-brand-blue shadow-glow"
                  : "border-slate-800 opacity-80 hover:opacity-100"
              }`}
            >
              <GalleryThumb item={item} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
