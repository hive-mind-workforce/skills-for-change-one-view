"use client"
import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import MetricCard from "@/components/MetricCard"
import ProgramChart from "./ProgramChart"
import RecentClients from "./RecentClients"
import { Users, TrendingUp, GitMerge, Target, Zap, Layers } from "lucide-react"
import { formatNumber, programLabel } from "@/lib/helpers"
import Link from "next/link"

interface AnalyticsData {
  surveyStats: {
    avg_satisfaction: string | null
    total: string
    recommend_count: string
  } | null
  placementCount: string | number
  droppedCount: string | number
  totalClients: string | number
  byStage: Array<{ stage: string; count: string | number }>
  byProgram: Array<{ program: string; total: string | number; placed: string | number; dropped: string | number }>
}

interface ClientsData {
  metrics: {
    total: number
    active: number
    outcomesAchievedPct: number
    crossProgram: number
    byProgram: Record<string, number>
  }
  clients: Array<Record<string, unknown>>
}

function DashboardInner() {
  const searchParams = useSearchParams()
  const role = searchParams.get("role") ?? "admin"

  const [data, setData] = useState<ClientsData | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/init").catch(() => {})
    Promise.all([
      fetch("/api/clients").then(r => r.json()),
      fetch("/api/analytics").then(r => r.json()).catch(() => null),
    ])
      .then(([clientsData, analyticsData]) => {
        setData(clientsData)
        setAnalytics(analyticsData)
        setLoading(false)
      })
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

  const metrics: ClientsData["metrics"] = data?.metrics ?? { total: 0, active: 0, outcomesAchievedPct: 0, crossProgram: 0, byProgram: {} }
  const clients = data?.clients ?? []
  const byProgram = metrics.byProgram ?? {}
  const chartData = Object.entries(byProgram).map(([program, count]) => ({ program, count: count as number }))

  // Quick Impact derived values
  const avgSatisfaction = analytics?.surveyStats?.avg_satisfaction
    ? parseFloat(analytics.surveyStats.avg_satisfaction).toFixed(1)
    : null
  const totalClients = parseInt(String(analytics?.totalClients ?? 0)) || 0
  const placementCount = parseInt(String(analytics?.placementCount ?? 0)) || 0
  const droppedCount = parseInt(String(analytics?.droppedCount ?? 0)) || 0
  const placementRatePct = totalClients > 0 ? Math.round((placementCount / totalClients) * 100) : 0
  const dropRatePct = totalClients > 0 ? Math.round((droppedCount / totalClients) * 100) : 0

  // Pipeline stage counts from byStage
  const stageMap: Record<string, number> = {}
  if (analytics?.byStage) {
    for (const row of analytics.byStage) {
      stageMap[row.stage] = parseInt(String(row.count)) || 0
    }
  }
  const pipelineStages = [
    { label: "Enrolled", count: stageMap["enrolled"] ?? 0 },
    { label: "Training", count: stageMap["training"] ?? 0 },
    { label: "Placed", count: stageMap["placed"] ?? 0 },
    { label: "Completed", count: stageMap["completed"] ?? 0 },
  ]
  const maxStageCount = Math.max(...pipelineStages.map(s => s.count), 1)

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
          <div className="mt-3 flex justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs">
              Updated ad-hoc and monthly for all funders
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
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

      {/* Quick Impact */}
      <section id="quick-impact">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={18} className="text-emerald-600 dark:text-emerald-400" />
          <h2 className="font-sora text-lg text-slate-700 dark:text-slate-200">Quick Impact</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Satisfaction */}
          <div className="glass rounded-xl p-5 flex flex-col gap-1 border-t-2 border-t-emerald-500/40">
            <span className="text-slate-500 dark:text-slate-400 text-sm">Client Satisfaction</span>
            <span className="font-sora text-3xl text-emerald-600 dark:text-emerald-400">
              {avgSatisfaction !== null ? `${avgSatisfaction}/5 ★` : "—"}
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-xs">based on completed surveys</span>
          </div>
          {/* Placement Rate */}
          <div className="glass rounded-xl p-5 flex flex-col gap-1 border-t-2 border-t-indigo-500/40">
            <span className="text-slate-500 dark:text-slate-400 text-sm">Placed or Employed</span>
            <span className="font-sora text-3xl text-indigo-600 dark:text-indigo-400">
              {placementRatePct}%
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-xs">{formatNumber(placementCount)} clients placed or completed</span>
          </div>
          {/* Drop-off Rate */}
          <div className="glass rounded-xl p-5 flex flex-col gap-1 border-t-2 border-t-amber-500/40">
            <span className="text-slate-500 dark:text-slate-400 text-sm">Drop-off Rate</span>
            <span className="font-sora text-3xl text-amber-600 dark:text-amber-400">
              {dropRatePct}%
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-xs">lower is better</span>
          </div>
        </div>
      </section>

      <section id="program-chart" className="glass rounded-xl p-5">
        <h2 className="font-sora text-lg text-slate-700 dark:text-slate-200 mb-4">Program Breakdown</h2>
        <ProgramChart data={chartData} />
      </section>

      {/* Pipeline Overview */}
      <section id="pipeline-overview">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-emerald-600 dark:text-emerald-400" />
            <h2 className="font-sora text-lg text-slate-700 dark:text-slate-200">Pipeline Overview</h2>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={`/pipeline?role=${role}`}
              className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 transition-colors"
            >
              View Full Pipeline →
            </Link>
            <Link
              href={`/analytics?role=${role}`}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              View Analytics →
            </Link>
          </div>
        </div>
        <div className="glass rounded-xl p-5 space-y-4">
          {pipelineStages.map(({ label, count }) => (
            <div key={label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">{label}</span>
                <span className="text-slate-500 dark:text-slate-400 tabular-nums">{formatNumber(count)}</span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.06]">
                <div
                  className="h-2 rounded-full bg-emerald-500/70 transition-all duration-500"
                  style={{ width: `${Math.round((count / maxStageCount) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-sora text-lg text-slate-700 dark:text-slate-200 mb-4">Recent Clients</h2>
        <Suspense fallback={null}>
          <RecentClients clients={clients.slice(0, 10)} />
        </Suspense>
      </section>
    </div>
  )
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="p-8 space-y-4 animate-pulse">
        <div className="h-32 glass rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 glass rounded-xl" />)}
        </div>
      </div>
    }>
      <DashboardInner />
    </Suspense>
  )
}
