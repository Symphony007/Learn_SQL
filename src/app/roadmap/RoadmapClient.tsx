"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import type { Topic } from "@/lib/types";
import Header from "@/components/Header";
import AuthModal from "@/components/AuthModal";

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
  const { user, loading } = useAuth();
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const handleOpenAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  useEffect(() => {
    let mounted = true;
    async function fetchProgress() {
      if (!user) {
        setProgressMap({});
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
          const solvedIds = new Set(data.map(d => d.question_id));
          const map: Record<string, number> = {};

          for (const topic of availableTopics) {
            const solvedCount = topic.questions.filter(q => solvedIds.has(q.id)).length;
            map[topic.topic_id] = solvedCount;
          }

          setProgressMap(map);
        }
      } catch (err) {
        console.error("Unexpected error fetching progress", err);
      }
    }

    fetchProgress();
    return () => {
      mounted = false;
    };
  }, [user, availableTopics]);

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans selection:bg-primary/20 selection:text-primary flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 md:py-20">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-text-primary mb-4">Curriculum Roadmap</h1>
          <p className="text-lg text-text-secondary max-w-2xl leading-relaxed">
            Follow our structured 34-topic progression. Build your mental model step-by-step from fundamental queries to advanced analytical patterns.
          </p>
        </div>

        <div className="relative">
          <div className={`flex flex-col border border-border rounded-xl bg-surface shadow-sm overflow-hidden transition-all duration-500 ${!user && !loading ? 'max-h-[500px]' : ''}`}>
            {FULL_ROADMAP.map((title, index) => {
              const order = index + 1;
              const availableTopic = availableTopics.find(t => t.title === title || t.order === order);
              const isAvailable = !!availableTopic;
              
              // Add a subtle thicker border between arbitrary logical groupings 
              // e.g. after every 10 or 12 items to give visual breathing room
              const isGroupEnd = [11, 20, 27].includes(order);

              if (isAvailable) {
                const solvedCount = progressMap[availableTopic.topic_id] || 0;
                const totalQuestions = availableTopic.questions.length;
                const isComplete = totalQuestions > 0 && solvedCount === totalQuestions;
                const isPartial = solvedCount > 0 && solvedCount < totalQuestions;

                return (
                  <Link
                    key={order}
                    href={`/topic/${availableTopic.topic_id}`}
                    className={`px-5 py-4 flex items-center gap-5 hover:bg-code-bg transition-colors group cursor-pointer focus:outline-none focus:bg-code-bg ${isGroupEnd ? 'border-b-4 border-background' : 'border-b border-border last:border-b-0'}`}
                  >
                    {/* Progress indicator */}
                    <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center transition-colors ${
                      isComplete 
                        ? "bg-secondary text-surface" 
                        : isPartial 
                          ? "border-2 border-primary" 
                          : "border-2 border-border group-hover:border-text-secondary"
                    }`}>
                      {isComplete && (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    
                    <div className="flex flex-col flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between w-full gap-1 sm:gap-0">
                        <div className="flex items-baseline gap-3">
                          <span className="text-sm font-medium text-text-secondary w-6 text-right">{order}.</span>
                          <span className="text-base font-semibold text-text-primary group-hover:text-primary transition-colors">
                            {availableTopic.title}
                          </span>
                        </div>
                        {user && totalQuestions > 0 && (
                          <span className={`text-xs font-medium sm:text-right ${isComplete ? 'text-secondary' : 'text-text-secondary'}`}>
                            {solvedCount}/{totalQuestions} solved
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-border group-hover:text-primary transition-colors hidden sm:block">
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
                  className={`px-5 py-4 flex items-center gap-5 bg-background/50 grayscale cursor-not-allowed ${isGroupEnd ? 'border-b-4 border-background' : 'border-b border-border last:border-b-0'}`}
                >
                  <div className="w-5 h-5 rounded-full border-2 border-border flex items-center justify-center shrink-0">
                    <svg className="w-2.5 h-2.5 text-border" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 17a2 2 0 0 0 2-2 2 2 0 0 0-2-2 2 2 0 0 0-2 2 2 2 0 0 0 2 2zm6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5 5 5 0 0 1 5 5v2h1zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3z"/>
                    </svg>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between w-full flex-1 gap-1 sm:gap-0">
                    <div className="flex items-baseline gap-3">
                      <span className="text-sm font-medium text-text-secondary w-6 text-right opacity-50">{order}.</span>
                      <span className="text-base font-medium text-text-secondary opacity-70">
                        {title}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold tracking-wider text-text-secondary uppercase opacity-70">
                      Coming Soon
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {!user && !loading && (
            <div className="absolute bottom-0 left-0 right-0 h-[400px] bg-gradient-to-t from-background via-background/90 to-transparent flex items-end justify-center pb-12 z-10 pointer-events-none">
              <div className="pointer-events-auto flex flex-col items-center gap-4 p-8 bg-surface/90 backdrop-blur-md border border-border rounded-2xl shadow-xl w-full max-w-md mx-auto text-center translate-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2 border border-primary/20">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-text-primary tracking-tight">Unlock the full course</h3>
                <p className="text-text-secondary text-base leading-relaxed max-w-[280px]">Create a free account to track your progress and access all 34 interactive SQL challenges.</p>
                <div className="flex gap-4 w-full mt-4 justify-center">
                   <button onClick={() => handleOpenAuth("login")} className="flex-1 py-3 rounded-xl bg-surface border-2 border-border hover:border-primary font-bold text-text-primary transition-all">Log In</button>
                   <button onClick={() => handleOpenAuth("signup")} className="flex-1 py-3 rounded-xl bg-primary text-white hover:bg-primary-hover font-bold transition-all shadow-md shadow-primary/20">Sign Up</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialMode={authMode} />

      {/* Footer */}
      <footer className="border-t border-border bg-background py-10 mt-12">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 opacity-60">
            <div className="w-6 h-6 rounded bg-border text-text-secondary flex items-center justify-center font-bold text-[10px]">
              QL
            </div>
            <span className="text-xs font-medium text-text-secondary tracking-widest uppercase">QueryLab</span>
          </div>
          <p className="text-text-secondary text-xs font-medium opacity-60">No fluff, just practice.</p>
        </div>
      </footer>
    </div>
  );
}
