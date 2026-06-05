"use client"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import {
  Star, Briefcase, TrendingDown, CheckSquare, Globe, Target,
  ThumbsUp, Users, TrendingUp, Lightbulb, Activity, AlertCircle, Quote,
  ChevronDown, ChevronUp, Zap,
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, LineChart, Line, CartesianGrid, PieChart, Pie, Legend,
} from "recharts"
import ProgramBadge from "@/components/ProgramBadge"
import { programColor, programLabel, programShortLabel, countryName } from "@/lib/helpers"

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
  total: number
  placed: number
  dropped: number
  avg_satisfaction: number | null
  recommend_pct: number | null
  survey_count: number
}

interface StageProgramRow {
  stage: string
  program: string
  count: string | number
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

interface Testimonial {
  success_story: string
  satisfaction: number
  program: string
  full_name: string
}

interface BarrierRow {
  barriers: string
  program: string
  count: string | number
}

interface AnalyticsData {
  byCountry: ByCountryRow[]
  byAgeGroup: ByAgeGroupRow[]
  byGender: ByGenderRow[]
  bySource: BySourceRow[]
  byProgram: ByProgramRow[]
  stageByProgram: StageProgramRow[]
  surveyStats: SurveyStats
  placementCount: string | number
  droppedCount: string | number
  totalClients: string | number
  monthlyTrend?: MonthlyRow[]
  testimonials?: Testimonial[]
  barriersByProgram?: BarrierRow[]
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
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null)
  const [surveyProgram, setSurveyProgram] = useState<string>("all")
  const [interval, setInterval] = useState<string>("all")
  const [aiInsights, setAiInsights] = useState<Array<{ title: string; body: string; type: string; program: string }> | null>(null)
  const [insightsLoading, setInsightsLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    setSelectedProgram(null)
    fetch(`/api/analytics${interval !== "all" ? `?interval=${interval}` : ""}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((raw: any) => {
        const stageRows: any[] = raw.byStage ?? []
        const placementCount = stageRows
          .filter((r: any) => ["complete", "survey", "placement"].includes(r.stage))
          .reduce((sum: number, r: any) => sum + Number(r.count), 0)
        const droppedCount = Number(stageRows.find((r: any) => r.stage === "dropped")?.count ?? 0)
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
            avg_satisfaction: p.avg_satisfaction != null ? Number(p.avg_satisfaction) : null,
            recommend_pct: p.recommend_pct != null ? Number(p.recommend_pct) : null,
            survey_count: Number(p.survey_count ?? 0),
          })),
          stageByProgram: raw.stageByProgram ?? [],
          testimonials: (raw.testimonials ?? []).map((t: any) => ({
            success_story: String(t.success_story ?? ""),
            satisfaction: Number(t.satisfaction ?? 0),
            program: String(t.program ?? ""),
            full_name: String(t.full_name ?? ""),
          })),
          barriersByProgram: raw.barriersByProgram ?? [],
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
  }, [interval])

  // Fetch AI insights once data is available
  useEffect(() => {
    if (!data) return
    setAiInsights(null)
    setInsightsLoading(true)
    const summary = {
      totalClients: data.totalClients,
      programPerformance: data.byProgram?.slice(0, 8),
      surveyStats: data.surveyStats,
      bySource: data.bySource?.slice(0, 5),
      byCountry: data.byCountry?.slice(0, 5),
    }
    fetch("/api/ai-insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analytics: summary }),
    })
      .then(r => r.json())
      .then(res => {
        if (res.insights?.length) setAiInsights(res.insights)
      })
      .catch(() => {})
      .finally(() => setInsightsLoading(false))
  }, [data])

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
  const terminalClients = placementCount + droppedCount || 1
  const placementPct = Math.round((placementCount / terminalClients) * 100).toString()
  const dropoffPct = Math.round((droppedCount / terminalClients) * 100).toString()
  const recommendPct = surveyTotal > 0 ? ((recommendCount / surveyTotal) * 100).toFixed(0) : "0"

  // World map data
  const countryData = (data.byCountry ?? []).map((r) => ({
    code: r.country_of_origin,
    count: Number(r.count),
  }))

  // Program data
  const byProgram = data.byProgram ?? []

  // Per-program stage breakdown for drill-down
  const stageByProgram = data.stageByProgram ?? []

  // Avg outcome rate across all programs for comparison
  const avgOutcomeRate = byProgram.length > 0
    ? byProgram.reduce((s, p) => s + (p.total > 0 ? (p.placed / p.total) * 100 : 0), 0) / byProgram.length
    : 0

  // Programs below average (need attention)
  const belowAvgPrograms = byProgram.filter(p => p.total > 0 && (p.placed / p.total) * 100 < avgOutcomeRate - 5)
  const aboveAvgPrograms = byProgram.filter(p => p.total > 0 && (p.placed / p.total) * 100 > avgOutcomeRate + 10)

  // Selected program detail
  const selectedProgramData = selectedProgram ? byProgram.find(p => p.program === selectedProgram) ?? null : null
  const selectedStages = stageByProgram
    .filter((r: any) => r.program === selectedProgram)
    .map((r: any) => ({ stage: String(r.stage), count: Number(r.count) }))
    .sort((a, b) => {
      const ORDER = ["outreach","vetting","eligibility","intake","training","placement","survey","complete"]
      return ORDER.indexOf(a.stage) - ORDER.indexOf(b.stage)
    })

  // Age group data sorted
  const ageData = AGE_GROUP_ORDER
    .map((ag) => {
      const row = (data.byAgeGroup ?? []).find((r) => r.age_group === ag)
      return { label: AGE_GROUP_LABEL[ag] ?? ag, count: Number(row?.count ?? 0) }
    })
    .filter((d) => d.count > 0)

  const maxAge = Math.max(1, ...ageData.map((d) => d.count))

  // Gender data: normalize legacy seed values to inclusive labels
  const KNOWN_GENDERS = new Set(["Woman","Man","Non-binary","Two-Spirit","Transgender woman","Transgender man","Genderfluid","Agender","Gender non-conforming","Genderqueer","Bigender","Questioning","Prefer not to say","Neutrois","Demi-girl"])
  const GENDER_LABEL: Record<string, string> = {
    female: "Woman", male: "Man", non_binary: "Non-binary", prefer_not_to_say: "Prefer not to say",
  }
  function normalizeGender(raw: string): string {
    if (GENDER_LABEL[raw]) return GENDER_LABEL[raw]
    if (KNOWN_GENDERS.has(raw)) return raw
    return `Self-described`
  }
  const genderData = (data.byGender ?? []).map((r) => ({
    label: normalizeGender(String(r.gender)),
    count: Number(r.count),
  }))
  const totalGender = genderData.reduce((s, r) => s + r.count, 0) || 1

  const GENDER_COLORS = [
    "text-indigo-600 dark:text-indigo-400", "text-rose-600 dark:text-rose-400",
    "text-cyan-600 dark:text-cyan-400", "text-amber-600 dark:text-amber-400",
    "text-violet-600 dark:text-violet-400", "text-emerald-600 dark:text-emerald-400",
    "text-pink-600 dark:text-pink-400", "text-sky-600 dark:text-sky-400",
    "text-orange-600 dark:text-orange-400", "text-teal-600 dark:text-teal-400",
  ]
  const GENDER_BG = [
    "bg-indigo-500", "bg-rose-500", "bg-cyan-500", "bg-amber-500",
    "bg-violet-500", "bg-emerald-500", "bg-pink-500", "bg-sky-500",
    "bg-orange-500", "bg-teal-500",
  ]

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
  const topProgram = byProgram.length > 0 ? byProgram.reduce((a, b) => (b.total > a.total ? b : a), byProgram[0]) : null
  const bestOutcomeProgram = byProgram.length > 0 ? byProgram.reduce((a, b) => {
    const pctA = a.total > 0 ? a.placed / a.total : 0
    const pctB = b.total > 0 ? b.placed / b.total : 0
    return pctB > pctA ? b : a
  }, byProgram[0]) : null
  const worstOutcomeProgram = byProgram.length > 0 ? byProgram.filter(p => p.total > 100).reduce((a, b) => {
    const pctA = a.total > 0 ? a.placed / a.total : 1
    const pctB = b.total > 0 ? b.placed / b.total : 1
    return pctB < pctA ? b : a
  }, byProgram.filter(p => p.total > 100)[0] ?? byProgram[0]) : null
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

  // Testimonials filtered by selected survey program
  const allTestimonials: Testimonial[] = data.testimonials ?? []
  const filteredTestimonials = surveyProgram === "all"
    ? allTestimonials
    : allTestimonials.filter(t => t.program === surveyProgram)

  // Top barriers aggregated for the selected program
  const barriersByProgram: BarrierRow[] = data.barriersByProgram ?? []
  const topBarriers = (surveyProgram === "all"
    ? Object.entries(barriersByProgram.reduce((acc: Record<string, number>, r) => {
        acc[r.barriers] = (acc[r.barriers] ?? 0) + Number(r.count); return acc
      }, {})).map(([b, c]) => ({ barriers: b, count: c }))
    : barriersByProgram.filter(r => r.program === surveyProgram).map(r => ({ barriers: r.barriers, count: Number(r.count) }))
  ).sort((a, b) => Number(b.count) - Number(a.count)).slice(0, 5)

  // Per-program satisfaction for the survey view
  const programSurveyStats = byProgram.filter(p => p.survey_count > 0 && p.avg_satisfaction != null)

  const INTERVALS = [
    { key: "1d", label: "24h" },
    { key: "7d", label: "7 days" },
    { key: "30d", label: "30 days" },
    { key: "90d", label: "Quarter" },
    { key: "180d", label: "6 months" },
    { key: "365d", label: "1 year" },
    { key: "all", label: "All time" },
  ]

  return (
    <div className="space-y-8">

      {/* ------------------------------------------------------------------ */}
      {/* 0. TIME INTERVAL SELECTOR                                            */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Showing:</span>
        {INTERVALS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setInterval(key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${interval === key ? "bg-emerald-500 text-white" : "glass border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06]"}`}
          >
            {label}
          </button>
        ))}
        {loading && <span className="text-xs text-slate-400 animate-pulse ml-2">Loading…</span>}
      </div>

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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <h2 className="font-sora text-xl text-slate-900 dark:text-white">Program Performance</h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">Click a program to drill down</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {byProgram.map(({ program, total, placed, avg_satisfaction, recommend_pct, survey_count }) => {
            const placePct = total > 0 ? (placed / total) * 100 : 0
            const color = programColor(program)
            const isSelected = selectedProgram === program
            const isBelow = total > 100 && placePct < avgOutcomeRate - 5
            return (
              <button
                key={program}
                onClick={() => setSelectedProgram(isSelected ? null : program)}
                className={`glass rounded-xl p-4 flex flex-col gap-3 text-left transition-all duration-200 ${isSelected ? "ring-2 ring-emerald-500/60 bg-emerald-500/[0.04]" : "glass-hover"}`}
              >
                <div className="flex items-center justify-between">
                  <ProgramBadge program={program} />
                  <div className="flex items-center gap-1">
                    {isBelow && <AlertCircle size={12} className="text-amber-500" />}
                    <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                      {total.toLocaleString()}
                    </span>
                    {isSelected ? <ChevronUp size={12} className="text-slate-400" /> : <ChevronDown size={12} className="text-slate-400" />}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Outcome rate</span>
                    <span className="font-medium" style={{ color }}>{placePct.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${placePct}%`, background: color }} />
                  </div>
                </div>

                {avg_satisfaction != null && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Satisfaction</span>
                    <span className="text-amber-600 dark:text-amber-400 font-medium">{avg_satisfaction.toFixed(1)}/5</span>
                  </div>
                )}

                {survey_count > 0 && recommend_pct != null && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Recommend</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">{recommend_pct.toFixed(0)}%</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Drill-down panel */}
        {selectedProgramData && (
          <div className="mt-4 glass rounded-xl p-5 border border-emerald-500/20 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-sora text-lg text-slate-900 dark:text-white">{programLabel(selectedProgramData.program)}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{selectedProgramData.total.toLocaleString()} enrolled clients</p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-right">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Outcome rate</p>
                  <p className="font-sora text-xl font-bold" style={{ color: programColor(selectedProgramData.program) }}>
                    {selectedProgramData.total > 0 ? ((selectedProgramData.placed / selectedProgramData.total) * 100).toFixed(0) : 0}%
                  </p>
                </div>
                {selectedProgramData.avg_satisfaction != null && (
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Avg satisfaction</p>
                    <p className="font-sora text-xl font-bold text-amber-600 dark:text-amber-400">{selectedProgramData.avg_satisfaction.toFixed(1)}/5</p>
                  </div>
                )}
                {selectedProgramData.recommend_pct != null && (
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Recommend</p>
                    <p className="font-sora text-xl font-bold text-emerald-600 dark:text-emerald-400">{selectedProgramData.recommend_pct.toFixed(0)}%</p>
                  </div>
                )}
              </div>
            </div>

            {selectedStages.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium mb-3">Client Pipeline</p>
                <div className="flex gap-1 items-end h-24">
                  {selectedStages.map(({ stage, count }) => {
                    const maxCount = Math.max(...selectedStages.map(s => s.count))
                    const pct = maxCount > 0 ? (count / maxCount) * 100 : 0
                    return (
                      <div key={stage} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs text-slate-500 dark:text-slate-400">{count >= 1000 ? (count/1000).toFixed(1)+"k" : count}</span>
                        <div className="w-full rounded-t-sm transition-all" style={{ height: `${Math.max(pct, 4)}%`, background: programColor(selectedProgramData.program), opacity: 0.6 + pct * 0.004 }} />
                        <span className="text-[10px] text-slate-400 capitalize truncate w-full text-center">{stage}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/[0.06] border border-blue-500/20">
              <Lightbulb size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {selectedProgramData.total > 0 && (selectedProgramData.placed / selectedProgramData.total) * 100 < avgOutcomeRate - 5
                  ? `Outcome rate is ${(avgOutcomeRate - (selectedProgramData.placed / selectedProgramData.total) * 100).toFixed(0)}pts below the org average. Consider additional caseworker support and barrier assessment for clients in the training stage.`
                  : selectedProgramData.total > 0 && (selectedProgramData.placed / selectedProgramData.total) * 100 > avgOutcomeRate + 10
                  ? `Top performer: ${(((selectedProgramData.placed / selectedProgramData.total) * 100) - avgOutcomeRate).toFixed(0)}pts above org average. Document the service model and consider replicating approaches across other programs.`
                  : `Performing close to the org average of ${avgOutcomeRate.toFixed(0)}%. Monitor intake funnel and training completion rates to identify optimization opportunities.`}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 4. DEMOGRAPHIC BREAKDOWN                                             */}
      {/* ------------------------------------------------------------------ */}
      <section id="analytics-demographics">
        <div className="flex items-center gap-2 mb-4">
          <Users size={18} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <h2 className="font-sora text-xl text-slate-900 dark:text-white">Demographic Breakdown</h2>
        </div>
        <div className="grid grid-cols-1 gap-6">

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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lightbulb size={18} className="text-amber-500 flex-shrink-0" />
              <h2 className="font-sora text-xl text-slate-900 dark:text-white">Actionable Insights</h2>
            </div>
            <div className="flex items-center gap-2">
              {insightsLoading && (
                <span className="text-xs text-slate-400 animate-pulse">AI analyzing…</span>
              )}
              {!insightsLoading && aiInsights && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/[0.08] border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <Zap size={10} /> AI-powered
                </span>
              )}
              {!insightsLoading && !aiInsights && (
                <span className="text-xs text-slate-400">Calculated from live data</span>
              )}
            </div>
          </div>

          {/* AI insights panel */}
          {aiInsights && aiInsights.length > 0 && (
            <div className="space-y-3 mb-3">
              {aiInsights.map((insight, i) => {
                const colorMap = {
                  success: { bg: "bg-emerald-500/[0.05] border-emerald-500/20", icon: "text-emerald-500", Icon: TrendingUp },
                  warning: { bg: "bg-amber-500/[0.05] border-amber-500/20", icon: "text-amber-500", Icon: AlertCircle },
                  info: { bg: "bg-blue-500/[0.05] border-blue-500/20", icon: "text-blue-500", Icon: Lightbulb },
                }
                const style = colorMap[insight.type as keyof typeof colorMap] ?? colorMap.info
                const Icon = style.Icon
                return (
                  <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${style.bg}`}>
                    <Icon size={16} className={`${style.icon} flex-shrink-0 mt-0.5`} />
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{insight.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{insight.body}</p>
                      {insight.program && insight.program !== "all" && (
                        <div className="mt-1"><ProgramBadge program={insight.program} /></div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Rule-based insights (shown while loading or as fallback) */}
          {(!aiInsights || insightsLoading) && (
          <div className="space-y-3">
            {/* Best performer */}
            {bestOutcomeProgram && bestOutcomeProgram.total > 0 && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/20">
                <TrendingUp size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {programLabel(bestOutcomeProgram.program)} leads with {((bestOutcomeProgram.placed / bestOutcomeProgram.total) * 100).toFixed(0)}% outcome rate
                    {avgOutcomeRate > 0 && ` (${(((bestOutcomeProgram.placed / bestOutcomeProgram.total) * 100) - avgOutcomeRate).toFixed(0)}pts above avg)`}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Document and replicate the service model. Share best practices across caseworker teams.
                  </p>
                </div>
              </div>
            )}

            {/* Programs needing attention */}
            {belowAvgPrograms.length > 0 && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/[0.05] border border-amber-500/20">
                <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {belowAvgPrograms.length} program{belowAvgPrograms.length > 1 ? "s" : ""} below average outcome rate: {belowAvgPrograms.map(p => programShortLabel(p.program)).join(", ")}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Review intake-to-training conversion. Consider caseload review and eligibility bottleneck analysis.
                  </p>
                </div>
              </div>
            )}

            {/* Top source */}
            {topSource && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-500/[0.05] border border-indigo-500/20">
                <Users size={16} className="text-indigo-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {Number(topSource.count).toLocaleString()} clients reached via {topSource.source.charAt(0).toUpperCase() + topSource.source.slice(1)}, your strongest intake channel
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {sourceData.length > 1 && sourceData[1]
                      ? `Second channel (${sourceData[1].source}) brings ${Number(sourceData[1].count).toLocaleString()}. Invest in both to diversify intake risk.`
                      : "Diversify intake channels to reduce dependency on a single source."}
                  </p>
                </div>
              </div>
            )}

            {/* Satisfaction insight */}
            {avgSatisfaction > 0 && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-violet-500/[0.05] border border-violet-500/20">
                <Star size={16} className="text-violet-500 flex-shrink-0 mt-0.5 fill-violet-500" />
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {avgSatisfaction >= 4.0
                      ? `Client satisfaction is strong at ${avgSatisfaction.toFixed(1)}/5, above the sector benchmark of 3.8`
                      : `Client satisfaction (${avgSatisfaction.toFixed(1)}/5) is below the 4.0 target; review service gaps`}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {surveyTotal > 0
                      ? `Based on ${surveyTotal.toLocaleString()} survey responses. ${recommendPct}% would recommend Skills for Change to others.`
                      : "Increase survey completion rate to improve reporting confidence."}
                  </p>
                </div>
              </div>
            )}

            {/* Country diversity */}
            {topCountry && Number(topCountry.count) > 0 && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-cyan-500/[0.05] border border-cyan-500/20">
                <Globe size={16} className="text-cyan-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    Clients from {(data.byCountry ?? []).length} countries; top origin is {countryName(topCountry.country_of_origin)} ({Number(topCountry.count).toLocaleString()} clients, {((Number(topCountry.count) / totalClients) * 100).toFixed(0)}% of total)
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Ensure language and cultural support capacity matches top-origin communities. Review language training waitlists.
                  </p>
                </div>
              </div>
            )}

            {/* Above-average programs */}
            {aboveAvgPrograms.length > 1 && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/[0.05] border border-blue-500/20">
                <CheckSquare size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {aboveAvgPrograms.length} programs consistently exceed targets: {aboveAvgPrograms.map(p => programShortLabel(p.program)).join(", ")}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Allocate these as showcase programs for funder reporting and board presentations.
                  </p>
                </div>
              </div>
            )}
          </div>
          )}
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
        <div className="space-y-4">
          {/* Header + program selector */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckSquare size={18} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <h2 className="font-sora text-xl text-slate-900 dark:text-white">Survey Insights</h2>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["all", ...byProgram.filter(p => p.survey_count > 0 && p.program !== "mental_health").map(p => p.program)].map(prog => (
                <button
                  key={prog}
                  onClick={() => setSurveyProgram(prog)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${surveyProgram === prog ? "bg-emerald-500 text-white" : "glass border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06]"}`}
                >
                  {prog === "all" ? "All Programs" : programShortLabel(prog)}
                </button>
              ))}
            </div>
          </div>

          {/* Org-level metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Avg Satisfaction", value: (() => {
                if (surveyProgram === "all") return avgSatisfaction.toFixed(1) + "/5"
                const p = byProgram.find(x => x.program === surveyProgram)
                return p?.avg_satisfaction != null ? p.avg_satisfaction.toFixed(1) + "/5" : "N/A"
              })(), color: "text-amber-600 dark:text-amber-400", icon: Star },
              { label: "Would Recommend", value: (() => {
                if (surveyProgram === "all") return recommendPct + "%"
                const p = byProgram.find(x => x.program === surveyProgram)
                return p?.recommend_pct != null ? p.recommend_pct.toFixed(0) + "%" : "N/A"
              })(), color: "text-emerald-600 dark:text-emerald-400", icon: ThumbsUp },
              { label: "Survey Responses", value: (() => {
                if (surveyProgram === "all") return surveyTotal.toLocaleString()
                const p = byProgram.find(x => x.program === surveyProgram)
                return p ? p.survey_count.toLocaleString() : "0"
              })(), color: "text-violet-600 dark:text-violet-400", icon: CheckSquare },
              { label: "Response Rate", value: (() => {
                if (surveyProgram === "all") return totalClients > 0 ? ((surveyTotal / totalClients) * 100).toFixed(0) + "%" : "0%"
                const p = byProgram.find(x => x.program === surveyProgram)
                return p && p.total > 0 ? ((p.survey_count / p.total) * 100).toFixed(0) + "%" : "0%"
              })(), color: "text-indigo-600 dark:text-indigo-400", icon: Activity },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} className="glass rounded-xl p-4 flex flex-col gap-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
                <span className={`font-sora text-2xl font-bold ${color}`}>{value}</span>
              </div>
            ))}
          </div>

          {/* Per-program satisfaction comparison (only shown for "all") */}
          {surveyProgram === "all" && programSurveyStats.length > 0 && (
            <div className="glass rounded-xl p-5">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium mb-3">Satisfaction by Program</p>
              <div className="space-y-2.5">
                {programSurveyStats.sort((a, b) => (b.avg_satisfaction ?? 0) - (a.avg_satisfaction ?? 0)).map(p => (
                  <div key={p.program} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 dark:text-slate-400 w-28 flex-shrink-0">{programShortLabel(p.program)}</span>
                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${((p.avg_satisfaction ?? 0) / 5) * 100}%`, background: programColor(p.program) }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-200 w-10 text-right">{p.avg_satisfaction?.toFixed(1)}/5</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top barriers */}
          {topBarriers.length > 0 && (
            <div className="glass rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={14} className="text-amber-500 flex-shrink-0" />
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">Top Barriers to Progress</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {topBarriers.map(({ barriers, count }) => (
                  <span key={barriers} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border border-amber-500/30 bg-amber-500/[0.06] text-amber-700 dark:text-amber-300">
                    {barriers}
                    <span className="text-amber-500 font-semibold">{Number(count).toLocaleString()}</span>
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Address these barriers in program design and intake support to improve completion rates.
              </p>
            </div>
          )}

          {/* Testimonials */}
          {filteredTestimonials.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Quote size={16} className="text-emerald-500 flex-shrink-0" />
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">Client Testimonials</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredTestimonials.slice(0, 6).map((t, i) => (
                  <div key={i} className="glass rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex items-start gap-2">
                      <Quote size={14} className="text-emerald-400 flex-shrink-0 mt-0.5 rotate-180" />
                      <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">{t.success_story}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{t.full_name}</span>
                        <ProgramBadge program={t.program} />
                      </div>
                      <StarRating rating={t.satisfaction} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

    </div>
  )
}
