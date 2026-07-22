import Link from "next/link";
import Header from "@/components/Header";
import { getAllTopics } from "@/lib/contentLoader";

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

export default function Home() {
  const topicsCount = getAllTopics().length;

  const demoQuery = `-- Find active users with premium plans
SELECT
  u.id, 
  u.email, 
  s.plan_name
FROM
  users u
JOIN
  subscriptions s ON u.id = s.user_id
WHERE
  s.status = 'active'
ORDER BY
  s.created_at DESC;`;

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans selection:bg-primary/20 selection:text-primary flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-6 py-20 md:py-32 max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
          
          {/* Text Content */}
          <div className="flex-1 flex flex-col items-start text-left w-full">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-text-primary mb-8 leading-[1.05]">
              Master SQL through <br className="hidden md:block"/>
              real execution.
            </h1>
            
            <p className="text-xl md:text-2xl text-text-secondary mb-12 leading-relaxed max-w-2xl font-medium">
              Structured practice designed for serious interview and placement prep. 
              Write and execute queries against real tables directly in your browser.
            </p>
            
            <div className="flex items-center gap-6 w-full sm:w-auto">
              <Link 
                href="/roadmap"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-text-primary hover:bg-text-secondary text-background font-bold text-lg transition-colors flex items-center justify-center gap-3 focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:ring-offset-background"
              >
                View Curriculum
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            
            <div className="mt-12 flex flex-wrap items-center gap-8 text-sm font-bold tracking-wider text-text-secondary uppercase">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                {topicsCount} Topics
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                Instant WASM Runtime
              </div>
            </div>
          </div>

          {/* Visual: Grounded Editor Block */}
          <div className="flex-1 w-full max-w-2xl hidden md:block">
            <div className="bg-code-bg border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col font-mono text-sm h-full">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-surface">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold tracking-widest text-text-secondary uppercase">editor.sql</span>
                </div>
                <div className="flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                   <span className="text-[10px] uppercase font-bold tracking-widest text-secondary">Ready</span>
                </div>
              </div>
              <div className="p-6 md:p-8 flex-1">
                <pre className="text-code-text leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                  {highlightSQL(demoQuery)}
                </pre>
              </div>
              <div className="bg-surface border-t border-border px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 px-2 py-1 rounded bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-wider">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Match
                </div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">2 rows • 4ms</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="border-t border-border bg-surface px-6 py-24">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary mb-4">
                Designed for serious learning
              </h2>
              <p className="text-lg text-text-secondary leading-relaxed max-w-2xl">
                Everything you need to build a robust mental model of SQL, without the friction of managing your own database.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Feature 1 (Large) */}
              <div className="md:col-span-8 bg-code-bg border border-border p-10 rounded-3xl flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary mb-4">
                    Live WASM Execution
                  </h3>
                  <p className="text-text-secondary leading-relaxed text-lg max-w-lg">
                    Queries run instantly in your browser via WebAssembly. No remote databases to provision, no server latency, just immediate feedback on every keystroke.
                  </p>
                </div>
              </div>

              {/* Feature 2 (Small) */}
              <div className="md:col-span-4 bg-background border border-border p-10 rounded-3xl flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-4">
                    Actionable Feedback
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    Get precise diffs comparing your output row-by-row with the expected results.
                  </p>
                </div>
              </div>

              {/* Feature 3 (Full width) */}
              <div className="md:col-span-12 bg-surface border border-border p-10 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="max-w-xl">
                  <h3 className="text-2xl font-bold text-text-primary mb-4">
                    Structured Progression
                  </h3>
                  <p className="text-text-secondary leading-relaxed text-lg">
                    Follow a carefully curated 34-topic roadmap that builds your knowledge step-by-step, covering everything from basic filtering to complex window functions and recursive CTEs.
                  </p>
                </div>
                <Link 
                  href="/roadmap"
                  className="px-6 py-3 rounded-xl border-2 border-border hover:border-primary text-text-primary font-bold transition-all whitespace-nowrap"
                >
                  Explore the Curriculum
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-10 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 opacity-60">
            <div className="w-6 h-6 rounded bg-border text-text-secondary flex items-center justify-center font-bold text-[10px]">
              QL
            </div>
            <span className="text-xs font-medium text-text-secondary tracking-widest uppercase">QueryLab</span>
          </div>
          <p className="text-text-secondary text-xs font-medium opacity-60">Built for serious learners. No fluff, just practice.</p>
        </div>
      </footer>
    </div>
  );
}
