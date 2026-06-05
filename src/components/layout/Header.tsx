"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { GitBranch, Play, Bot, RotateCcw } from "lucide-react"
import ThemeToggle from "@/components/ThemeToggle"

export default function Header() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get("role") ?? "admin"
  const [resetting, setResetting] = useState(false)

  function setRole(r: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("role", r)
    router.push("?" + params.toString())
  }

  function startDemo() {
    window.dispatchEvent(new CustomEvent("start-demo"))
  }

  async function resetDemo() {
    if (resetting) return
    setResetting(true)
    try {
      await fetch(`/api/reset?role=${role}`, { method: "POST" })
      router.refresh()
      router.push(`/?role=admin`)
    } finally {
      setResetting(false)
    }
  }

  const ROLE_LABELS: Record<string, { short: string; full: string }> = {
    admin: { short: "Ad", full: "Admin" },
    caseworker: { short: "CW", full: "Caseworker" },
    viewer: { short: "Vi", full: "Viewer" },
  }

  return (
    <div className="sticky top-0 z-50">
      <header className="bg-[var(--ov-header-bg)] border-b border-black/[0.08] dark:border-white/[0.12] h-16 flex items-center px-3 md:px-6 gap-2 md:gap-3 transition-colors duration-200">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
          <span className="font-sora text-lg text-slate-900 dark:text-white">OneView</span>
          <span className="hidden lg:inline text-slate-400 dark:text-slate-500 text-sm">Skills for Change</span>
        </Link>

        <div className="flex-1" />

        <div className="relative group shrink-0">
          <div className="flex items-center gap-0.5 bg-black/[0.04] dark:bg-white/[0.04] rounded-lg p-1">
            {["admin", "caseworker", "viewer"].map(r => {
              const labels = ROLE_LABELS[r]
              return (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`px-2 sm:px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    role === r
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <span className="sm:hidden">{labels.short}</span>
                  <span className="hidden sm:inline">{labels.full}</span>
                </button>
              )
            })}
          </div>
          <div className="pointer-events-none absolute top-full right-0 mt-2 w-64 px-3 py-2 rounded-lg bg-slate-900 dark:bg-slate-700 text-white text-xs leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-lg">
            Demo only: production will replace this with JWT/SSO authentication.
            <div className="absolute -top-1 right-6 w-2 h-2 bg-slate-900 dark:bg-slate-700 rotate-45" />
          </div>
        </div>

        <ThemeToggle />

        <a
          href="/llms.txt"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors shrink-0"
          aria-label="LLMs.txt: AI agent index"
        >
          <Bot size={18} />
        </a>

        <a
          href="https://github.com/hive-mind-workforce/skills-for-change-one-view"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:block p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors shrink-0"
          aria-label="GitHub repository"
        >
          <GitBranch size={18} />
        </a>

        {role === "admin" && (
          <button
            onClick={resetDemo}
            disabled={resetting}
            title="Reset demo data"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-black/[0.1] dark:border-white/[0.1] hover:border-amber-500/40 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 text-xs font-medium rounded-lg transition-colors shrink-0 disabled:opacity-50"
          >
            <RotateCcw size={12} className={resetting ? "animate-spin" : ""} />
            <span>Reset</span>
          </button>
        )}

        <button
          onClick={startDemo}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white dark:text-black text-xs font-semibold rounded-lg transition-colors shrink-0"
        >
          <Play size={12} />
          <span className="hidden sm:inline">Demo</span>
          <span className="sm:hidden">▶</span>
        </button>
      </header>
    </div>
  )
}
