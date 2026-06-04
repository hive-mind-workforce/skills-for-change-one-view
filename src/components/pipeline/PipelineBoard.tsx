"use client"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import ProgramBadge from "@/components/ProgramBadge"

// ── Types ────────────────────────────────────────────────────────────────────

interface PipelineClient {
  id: string
  full_name: string
  country_of_origin: string | null
  stage: string | null
  source: string | null
  created_at: string
  program: string | null
  funder: string | null
  enrolled_at: string | null
}

type PipelineData = Record<string, PipelineClient[]>

// ── Stage definitions ────────────────────────────────────────────────────────

const STAGES = [
  { id: "outreach",  label: "Outreach",   color: "#3b82f6", icon: "📣", desc: "Initial contact made" },
  { id: "vetting",   label: "Vetting",    color: "#8b5cf6", icon: "🔍", desc: "Caseworker interview" },
  { id: "eligible",  label: "Eligible",   color: "#f59e0b", icon: "✓",  desc: "Eligibility confirmed" },
  { id: "enrolled",  label: "Enrolled",   color: "#10b981", icon: "📋", desc: "Program enrolled" },
  { id: "training",  label: "Training",   color: "#06b6d4", icon: "🎓", desc: "In training" },
  { id: "placed",    label: "Placed",     color: "#ec4899", icon: "💼", desc: "Job placement secured" },
  { id: "completed", label: "Completed",  color: "#22c55e", icon: "🏆", desc: "Program completed" },
  { id: "dropped",   label: "Dropped",    color: "#ef4444", icon: "⚠",  desc: "Left the program" },
]

// ── Country flags ────────────────────────────────────────────────────────────

const FLAGS: Record<string, string> = {
  IN: "🇮🇳", SO: "🇸🇴", SY: "🇸🇾", PH: "🇵🇭", UA: "🇺🇦", PK: "🇵🇰", IQ: "🇮🇶",
  CN: "🇨🇳", ET: "🇪🇹", IR: "🇮🇷", NP: "🇳🇵", EG: "🇪🇬", VN: "🇻🇳", BD: "🇧🇩",
  NG: "🇳🇬", LK: "🇱🇰", CO: "🇨🇴", JM: "🇯🇲", MX: "🇲🇽", KE: "🇰🇪",
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null
  const ms = Date.now() - new Date(dateStr).getTime()
  return Math.max(0, Math.floor(ms / 86_400_000))
}

