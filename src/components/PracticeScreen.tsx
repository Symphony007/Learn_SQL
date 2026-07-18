"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Database } from "sql.js";
import type { Question, TableFixture } from "@/lib/types";
import { createDatabase, runQuery, QueryResult } from "@/lib/sqlEngine";
import { formatSqlError } from "@/lib/errorFormatter";
import { diffResults, DiffResult } from "@/lib/resultDiffer";
import Editor from "@monaco-editor/react";

// ═══════════════════════════════════════════════════════════════════════════
// Props
// ═══════════════════════════════════════════════════════════════════════════

interface PracticeScreenProps {
  question: Question;
  tables: TableFixture[];
}

// ═══════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════

export default function PracticeScreen({ question, tables }: PracticeScreenProps) {
  const dbRef = useRef<Database | null>(null);
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [queryText, setQueryText] = useState("-- Write your SQL query here\nSELECT ");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rawError, setRawError] = useState<string | null>(null);
  const [diff, setDiff] = useState<DiffResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Derive known names from the fixture tables for error formatting
  const knownTableNames = tables.map((t) => t.name);
  const knownColumnNames = tables.flatMap((t) => t.columns.map((c) => c.name));

  // Build combined setup SQL from all fixture tables
  const setupSql = tables.map((t) => `${t.create_sql}\n${t.insert_sql}`).join("\n\n");

  // ── Initialise DB on mount ────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const db = await createDatabase(setupSql);
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
  }, [setupSql]);

  // ── Run query ─────────────────────────────────────────────────────────
  const handleRun = useCallback(() => {
    if (!dbRef.current) return;

    setIsRunning(true);
    setResult(null);
    setError(null);
    setRawError(null);
    setDiff(null);

    setTimeout(() => {
      try {
        const res = runQuery(dbRef.current!, queryText);
        setResult(res);
        setDiff(
          diffResults(res.rows, question.expected_result, question.order_sensitive),
        );
      } catch (err) {
        const formatted = formatSqlError(err, knownTableNames, knownColumnNames);
        setError(formatted.message);
        setRawError(formatted.raw);
      } finally {
        setIsRunning(false);
      }
    }, 50);
  }, [queryText, question.expected_result, question.order_sensitive, knownTableNames, knownColumnNames]);

  // ── Keyboard shortcut (Ctrl/Cmd + Enter) ──────────────────────────────
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

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* WASM init error */}
      {dbError && (
        <div className="rounded-lg border border-red-500/40 bg-red-950/40 p-4 text-red-300 text-sm font-mono">
          {dbError}
        </div>
      )}

      {/* ── Schema viewer ──────────────────────────────────────────── */}
      <section>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Schema Reference
        </h3>
        {tables.map((table) => (
          <div
            key={table.name}
            className="rounded-xl border border-white/10 bg-[#12121a] overflow-hidden mb-3"
          >
            <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-mono text-sm text-emerald-300">{table.name}</span>
              <span className="text-xs text-gray-500 ml-2">
                ({table.columns.map((c) => `${c.name} ${c.type}`).join(", ")})
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {table.columns.map((col) => (
                      <th
                        key={col.name}
                        className="px-4 py-2 text-left font-medium text-gray-400 text-xs uppercase tracking-wider"
                      >
                        {col.name}
                      </th>
                    ))}
                  </tr>
                </thead>
              </table>
            </div>
          </div>
        ))}
      </section>



      {/* ── Monaco Editor ──────────────────────────────────────────── */}
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
            scrollbar: { vertical: "hidden", horizontal: "auto" },
          }}
        />
      </div>

      {/* Run button */}
      <div className="flex items-center gap-3">
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

      {/* ── Result panel ───────────────────────────────────────────── */}
      {(result || error) && (
        <section>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Result
          </h3>

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
    </div>
  );
}
