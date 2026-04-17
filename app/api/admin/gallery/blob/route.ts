import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_VIDEO_BYTES = 120 * 1024 * 1024;

const MSG_SEM_TOKEN =
  "Falta BLOB_READ_WRITE_TOKEN. No site vercel.com: seu projeto → Storage → Blob (crie e conecte). Depois Settings → Environment Variables → copie o token. No seu PC, crie/edite .env.local na pasta farolfix com BLOB_READ_WRITE_TOKEN=... e reinicie npm run dev.";

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) {
    return NextResponse.json({ error: MSG_SEM_TOKEN }, { status: 503 });
  }

  try {
    const jsonResponse = await handleUpload({
      request,
      body,
      token,
      onBeforeGenerateToken: async () => {
        const ok = await isAdminAuthenticated();
        if (!ok) {
          throw new Error("Não autorizado. Faça login no admin.");
        }
        return {
          // video/* cobre MP4 do WhatsApp e variações; octet-stream costuma vir de alguns celulares
          allowedContentTypes: [
            "video/*",
            "application/octet-stream"
          ],
          maximumSizeInBytes: MAX_VIDEO_BYTES,
          addRandomSuffix: true
        };
      }
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha no upload.";
    const status = message.includes("Não autorizado") ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