function hexWithAlpha(hex: string, alpha: number): string {
  // Convert 6-char hex to rgba
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

// ── Summary row ──────────────────────────────────────────────────────────────

interface SummaryRowProps {
  data: PipelineData
}

function SummaryRow({ data }: SummaryRowProps) {
  const ACTIVE_STAGES = STAGES.filter(s => s.id !== "completed" && s.id !== "dropped").map(s => s.id)

  const activeClients = ACTIVE_STAGES.flatMap(id => data[id] ?? [])
  const totalActive = activeClients.length

  const allDays = activeClients
    .map(c => daysSince(c.enrolled_at ?? c.created_at))
    .filter((d): d is number => d !== null)
  const avgDays = allDays.length > 0 ? Math.round(allDays.reduce((a, b) => a + b, 0) / allDays.length) : 0

  const topStages = ACTIVE_STAGES
    .map(id => ({ id, count: (data[id] ?? []).length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .filter(s => s.count > 0)

  return (
    <div className="glass rounded-xl p-4 mb-6 flex flex-wrap gap-6 items-center">
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium mb-0.5">Active Clients</p>
        <p className="font-sora text-2xl text-slate-900 dark:text-white">{totalActive}</p>
      </div>
      <div className="w-px h-8 bg-slate-200 dark:bg-white/[0.08] hidden sm:block" />
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium mb-0.5">Avg. Days in Pipeline</p>
        <p className="font-sora text-2xl text-slate-900 dark:text-white">{avgDays}</p>
      </div>
      {topStages.length > 0 && (
        <>
          <div className="w-px h-8 bg-slate-200 dark:bg-white/[0.08] hidden sm:block" />
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium mb-1">Busiest Stages</p>
            <div className="flex gap-2">
              {topStages.map(s => {
                const stage = STAGES.find(st => st.id === s.id)
                return (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
                    style={{
                      backgroundColor: hexWithAlpha(stage?.color ?? "#94a3b8", 0.12),
                      borderColor: hexWithAlpha(stage?.color ?? "#94a3b8", 0.3),
                      color: stage?.color ?? "#94a3b8",
                    }}
                  >
                    {stage?.icon} {stage?.label} ({s.count})
                  </span>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Client card ──────────────────────────────────────────────────────────────

interface ClientCardProps {
  client: PipelineClient
  stageColor: string
  onClick: () => void
}

function ClientCard({ client, stageColor, onClick }: ClientCardProps) {
  const initials = getInitials(client.full_name)
  const days = daysSince(client.enrolled_at ?? client.created_at)
  const countryCode = client.country_of_origin?.toUpperCase().slice(0, 2) ?? null
  const flag = countryCode ? (FLAGS[countryCode] ?? null) : null

  return (
    <div
      onClick={onClick}
      className="glass rounded-lg p-3 border-l-2 hover:border-l-4 cursor-pointer transition-all"
      style={{ borderColor: stageColor }}
    >
      <div className="flex items-start gap-2">
        {/* Initials circle */}
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
          style={{
            backgroundColor: hexWithAlpha(stageColor, 0.2),
            color: stageColor,
          }}
        >
          {initials}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-slate-800 dark:text-slate-200 text-sm font-medium leading-tight truncate">
            {client.full_name}
          </p>

          {client.program && (
            <div className="mt-1">
              <ProgramBadge program={client.program} />
            </div>
          )}

          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {flag && countryCode && (
              <span className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-0.5">
                {flag} {countryCode}
              </span>
            )}
            {days !== null && (
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {days}d in pipeline
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Column ───────────────────────────────────────────────────────────────────

interface ColumnProps {
  stage: typeof STAGES[number]
  clients: PipelineClient[]
  onClientClick: (clientId: string) => void
}

function Column({ stage, clients, onClientClick }: ColumnProps) {
  return (
    <div className="flex flex-col min-w-[220px] max-w-[240px] flex-shrink-0">
      {/* Column header */}
      <div
        className="rounded-t-xl px-3 py-2 mb-0"
        style={{ backgroundColor: hexWithAlpha(stage.color, 0.12), borderBottom: `2px solid ${hexWithAlpha(stage.color, 0.4)}` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-base leading-none">{stage.icon}</span>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{stage.label}</span>
          </div>
          <span
            className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold"
            style={{
              backgroundColor: hexWithAlpha(stage.color, 0.25),
              color: stage.color,
            }}
          >
            {clients.length}
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{stage.desc}</p>
      </div>

      {/* Column body */}
      <div className="flex-1 glass rounded-b-xl rounded-tl-none rounded-tr-none p-2 max-h-[60vh] overflow-y-auto space-y-2 pr-1">
        {clients.length === 0 ? (
          <p className="text-center text-xs text-slate-400 dark:text-slate-500 py-4">No clients</p>
        ) : (
          clients.map(client => (
            <ClientCard
              key={client.id}
              client={client}
              stageColor={stage.color}
              onClick={() => onClientClick(client.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ── PipelineBoard (main export) ──────────────────────────────────────────────

export default function PipelineBoard() {
  const [data, setData] = useState<PipelineData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Map DB stage names to component stage IDs
    const STAGE_MAP: Record<string, string> = {
      eligibility: "eligible", intake: "enrolled", placement: "placed",
      complete: "completed", survey: "completed",
    }
    fetch("/api/pipeline")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((raw: any) => {
        if (raw.error) throw new Error(raw.error)
        const grouped: PipelineData = {}
        for (const client of raw.clients ?? []) {
          const dbStage = client.stage ?? "intake"
          const id = STAGE_MAP[dbStage] ?? dbStage
          if (!grouped[id]) grouped[id] = []
          grouped[id].push(client)
        }
        setData(grouped)
      })
      .catch(err => setError(err.message))
  }, [])

  function handleClientClick(clientId: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("clientId", clientId)
    router.push(`/journeys?${params.toString()}`)
  }

  if (error) {
    return (
      <div className="glass rounded-xl p-6 text-center">
        <p className="text-slate-500 dark:text-slate-400 text-sm">Failed to load pipeline: {error}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map(stage => (
          <div
            key={stage.id}
            className="min-w-[220px] max-w-[240px] flex-shrink-0 glass rounded-xl h-48 animate-pulse"
            style={{ borderTop: `3px solid ${hexWithAlpha(stage.color, 0.3)}` }}
          />
        ))}
      </div>
    )
  }

  return (
    <div>
      <SummaryRow data={data} />
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map(stage => (
          <Column
            key={stage.id}
            stage={stage}
            clients={data[stage.id] ?? []}
            onClientClick={handleClientClick}
          />
        ))}
      </div>
    </div>
  )
}
