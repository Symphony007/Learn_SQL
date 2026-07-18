"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Database } from "sql.js";
import { createDatabase, runQuery, QueryResult } from "@/lib/sqlEngine";
import { formatSqlError } from "@/lib/errorFormatter";
import { diffResults, DiffResult } from "@/lib/resultDiffer";
import Editor from "@monaco-editor/react";

// ═══════════════════════════════════════════════════════════════════════════
// Hardcoded fixture — this will be replaced by a content JSON system later.
// ═══════════════════════════════════════════════════════════════════════════

const TABLE_NAME = "Employees";

const COLUMNS = [
  { name: "id", type: "INTEGER", pk: true },
  { name: "name", type: "TEXT" },
  { name: "department", type: "TEXT" },
  { name: "salary", type: "INTEGER" },
  { name: "manager_id", type: "INTEGER, nullable" },
];

const KNOWN_COLUMN_NAMES = COLUMNS.map((c) => c.name);

const SETUP_SQL = `
  CREATE TABLE ${TABLE_NAME} (
    id         INTEGER PRIMARY KEY,
    name       TEXT    NOT NULL,
    department TEXT    NOT NULL,
    salary     INTEGER NOT NULL,
    manager_id INTEGER
  );

  INSERT INTO ${TABLE_NAME} (id, name, department, salary, manager_id) VALUES
    (1,  'Alice',    'Engineering', 95000,  NULL),
    (2,  'Bob',      'Sales',       62000,  1),
    (3,  'Charlie',  'Engineering', 88000,  1),
    (4,  'Diana',    'Marketing',   71000,  NULL),
    (5,  'Eve',      'Engineering', 105000, NULL),
    (6,  'Frank',    'Sales',       58000,  2),
    (7,  'Grace',    'Marketing',   74000,  4),
    (8,  'Heidi',    'Engineering', 92000,  1),
    (9,  'Ivan',     'Sales',       67000,  2),
    (10, 'Judy',     'Engineering', 110000, NULL);
`;

const SAMPLE_ROWS = [
  { id: 1, name: "Alice", department: "Engineering", salary: 95000, manager_id: "NULL" },
  { id: 2, name: "Bob", department: "Sales", salary: 62000, manager_id: 1 },
  { id: 3, name: "Charlie", department: "Engineering", salary: 88000, manager_id: 1 },
  { id: 4, name: "Diana", department: "Marketing", salary: 71000, manager_id: "NULL" },
];

const QUESTION =
  "List the names and salaries of employees in the 'Engineering' department, ordered by salary descending.";

const EXPECTED_RESULT: Record<string, unknown>[] = [
  { name: "Judy",    salary: 110000 },
  { name: "Eve",     salary: 105000 },
  { name: "Alice",   salary: 95000 },
  { name: "Heidi",   salary: 92000 },
  { name: "Charlie", salary: 88000 },
];

const DEFAULT_QUERY = `-- Write your SQL query here\nSELECT `;

// ═══════════════════════════════════════════════════════════════════════════
// Page component
// ═══════════════════════════════════════════════════════════════════════════

