import Link from "next/link";
import { getAllTopics } from "@/lib/contentLoader";

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

export default function RoadmapPage() {
  const availableTopics = getAllTopics();

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 flex flex-col">
      {/* Navigation */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                SQL
              </div>
              <span className="font-semibold tracking-tight text-slate-900">Practice Platform</span>
            </Link>
          </div>
          <nav>
            <Link 
              href="/roadmap"
              className="text-sm font-medium text-indigo-600"
            >
              Curriculum
            </Link>
          </nav>
        </div>
      </header>

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
              return (
                <Link
                  key={order}
                  href={`/topic/${availableTopic.topic_id}`}
                  className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center gap-5 hover:border-indigo-300 hover:shadow-md transition-all group cursor-pointer"
                >
                  {/* Progress placeholder */}
                  <div className="w-6 h-6 rounded-full border-2 border-slate-200 shrink-0 group-hover:border-indigo-300 transition-colors" />
                  
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-3">
                      <span className="text-sm font-semibold text-slate-400 w-6">{order}.</span>
                      <span className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {availableTopic.title}
                      </span>
                    </div>
                  </div>
                  
                  <div className="ml-auto text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
                    {availableTopic.questions.length} question{availableTopic.questions.length !== 1 ? "s" : ""}
                  </div>
                </Link>
              );
            }

            return (
              <div
                key={order}
                className="rounded-2xl border border-slate-200 border-dashed bg-slate-50/50 p-5 flex items-center gap-5 opacity-70"
              >
                {/* Progress placeholder */}
                <div className="w-6 h-6 rounded-full border-2 border-slate-200 shrink-0" />
                
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-3">
                    <span className="text-sm font-semibold text-slate-400 w-6">{order}.</span>
                    <span className="text-lg font-semibold text-slate-700">
                      {title}
                    </span>
                  </div>
                </div>
                
                <div className="ml-auto text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                  Coming soon
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-slate-500 text-sm">
          <p>Built for serious SQL learners. No fluff, just practice.</p>
        </div>
      </footer>
    </div>
  );
}
