"use client"
import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import MetricCard from "@/components/MetricCard"
import ProgramChart from "./ProgramChart"
import RecentClients from "./RecentClients"
import { Users, TrendingUp, GitMerge, Target, Zap, Layers, Star, ArrowRight } from "lucide-react"
import { formatNumber, programLabel } from "@/lib/helpers"
import Link from "next/link"

interface AnalyticsData {
  total: number
  surveyStats: { avg_sat: string | null; total: string; recommend_pct: string } | null
  byStage: Array<{ stage: string; count: string | number }>
  byProgram?: Array<{ program: string }>
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

const STAGE_META: Record<string, { label: string; color: string; order: number }> = {
  outreach:    { label: "Outreach",    color: "#3b82f6", order: 0 },
  vetting:     { label: "Vetting",     color: "#8b5cf6", order: 1 },
  eligibility: { label: "Eligible",    color: "#f59e0b", order: 2 },
  intake:      { label: "Enrolled",    color: "#10b981", order: 3 },
  training:    { label: "Training",    color: "#06b6d4", order: 4 },
  placement:   { label: "Placed",      color: "#ec4899", order: 5 },
  survey:      { label: "Survey",      color: "#a855f7", order: 6 },
  complete:    { label: "Completed",   color: "#22c55e", order: 7 },
  dropped:     { label: "Dropped",     color: "#6b7280", order: 8 },
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
      <div className="h-64 glass rounded-2xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 glass rounded-xl" />)}
      </div>
    </div>
  )

  if (error) return <div className="p-8 text-rose-500 dark:text-rose-400">Error loading data: {error}</div>

  const metrics = data?.metrics ?? { total: 0, active: 0, outcomesAchievedPct: 0, crossProgram: 0, byProgram: {} }
  const clients = data?.clients ?? []
  const byProgram = metrics.byProgram ?? {}
  const chartData = Object.entries(byProgram).map(([program, count]) => ({ program, count: count as number }))

  // Stage counts keyed by raw DB stage value
  const stageMap: Record<string, number> = {}
  for (const row of analytics?.byStage ?? []) {
    stageMap[row.stage] = parseInt(String(row.count)) || 0
  }

  const completedCount = stageMap["complete"] ?? 0
  const placedCount    = stageMap["placement"] ?? 0
  const surveyCount    = stageMap["survey"] ?? 0
  const droppedCount   = stageMap["dropped"] ?? 0
  const totalClients   = analytics?.total ?? metrics.total ?? 0
  const activeCount    = (stageMap["intake"] ?? 0) + (stageMap["training"] ?? 0) + (stageMap["placement"] ?? 0)
  const successCount   = completedCount + placedCount + surveyCount
  // Rate = success / (success + dropped); only counts clients who have finished
  const terminalCount  = successCount + droppedCount
  const successPct     = terminalCount > 0 ? Math.round((successCount / terminalCount) * 100) : 0
  const dropPct        = terminalCount > 0 ? Math.round((droppedCount / terminalCount) * 100) : 0
  const avgSat         = analytics?.surveyStats?.avg_sat
    ? parseFloat(String(analytics.surveyStats.avg_sat)).toFixed(1) : null

  // Pipeline stages sorted by funnel order, excluding zero-count dropped for cleanliness
  const pipelineStages = Object.entries(STAGE_META)
    .sort((a, b) => a[1].order - b[1].order)
    .map(([key, meta]) => ({ key, ...meta, count: stageMap[key] ?? 0 }))
    .filter(s => s.key !== "dropped" || s.count > 0)

  const maxStageCount = Math.max(...pipelineStages.map(s => s.count), 1)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

      {/* ── Hero ── */}
      <section id="dashboard-hero" className="relative rounded-2xl overflow-hidden">
        {/* background image */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&q=60')" }}
        />
        {/* darkening base so image reads but doesn't compete */}
        <div className="absolute inset-0 bg-[#060610]/65" />
        {/* colour tints that match the design system */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_20%_70%,rgba(16,185,129,0.25),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_80%_30%,rgba(99,102,241,0.18),transparent)]" />
        {/* vignette: darken edges so centre text pops */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,transparent,rgba(6,6,16,0.55))]" />

        <div className="relative z-10 text-center py-16 px-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs tracking-widest uppercase mb-4">
            Skills for Change · Toronto · Since 1982
          </span>
          <h1 className="font-sora font-black text-7xl md:text-[9rem] leading-none text-white"
            style={{ textShadow: "0 0 80px rgba(16,185,129,0.55), 0 0 20px rgba(16,185,129,0.3)" }}>
            {formatNumber(metrics.total ?? 19140)}
          </h1>
          <p className="text-white font-semibold text-2xl md:text-3xl mt-3 tracking-tight">
            Lives Changed. Futures Built.
          </p>
          <p className="text-slate-300 mt-2 text-base md:text-lg">
            Newcomers and refugees served across 8 programs and multiple funders
          </p>

          {/* three hero stats */}
          <div className="flex justify-center gap-8 mt-8 flex-wrap">
            <div className="text-center">
              <div className="font-sora font-bold text-3xl text-emerald-400">{successPct}%</div>
              <div className="text-slate-400 text-xs mt-0.5">Program success rate</div>
            </div>
            <div className="w-px bg-white/10 self-stretch" />
            <div className="text-center">
              <div className="font-sora font-bold text-3xl text-indigo-400">{formatNumber(activeCount)}</div>
              <div className="text-slate-400 text-xs mt-0.5">Active now</div>
            </div>
            <div className="w-px bg-white/10 self-stretch" />
            <div className="text-center">
              <div className="font-sora font-bold text-3xl text-cyan-400">
                {avgSat ? `${avgSat}★` : `${metrics.outcomesAchievedPct ?? 0}%`}
              </div>
              <div className="text-slate-400 text-xs mt-0.5">{avgSat ? "Avg satisfaction" : "Outcomes met"}</div>
            </div>
          </div>

          {/* program badges */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {Object.keys(byProgram).map(p => (
              <span key={p} className="px-3 py-1 bg-white/[0.07] backdrop-blur-sm border border-white/[0.12] rounded-full text-xs text-slate-200 hover:bg-white/[0.12] transition-colors">
                {programLabel(p)}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Metric cards ── */}
      <section id="metric-cards" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total Clients" value={formatNumber(metrics.total ?? 0)} sub="across all programs" icon={<Users size={16} />} />
        <MetricCard label="Active Enrollments" value={formatNumber(metrics.active ?? 0)} sub="currently enrolled" icon={<TrendingUp size={16} />} color="#6366f1" />
        <MetricCard label="Outcomes Achieved" value={(metrics.outcomesAchievedPct ?? 0) + "%"} sub="of all tracked outcomes" icon={<Target size={16} />} color="#f59e0b" />
        <MetricCard label="Cross-Program" value={formatNumber(metrics.crossProgram ?? 0)} sub="consent granted" icon={<GitMerge size={16} />} color="#8b5cf6" />
      </section>

      {/* ── Quick Impact ── */}
      <section id="quick-impact">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={18} className="text-emerald-500" />
          <h2 className="font-sora text-lg text-slate-900 dark:text-white">Quick Impact</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass rounded-xl p-5 flex flex-col gap-1 border-t-2 border-t-emerald-500/50">
            <span className="text-slate-500 dark:text-slate-400 text-sm">Client Satisfaction</span>
            <span className="font-sora text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {avgSat ? `${avgSat} / 5` : "N/A"}
            </span>
            {avgSat && (
              <span className="flex gap-0.5">
                {[1,2,3,4,5].map(n => (
                  <Star key={n} size={12} className={parseFloat(avgSat) >= n ? "text-amber-400 fill-amber-400" : "text-slate-600"} />
                ))}
              </span>
            )}
            <span className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
              {analytics?.surveyStats?.recommend_pct ?? 0}% would recommend · {formatNumber(Number(analytics?.surveyStats?.total ?? 0))} surveys
            </span>
          </div>

          <div className="glass rounded-xl p-5 flex flex-col gap-1 border-t-2 border-t-indigo-500/50">
            <span className="text-slate-500 dark:text-slate-400 text-sm">Program Success Rate</span>
            <span className="font-sora text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {successPct}%
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-xs">
              of completed journeys: {formatNumber(placedCount)} placed, {formatNumber(completedCount)} graduated
            </span>
          </div>

          <div className="glass rounded-xl p-5 flex flex-col gap-1 border-t-2 border-t-amber-500/50">
            <span className="text-slate-500 dark:text-slate-400 text-sm">Drop-off Rate</span>
            <span className="font-sora text-3xl font-bold text-amber-600 dark:text-amber-400">
              {dropPct}%
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-xs">
              {formatNumber(droppedCount)} of {formatNumber(terminalCount)} completed journeys
            </span>
          </div>
        </div>
      </section>

      {/* ── Program Breakdown ── */}
      <section id="program-chart" className="glass rounded-xl p-5">
        <h2 className="font-sora text-lg text-slate-900 dark:text-white mb-4">Program Breakdown</h2>
        <ProgramChart data={chartData} />
      </section>

      {/* ── Pipeline Overview ── */}
      <section id="pipeline-overview">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-emerald-500" />
            <h2 className="font-sora text-lg text-slate-900 dark:text-white">Pipeline Overview</h2>
          </div>
          <Link
            href={`/pipeline?role=${role}`}
            className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 transition-colors"
          >
            View Full Pipeline <ArrowRight size={14} />
          </Link>
        </div>
        <div className="glass rounded-xl p-5 space-y-3">
          {pipelineStages.map(({ key, label, color, count }) => (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                  <span className="text-slate-700 dark:text-slate-300">{label}</span>
                </div>
                <span className="text-slate-500 dark:text-slate-400 tabular-nums font-medium">{formatNumber(count)}</span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.06]">
                <div
                  className="h-2 rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.round((count / maxStageCount) * 100)}%`,
                    background: color,
                    opacity: key === "dropped" ? 0.4 : 0.75,
                  }}
                />
              </div>
            </div>
          ))}
          <div className="pt-2 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "In pipeline", value: formatNumber(activeCount), color: "text-emerald-500" },
              { label: "Awaiting survey", value: formatNumber(surveyCount), color: "text-violet-500" },
              { label: "Completed", value: formatNumber(completedCount), color: "text-green-500" },
              { label: "Dropped", value: formatNumber(droppedCount), color: "text-slate-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <div className={`font-sora font-bold text-xl ${color}`}>{value}</div>
                <div className="text-slate-500 dark:text-slate-400 text-xs">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recent Clients ── */}
      <section>
        <h2 className="font-sora text-lg text-slate-900 dark:text-white mb-4">Recent Clients</h2>
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
        <div className="h-64 glass rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 glass rounded-xl" />)}
        </div>
      </div>
    }>
      <DashboardInner />
    </Suspense>
  )
}
