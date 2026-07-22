"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Topic, TableFixture } from "@/lib/types";
import PracticeScreen from "@/components/PracticeScreen";
import Header from "@/components/Header";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabaseClient";

interface TopicPageClientProps {
  topic: Topic;
}

function getTablesForQuestion(topic: Topic, questionIndex: number): TableFixture[] {
  const question = topic.questions[questionIndex];
  if (question.fixture) {
    return question.fixture.tables;
  }
  if (topic.shared_table) {
    return Array.isArray(topic.shared_table) ? topic.shared_table : [topic.shared_table];
  }
  return [];
}

function renderConcept(concept: string) {
  // Normalize bullet markers (- , • , *) to \n• so we can split reliably
  let normalized = concept.replace(/(?:^|\n)\s*[-•*]\s+/g, '\n• ');
  
  if (normalized.startsWith('\n• ')) {
    normalized = normalized.substring(1);
  }
  
  const parts = normalized.split('\n• ');
  let intro = '';
  let bullets: string[] = [];

  if (parts.length === 1 && parts[0].startsWith('• ')) {
    bullets = [parts[0].substring(2).trim()];
  } else if (parts.length === 1) {
    return <p className="text-lg text-text-primary leading-relaxed font-medium whitespace-pre-line">{concept}</p>;
  } else {
    intro = parts[0].trim();
    bullets = parts.slice(1);
  }

  return (
    <div className="flex flex-col gap-6">
      {intro && <p className="text-xl text-text-primary leading-relaxed font-medium tracking-tight whitespace-pre-line">{intro}</p>}
      {bullets.length > 0 && (
        <ul className="flex flex-col gap-3">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-4">
              <span className="w-1.5 h-1.5 rounded-full bg-text-secondary shrink-0 mt-2.5"></span>
              <span className="text-lg text-text-secondary leading-relaxed whitespace-pre-line">{b.trim()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function highlightSQL(code: string) {
  const parts = code.split(/(\b(?:SELECT|FROM|WHERE|JOIN|ON|LEFT|RIGHT|INNER|OUTER|GROUP BY|ORDER BY|HAVING|LIMIT|OFFSET|AS|ASC|DESC|AND|OR|NOT|IN|BETWEEN|LIKE|IS NULL|IS NOT NULL|COUNT|SUM|AVG|MIN|MAX|DISTINCT|CASE|WHEN|THEN|ELSE|END|WITH|UNION|ALL|OVER|PARTITION BY|CREATE TABLE|INSERT INTO|VALUES|INTEGER|TEXT|PRIMARY KEY)\b|'[^']*'|--.*)/gi);
  
  return parts.map((part, i) => {
    if (part.startsWith('--')) {
      return <span key={i} className="text-text-secondary opacity-70 italic">{part}</span>;
    }
    if (part.startsWith("'")) {
      return <span key={i} className="text-secondary">{part}</span>;
    }
    const isKeyword = /^(SELECT|FROM|WHERE|JOIN|ON|LEFT|RIGHT|INNER|OUTER|GROUP BY|ORDER BY|HAVING|LIMIT|OFFSET|AS|ASC|DESC|AND|OR|NOT|IN|BETWEEN|LIKE|IS NULL|IS NOT NULL|COUNT|SUM|AVG|MIN|MAX|DISTINCT|CASE|WHEN|THEN|ELSE|END|WITH|UNION|ALL|OVER|PARTITION BY|CREATE TABLE|INSERT INTO|VALUES|INTEGER|TEXT|PRIMARY KEY)$/i.test(part);
    if (isKeyword) {
      return <span key={i} className="text-primary font-medium">{part.toUpperCase()}</span>;
    }
    return <span key={i} className="text-code-text">{part}</span>;
  });
}

export default function TopicPageClient({ topic }: TopicPageClientProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const { user } = useAuth();
  const [solvedIds, setSolvedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;
    async function fetchProgress() {
      if (!user) {
        setSolvedIds(new Set());
        return;
      }

      try {
        const { data, error } = await supabase
          .from("progress")
          .select("question_id")
          .eq("user_id", user.id)
          .eq("solved", true);

        if (error) {
          console.error("Failed to fetch progress", error);
          return;
        }

        if (mounted && data) {
          const solved = new Set(data.map(d => d.question_id));
          setSolvedIds(solved);
        }
      } catch (err) {
        console.error("Unexpected error fetching progress", err);
      }
    }

    fetchProgress();
    return () => {
      mounted = false;
    };
  }, [user]);

  const handleSolve = (questionId: string) => {
    setSolvedIds((prev) => {
      const next = new Set(prev);
      next.add(questionId);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans selection:bg-primary/20 selection:text-primary flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 md:py-20 flex flex-col gap-16">
        
        {/* Header & Breadcrumb */}
        <div className="flex flex-col gap-4">
          <Link
            href="/roadmap"
            className="text-sm font-medium text-text-secondary hover:text-primary focus:outline-none rounded-md transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Roadmap
          </Link>
          <div className="flex flex-col gap-2 mt-2">
            <span className="text-sm font-bold tracking-widest uppercase text-primary">Topic {topic.order}</span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-text-primary leading-tight">
              {topic.title}
            </h1>
          </div>
        </div>

        {/* ── Theory section ──────────────────────────────────────────── */}
        <section className="flex flex-col gap-16">
          
          {/* Concept */}
          <div>
            {renderConcept(topic.theory.concept)}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Syntax */}
            <div className="flex flex-col gap-4">
              <h2 className="text-xs font-bold text-text-secondary uppercase tracking-widest">
                Syntax
              </h2>
              <div className="bg-code-bg border-t-2 border-border rounded-b-xl rounded-tr-xl p-5 md:p-6 h-full flex flex-col justify-start overflow-x-auto relative shadow-sm">
                <div className="absolute top-0 right-0 px-3 py-1 bg-border/50 rounded-bl-lg text-[10px] font-bold text-text-secondary uppercase tracking-wider">SQL</div>
                <pre className="text-sm md:text-base font-mono leading-relaxed whitespace-pre-wrap">
                  {highlightSQL(topic.theory.syntax)}
                </pre>
              </div>
            </div>

            {/* Worked Example */}
            <div className="flex flex-col gap-4">
              <h2 className="text-xs font-bold text-text-secondary uppercase tracking-widest">
                Example
              </h2>
              <div className="bg-code-bg border-t-2 border-border rounded-b-xl rounded-tr-xl p-5 md:p-6 h-full flex flex-col justify-start overflow-x-auto relative shadow-sm">
                <div className="absolute top-0 right-0 px-3 py-1 bg-border/50 rounded-bl-lg text-[10px] font-bold text-text-secondary uppercase tracking-wider">SQL</div>
                <pre className="text-sm md:text-base font-mono leading-relaxed whitespace-pre-wrap">
                  {highlightSQL(topic.theory.example.query)}
                </pre>
              </div>
            </div>
          </div>

        </section>

        {/* ── Practice section ──────────────────────────────────────────── */}
        <section className="mt-8 border-t border-border pt-16">
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-text-primary">
              Practice Exercises
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {topic.questions.map((q, i) => {
              const isSelected = selectedIdx === i;
              const isSolved = solvedIds.has(q.id);
              const tablesForQuestion = isSelected ? getTablesForQuestion(topic, i) : [];

              return (
                <div key={q.id} className="flex flex-col gap-2">
                  {/* Question Item Card */}
                  <button
                    onClick={() => setSelectedIdx(isSelected ? null : i)}
                    className={`rounded-xl border p-5 text-left transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-focus-ring ${
                      isSelected
                        ? "border-primary bg-surface shadow-sm"
                        : "border-border bg-surface hover:border-text-secondary"
                    }`}
                  >
                    <div className="flex items-start gap-5">
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 mt-0.5 transition-colors ${
                        isSolved 
                          ? "bg-secondary text-surface" 
                          : isSelected 
                            ? "bg-primary text-surface" 
                            : "border-2 border-border text-transparent"
                      }`}>
                        {isSolved ? (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="text-[10px] font-bold">{isSelected ? i + 1 : ""}</span>
                        )}
                      </div>
                      <span className="text-lg text-text-primary leading-relaxed font-medium">
                        {q.prompt}
                      </span>
                    </div>
                  </button>

                  {/* Inline Practice Screen */}
                  {isSelected && (
                    <div className="mt-2 md:ml-11 p-1 rounded-2xl bg-surface border border-border shadow-lg overflow-hidden animate-in fade-in duration-200 slide-in-from-top-2">
                      <PracticeScreen
                        key={q.id}
                        question={q}
                        tables={tablesForQuestion}
                        onSolve={() => handleSolve(q.id)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-10 mt-12">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 opacity-60">
            <img src="/logo-light.svg" alt="QueryLab" className="h-6 w-auto block dark:hidden opacity-50 grayscale" />
            <img src="/logo-dark.svg" alt="QueryLab" className="h-6 w-auto hidden dark:block opacity-50 grayscale" />
            <span className="text-xs font-medium text-text-secondary tracking-widest uppercase">QueryLab</span>
          </div>
          <p className="text-text-secondary text-xs font-medium opacity-60">No fluff, just practice.</p>
        </div>
      </footer>
    </div>
  );
}
