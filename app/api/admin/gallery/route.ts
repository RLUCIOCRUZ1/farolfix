import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { createGalleryImage, getGalleryImages } from "@/services/gallery";

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const images = await getGalleryImages({ includeInactive: true });
  return NextResponse.json({ images });
}

export async function POST(request: Request) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { imageData?: string; legenda?: string; videoUrl?: string };
    const hasVideo = Boolean(body.videoUrl?.trim());
    const hasImage = Boolean(body.imageData);
    if (hasVideo && hasImage) {
      return NextResponse.json({ error: "Envie só imagem ou só vídeo, não os dois." }, { status: 400 });
    }
    if (!hasVideo && !hasImage) {
      return NextResponse.json({ error: "Envie uma imagem ou a URL do vídeo." }, { status: 400 });
    }

    const image = await createGalleryImage({
      imageData: body.imageData,
      videoUrl: body.videoUrl,
      legenda: body.legenda
    });

    return NextResponse.json({ image });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao enviar imagem.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
