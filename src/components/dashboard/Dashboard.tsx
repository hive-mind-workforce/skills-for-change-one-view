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

  if (error) return <div className="p-8 text-rose-500 dark:text-rose-400">Error loading data: {error}</div>

  const metrics = data?.metrics ?? {}
  const clients = data?.clients ?? []
  const byProgram = metrics.byProgram ?? {}
  const chartData = Object.entries(byProgram).map(([program, count]) => ({ program, count: count as number }))

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <section id="dashboard-hero" className="relative rounded-2xl overflow-hidden mb-2">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&q=60')" }}
        />
        <div className="absolute inset-0 bg-[#060610]/75" />
        <div className="relative z-10 text-center py-16 px-4">
          <p className="text-emerald-600 dark:text-emerald-400 text-sm uppercase tracking-widest mb-2">Skills for Change · Toronto</p>
          <h1 className="font-sora text-6xl md:text-8xl text-white drop-shadow-[0_0_40px_rgba(16,185,129,0.4)]">
            {formatNumber(metrics.total ?? 19140)}
          </h1>
          <p className="text-slate-200 text-2xl mt-2 font-light">Potential Meets Opportunity</p>
          <p className="text-slate-400 mt-1">Building welcoming and equitable communities since 1982</p>
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {Object.keys(byProgram).map(p => (
              <span key={p} className="px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-xs text-slate-200">
                {programLabel(p)}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="metric-cards" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total Clients" value={formatNumber(metrics.total ?? 0)} sub="across all programs" icon={<Users size={16} />} />
        <MetricCard label="Active Enrolments" value={formatNumber(metrics.active ?? 0)} sub="currently enrolled" icon={<TrendingUp size={16} />} color="#6366f1" />
        <MetricCard label="Outcomes Achieved" value={(metrics.outcomesAchievedPct ?? 0) + "%"} sub="of all tracked outcomes" icon={<Target size={16} />} color="#f59e0b" />
        <MetricCard label="Cross-Program" value={formatNumber(metrics.crossProgram ?? 0)} sub="consent granted" icon={<GitMerge size={16} />} color="#8b5cf6" />
      </section>

      <section id="program-chart" className="glass rounded-xl p-5">
        <h2 className="font-sora text-lg text-slate-700 dark:text-slate-200 mb-4">Program Breakdown</h2>
        <ProgramChart data={chartData} />
      </section>

      <section>
        <h2 className="font-sora text-lg text-slate-700 dark:text-slate-200 mb-4">Recent Clients</h2>
        <RecentClients clients={clients.slice(0, 10)} />
      </section>
    </div>
  )
}
