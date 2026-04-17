import { NextResponse } from "next/server";
import { setAdminSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: "ADMIN_EMAIL e ADMIN_PASSWORD precisam estar configurados." },
        { status: 500 }
      );
    }

    if (body.email !== adminEmail || body.password !== adminPassword) {
      return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
    }

    await setAdminSession();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Falha ao processar login." }, { status: 400 });
  }
}
