"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Database } from "sql.js";
import type { Question, TableFixture } from "@/lib/types";
import { createDatabase, runQuery, QueryResult } from "@/lib/sqlEngine";
import { formatSqlError } from "@/lib/errorFormatter";
import { diffResults, DiffResult } from "@/lib/resultDiffer";
import Editor, { useMonaco } from "@monaco-editor/react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabaseClient";

// ═══════════════════════════════════════════════════════════════════════════
// Props
// ═══════════════════════════════════════════════════════════════════════════

interface PracticeScreenProps {
  question: Question;
  tables: TableFixture[];
  onSolve?: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════

export default function PracticeScreen({ question, tables, onSolve }: PracticeScreenProps) {
  const { user } = useAuth();
  const dbRef = useRef<Database | null>(null);
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [queryText, setQueryText] = useState("-- Write your SQL query here\nSELECT ");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rawError, setRawError] = useState<string | null>(null);
  const [diff, setDiff] = useState<DiffResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [sampleData, setSampleData] = useState<Record<string, QueryResult>>({});
  const monaco = useMonaco();
  const [editorInstance, setEditorInstance] = useState<any>(null);

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
          
          // Fetch full data for schema viewer
          const samples: Record<string, QueryResult> = {};
          for (const t of tables) {
            try {
              samples[t.name] = runQuery(db, `SELECT * FROM ${t.name}`);
            } catch (e) {
              console.error(`Failed to fetch sample data for ${t.name}`, e);
            }
          }
          setSampleData(samples);
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
  }, [setupSql, tables]);

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
        
        const diffRes = diffResults(res.rows, question.expected_result, question.order_sensitive);
        setDiff(diffRes);

        if (diffRes.match) {
          if (user) {
            // Logged in: Save progress silently
            supabase.from("progress").upsert({
              user_id: user.id,
              question_id: question.id,
              solved: true,
            }).then(({ error }) => {
              if (error) {
                console.error("Failed to save progress", error);
              } else if (onSolve) {
                onSolve();
              }
            });
          } else {
            // Not logged in: we still trigger onSolve to update local UI if desired
            // But we don't save to supabase.
            if (onSolve) onSolve();
          }
        }
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

  // ── Monaco Autocomplete ───────────────────────────────────────────────
  useEffect(() => {
    if (!monaco) return;

    const provider = monaco.languages.registerCompletionItemProvider("sql", {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions: any[] = [];

        // Add table names
        tables.forEach((t) => {
          suggestions.push({
            label: t.name,
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: t.name,
            detail: "Table",
            range,
          });

          // Add column names
          t.columns.forEach((c) => {
            suggestions.push({
              label: c.name,
              kind: monaco.languages.CompletionItemKind.Field,
              insertText: c.name,
              detail: `Column (${t.name})`,
              range,
            });
          });
        });

        // Add common SQL keywords
        const keywords = ["SELECT", "FROM", "WHERE", "GROUP BY", "ORDER BY", "LIMIT", "INNER JOIN", "LEFT JOIN", "ON", "AND", "OR", "IS NULL", "IS NOT NULL", "COUNT", "SUM", "AVG", "MIN", "MAX", "AS", "HAVING", "DESC", "ASC"];
        keywords.forEach((kw) => {
          suggestions.push({
            label: kw,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: kw,
            range,
          });
        });

        return { suggestions };
      },
    });

    return () => provider.dispose();
  }, [monaco, tables]);

  // ── Live Syntax Validation ────────────────────────────────────────────
  useEffect(() => {
    if (!monaco || !editorInstance || !dbReady || !dbRef.current) return;
    
    // Skip empty query checking to avoid noisy initial errors
    if (!queryText || queryText.trim() === "" || queryText.trim() === "-- Write your SQL query here\nSELECT") {
       const model = editorInstance.getModel();
       if (model) monaco.editor.setModelMarkers(model, "sql", []);
       return;
    }

    const timeout = setTimeout(() => {
      const model = editorInstance.getModel();
      if (!model) return;

      try {
        // We prepare the statement to check syntax and column validity
        // If it's valid, it passes silently. If not, it throws.
        const stmt = dbRef.current!.prepare(queryText);
        stmt.free(); // Free memory immediately since we only wanted to check syntax
        monaco.editor.setModelMarkers(model, "sql", []);
      } catch (err: any) {
        // sql.js doesn't give us line numbers, so we mark the whole model
        monaco.editor.setModelMarkers(model, "sql", [
          {
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: model.getLineCount(),
            endColumn: model.getLineMaxColumn(model.getLineCount()),
            message: err.message || "Syntax error",
            severity: monaco.MarkerSeverity.Error,
          },
        ]);
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(timeout);
  }, [queryText, monaco, editorInstance, dbReady]);

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* WASM init error */}
      {dbError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm font-mono">
          {dbError}
        </div>
      )}

      {/* ── Schema viewer ──────────────────────────────────────────── */}
      <section>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
          Database Tables
        </h3>
        <div className="grid gap-4">
          {tables.map((table) => {
            const sample = sampleData[table.name];
            
            return (
              <div
                key={table.name}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
              >
                <div className="px-4 py-2 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-teal-500" />
                    <span className="font-mono text-sm font-semibold text-slate-700">{table.name}</span>
                  </div>
                </div>
                
                <div className="overflow-x-auto overflow-y-auto max-h-72">
                  {sample ? (
                    <table className="w-full text-sm text-left">
                      <thead className="sticky top-0 z-10">
                        <tr className="border-b border-slate-200 bg-slate-100/90 backdrop-blur-sm">
                          {sample.columns.map((col) => (
                            <th
                              key={col}
                              className="px-4 py-2 font-mono text-xs font-semibold text-slate-500 bg-slate-50/50"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="font-mono text-sm text-slate-700 divide-y divide-slate-100">
                        {sample.rows.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            {sample.columns.map((col) => (
                              <td key={col} className="px-4 py-2 whitespace-nowrap">
                                {row[col] === null ? (
                                  <span className="text-slate-400 italic">NULL</span>
                                ) : (
                                  String(row[col])
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                        {sample.rows.length === 0 && (
                          <tr>
                            <td colSpan={sample.columns.length} className="px-4 py-3 text-slate-400 italic text-center">
                              Table is empty
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  ) : (
                    <div className="px-4 py-4 text-xs text-slate-400 text-center animate-pulse">
                      Loading data...
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Monaco Editor ──────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm mt-2">
        <div className="px-4 py-2 border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500 flex items-center justify-between">
          <span className="uppercase tracking-wider">SQL Editor</span>
          <span className="text-slate-400">Ctrl + Enter to run</span>
        </div>
        <Editor
          height="180px"
          defaultLanguage="sql"
          theme="light"
          value={queryText}
          onChange={(value) => setQueryText(value ?? "")}
          onMount={(editor) => setEditorInstance(editor)}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "var(--font-geist-mono), monospace",
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
          className="px-6 py-2.5 rounded-lg font-medium text-sm transition-all
            bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white
            disabled:opacity-50 disabled:cursor-not-allowed
            shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30
            cursor-pointer flex items-center gap-2"
        >
          {isRunning ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Running...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
              Run Query
            </>
          )}
        </button>
        {!dbReady && !dbError && (
          <span className="text-sm font-medium text-slate-400 animate-pulse">
            Loading sql.js...
          </span>
        )}
      </div>

      {/* ── Result panel ───────────────────────────────────────────── */}
      {(result || error) && (
        <section className="mt-4 border-t border-slate-100 pt-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
            Result
          </h3>

          {/* Error display */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm">
              <p className="text-red-700 text-sm font-medium leading-relaxed mb-1">{error}</p>
              {rawError && rawError !== error && (
                <p className="text-red-500/80 text-xs font-mono mt-3 p-3 bg-white/50 rounded-lg">
                  Raw Error: {rawError}
                </p>
              )}
            </div>
          )}

          {/* Success result */}
          {result && (
            <div className="flex flex-col gap-4">
              {/* Correct badge or diff reason */}
              {diff && diff.match && (
                <div className="flex items-center gap-3 rounded-xl border border-teal-200 bg-teal-50 px-5 py-3 shadow-sm justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-sm">
                      ✓
                    </div>
                    <div>
                      <span className="text-teal-800 font-semibold text-sm block">
                        Correct!
                      </span>
                      <span className="text-teal-600 text-xs block mt-0.5">
                        Output matches expected result.
                      </span>
                    </div>
                  </div>
                  {!user && (
                    <span className="text-xs text-slate-500 italic">
                      Log in to save your progress
                    </span>
                  )}
                </div>
              )}
              {diff && !diff.match && (
                <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 shadow-sm">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm">
                    ✗
                  </div>
                  <div>
                    <span className="text-amber-800 font-semibold text-sm block">
                      Not quite
                    </span>
                    <span className="text-amber-700 text-xs block mt-0.5">
                      {diff.reason}
                    </span>
                  </div>
                </div>
              )}

              {/* Result table */}
              {result.columns.length > 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          {result.columns.map((col) => (
                            <th
                              key={col}
                              className="px-4 py-3 font-mono text-xs font-semibold text-slate-500 uppercase tracking-wider"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="font-mono text-sm text-slate-700 divide-y divide-slate-100">
                        {result.rows.map((row, i) => (
                          <tr
                            key={i}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            {result.columns.map((col) => (
                              <td key={col} className="px-4 py-2.5 whitespace-nowrap">
                                {row[col] === null ? (
                                  <span className="text-slate-400 italic">NULL</span>
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
                  <div className="px-4 py-3 text-xs font-medium text-slate-500 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                    <span>
                      {result.rows.length} row{result.rows.length !== 1 ? "s" : ""} returned
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-slate-500 text-sm shadow-sm">
                  <span className="block font-medium mb-1">Query executed successfully.</span>
                  <span className="text-slate-400">No rows were returned.</span>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
