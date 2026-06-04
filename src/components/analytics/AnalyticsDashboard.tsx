"use client"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import {
  Star, Briefcase, TrendingDown, CheckSquare, Globe, Target,
  ThumbsUp, Users, TrendingUp, Lightbulb, Activity,
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, LineChart, Line, CartesianGrid, PieChart, Pie, Legend,
} from "recharts"
import ProgramBadge from "@/components/ProgramBadge"
import { programColor, programShortLabel } from "@/lib/helpers"

// Dynamically import the map to avoid SSR issues with react-simple-maps
const WorldMap = dynamic(() => import("./WorldMap"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[380px] bg-slate-900 dark:bg-[#050510] rounded-xl animate-pulse" />
  ),
})

// ---- Types ---------------------------------------------------------------

interface ByCountryRow {
  country_of_origin: string
  count: string | number
}

interface ByAgeGroupRow {
  age_group: string
  count: string | number
}

interface ByGenderRow {
  gender: string
  count: string | number
}

interface BySourceRow {
  source: string
  count: string | number
}

interface ByProgramRow {
  program: string
  total: string | number
  placed: string | number
  dropped: string | number
}

interface SurveyStats {
  avg_satisfaction: string | number | null
  total: string | number
  recommend_count: string | number
}

interface MonthlyRow {
  month: string
  count: string | number
}

interface AnalyticsData {
  byCountry: ByCountryRow[]
  byAgeGroup: ByAgeGroupRow[]
  byGender: ByGenderRow[]
  bySource: BySourceRow[]
  byProgram: ByProgramRow[]
  surveyStats: SurveyStats
  placementCount: string | number
  droppedCount: string | number
  totalClients: string | number
  monthlyTrend?: MonthlyRow[]
}

interface AnalyticsDashboardProps {
  role: string
}

// ---- Helpers --------------------------------------------------------------

const SOURCE_COLORS: Record<string, string> = {
  referral: "#10b981",
  "walk-in": "#6366f1",
  online: "#06b6d4",
  event: "#f59e0b",
  partner: "#8b5cf6",
}

const AGE_GROUP_ORDER = ["18-24", "25-34", "35-44", "45-54", "55+"]
const AGE_GROUP_LABEL: Record<string, string> = {
  "18-24": "18–24", "25-34": "25–34", "35-44": "35–44", "45-54": "45–54", "55+": "55+",
}

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={16}
          className={
            i < Math.round(rating)
              ? "text-amber-400 fill-amber-400"
              : "text-slate-300 dark:text-slate-600"
          }
        />
      ))}
    </div>
  )
}

// ---- Skeleton & Error States ----------------------------------------------

function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 glass rounded-xl" />
        ))}
      </div>
      <div className="h-[420px] glass rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-40 glass rounded-xl" />
        ))}
      </div>
    </div>
  )
}

// ---- Main Component -------------------------------------------------------

