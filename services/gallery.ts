import { db } from "@/lib/db";
import type { GalleryImageItem, GalleryImageRow, GalleryMediaKind } from "@/lib/types";
import { getYouTubeEmbedUrl, isDirectVideoUrl, normalizeVideoInput } from "@/lib/gallery-media";

const FALLBACK_IMAGES: GalleryImageItem[] = [
  {
    id: "fallback-antes-depois-01",
    src: "/gallery/antes-depois-01.png",
    legenda: "Resultado real Farolfix",
    kind: "image"
  }
];

function mapToItem(row: GalleryImageRow): GalleryImageItem {
  let kind: GalleryMediaKind =
    row.kind === "video" ? "video" : row.kind === "image" ? "image" : "image";

  if (row.kind == null) {
    const s = row.image_data.trim();
    if (s.startsWith("http") && (getYouTubeEmbedUrl(s) || isDirectVideoUrl(s))) {
      kind = "video";
    }
  }

  return {
    id: row.id,
    src: row.image_data,
    legenda: row.legenda ?? "Antes e depois Farolfix",
    kind
  };
}

function isMissingTableError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? String((error as { code?: string }).code) : "";
  const message = "message" in error ? String((error as { message?: string }).message) : "";
  return code === "42P01" || message.includes('relation "gallery_images" does not exist');
}

function isUndefinedColumnError(error: unknown, column: string) {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? String((error as { code?: string }).code) : "";
  const message = "message" in error ? String((error as { message?: string }).message) : "";
  return (
    code === "42703" ||
    (message.includes("column") && message.includes(column) && message.includes("does not exist"))
  );
}

export async function getGalleryImages(options?: { includeInactive?: boolean }) {
  const includeInactive = Boolean(options?.includeInactive);
  const whereClause = includeInactive ? "" : "where ativo = true";

  try {
    let response = await db.query<GalleryImageRow>(
      `select id, image_data, legenda, ativo, created_at, coalesce(kind, 'image') as kind
       from gallery_images
       ${whereClause}
       order by created_at desc`
    );

    if (response.rows.length === 0 && !includeInactive) {
      return FALLBACK_IMAGES;
    }

    const dynamicItems = response.rows.map(mapToItem);
    const baseItems = includeInactive ? dynamicItems : [...FALLBACK_IMAGES, ...dynamicItems];
    return baseItems;
  } catch (error) {
    if (isMissingTableError(error)) {
      return FALLBACK_IMAGES;
    }
    if (isUndefinedColumnError(error, "kind")) {
      try {
        const response = await db.query<GalleryImageRow>(
          `select id, image_data, legenda, ativo, created_at
           from gallery_images
           ${whereClause}
           order by created_at desc`
        );
        const dynamicItems = response.rows.map((row: GalleryImageRow) =>
          mapToItem({ ...row, kind: "image" })
        );
        const baseItems = includeInactive ? dynamicItems : [...FALLBACK_IMAGES, ...dynamicItems];
        return baseItems;
      } catch (inner) {
        if (isMissingTableError(inner)) {
          return FALLBACK_IMAGES;
        }
        throw inner;
      }
    }
    throw error;
  }
}

export async function createGalleryImage(input: {
  imageData?: string;
  legenda?: string;
  videoUrl?: string;
}) {
  const legenda = input.legenda?.trim() || null;

  if (input.videoUrl?.trim()) {
    const { stored } = normalizeVideoInput(input.videoUrl);
    try {
      const response = await db.query<GalleryImageRow>(
        `insert into gallery_images (image_data, legenda, kind)
         values ($1, $2, 'video')
         returning id, image_data, legenda, ativo, created_at, kind`,
        [stored, legenda]
      );
      return mapToItem(response.rows[0]);
    } catch (error) {
      if (isUndefinedColumnError(error, "kind")) {
        throw new Error(
          "Coluna kind não existe no banco. Execute no Neon: alter table gallery_images add column if not exists kind text not null default 'image' check (kind in ('image','video'));"
        );
      }
      if (isMissingTableError(error)) {
        throw new Error("Tabela de galeria não criada no banco. Execute o SQL de gallery_images no Neon.");
      }
      throw error;
    }
  }

  if (!input.imageData?.startsWith("data:image/")) {
    throw new Error("Formato de imagem inválido ou informe a URL do vídeo.");
  }

  try {
    const response = await db.query<GalleryImageRow>(
      `insert into gallery_images (image_data, legenda, kind)
       values ($1, $2, 'image')
       returning id, image_data, legenda, ativo, created_at, kind`,
      [input.imageData, legenda]
    );

    return mapToItem(response.rows[0]);
  } catch (error) {
    if (isUndefinedColumnError(error, "kind")) {
      try {
        const response = await db.query<GalleryImageRow>(
          `insert into gallery_images (image_data, legenda)
           values ($1, $2)
           returning id, image_data, legenda, ativo, created_at`,
          [input.imageData, legenda]
        );
        return mapToItem({ ...response.rows[0], kind: "image" });
      } catch (inner) {
        if (isMissingTableError(inner)) {
          throw new Error("Tabela de galeria não criada no banco. Execute o SQL de gallery_images no Neon.");
        }
        throw inner;
      }
    }
    if (isMissingTableError(error)) {
      throw new Error("Tabela de galeria não criada no banco. Execute o SQL de gallery_images no Neon.");
    }
    throw error;
  }
}

export async function deleteGalleryImage(id: string) {
  let response;
  try {
    response = await db.query<{ id: string }>("delete from gallery_images where id = $1 returning id", [id]);
  } catch (error) {
    if (isMissingTableError(error)) {
      throw new Error("Tabela de galeria não criada no banco. Execute o SQL de gallery_images no Neon.");
    }
    throw error;
  }

  if (!response.rows[0]) {
    throw new Error("Imagem não encontrada.");
  }
}

export async function toggleGalleryImage(id: string, ativo: boolean) {
  let response;
  try {
    response = await db.query<GalleryImageRow>(
      `update gallery_images
       set ativo = $2
       where id = $1
       returning id, image_data, legenda, ativo, created_at, coalesce(kind, 'image') as kind`,
      [id, ativo]
    );
  } catch (error) {
    if (isUndefinedColumnError(error, "kind")) {
      response = await db.query<GalleryImageRow>(
        `update gallery_images
         set ativo = $2
         where id = $1
         returning id, image_data, legenda, ativo, created_at`,
        [id, ativo]
      );
    } else if (isMissingTableError(error)) {
      throw new Error("Tabela de galeria não criada no banco. Execute o SQL de gallery_images no Neon.");
    } else {
      throw error;
    }
  }

  if (!response.rows[0]) {
    throw new Error("Imagem não encontrada.");
  }

  return mapToItem(response.rows[0]);
}
