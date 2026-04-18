import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { deleteSocialProofImage, toggleSocialProofImage } from "@/services/social-proof";

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
    const item = await toggleSocialProofImage(id, Boolean(body.ativo));
    return NextResponse.json({ item });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao atualizar.";
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
    await deleteSocialProofImage(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao excluir.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
