import { generateClientTokenFromReadWriteToken } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_VIDEO_BYTES = 120 * 1024 * 1024;

/**
 * Gera token de upload para o cliente sem depender do fetch interno do SDK
 * (que não envia cookies em alguns navegadores). O admin chama esta rota com
 * credentials: "include" e depois usa put() com o clientToken.
 */
export async function POST(request: Request) {
  const rw = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!rw) {
    return NextResponse.json(
      { error: "Configure BLOB_READ_WRITE_TOKEN no Vercel (Storage → Blob) ou em .env.local." },
      { status: 503 }
    );
  }

  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Faça login no admin." }, { status: 401 });
  }

  let body: { pathname?: string; multipart?: boolean };
  try {
    body = (await request.json()) as { pathname?: string; multipart?: boolean };
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const pathname = body.pathname?.trim();
  if (!pathname || !pathname.startsWith("gallery/")) {
    return NextResponse.json({ error: "Caminho do arquivo inválido." }, { status: 400 });
  }

  try {
    const clientToken = await generateClientTokenFromReadWriteToken({
      token: rw,
      pathname,
      maximumSizeInBytes: MAX_VIDEO_BYTES,
      allowedContentTypes: [
        "video/mp4",
        "video/webm",
        "video/quicktime",
        "video/x-msvideo",
        "video/3gpp",
        "video/m4v",
        "application/octet-stream"
      ],
      addRandomSuffix: true
    });

    return NextResponse.json({ clientToken });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Falha ao gerar token de upload.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
