/**
 * sql.js engine wrapper.
 *
 * Initialises the WASM runtime once, caches it, and exposes helpers for
 * creating in-memory databases and running queries.
 */

import initSqlJs, { Database, SqlJsStatic } from "sql.js";

let SQL: SqlJsStatic | null = null;

/**
 * Loads the sql.js WASM runtime once and caches the result.
 * The wasm file is served from /public/sql-wasm.wasm.
 */
export async function getSqlJs(): Promise<SqlJsStatic> {
  if (SQL) return SQL;
  SQL = await initSqlJs({
    locateFile: (file: string) => `/${file}`,
  });
  return SQL;
}

/**
 * Creates a fresh in-memory SQLite database and runs the given setup SQL
 * (typically CREATE TABLE + INSERT statements).
 */
export async function createDatabase(setupSql: string): Promise<Database> {
  const sqlJs = await getSqlJs();
  const db = new sqlJs.Database();
  db.run(setupSql);
  return db;
}

export type QueryResult = {
  columns: string[];
  rows: Record<string, unknown>[];
};

/**
 * Runs a SQL query against an existing database and returns the result
 * normalised into a columns + rows shape.
 *
 * Throws the raw sql.js error on failure — callers should catch and pass
 * to `formatSqlError()` for user-friendly messages.
 */
export function runQuery(db: Database, query: string): QueryResult {
  const results = db.exec(query);

  if (results.length === 0) {
    return { columns: [], rows: [] };
  }

  const { columns, values } = results[0];
  const rows = values.map((row) => {
    const rowObj: Record<string, unknown> = {};
    columns.forEach((col, i) => {
      rowObj[col] = row[i];
    });
    return rowObj;
  });

  return { columns, rows };
}
