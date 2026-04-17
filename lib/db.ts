import type { QueryResult, QueryResultRow } from "pg";
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var farolfixPool: Pool | undefined;
}

function criarPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL não configurada.");
  }

  return new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });
}

let pool: Pool | undefined;

function getPool(): Pool {
  if (pool) {
    return pool;
  }
  if (global.farolfixPool) {
    pool = global.farolfixPool;
    return pool;
  }
  pool = criarPool();
  if (process.env.NODE_ENV !== "production") {
    global.farolfixPool = pool;
  }
  return pool;
}

/** Só conecta ao abrir a primeira query — evita falha do `next build` sem DATABASE_URL. */
export const db = {
  query: <T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[]
  ): Promise<QueryResult<T>> => getPool().query<T>(text, params)
};
