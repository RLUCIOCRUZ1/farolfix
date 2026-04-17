import { NextResponse } from "next/server";
import { registrarEvento } from "@/services/analytics";

export async function POST() {
  try {
    await registrarEvento("acesso");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
