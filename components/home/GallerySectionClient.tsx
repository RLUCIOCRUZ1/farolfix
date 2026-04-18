"use client";

import { useEffect, useState } from "react";
import { BeforeAfterGallery } from "@/components/home/BeforeAfterGallery";
import type { GalleryImageItem } from "@/lib/types";

const FALLBACK: GalleryImageItem[] = [
  {
    id: "fallback-antes-depois-01",
    src: "/gallery/antes-depois-01.png",
    legenda: "Resultado real Farolfix",
    kind: "image"
  }
];

export function GallerySectionClient() {
  const [items, setItems] = useState<GalleryImageItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/public/gallery", { cache: "no-store", credentials: "same-origin" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((body: { items?: GalleryImageItem[] }) => {
        if (cancelled) return;
        const list = body?.items?.filter((i) => Boolean(i?.src)) ?? [];
        setItems(list.length > 0 ? list : FALLBACK);
      })
      .catch(() => {
        if (!cancelled) setItems(FALLBACK);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (items === null) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-3 animate-pulse" aria-busy="true">
        <div className="h-[200px] rounded-2xl border border-slate-800 bg-slate-900/40 sm:h-[240px] md:h-[340px]" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 w-24 shrink-0 rounded-lg bg-slate-900/40" />
          ))}
        </div>
      </div>
    );
  }

  return <BeforeAfterGallery items={items} />;
}
