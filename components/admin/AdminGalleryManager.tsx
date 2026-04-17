"use client";

import { upload } from "@vercel/blob/client";
import { useState } from "react";
import type { GalleryImageItem } from "@/lib/types";
import { getYouTubeThumbnailUrl } from "@/lib/gallery-media";

function safeVideoPath(name: string) {
  const base = name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  return base || "video";
}

type AdminGalleryManagerProps = {
  initialImages: GalleryImageItem[];
};

async function compressImageToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const maxWidth = 1400;
  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Não foi possível processar a imagem.");

  context.drawImage(bitmap, 0, 0, width, height);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
  return dataUrl;
}

function AdminThumb({ item }: { item: GalleryImageItem }) {
  if (item.kind === "video") {
    const yt = getYouTubeThumbnailUrl(item.src);
    if (yt) {
      return (
        <span className="relative block h-28 w-full">
          <img src={yt} alt="" className="h-28 w-full rounded-md object-cover" />
          <span className="absolute inset-0 flex items-center justify-center rounded-md bg-black/35 text-lg text-white">
            ▶
          </span>
        </span>
      );
    }
    return (
      <div className="flex h-28 w-full items-center justify-center rounded-md bg-slate-900 text-xs text-slate-400">
        Vídeo (MP4)
      </div>
    );
  }
  return <img src={item.src} alt={item.legenda} className="h-28 w-full rounded-md object-cover" />;
}

export function AdminGalleryManager({ initialImages }: AdminGalleryManagerProps) {
  const [images, setImages] = useState(initialImages);
  const [file, setFile] = useState<File | null>(null);
  const [legenda, setLegenda] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("Selecione uma imagem antes de enviar.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const imageData = await compressImageToDataUrl(file);
      const response = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData, legenda })
      });

      const body = (await response.json()) as { error?: string; image?: GalleryImageItem };
      if (!response.ok || !body.image) {
        throw new Error(body.error ?? "Falha ao enviar imagem.");
      }

      setImages((current) => [body.image!, ...current]);
      setFile(null);
      setLegenda("");
      setSuccess("Imagem enviada com sucesso. Já está disponível na página principal.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao processar upload.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVideoFileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!videoFile) {
      setError("Selecione um vídeo.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const pathname = `gallery/${Date.now()}-${safeVideoPath(videoFile.name)}`;
      const blob = await upload(pathname, videoFile, {
        access: "public",
        handleUploadUrl: "/api/admin/gallery/blob",
        multipart: videoFile.size > 8 * 1024 * 1024
      });

      const response = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: blob.url, legenda })
      });

      const body = (await response.json()) as { error?: string; image?: GalleryImageItem };
      if (!response.ok || !body.image) {
        throw new Error(body.error ?? "Falha ao registrar o vídeo na galeria.");
      }

      setImages((current) => [body.image!, ...current]);
      setVideoFile(null);
      setLegenda("");
      setSuccess("Vídeo enviado e adicionado ao carrossel.");
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Erro ao enviar vídeo.";
      const isBlobToken =
        /client token|BLOB_READ_WRITE|blob.*token|retrieve the client token/i.test(raw);
      setError(
        isBlobToken
          ? "Falta o token do armazenamento Vercel Blob. No Vercel: projeto → Storage → Blob → conectar. Copie BLOB_READ_WRITE_TOKEN em Environment Variables. No PC, coloque no arquivo .env.local na pasta do projeto e reinicie o servidor (npm run dev)."
          : raw
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Deseja excluir este item da galeria?");
    if (!confirmed) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
      const body = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !body.ok) {
        throw new Error(body.error ?? "Falha ao excluir item.");
      }
      setImages((current) => current.filter((item) => item.id !== id));
      setSuccess("Item removido da galeria.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao excluir item.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-black/40 p-4">
      <h2 className="text-lg font-semibold">Gerenciar Antes e Depois</h2>

      <div className="mt-4 rounded-xl border border-slate-700/80 bg-slate-950/40 p-3">
        <label className="text-xs text-slate-500">Legenda (opcional)</label>
        <input
          value={legenda}
          onChange={(e) => setLegenda(e.target.value)}
          placeholder="Legenda"
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-brand-blue"
        />
      </div>

      <form onSubmit={handleUpload} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-1.5 file:text-sm file:text-slate-200"
        />
        <button
          type="submit"
          disabled={loading || !file}
          className="rounded-lg bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Enviar foto"}
        </button>
      </form>

      <form
        onSubmit={handleVideoFileSubmit}
        className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center"
      >
        <input
          type="file"
          accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
          onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
          disabled={loading}
          className="min-h-[42px] rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-1.5 file:text-sm file:text-slate-200"
        />
        <button
          type="submit"
          disabled={loading || !videoFile}
          className="rounded-lg border border-emerald-700/80 bg-emerald-950/60 px-5 py-2.5 text-sm font-semibold text-emerald-50 disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Enviar vídeo do PC"}
        </button>
      </form>

      {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
      {success ? <p className="mt-3 text-sm text-emerald-400">{success}</p> : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {images.map((image) => (
          <article key={image.id} className="rounded-xl border border-slate-800 bg-slate-950/50 p-2">
            <AdminThumb item={image} />
            <p className="mt-2 min-h-8 text-xs text-slate-300">{image.legenda}</p>
            <p className="text-[10px] uppercase tracking-wide text-slate-500">
              {image.kind === "video" ? "Vídeo" : "Imagem"}
            </p>
            <button
              type="button"
              onClick={() => handleDelete(image.id)}
              disabled={loading || image.id.startsWith("fallback-")}
              className="mt-2 w-full rounded-md border border-red-700 px-3 py-1 text-xs text-red-300 disabled:opacity-40"
            >
              Excluir
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
