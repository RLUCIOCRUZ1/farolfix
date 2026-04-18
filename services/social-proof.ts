import { db } from "@/lib/db";
import type { SocialProofAdminItem, SocialProofItem, SocialProofRow } from "@/lib/types";

function mapToItem(row: SocialProofRow): SocialProofItem {
  return {
    id: row.id,
    src: row.image_data.trim(),
    legenda: row.legenda?.trim() ?? ""
  };
}

function mapToAdminItem(row: SocialProofRow): SocialProofAdminItem {
  return { ...mapToItem(row), ativo: row.ativo };
}

function isMissingTableError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? String((error as { code?: string }).code) : "";
  const message = "message" in error ? String((error as { message?: string }).message) : "";
  return code === "42P01" || message.includes('relation "social_proof_images" does not exist');
}

export async function getSocialProofImages(options: {
  includeInactive: true;
}): Promise<SocialProofAdminItem[]>;
export async function getSocialProofImages(options?: {
  includeInactive?: false;
}): Promise<SocialProofItem[]>;
export async function getSocialProofImages(options?: {
  includeInactive?: boolean;
}): Promise<SocialProofItem[] | SocialProofAdminItem[]> {
  const includeInactive = Boolean(options?.includeInactive);
  const whereClause = includeInactive ? "" : "where coalesce(ativo, true) = true";

  try {
    const response = await db.query<SocialProofRow>(
      `select id, image_data, legenda, ativo, created_at
       from social_proof_images
       ${whereClause}
       order by created_at desc`
    );
    if (includeInactive) {
      return response.rows.map(mapToAdminItem);
    }
    return response.rows.map(mapToItem);
  } catch (error) {
    if (isMissingTableError(error)) {
      return [];
    }
    throw error;
  }
}

export async function createSocialProofImage(input: {
  imageData?: string;
  legenda?: string;
}): Promise<SocialProofAdminItem> {
  const legenda = input.legenda?.trim() || null;

  if (!input.imageData?.startsWith("data:image/")) {
    throw new Error("Formato de imagem inválido.");
  }

  try {
    const response = await db.query<SocialProofRow>(
      `insert into social_proof_images (image_data, legenda)
       values ($1, $2)
       returning id, image_data, legenda, ativo, created_at`,
      [input.imageData, legenda]
    );
    return mapToAdminItem(response.rows[0]);
  } catch (error) {
    if (isMissingTableError(error)) {
      throw new Error(
        "Tabela social_proof_images não existe. Execute o SQL em supabase/schema.sql no Neon."
      );
    }
    throw error;
  }
}

export async function deleteSocialProofImage(id: string) {
  let response;
  try {
    response = await db.query<{ id: string }>(
      "delete from social_proof_images where id = $1 returning id",
      [id]
    );
  } catch (error) {
    if (isMissingTableError(error)) {
      throw new Error("Tabela social_proof_images não criada no banco.");
    }
    throw error;
  }

  if (!response.rows[0]) {
    throw new Error("Imagem não encontrada.");
  }
}

export async function toggleSocialProofImage(id: string, ativo: boolean) {
  let response;
  try {
    response = await db.query<SocialProofRow>(
      `update social_proof_images
       set ativo = $2
       where id = $1
       returning id, image_data, legenda, ativo, created_at`,
      [id, ativo]
    );
  } catch (error) {
    if (isMissingTableError(error)) {
      throw new Error("Tabela social_proof_images não criada no banco.");
    }
    throw error;
  }

  if (!response.rows[0]) {
    throw new Error("Imagem não encontrada.");
  }

  return mapToAdminItem(response.rows[0]);
}
