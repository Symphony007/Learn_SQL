import Link from "next/link";
import Header from "@/components/Header";
import { getAllTopics } from "@/lib/contentLoader";

export default function Home() {
  const topicsCount = getAllTopics().length;

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section: Asymmetric */}
        <section className="px-6 py-16 md:py-24 lg:py-32 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.05]">
              Master SQL through real execution.
            </h1>
            
            <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-lg">
              Structured practice designed for serious interview and placement prep. 
              Write and execute queries against real tables directly in your browser.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link 
                href="/roadmap"
                className="w-full sm:w-auto px-8 py-4 rounded bg-slate-900 hover:bg-indigo-600 text-white font-medium text-lg transition-colors active:scale-95 flex items-center justify-center gap-3"
              >
                View the Curriculum
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            
            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm font-medium text-slate-500">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {topicsCount} structured topics
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Instant WASM runtime
              </div>
            </div>
          </div>

          {/* Visual: Abstract Mockup / Preview */}
          <div className="lg:col-span-6 relative w-full h-full min-h-[420px] hidden sm:block">
            <div className="absolute inset-0 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden shadow-sm flex flex-col">
              {/* Mockup Header */}
              <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                <span className="ml-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Practice Environment</span>
              </div>
              {/* Mockup Editor */}
              <div className="p-6 md:p-8 bg-[#FAFAFA] flex-1 font-mono text-sm md:text-base leading-relaxed border-b border-slate-200">
                <div className="text-slate-400 mb-4">-- Find all active users with premium subscriptions</div>
                <div className="text-indigo-600 font-semibold mb-1">SELECT</div>
                <div className="pl-6 text-slate-700 mb-2">u.id, u.email, s.plan_name</div>
                <div className="text-indigo-600 font-semibold mb-1">FROM</div>
                <div className="pl-6 text-slate-700 mb-2">users u</div>
                <div className="text-indigo-600 font-semibold mb-1">JOIN</div>
                <div className="pl-6 text-slate-700 mb-2">subscriptions s <span className="text-indigo-600 font-semibold">ON</span> u.id = s.user_id</div>
                <div className="text-indigo-600 font-semibold mb-1">WHERE</div>
                <div className="pl-6 text-slate-700">s.status = <span className="text-teal-600">'active'</span></div>
              </div>
              {/* Mockup Output */}
              <div className="p-4 md:p-5 bg-white flex items-center justify-between">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-green-50 text-green-700 text-xs md:text-sm font-semibold border border-green-200">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Correct!
                </div>
                <span className="text-xs text-slate-400 font-medium">Execution: 4ms</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="border-t border-slate-200 bg-[#FAFAFA] px-6 py-20 lg:py-32">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
                Designed for serious learning
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Everything you need to build a robust mental model of SQL, without the friction of managing your own database.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
              {/* Feature 1 */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                  Live Execution
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Queries run instantly via WebAssembly. No remote databases to provision, no server latency, just immediate feedback on every keystroke.
                </p>
              </div>

              {/* Feature 2 */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                  Actionable Feedback
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Get precise diffs comparing your output row-by-row with the expected results, alongside clear formatting for syntax errors.
                </p>
              </div>

              {/* Feature 3 */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
                  Structured Progression
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Follow a carefully curated roadmap that builds your knowledge step-by-step, covering everything from basic filtering to complex window functions.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-xs">
              QL
            </div>
            <span className="font-semibold tracking-tight text-slate-900">QueryLab</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Built for serious learners.</p>
        </div>
      </footer>
    </div>
  );
}
