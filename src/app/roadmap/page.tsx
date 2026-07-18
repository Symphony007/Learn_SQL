import Link from "next/link";
import { getAllTopics } from "@/lib/contentLoader";

export default function RoadmapPage() {
  const topics = getAllTopics();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 flex flex-col">
      {/* Persistent Header */}
      <header className="border-b border-white/10 bg-[#0d0d14] px-6 py-4 flex items-center">
        <Link href="/roadmap" className="text-xl font-semibold tracking-tight hover:opacity-80 transition-opacity">
          <span className="text-emerald-400">SQL</span> Practice Platform
        </Link>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Learning Roadmap</h1>
          <p className="text-gray-400 text-sm">
            Master SQL progressively by reading theory and solving interactive challenges.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {topics.map((topic) => (
            <Link
              key={topic.topic_id}
              href={`/topic/${topic.topic_id}`}
              className="rounded-xl border border-white/10 bg-[#12121a] px-5 py-4
                hover:border-emerald-500/30 hover:bg-[#14141f] transition-all group"
            >
              <div className="flex items-center gap-4">
                {/* Placeholder checkmark */}
                <div className="w-5 h-5 rounded-full border border-white/20 shrink-0 group-hover:border-white/40 transition-colors" />
                
                <span className="font-medium text-gray-200 group-hover:text-emerald-300 transition-colors">
                  {topic.order}. {topic.title}
                </span>
                <span className="ml-auto text-xs text-gray-600">
                  {topic.questions.length} question{topic.questions.length !== 1 ? "s" : ""}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
