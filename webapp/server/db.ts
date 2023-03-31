import { Pool, QueryResult, QueryResultRow } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

globalThis.pgPool = pool;

export async function psqlQuery<R extends QueryResultRow>(
  query: string,
  values?: any[]
): Promise<QueryResult<R>> {
  const pool = global.pgPool;
  try {
    return await pool.query<R>(query, values);
  } catch (e) {
    console.error("[postgree] ", e, { query, values });
    throw new Error(
      "[postgree] " + (e instanceof Error ? e.message : "Unknown db error")
    );
  }
}
