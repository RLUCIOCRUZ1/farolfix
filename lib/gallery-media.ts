export type GalleryKind = "image" | "video";

export function parseYouTubeId(url: string): string | null {
  try {
    const u = new URL(url.trim());
    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace("/", "").split("/")[0];
      return id || null;
    }
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      const embed = u.pathname.match(/\/embed\/([^/?]+)/);
      if (embed?.[1]) return embed[1];
      const shorts = u.pathname.match(/\/shorts\/([^/?]+)/);
      if (shorts?.[1]) return shorts[1];
    }
  } catch {
    return null;
  }
  return null;
}

export function getYouTubeEmbedUrl(url: string): string | null {
  const id = parseYouTubeId(url);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}`;
}

export function getYouTubeThumbnailUrl(url: string): string | null {
  const id = parseYouTubeId(url);
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}

export function isDirectVideoUrl(url: string): boolean {
  const lower = url.trim().toLowerCase();
  return (
    lower.endsWith(".mp4") ||
    lower.endsWith(".webm") ||
    lower.endsWith(".ogg") ||
    lower.includes(".mp4?") ||
    lower.includes(".webm?")
  );
}

export function normalizeVideoInput(raw: string): { kind: GalleryKind; stored: string } {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("Informe a URL do vídeo.");

  if (trimmed.startsWith("data:video/")) {
    return { kind: "video", stored: trimmed };
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return { kind: "video", stored: trimmed };
  }

  throw new Error("URL do vídeo inválida. Use link do YouTube ou arquivo MP4 (https).");
}