export default function PocPage() {
  const dbRef = useRef<Database | null>(null);
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [queryText, setQueryText] = useState(DEFAULT_QUERY);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rawError, setRawError] = useState<string | null>(null);
  const [diff, setDiff] = useState<DiffResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // ── Initialise DB once ──────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const db = await createDatabase(SETUP_SQL);
        if (!cancelled) {
          dbRef.current = db;
          setDbReady(true);
        }
      } catch (err) {
        if (!cancelled) {
          setDbError(
            `Failed to initialise sql.js: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Run query ───────────────────────────────────────────────────────────
  const handleRun = useCallback(() => {
    if (!dbRef.current) return;

    setIsRunning(true);
    setResult(null);
    setError(null);
    setRawError(null);
    setDiff(null);

    // Tiny timeout so the UI can show the "Running…" state before exec blocks
    setTimeout(() => {
      try {
        const res = runQuery(dbRef.current!, queryText);
        setResult(res);
        setDiff(diffResults(res.rows, EXPECTED_RESULT));
      } catch (err) {
        const formatted = formatSqlError(
          err,
          [TABLE_NAME],
          KNOWN_COLUMN_NAMES,
        );
        setError(formatted.message);
        setRawError(formatted.raw);
      } finally {
        setIsRunning(false);
      }
    }, 50);
  }, [queryText]);

  // ── Keyboard shortcut (Ctrl/Cmd + Enter) ────────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleRun();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleRun]);

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0d0d14] px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">
          <span className="text-emerald-400">SQL</span> Practice Platform
          <span className="ml-3 text-xs font-normal text-gray-500 align-middle rounded-full border border-white/10 px-2 py-0.5">
            Stage 1 — Proof of Concept
          </span>
        </h1>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 flex flex-col gap-8">
        {/* WASM init error */}
        {dbError && (
          <div className="rounded-lg border border-red-500/40 bg-red-950/40 p-4 text-red-300 text-sm font-mono">
            {dbError}
          </div>
        )}

        {/* ── Section 1: Schema viewer ──────────────────────────────── */}
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Schema Reference
          </h2>
          <div className="rounded-xl border border-white/10 bg-[#12121a] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-mono text-sm text-emerald-300">{TABLE_NAME}</span>
              <span className="text-xs text-gray-500 ml-2">
                ({COLUMNS.map((c) => `${c.name} ${c.type}`).join(", ")})
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {COLUMNS.map((col) => (
                      <th
                        key={col.name}
                        className="px-4 py-2 text-left font-medium text-gray-400 text-xs uppercase tracking-wider"
                      >
                        {col.name}
                        {col.pk && (
                          <span className="ml-1 text-[10px] text-amber-400/70">PK</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-mono text-gray-300">
                  {SAMPLE_ROWS.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                    >
                      {COLUMNS.map((col) => (
                        <td key={col.name} className="px-4 py-2 whitespace-nowrap">
                          {String(row[col.name as keyof typeof row])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2 text-xs text-gray-600">
              Showing 4 of 10 rows (seed data)
            </div>
          </div>
        </section>

        {/* ── Section 2: Question + Query editor ────────────────────── */}
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Challenge
          </h2>

          {/* Question prompt */}
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-4 mb-4">
            <p className="text-indigo-200 text-sm leading-relaxed">
              <span className="text-indigo-400 font-semibold mr-2">Q:</span>
              {QUESTION}
            </p>
          </div>

          {/* Monaco Editor */}
          <div className="rounded-xl border border-white/10 bg-[#1e1e1e] overflow-hidden">
            <div className="px-4 py-2 border-b border-white/5 text-xs text-gray-500 flex items-center justify-between">
              <span>SQL Editor</span>
              <span className="text-gray-600">Ctrl + Enter to run</span>
            </div>
            <Editor
              height="180px"
              defaultLanguage="sql"
              theme="vs-dark"
              value={queryText}
              onChange={(value) => setQueryText(value ?? "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                wordWrap: "on",
                padding: { top: 12, bottom: 12 },
                renderLineHighlight: "none",
                overviewRulerBorder: false,
                hideCursorInOverviewRuler: true,
                scrollbar: {
                  vertical: "hidden",
                  horizontal: "auto",
                },
              }}
            />
          </div>

          {/* Run button */}
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={handleRun}
              disabled={!dbReady || isRunning}
              className="px-5 py-2 rounded-lg font-medium text-sm transition-all
                bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700
                disabled:opacity-40 disabled:cursor-not-allowed
                shadow-lg shadow-emerald-900/30 hover:shadow-emerald-800/40
                cursor-pointer"
            >
              {isRunning ? "Running…" : "▶ Run Query"}
            </button>
            {!dbReady && !dbError && (
              <span className="text-xs text-gray-500 animate-pulse">
                Loading sql.js WASM…
              </span>
            )}
          </div>
        </section>

        {/* ── Section 3: Result panel ───────────────────────────────── */}
        {(result || error) && (
          <section>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Result
            </h2>

            {/* Error display */}
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-4">
                <p className="text-red-300 text-sm font-medium mb-1">{error}</p>
                {rawError && rawError !== error && (
                  <p className="text-red-400/60 text-xs font-mono mt-2">
                    Raw: {rawError}
                  </p>
                )}
              </div>
            )}

            {/* Success result */}
            {result && (
              <div className="flex flex-col gap-3">
                {/* Correct badge or diff reason */}
                {diff && diff.match && (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-950/20 px-4 py-2.5">
                    <span className="text-lg">✓</span>
                    <span className="text-emerald-300 font-semibold text-sm">
                      Correct!
                    </span>
                    <span className="text-emerald-400/60 text-xs ml-1">
                      Output matches expected result.
                    </span>
                  </div>
                )}
                {diff && !diff.match && (
                  <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-950/20 px-4 py-2.5">
                    <span className="text-lg">✗</span>
                    <span className="text-amber-300 font-medium text-sm">
                      Not quite — {diff.reason}
                    </span>
                  </div>
                )}

                {/* Result table */}
                {result.columns.length > 0 ? (
                  <div className="rounded-xl border border-white/10 bg-[#12121a] overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/10">
                            {result.columns.map((col) => (
                              <th
                                key={col}
                                className="px-4 py-2.5 text-left font-medium text-gray-400 text-xs uppercase tracking-wider"
                              >
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="font-mono text-gray-300">
                          {result.rows.map((row, i) => (
                            <tr
                              key={i}
                              className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                            >
                              {result.columns.map((col) => (
                                <td key={col} className="px-4 py-2 whitespace-nowrap">
                                  {row[col] === null ? (
                                    <span className="text-gray-600 italic">NULL</span>
                                  ) : (
                                    String(row[col])
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-4 py-2 text-xs text-gray-600 border-t border-white/5">
                      {result.rows.length} row{result.rows.length !== 1 ? "s" : ""} returned
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/10 bg-[#12121a] px-4 py-6 text-center text-gray-500 text-sm">
                    Query executed successfully — no rows returned.
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-3 text-center text-xs text-gray-600">
        SQL Practice Platform · Stage 1 PoC · All queries run client-side via sql.js
      </footer>
    </div>
  );
}
