import { NextResponse } from "next/server";
import { getSocialProofImages } from "@/services/social-proof";

export async function GET() {
  try {
    const items = await getSocialProofImages({ includeInactive: false });
    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao carregar provas sociais.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
