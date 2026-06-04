"use client"
import { useEffect, useState } from "react"
import MetricCard from "@/components/MetricCard"
import ProgramChart from "./ProgramChart"
import RecentClients from "./RecentClients"
import { Users, TrendingUp, GitMerge, Target } from "lucide-react"
import { formatNumber, programLabel } from "@/lib/helpers"

export default function Dashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/init").catch(() => {})
    fetch("/api/clients")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="p-8 space-y-4 animate-pulse">
      <div className="h-32 glass rounded-xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 glass rounded-xl" />)}
      </div>
    </div>
  )

  if (error) return <div className="p-8 text-rose-400">Error loading data: {error}</div>

  const metrics = data?.metrics ?? {}
  const clients = data?.clients ?? []
  const byProgram = metrics.byProgram ?? {}
  const chartData = Object.entries(byProgram).map(([program, count]) => ({ program, count: count as number }))

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <section id="dashboard-hero" className="text-center py-8">
        <p className="text-slate-500 text-sm uppercase tracking-widest mb-2">Skills for Change</p>
        <h1 className="font-sora text-6xl md:text-8xl text-emerald-400 drop-shadow-[0_0_40px_rgba(16,185,129,0.3)]">
          {formatNumber(metrics.total ?? 16247)}
        </h1>
        <p className="text-slate-300 text-2xl mt-2">Lives in Motion</p>
        <p className="text-slate-500 mt-1">Serving immigrants and refugees across Toronto</p>
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {Object.keys(byProgram).map(p => (
            <span key={p} className="px-3 py-1 glass rounded-full text-xs text-slate-300">
              {programLabel(p)}
            </span>
          ))}
        </div>
      </section>

      <section id="metric-cards" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total Clients" value={formatNumber(metrics.total ?? 0)} sub="across all programs" icon={<Users size={16} />} />
        <MetricCard label="Active Enrolments" value={formatNumber(metrics.active ?? 0)} sub="currently enrolled" icon={<TrendingUp size={16} />} color="#6366f1" />
        <MetricCard label="Outcomes Achieved" value={(metrics.outcomesAchievedPct ?? 0) + "%"} sub="of all tracked outcomes" icon={<Target size={16} />} color="#f59e0b" />
        <MetricCard label="Cross-Program" value={formatNumber(metrics.crossProgram ?? 0)} sub="consent granted" icon={<GitMerge size={16} />} color="#8b5cf6" />
      </section>

      <section id="program-chart" className="glass rounded-xl p-5">
        <h2 className="font-sora text-lg text-slate-200 mb-4">Program Breakdown</h2>
        <ProgramChart data={chartData} />
      </section>

      <section>
        <h2 className="font-sora text-lg text-slate-200 mb-4">Recent Clients</h2>
        <RecentClients clients={clients.slice(0, 10)} />
      </section>
    </div>
  )
}