export default function AnalyticsDashboard({ role: _role }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((raw: any) => {
        const stageRows: any[] = raw.byStage ?? []
        const placementCount = Number(stageRows.find((r: any) => r.stage === "complete")?.count ?? 0)
        const droppedCount = stageRows
          .filter((r: any) => ["outreach", "vetting"].includes(r.stage))
          .reduce((sum: number, r: any) => sum + Number(r.count), 0)
        const surveyRaw = raw.surveyStats ?? {}
        const surveyTotal = Number(surveyRaw.total ?? 0)
        const normalized: AnalyticsData = {
          ...raw,
          totalClients: raw.total,
          placementCount,
          droppedCount,
          byProgram: (raw.programPerformance ?? []).map((p: any) => ({
            program: p.program,
            total: Number(p.clients),
            placed: Math.round(Number(p.clients) * Number(p.outcome_rate ?? 0) / 100),
            dropped: 0,
          })),
          surveyStats: {
            avg_satisfaction: Number(surveyRaw.avg_sat ?? 0),
            total: surveyTotal,
            recommend_count: surveyTotal > 0
              ? Math.round((Number(surveyRaw.recommend_pct ?? 0) / 100) * surveyTotal)
              : 0,
          },
          monthlyTrend: (raw.monthlyTrend ?? []).map((r: any) => ({
            month: r.month,
            count: Number(r.count),
          })),
        }
        setData(normalized)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message)
        setLoading(false)
      })
  }, [])

  if (loading) return <LoadingSkeleton />

  if (error) {
    return (
      <div className="glass rounded-xl p-6 border border-rose-500/30 bg-rose-500/5">
        <p className="text-rose-600 dark:text-rose-400 font-medium">Failed to load analytics</p>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{error}</p>
      </div>
    )
  }

  if (!data) return null

  // Coerce all counts to numbers
  const totalClients = Number(data.totalClients) || 1
  const placementCount = Number(data.placementCount) || 0
  const droppedCount = Number(data.droppedCount) || 0
  const avgSatisfaction = Number(data.surveyStats?.avg_satisfaction) || 0
  const surveyTotal = Number(data.surveyStats?.total) || 0
  const recommendCount = Number(data.surveyStats?.recommend_count) || 0

  const satisfactionPct = ((avgSatisfaction / 5) * 100).toFixed(0)
  const placementPct = ((placementCount / totalClients) * 100).toFixed(0)
  const dropoffPct = ((droppedCount / totalClients) * 100).toFixed(0)
  const recommendPct = surveyTotal > 0 ? ((recommendCount / surveyTotal) * 100).toFixed(0) : "0"

  // World map data
  const countryData = (data.byCountry ?? []).map((r) => ({
    code: r.country_of_origin,
    count: Number(r.count),
  }))

  // Program data
  const byProgram = (data.byProgram ?? []).map((r) => ({
    program: r.program,
    total: Number(r.total),
    placed: Number(r.placed),
    dropped: Number(r.dropped),
  }))

  // Age group data sorted
  const ageData = AGE_GROUP_ORDER
    .map((ag) => {
      const row = (data.byAgeGroup ?? []).find((r) => r.age_group === ag)
      return { label: AGE_GROUP_LABEL[ag] ?? ag, count: Number(row?.count ?? 0) }
    })
    .filter((d) => d.count > 0)

  const maxAge = Math.max(1, ...ageData.map((d) => d.count))

  // Gender data
  const genderData = (data.byGender ?? []).map((r) => ({
    label: String(r.gender).charAt(0).toUpperCase() + String(r.gender).slice(1),
    count: Number(r.count),
  }))
  const totalGender = genderData.reduce((s, r) => s + r.count, 0) || 1

  const GENDER_COLORS = ["text-indigo-600 dark:text-indigo-400", "text-rose-600 dark:text-rose-400", "text-cyan-600 dark:text-cyan-400"]
  const GENDER_BG = ["bg-indigo-500", "bg-rose-500", "bg-cyan-500"]

  // Source data
  const sourceData = (data.bySource ?? []).map((r) => ({
    source: String(r.source),
    count: Number(r.count),
  }))

  // Monthly trend
  const monthlyData = (data.monthlyTrend ?? []).map((r) => ({
    month: r.month,
    count: Number(r.count),
  }))
  const maxMonthly = Math.max(1, ...monthlyData.map(d => d.count))
  const trendDelta = monthlyData.length >= 2
    ? monthlyData[monthlyData.length - 1].count - monthlyData[monthlyData.length - 2].count
    : 0

  // Key insights
  const topProgram = byProgram.reduce((a, b) => (Number(b.total) > Number(a.total) ? b : a), byProgram[0])
  const bestOutcomeProgram = byProgram.reduce((a, b) => {
    const pctA = Number(a.total) > 0 ? Number(a.placed) / Number(a.total) : 0
    const pctB = Number(b.total) > 0 ? Number(b.placed) / Number(b.total) : 0
    return pctB > pctA ? b : a
  }, byProgram[0])
  const topSource = sourceData[0]
  const topCountry = (data.byCountry ?? []).reduce((a: any, b: any) => (Number(b.count) > Number(a.count) ? b : a), data.byCountry?.[0] ?? { country_of_origin: "N/A", count: 0 })

  // Funder breakdown from programs
  const FUNDER_PROGRAMS: Record<string, string[]> = {
    IRCC: ["settlement", "language"],
    "Employment Ontario": ["employment", "trades"],
    "United Way": ["mental_health", "youth"],
    "City of Toronto": ["mentoring", "women"],
  }
  const funderBreakdown = Object.entries(FUNDER_PROGRAMS).map(([funder, programs]) => {
    const total = byProgram.filter(p => programs.includes(p.program)).reduce((s, p) => s + Number(p.total), 0)
    return { funder, total }
  }).filter(f => f.total > 0)

  return (
    <div className="space-y-8">

      {/* ------------------------------------------------------------------ */}
      {/* 1. HERO METRICS ROW                                                  */}
      {/* ------------------------------------------------------------------ */}
      <section id="analytics-hero-metrics" className="grid grid-cols-2 md:grid-cols-4 gap-4">

        {/* Satisfaction Rate */}
        <div className="glass rounded-xl p-5 flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-sm">Satisfaction Rate</span>
            <Star size={16} className="text-amber-500 dark:text-amber-400 flex-shrink-0" />
          </div>
          <span className="font-sora text-4xl text-emerald-600 dark:text-emerald-400 leading-none">
            {satisfactionPct}%
          </span>
          <StarRating rating={avgSatisfaction} />
          <span className="text-slate-500 dark:text-slate-400 text-xs">avg {avgSatisfaction.toFixed(1)} / 5.0</span>
        </div>

        {/* Placement Rate */}
        <div className="glass rounded-xl p-5 flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-sm">Placement Rate</span>
            <Briefcase size={16} className="text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
          </div>
          <span className="font-sora text-4xl text-indigo-600 dark:text-indigo-400 leading-none">
            {placementPct}%
          </span>
          <span className="text-slate-500 dark:text-slate-400 text-xs">
            {placementCount.toLocaleString()} of {totalClients.toLocaleString()} clients
          </span>
        </div>

        {/* Drop-off Rate */}
        <div className="glass rounded-xl p-5 flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-sm">Drop-off Rate</span>
            <TrendingDown size={16} className="text-amber-500 dark:text-amber-400 flex-shrink-0" />
          </div>
          <span className="font-sora text-4xl text-amber-600 dark:text-amber-400 leading-none">
            {dropoffPct}%
          </span>
          <span className="text-slate-500 dark:text-slate-400 text-xs">
            lower is better: {droppedCount.toLocaleString()} dropped
          </span>
        </div>

        {/* Survey Responses */}
        <div className="glass rounded-xl p-5 flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-sm">Survey Responses</span>
            <CheckSquare size={16} className="text-violet-500 dark:text-violet-400 flex-shrink-0" />
          </div>
          <span className="font-sora text-4xl text-violet-600 dark:text-violet-400 leading-none">
            {surveyTotal.toLocaleString()}
          </span>
          <span className="text-slate-500 dark:text-slate-400 text-xs">
            {recommendPct}% would recommend
          </span>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 2. WORLD MAP                                                         */}
      {/* ------------------------------------------------------------------ */}
      <section id="analytics-world-map">
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <Globe size={18} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <h2 className="font-sora text-xl text-slate-900 dark:text-white">
              Where Our Clients Come From
            </h2>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
            Every highlighted country is a country of origin. Darker green = more clients from that country.
          </p>
          <WorldMap byCountry={data.byCountry ?? []} />
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-3 text-center">
            Showing {countryData.length} source countries across {totalClients.toLocaleString()} clients
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 3. PROGRAM OUTCOMES GRID                                             */}
      {/* ------------------------------------------------------------------ */}
      <section id="analytics-programs">
        <div className="flex items-center gap-2 mb-4">
          <Target size={18} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <h2 className="font-sora text-xl text-slate-900 dark:text-white">Program Performance</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {byProgram.map(({ program, total, placed, dropped }) => {
            const placePct = total > 0 ? (placed / total) * 100 : 0
            const dropPct = total > 0 ? (dropped / total) * 100 : 0
            const color = programColor(program)
            return (
              <div key={program} className="glass rounded-xl p-4 flex flex-col gap-3 glass-hover">
                <div className="flex items-center justify-between">
                  <ProgramBadge program={program} />
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                    {total.toLocaleString()}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Placement</span>
                    <span className="font-medium" style={{ color }}>{placePct.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${placePct}%`, background: color }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Drop-off</span>
                    <span className="text-amber-600 dark:text-amber-400 font-medium">{dropPct.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 dark:bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${dropPct}%` }}
                    />
                  </div>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-white/[0.06]">
                  {programShortLabel(program)}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 4. DEMOGRAPHIC BREAKDOWN                                             */}
      {/* ------------------------------------------------------------------ */}
      <section id="analytics-demographics">
        <div className="flex items-center gap-2 mb-4">
          <Users size={18} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <h2 className="font-sora text-xl text-slate-900 dark:text-white">Demographic Breakdown</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Age Groups */}
          <div className="glass rounded-xl p-5">
            <h3 className="text-slate-700 dark:text-slate-200 font-semibold mb-4 text-sm uppercase tracking-wider">
              Age Distribution
            </h3>
            <div className="space-y-2.5">
              {ageData.map(({ label, count }) => {
                const pct = (count / maxAge) * 100
                return (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 dark:text-slate-400 w-14 flex-shrink-0 text-right">
                      {label}
                    </span>
                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-600 dark:text-slate-300 w-14 flex-shrink-0">
                      {count.toLocaleString()}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Gender Split */}
          <div className="glass rounded-xl p-5">
            <h3 className="text-slate-700 dark:text-slate-200 font-semibold mb-4 text-sm uppercase tracking-wider">
              Gender Split
            </h3>
            <div className="space-y-4">
              {genderData.map(({ label, count }, idx) => {
                const pct = ((count / totalGender) * 100).toFixed(0)
                return (
                  <div key={label} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${GENDER_COLORS[idx % GENDER_COLORS.length]}`}>
                        {label}
                      </span>
                      <span className="text-slate-600 dark:text-slate-300 text-sm font-semibold">
                        {pct}% <span className="text-slate-400 dark:text-slate-500 font-normal text-xs">({count.toLocaleString()})</span>
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${GENDER_BG[idx % GENDER_BG.length]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 5. CLIENT SOURCES                                                    */}
      {/* ------------------------------------------------------------------ */}
      <section id="analytics-sources">
        <div className="glass rounded-xl p-5">
          <h2 className="font-sora text-xl text-slate-900 dark:text-white mb-4">
            How Clients Find Us
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={sourceData}
              layout="vertical"
              margin={{ top: 4, right: 32, bottom: 4, left: 56 }}
            >
              <XAxis
                type="number"
                tick={{ fill: "var(--ov-tick-color)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => (v / 1000).toFixed(0) + "k"}
              />
              <YAxis
                type="category"
                dataKey="source"
                tick={{ fill: "var(--ov-tick-color)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
              />
              <Tooltip
                cursor={{ fill: "var(--ov-chart-cursor, rgba(0,0,0,0.04))" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const row = payload[0].payload as { source: string; count: number }
                  return (
                    <div className="glass rounded-lg p-3 text-sm shadow-xl">
                      <p className="text-slate-800 dark:text-slate-200 font-medium capitalize">{row.source}</p>
                      <p className="text-emerald-600 dark:text-emerald-400">{Number(row.count).toLocaleString()} clients</p>
                    </div>
                  )
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {sourceData.map(({ source }) => (
                  <Cell key={source} fill={SOURCE_COLORS[source] ?? "#94a3b8"} opacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 6. MONTHLY INTAKE TREND                                              */}
      {/* ------------------------------------------------------------------ */}
      {monthlyData.length > 1 && (
        <section id="analytics-trend">
          <div className="glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <h2 className="font-sora text-xl text-slate-900 dark:text-white">Monthly Intake Trend</h2>
              </div>
              <span className={`text-sm font-semibold flex items-center gap-1 ${trendDelta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                <TrendingUp size={14} />
                {trendDelta >= 0 ? "+" : ""}{trendDelta.toLocaleString()} vs prior month
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">New client registrations over the last 12 months.</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyData} margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
                <defs>
                  <linearGradient id="intakeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--ov-grid-line, rgba(148,163,184,0.12))" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "var(--ov-tick-color)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--ov-tick-color)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? (v/1000).toFixed(0)+"k" : v} width={36} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const row = payload[0].payload as { month: string; count: number }
                    return (
                      <div className="glass rounded-lg p-3 text-sm shadow-xl">
                        <p className="text-slate-800 dark:text-slate-200 font-medium">{row.month}</p>
                        <p className="text-emerald-600 dark:text-emerald-400">{Number(row.count).toLocaleString()} new clients</p>
                      </div>
                    )
                  }}
                />
                <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} fill="url(#intakeGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 7. KEY INSIGHTS                                                      */}
      {/* ------------------------------------------------------------------ */}
      {byProgram.length > 0 && (
        <section id="analytics-insights">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={18} className="text-amber-500 flex-shrink-0" />
            <h2 className="font-sora text-xl text-slate-900 dark:text-white">Key Insights</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                label: "Largest program by enrolment",
                value: topProgram ? programShortLabel(topProgram.program) : "N/A",
                sub: topProgram ? `${Number(topProgram.total).toLocaleString()} clients enrolled` : "",
                color: "text-indigo-600 dark:text-indigo-400",
                bg: "bg-indigo-500/[0.06] border-indigo-500/20",
              },
              {
                label: "Highest outcome rate",
                value: bestOutcomeProgram && Number(bestOutcomeProgram.total) > 0
                  ? `${((Number(bestOutcomeProgram.placed) / Number(bestOutcomeProgram.total)) * 100).toFixed(0)}%`
                  : "N/A",
                sub: bestOutcomeProgram ? programShortLabel(bestOutcomeProgram.program) : "",
                color: "text-emerald-600 dark:text-emerald-400",
                bg: "bg-emerald-500/[0.06] border-emerald-500/20",
              },
              {
                label: "Top intake source",
                value: topSource ? (topSource.source.charAt(0).toUpperCase() + topSource.source.slice(1)) : "N/A",
                sub: topSource ? `${Number(topSource.count).toLocaleString()} clients via ${topSource.source}` : "",
                color: "text-violet-600 dark:text-violet-400",
                bg: "bg-violet-500/[0.06] border-violet-500/20",
              },
              {
                label: "Most common country of origin",
                value: topCountry?.country_of_origin ?? "N/A",
                sub: `${Number(topCountry?.count ?? 0).toLocaleString()} clients`,
                color: "text-cyan-600 dark:text-cyan-400",
                bg: "bg-cyan-500/[0.06] border-cyan-500/20",
              },
            ].map((insight, i) => (
              <div key={i} className={`rounded-xl p-4 border ${insight.bg}`}>
                <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider mb-1">{insight.label}</p>
                <p className={`font-sora text-2xl font-bold ${insight.color}`}>{insight.value}</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{insight.sub}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 8. FUNDER BREAKDOWN                                                  */}
      {/* ------------------------------------------------------------------ */}
      {funderBreakdown.length > 0 && (
        <section id="analytics-funders">
          <div className="glass rounded-xl p-5">
            <h2 className="font-sora text-xl text-slate-900 dark:text-white mb-4">Clients by Funder</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { funder: "IRCC", color: "#10b981", bg: "bg-emerald-500/10 border-emerald-500/20" },
                { funder: "Employment Ontario", color: "#6366f1", bg: "bg-indigo-500/10 border-indigo-500/20" },
                { funder: "United Way", color: "#f59e0b", bg: "bg-amber-500/10 border-amber-500/20" },
                { funder: "City of Toronto", color: "#8b5cf6", bg: "bg-violet-500/10 border-violet-500/20" },
              ].map(({ funder, color, bg }) => {
                const entry = funderBreakdown.find(f => f.funder === funder)
                const count = entry?.total ?? 0
                const pct = totalClients > 0 ? ((count / totalClients) * 100).toFixed(0) : "0"
                return (
                  <div key={funder} className={`rounded-xl p-4 border ${bg}`}>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mb-1 truncate">{funder}</p>
                    <p className="font-sora text-3xl font-bold" style={{ color }}>{pct}%</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{count.toLocaleString()} clients</p>
                    <div className="mt-2 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 9. SURVEY INSIGHTS PANEL                                             */}
      {/* ------------------------------------------------------------------ */}
      <section id="analytics-survey">
        <div className="glass rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h2 className="font-sora text-xl text-slate-900 dark:text-white mb-1">
                Survey Insights
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Based on {surveyTotal.toLocaleString()} client surveys
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CheckSquare size={12} />
              {surveyTotal.toLocaleString()} completed
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Avg Satisfaction */}
            <div className="flex flex-col items-start gap-2">
              <span className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-medium">
                Avg Satisfaction
              </span>
              <span className="font-sora text-4xl text-amber-500 dark:text-amber-400 leading-none">
                {avgSatisfaction.toFixed(1)}
              </span>
              <StarRating rating={avgSatisfaction} />
              <span className="text-slate-500 dark:text-slate-400 text-xs">out of 5.0</span>
            </div>

            {/* Would Recommend */}
            <div className="flex flex-col items-start gap-2">
              <span className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-medium">
                Would Recommend
              </span>
              <div className="flex items-center gap-2">
                <span className="font-sora text-4xl text-emerald-600 dark:text-emerald-400 leading-none">
                  {recommendPct}%
                </span>
                <ThumbsUp size={20} className="text-emerald-500 dark:text-emerald-400 mb-1" />
              </div>
              <span className="text-slate-500 dark:text-slate-400 text-xs">
                {recommendCount.toLocaleString()} of {surveyTotal.toLocaleString()} respondents
              </span>
            </div>

            {/* Response Rate */}
            <div className="flex flex-col items-start gap-2">
              <span className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-medium">
                Response Rate
              </span>
              <span className="font-sora text-4xl text-violet-600 dark:text-violet-400 leading-none">
                {totalClients > 0 ? ((surveyTotal / totalClients) * 100).toFixed(0) : "0"}%
              </span>
              <div className="h-1.5 w-full max-w-[120px] bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 dark:bg-violet-400 rounded-full"
                  style={{ width: `${totalClients > 0 ? (surveyTotal / totalClients) * 100 : 0}%` }}
                />
              </div>
              <span className="text-slate-500 dark:text-slate-400 text-xs">of all clients surveyed</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
