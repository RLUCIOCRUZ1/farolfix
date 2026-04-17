import { NextResponse } from "next/server";
import { registrarEvento } from "@/services/analytics";

export async function POST() {
  try {
    await registrarEvento("acesso");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[track-access] Falha ao registrar acesso:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
