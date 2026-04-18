import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { createSocialProofImage, getSocialProofImages } from "@/services/social-proof";

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const items = await getSocialProofImages({ includeInactive: true });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { imageData?: string; legenda?: string };
    if (!body.imageData) {
      return NextResponse.json({ error: "Envie uma imagem." }, { status: 400 });
    }

    const item = await createSocialProofImage({
      imageData: body.imageData,
      legenda: body.legenda
    });

    return NextResponse.json({ item });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao enviar imagem.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
