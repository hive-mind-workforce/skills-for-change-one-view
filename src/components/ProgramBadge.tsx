const COLORS: Record<string, string> = {
  settlement: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  employment: "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
  language: "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30",
  mental_health: "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30",
  trades: "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30",
  mentoring: "bg-violet-500/20 text-violet-700 dark:text-violet-300 border-violet-500/30",
  youth: "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30",
  women: "bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-500/30",
}

const LABELS: Record<string, string> = {
  settlement: "Settlement", employment: "Employment", language: "Language",
  mental_health: "Mental Health", trades: "Trades", mentoring: "Mentoring",
  youth: "Youth", women: "Women's",
}

export default function ProgramBadge({ program }: { program: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${COLORS[program] ?? "bg-slate-500/20 text-slate-300 border-slate-500/30"}`}>
      {LABELS[program] ?? program}
    </span>
  )
}
