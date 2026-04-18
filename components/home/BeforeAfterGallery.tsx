"use client";

import { useMemo, useState } from "react";
import type { GalleryImageItem } from "@/lib/types";
import {
  getYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
  isPlayableHttpVideo
} from "@/lib/gallery-media";

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
    if (isPlayableHttpVideo(item.src)) {
      return (
        <video
          src={item.src}
          controls
          playsInline
          preload="metadata"
          className="h-[200px] w-full object-contain bg-slate-950 sm:h-[240px] md:h-[340px]"
        />
      );
    }
    return (
      <div className="flex h-[180px] items-center justify-center bg-slate-900 px-4 text-center text-sm text-slate-400 sm:h-[220px] md:h-[280px]">
        URL de vídeo não suportada. Use YouTube, link .mp4 ou envie o arquivo pelo admin.
      </div>
    );
  }

  return (
    <img
      src={item.src}
      alt={item.legenda}
      className="h-[200px] w-full object-contain bg-slate-950 sm:h-[240px] md:h-[340px]"
      loading="eager"
    />
  );
}

function GalleryThumb({ item }: { item: GalleryImageItem }) {
  if (item.kind === "video") {
    const yt = getYouTubeThumbnailUrl(item.src);
    if (yt) {
      return (
        <span className="relative block h-16 w-24">
          <img src={yt} alt="" className="h-16 w-24 object-cover" loading="lazy" />
          <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-lg text-white">
            ▶
          </span>
        </span>
      );
    }
    if (isPlayableHttpVideo(item.src)) {
      return (
        <video
          src={item.src}
          muted
          playsInline
          preload="metadata"
          className="h-16 w-24 object-cover"
          aria-hidden
        />
      );
    }
    return (
      <div className="flex h-16 w-24 items-center justify-center bg-slate-900 text-[10px] text-slate-400">
        Vídeo
      </div>
    );
  }

  return <img src={item.src} alt={item.legenda} className="h-16 w-24 object-cover" loading="lazy" />;
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
              className={`min-w-24 overflow-hidden rounded-lg border transition ${
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
