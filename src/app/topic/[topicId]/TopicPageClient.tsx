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
    return [topic.shared_table];
  }
  return [];
}

export default function TopicPageClient({ topic }: TopicPageClientProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const { user } = useAuth();
  const [solvedIds, setSolvedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchProgress() {
      if (!user) {
        setSolvedIds(new Set());
        return;
      }

      const { data, error } = await supabase
        .from("progress")
        .select("question_id")
        .eq("user_id", user.id)
        .eq("solved", true);

      if (error) {
        console.error("Failed to fetch progress", error);
        return;
      }

      const solved = new Set(data.map(d => d.question_id));
      setSolvedIds(solved);
    }

    fetchProgress();
  }, [user]);

  const handleSolve = (questionId: string) => {
    setSolvedIds((prev) => {
      const next = new Set(prev);
      next.add(questionId);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 md:py-16 flex flex-col gap-12">
        
        {/* Header & Breadcrumb */}
        <div>
          <Link
            href="/roadmap"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors mb-6 inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Roadmap
          </Link>
          <div className="flex items-baseline gap-4 mt-2">
            <span className="text-xl font-semibold text-slate-400">{topic.order}.</span>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              {topic.title}
            </h1>
          </div>
        </div>

        {/* ── Theory section ──────────────────────────────────────────── */}
        <section className="flex flex-col gap-10">
          
          {/* Concept */}
          <div>
            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4">
              Concept
            </h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-lg text-slate-700 leading-relaxed whitespace-pre-line">
                {topic.theory.concept}
              </p>
            </div>
          </div>

          {/* Syntax */}
          <div>
            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4">
              Syntax
            </h2>
            <div className="bg-slate-900 rounded-2xl p-6 shadow-sm overflow-x-auto">
              <pre className="text-teal-400 text-sm md:text-base font-mono leading-relaxed whitespace-pre-wrap">
                {topic.theory.syntax}
              </pre>
            </div>
          </div>

          {/* Worked Example */}
          <div>
            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4">
              Worked Example
            </h2>
            <div className="bg-slate-900 rounded-2xl p-6 shadow-sm overflow-x-auto">
              <pre className="text-indigo-300 text-sm md:text-base font-mono leading-relaxed whitespace-pre-wrap">
                {topic.theory.example.query}
              </pre>
            </div>
          </div>

        </section>

        {/* ── Practice section ──────────────────────────────────────────── */}
        <section className="mt-8">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Practice Exercises
            </h2>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          <div className="flex flex-col gap-4">
            {topic.questions.map((q, i) => {
              const isSelected = selectedIdx === i;
              const isSolved = solvedIds.has(q.id);
              const tablesForQuestion = isSelected ? getTablesForQuestion(topic, i) : [];

              return (
                <div key={q.id} className="flex flex-col gap-3">
                  {/* Question Item Card */}
                  <button
                    onClick={() => setSelectedIdx(isSelected ? null : i)}
                    className={`rounded-2xl border p-5 text-left transition-all cursor-pointer shadow-sm ${
                      isSelected
                        ? "border-indigo-600 ring-1 ring-indigo-600 bg-white"
                        : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 font-bold text-sm transition-colors ${
                        isSolved 
                          ? "bg-green-500 text-white" 
                          : isSelected 
                            ? "bg-indigo-600 text-white" 
                            : "bg-slate-100 text-slate-500"
                      }`}>
                        {isSolved ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          i + 1
                        )}
                      </div>
                      <span className="text-lg font-medium text-slate-800 leading-relaxed mt-0.5">
                        {q.prompt}
                      </span>
                    </div>
                  </button>

                  {/* Inline Practice Screen */}
                  {isSelected && (
                    <div className="ml-0 md:ml-12 p-6 md:p-8 border border-slate-200 rounded-2xl bg-white shadow-lg overflow-hidden animate-in slide-in-from-top-4 fade-in duration-200">
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
      <footer className="border-t border-slate-200 bg-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-sm mb-4">
            SQL
          </div>
          <p className="text-slate-500 text-sm font-medium">Built for serious learners. No fluff, just practice.</p>
        </div>
      </footer>
    </div>
  );
}
