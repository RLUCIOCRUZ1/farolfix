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

export const db = global.farolfixPool ?? criarPool();

if (process.env.NODE_ENV !== "production") {
  global.farolfixPool = db;
}
