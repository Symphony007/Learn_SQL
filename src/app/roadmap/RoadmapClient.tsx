"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import type { Topic } from "@/lib/types";
import Header from "@/components/Header";

const FULL_ROADMAP = [
  "Introduction to Tables & SELECT",
  "Filtering Rows with WHERE",
  "Working with NULL Values",
  "Pattern Matching with LIKE",
  "Filtering with BETWEEN & IN",
  "Removing Duplicate Rows with DISTINCT",
  "Sorting Results with ORDER BY",
  "Limiting Results with LIMIT & OFFSET",
  "Summarizing Data with Aggregate Functions",
  "Grouping Rows with GROUP BY",
  "Filtering Groups with HAVING",
  "Using Aliases (AS)",
  "Combining Tables with INNER JOIN",
  "Keeping Unmatched Rows with LEFT JOIN",
  "RIGHT JOIN",
  "FULL OUTER JOIN",
  "Generating Combinations with CROSS JOIN",
  "Self Joins",
  "Joining Multiple Tables",
  "Combining Result Sets with UNION",
  "Conditional Logic with CASE",
  "Scalar Subqueries",
  "Subqueries in WHERE (IN, EXISTS, ANY, ALL)",
  "Correlated Subqueries",
  "Derived Tables (Subqueries in FROM)",
  "Common Table Expressions (WITH)",
  "Recursive CTEs",
  "Window Functions (OVER & PARTITION BY)",
  "Ranking & Navigation Functions",
  "Running Totals & Window Aggregates",
  "Date & Time Functions",
  "Pivoting Data with CASE & Aggregates",
  "Top-N Per Group",
  "Gaps & Islands"
];

interface RoadmapClientProps {
  availableTopics: Topic[];
}

export default function RoadmapClient({ availableTopics }: RoadmapClientProps) {
  const { user } = useAuth();
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchProgress() {
      if (!user) {
        setProgressMap({});
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

      const solvedIds = new Set(data.map(d => d.question_id));
      const map: Record<string, number> = {};

      for (const topic of availableTopics) {
        const solvedCount = topic.questions.filter(q => solvedIds.has(q.id)).length;
        map[topic.topic_id] = solvedCount;
      }

      setProgressMap(map);
    }

    fetchProgress();
  }, [user, availableTopics]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 md:py-20">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4">Curriculum Roadmap</h1>
          <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
            Follow our structured 34-topic progression. Build your mental model step-by-step from fundamental queries to advanced analytical patterns.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {FULL_ROADMAP.map((title, index) => {
            const order = index + 1;
            const availableTopic = availableTopics.find(t => t.title === title || t.order === order);
            const isAvailable = !!availableTopic;

            if (isAvailable) {
              const solvedCount = progressMap[availableTopic.topic_id] || 0;
              const totalQuestions = availableTopic.questions.length;
              const isComplete = totalQuestions > 0 && solvedCount === totalQuestions;
              const isPartial = solvedCount > 0 && solvedCount < totalQuestions;

              return (
                <Link
                  key={order}
                  href={`/topic/${availableTopic.topic_id}`}
                  className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center gap-5 hover:border-indigo-300 hover:shadow-md transition-all group cursor-pointer"
                >
                  {/* Progress indicator */}
                  <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center transition-colors ${
                    isComplete 
                      ? "bg-green-500 text-white" 
                      : isPartial 
                        ? "border-2 border-indigo-400" 
                        : "border-2 border-slate-200 group-hover:border-indigo-300"
                  }`}>
                    {isComplete && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  
                  <div className="flex flex-col flex-1">
                    <div className="flex items-baseline justify-between w-full">
                      <div className="flex items-baseline gap-3">
                        <span className="text-sm font-semibold text-slate-400 w-6">{order}.</span>
                        <span className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {availableTopic.title}
                        </span>
                      </div>
                      {user && totalQuestions > 0 && (
                        <span className="text-sm font-medium text-slate-500">
                          {solvedCount}/{totalQuestions} solved
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-slate-400 group-hover:text-indigo-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              );
            }

            // Locked topic
            return (
              <div 
                key={order}
                className="rounded-2xl border border-slate-200 border-dashed bg-slate-50/50 p-5 flex items-center gap-5 opacity-70 grayscale cursor-not-allowed"
              >
                <div className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 17a2 2 0 0 0 2-2 2 2 0 0 0-2-2 2 2 0 0 0-2 2 2 2 0 0 0 2 2zm6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5 5 5 0 0 1 5 5v2h1zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3z"/>
                  </svg>
                </div>
                
                <div className="flex items-baseline gap-3">
                  <span className="text-sm font-semibold text-slate-400 w-6">{order}.</span>
                  <span className="text-lg font-medium text-slate-500">
                    {title}
                  </span>
                </div>

                <div className="ml-auto px-3 py-1 bg-slate-200 rounded-full text-xs font-semibold text-slate-500 tracking-wider">
                  COMING SOON
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
