import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              SQL
            </div>
            <span className="font-semibold tracking-tight text-slate-900">Practice Platform</span>
          </div>
          <nav>
            <Link 
              href="/roadmap"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Curriculum
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-24 pb-28 md:pt-32 md:pb-36 overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-50 to-transparent opacity-70 pointer-events-none rounded-full blur-3xl" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            34 Complete Topics
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
            Master SQL through <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-teal-500">
              real execution.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Structured SQL practice designed for interview and placement prep. 
            Don't just read theory — write real queries against real tables directly in your browser.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/roadmap"
              className="px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-lg shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all active:scale-95 flex items-center gap-2"
            >
              Start Learning Now
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link 
              href="#features"
              className="px-8 py-4 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium text-lg hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Scope / Credibility Banner */}
      <section className="border-y border-slate-200 bg-white relative z-20">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center flex flex-col md:flex-row items-center justify-center gap-4">
          <span className="text-slate-400 hidden md:inline">From basics to mastery:</span>
          <p className="text-slate-600 font-medium text-sm md:text-base">
            Covering everything from basic <code className="font-mono text-[0.9em] bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600">SELECT</code> to advanced <code className="font-mono text-[0.9em] bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600">WINDOW</code> functions, Recursive CTEs, and interview patterns.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-24 bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
              Everything you need to get fluent.
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              We built this platform to bridge the gap between reading SQL syntax and actually writing it under pressure.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Live Browser Execution</h3>
              <p className="text-slate-600 leading-relaxed">
                Queries run instantly in your browser using WebAssembly. No databases to spin up, no server latency, just immediate execution.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Actionable Feedback</h3>
              <p className="text-slate-600 leading-relaxed">
                Get precise diffs comparing your output row-by-row with the expected results, plus helpful syntax error formatting to unstuck you fast.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Structured Progression</h3>
              <p className="text-slate-600 leading-relaxed">
                Follow a carefully curated 34-topic roadmap that builds your mental model step-by-step, without skipping the hard parts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
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
