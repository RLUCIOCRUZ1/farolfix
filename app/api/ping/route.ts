import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Mantém o Neon ativo com leitura mínima — use no UptimeRobot (GET a cada 5 min). */
export async function GET() {
  try {
    await db.query("select 1");
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err) {
    console.error("[ping]", err);
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
