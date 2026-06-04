"use client"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { GitBranch, Play, Bot } from "lucide-react"

export default function Header() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get("role") ?? "admin"

  function setRole(r: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("role", r)
    router.push("?" + params.toString())
  }

  function startDemo() {
    window.dispatchEvent(new CustomEvent("start-demo"))
  }

  return (
    <div className="sticky top-0 z-50">
      <header className="bg-[#07071a] border-b border-white/[0.12] h-16 flex items-center px-4 md:px-6 gap-3">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
          <span className="font-sora text-lg text-white">OneView</span>
          <span className="hidden sm:inline text-slate-500 text-sm">Skills for Change</span>
        </Link>

        <div className="flex-1" />

        <div className="flex items-center gap-1 bg-white/[0.04] rounded-lg p-1 shrink-0">
          {["admin","caseworker","viewer"].map(r => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`px-2 sm:px-3 py-1 rounded-md text-xs font-medium capitalize transition-all ${
                role === r
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <a
          href="/llms.txt"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-slate-400 hover:text-white transition-colors shrink-0"
          aria-label="LLMs.txt — AI agent index"
        >
          <Bot size={18} />
        </a>

        <a
          href="https://github.com/hive-mind-workforce/skills-for-change-one-view"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:block p-2 text-slate-400 hover:text-white transition-colors shrink-0"
          aria-label="GitHub repository"
        >
          <GitBranch size={18} />
        </a>

        <button
          onClick={startDemo}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold rounded-lg transition-colors shrink-0"
        >
          <Play size={12} />
          <span className="hidden sm:inline">Demo</span>
          <span className="sm:hidden">▶</span>
        </button>
      </header>
    </div>
  )
}
