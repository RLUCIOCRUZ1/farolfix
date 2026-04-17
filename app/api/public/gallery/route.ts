import { NextResponse } from "next/server";
import { getGalleryImages } from "@/services/gallery";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const FALLBACK_JSON = {
  items: [
    {
      id: "fallback-antes-depois-01",
      src: "/gallery/antes-depois-01.png",
      legenda: "Resultado real Farolfix",
      kind: "image" as const
    }
  ]
};

export async function GET() {
  try {
    const items = await getGalleryImages();
    return NextResponse.json(
      { items },
      { headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" } }
    );
  } catch (err) {
    console.error("[api/public/gallery]", err);
    return NextResponse.json(FALLBACK_JSON, {
      status: 200,
      headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" }
    });
  }
}
