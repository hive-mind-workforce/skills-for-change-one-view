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

  const rolePicker = (
    <div className="flex items-center gap-1 bg-white/[0.04] rounded-lg p-1">
      {["admin","caseworker","viewer"].map(r => (
        <button
          key={r}
          onClick={() => setRole(r)}
          className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-all ${
            role === r
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  )

  return (
    <div className="sticky top-0 z-50">
      <header className="bg-[#07071a] border-b border-white/[0.12] h-16 flex items-center px-4 md:px-6 gap-4">
        <Link href="/" className="flex items-center gap-2 mr-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
          <span className="font-sora text-lg text-white">OneView</span>
          <span className="hidden sm:inline text-slate-500 text-sm">Skills for Change</span>
        </Link>

        <div className="hidden sm:block">{rolePicker}</div>

        <a
          href="/llms.txt"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:block p-2 text-slate-400 hover:text-white transition-colors"
          aria-label="LLMs.txt — AI agent index"
        >
          <Bot size={18} />
        </a>

        <a
          href="https://github.com/hive-mind-workforce/skills-for-change-one-view"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:block p-2 text-slate-400 hover:text-white transition-colors"
          aria-label="GitHub repository"
        >
          <GitBranch size={18} />
        </a>

        <button
          onClick={startDemo}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold rounded-lg transition-colors"
        >
          <Play size={12} />
          <span>Demo</span>
        </button>
      </header>

      <div className="flex sm:hidden items-center justify-between bg-[#07071a] border-b border-white/[0.1] px-4 py-2">
        {rolePicker}
        <div className="flex items-center gap-1">
          <a
            href="/llms.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-slate-500 hover:text-white transition-colors"
            aria-label="LLMs.txt — AI agent index"
          >
            <Bot size={16} />
          </a>
          <a
            href="https://github.com/hive-mind-workforce/skills-for-change-one-view"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-slate-500 hover:text-white transition-colors"
            aria-label="GitHub repository"
          >
            <GitBranch size={16} />
          </a>
        </div>
      </div>
    </div>
  )
}
