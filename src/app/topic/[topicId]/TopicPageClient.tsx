"use client";

import { useState } from "react";
import Link from "next/link";
import type { Topic, TableFixture } from "@/lib/types";
import PracticeScreen from "@/components/PracticeScreen";

interface TopicPageClientProps {
  topic: Topic;
}

/**
 * Resolves the fixture tables for a given question within a topic.
 * Uses the question's own fixture if present, otherwise falls back to the topic's shared_table.
 */
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

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 flex flex-col">
      {/* Persistent Header */}
      <header className="border-b border-white/10 bg-[#0d0d14] px-6 py-4 flex items-center">
        <Link href="/roadmap" className="text-xl font-semibold tracking-tight hover:opacity-80 transition-opacity">
          <span className="text-emerald-400">SQL</span> Practice Platform
        </Link>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 flex flex-col gap-10">
        
        {/* Breadcrumb & Title */}
        <div>
          <Link
            href="/roadmap"
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors mb-4 inline-block"
          >
            ← Back to Roadmap
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-emerald-400">
            {topic.title}
          </h1>
        </div>

        {/* ── Theory section ──────────────────────────────────────────── */}
        <section className="flex flex-col gap-6">
          
          <div>
            <h2 className="text-lg font-semibold text-gray-200 border-b border-white/10 pb-2 mb-3">
              Concept
            </h2>
            <p className="text-gray-300 text-base leading-relaxed whitespace-pre-line">
              {topic.theory.concept}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-200 border-b border-white/10 pb-2 mb-3">
              Syntax
            </h2>
            <pre className="text-emerald-300 text-sm leading-relaxed font-mono bg-black/30 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap border border-white/5">
              {topic.theory.syntax}
            </pre>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-200 border-b border-white/10 pb-2 mb-3">
              Worked Example
            </h2>
            <div className="bg-[#12121a] border border-white/10 rounded-lg p-5">
              <pre className="text-indigo-300 text-sm font-mono bg-black/30 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap mb-4 border border-white/5">
                {topic.theory.example.query}
              </pre>
              <p className="text-gray-400 text-sm leading-relaxed">
                {topic.theory.example.explanation}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-200 border-b border-white/10 pb-2 mb-3">
              Common Mistakes
            </h2>
            <ul className="flex flex-col gap-3 list-disc list-inside text-gray-300 text-base leading-relaxed">
              {topic.theory.common_mistakes.map((mistake, i) => (
                <li key={i}>
                  {mistake}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Practice section ──────────────────────────────────────────── */}
        <section>
          <h2 className="text-xl font-bold text-gray-100 border-b border-white/10 pb-2 mb-5">
            Practice
          </h2>

          <div className="flex flex-col gap-4">
            {topic.questions.map((q, i) => {
              const isSelected = selectedIdx === i;
              const tablesForQuestion = isSelected ? getTablesForQuestion(topic, i) : [];

              return (
                <div key={q.id} className="flex flex-col gap-2">
                  {/* Question Item */}
                  <button
                    onClick={() => setSelectedIdx(isSelected ? null : i)}
                    className={`rounded-xl border px-5 py-4 text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-emerald-500/40 bg-emerald-950/20"
                        : "border-white/10 bg-[#12121a] hover:border-white/20 hover:bg-[#14141f]"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-sm font-medium text-gray-400 mt-0.5">
                        {i + 1}.
                      </span>
                      <span className="text-base text-gray-200 leading-relaxed">
                        {q.prompt}
                      </span>
                    </div>
                  </button>

                  {/* Inline Practice Screen */}
                  {isSelected && (
                    <div className="ml-0 md:ml-8 mt-2 p-5 border border-white/10 rounded-xl bg-[#0a0a0f] shadow-lg">
                      <PracticeScreen
                        key={q.id}
                        question={q}
                        tables={tablesForQuestion}
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
      <footer className="border-t border-white/5 px-6 py-4 text-center text-xs text-gray-600 mt-8">
        SQL Practice Platform · All queries run client-side via sql.js
      </footer>
    </div>
  );
}
