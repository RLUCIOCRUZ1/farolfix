import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { deleteGalleryImage, toggleGalleryImage } from "@/services/gallery";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = (await request.json()) as { ativo?: boolean };
    const image = await toggleGalleryImage(id, Boolean(body.ativo));
    return NextResponse.json({ image });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao atualizar imagem.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    await deleteGalleryImage(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao excluir imagem.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
