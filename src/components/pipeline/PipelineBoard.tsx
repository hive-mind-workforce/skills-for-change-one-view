"use client"
import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, X, CheckCircle, ChevronRight, ArrowRight } from "lucide-react"
import ProgramBadge from "@/components/ProgramBadge"
import { programShortLabel, programColor, countryName } from "@/lib/helpers"

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
  { id: "outreach",  label: "Outreach",   color: "#3b82f6", icon: "📣", desc: "Initial contact made",           dbStage: "outreach"    },
  { id: "vetting",   label: "Vetting",    color: "#8b5cf6", icon: "🔍", desc: "Caseworker interview",           dbStage: "vetting"     },
  { id: "eligible",  label: "Eligible",   color: "#f59e0b", icon: "✓",  desc: "Eligibility confirmed",          dbStage: "eligibility" },
  { id: "enrolled",  label: "Enrolled",   color: "#10b981", icon: "📋", desc: "Program enrolled",               dbStage: "intake"      },
  { id: "training",  label: "Training",   color: "#06b6d4", icon: "🎓", desc: "In training",                    dbStage: "training"    },
  { id: "placed",    label: "Placed",     color: "#ec4899", icon: "💼", desc: "Placement secured",              dbStage: "placement"   },
  { id: "survey",    label: "Survey",     color: "#a855f7", icon: "📧", desc: "Awaiting survey response",       dbStage: "survey"      },
  { id: "completed", label: "Completed",  color: "#22c55e", icon: "🏆", desc: "Program completed",              dbStage: "complete"    },
  { id: "dropped",   label: "Dropped",    color: "#6b7280", icon: "⚠",  desc: "Client dropped off program",    dbStage: "dropped"     },
]

const DB_STAGE_MAP: Record<string, string> = {
  eligibility: "eligible", intake: "enrolled", placement: "placed",
  complete: "completed",
}

// Confirmation requirement per destination stage
const STAGE_CONFIRM: Record<string, string> = {
  enrolled:  "Client consent form signed and filed",
  placed:    "Employer and role details confirmed",
  survey:    "Exit survey email sent to client",
  completed: "Survey response received and reviewed",
  dropped:   "Confirm client has formally dropped off the program",
}

const ALL_PROGRAMS = ["settlement","employment","language","mental_health","trades","mentoring","youth","women"]

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

function hexAlpha(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${a})`
}

// ── Client card ──────────────────────────────────────────────────────────────

interface ClientCardProps {
  client: PipelineClient
  stageColor: string
  isDragging: boolean
  onDragStart: (e: React.DragEvent) => void
  onDragEnd: () => void
  onClick: () => void
}

function ClientCard({ client, stageColor, isDragging, onDragStart, onDragEnd, onClick }: ClientCardProps) {
  const initials = getInitials(client.full_name)
  const days = daysSince(client.enrolled_at ?? client.created_at)
  const country = client.country_of_origin ? countryName(client.country_of_origin) : null

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`glass rounded-lg p-3 border-l-2 cursor-pointer transition-all select-none
        ${isDragging ? "opacity-40 scale-95" : "hover:border-l-4"}`}
      style={{ borderColor: stageColor }}
    >
      <div className="flex items-start gap-2">
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
          style={{ backgroundColor: hexAlpha(stageColor, 0.2), color: stageColor }}
        >
          {initials}
        </div>
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
            {country && (
              <span className="text-slate-500 dark:text-slate-400 text-xs truncate max-w-[90px]">{country}</span>
            )}
            {days !== null && (
              <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">
                {days}d
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Stage column ─────────────────────────────────────────────────────────────

interface ColumnProps {
  stage: typeof STAGES[number]
  clients: PipelineClient[]
  isDragOver: boolean
  draggingClientId: string | null
  pendingCount?: number
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent) => void
  onDragStart: (clientId: string, fromStage: string) => void
  onDragEnd: () => void
  onClientClick: (clientId: string) => void
}

function Column({
  stage, clients, isDragOver, draggingClientId, pendingCount,
  onDragOver, onDragLeave, onDrop, onDragStart, onDragEnd, onClientClick,
}: ColumnProps) {
  return (
    <div className="flex flex-col min-w-[220px] max-w-[240px] flex-shrink-0">
      <div
        className="rounded-t-xl px-3 py-2"
        style={{
          backgroundColor: hexAlpha(stage.color, 0.12),
          borderBottom: `2px solid ${hexAlpha(stage.color, 0.4)}`,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-base leading-none">{stage.icon}</span>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{stage.label}</span>
          </div>
          <span
            className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold"
            style={{ backgroundColor: hexAlpha(stage.color, 0.25), color: stage.color }}
          >
            {clients.length}
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{stage.desc}</p>
        {pendingCount !== undefined && pendingCount > 0 && (
          <div className="mt-1.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/25 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">{pendingCount} awaiting response</span>
          </div>
        )}
      </div>

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`flex-1 rounded-b-xl p-2 max-h-[60vh] overflow-y-auto space-y-2 pr-1 transition-colors
          ${isDragOver
            ? "bg-white/[0.08] ring-2 ring-inset"
            : "glass"
          }`}
        style={isDragOver ? { outline: `2px solid ${hexAlpha(stage.color, 0.6)}`, outlineOffset: "-2px" } : {}}
      >
        {clients.length === 0 && !isDragOver && (
          <p className="text-center text-xs text-slate-400 dark:text-slate-500 py-4">No clients</p>
        )}
        {isDragOver && clients.length === 0 && (
          <div className="flex items-center justify-center py-4 text-xs rounded-lg border-2 border-dashed"
            style={{ borderColor: hexAlpha(stage.color, 0.5), color: stage.color }}>
            Drop here
          </div>
        )}
        {clients.map(client => (
          <ClientCard
            key={client.id}
            client={client}
            stageColor={stage.color}
            isDragging={draggingClientId === client.id}
            onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; onDragStart(client.id, stage.id) }}
            onDragEnd={onDragEnd}
            onClick={() => onClientClick(client.id)}
          />
        ))}
        {isDragOver && clients.length > 0 && (
          <div className="flex items-center justify-center py-2 text-xs rounded-lg border-2 border-dashed"
            style={{ borderColor: hexAlpha(stage.color, 0.5), color: stage.color }}>
            Drop here
          </div>
        )}
      </div>
    </div>
  )
}

// ── Move dialog ──────────────────────────────────────────────────────────────

interface MoveDialogProps {
  clientName: string
  fromStage: string
  toStage: string
  note: string
  onNoteChange: (v: string) => void
  confirmed: boolean
  onConfirmedChange: (v: boolean) => void
  busy: boolean
  onConfirm: () => void
  onCancel: () => void
}

function MoveDialog({
  clientName, fromStage, toStage, note, onNoteChange,
  confirmed, onConfirmedChange, busy, onConfirm, onCancel,
}: MoveDialogProps) {
  const fromDef = STAGES.find(s => s.id === fromStage)
  const toDef = STAGES.find(s => s.id === toStage)
  const confirmText = STAGE_CONFIRM[toStage]
  const canConfirm = !confirmText || confirmed

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative glass rounded-2xl p-6 w-full max-w-md shadow-2xl border border-white/[0.12]">
        <h3 className="font-sora text-lg text-slate-900 dark:text-white mb-1">Move Client</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
          <span className="font-medium text-slate-700 dark:text-slate-300">{clientName}</span>
        </p>

        <div className="flex items-center gap-3 mb-5 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.04]">
          <span className="px-2 py-1 rounded-lg text-xs font-medium"
            style={{ backgroundColor: hexAlpha(fromDef?.color ?? "#94a3b8", 0.15), color: fromDef?.color ?? "#94a3b8" }}>
            {fromDef?.icon} {fromDef?.label}
          </span>
          <ArrowRight size={14} className="text-slate-400 flex-shrink-0" />
          <span className="px-2 py-1 rounded-lg text-xs font-medium"
            style={{ backgroundColor: hexAlpha(toDef?.color ?? "#94a3b8", 0.15), color: toDef?.color ?? "#94a3b8" }}>
            {toDef?.icon} {toDef?.label}
          </span>
        </div>

        {confirmText && (
          <label className="flex items-start gap-3 mb-4 cursor-pointer">
            <div
              onClick={() => onConfirmedChange(!confirmed)}
              className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors ${confirmed ? "bg-emerald-500 border-emerald-500" : "border-slate-300 dark:border-slate-600"}`}
            >
              {confirmed && <CheckCircle size={10} className="text-white" />}
            </div>
            <span className="text-sm text-slate-700 dark:text-slate-300">{confirmText}</span>
          </label>
        )}

        <div className="mb-4">
          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Add a note (optional)</label>
          <textarea
            value={note}
            onChange={e => onNoteChange(e.target.value)}
            placeholder="e.g. Client has started at ABC Corp, follow up in 30 days…"
            rows={3}
            className="w-full glass rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          />
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg glass border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 text-sm hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!canConfirm || busy}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-medium transition-colors flex items-center gap-1.5"
          >
            {busy ? "Moving…" : (
              <>
                Confirm <ChevronRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Summary row ──────────────────────────────────────────────────────────────

function SummaryRow({ data }: { data: PipelineData }) {
  const ACTIVE = STAGES.filter(s => s.id !== "completed").map(s => s.id)
  const active = ACTIVE.flatMap(id => data[id] ?? [])
  const allDays = active
    .map(c => daysSince(c.enrolled_at ?? c.created_at))
    .filter((d): d is number => d !== null)
  const avgDays = allDays.length > 0 ? Math.round(allDays.reduce((a, b) => a + b, 0) / allDays.length) : 0
  const busiest = ACTIVE
    .map(id => ({ id, count: (data[id] ?? []).length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 2)
    .filter(s => s.count > 0)

  return (
    <div className="glass rounded-xl p-4 mb-5 flex flex-wrap gap-6 items-center">
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium mb-0.5">Active</p>
        <p className="font-sora text-2xl text-slate-900 dark:text-white">{active.length}</p>
      </div>
      <div className="w-px h-8 bg-slate-200 dark:bg-white/[0.08] hidden sm:block" />
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium mb-0.5">Avg Days</p>
        <p className="font-sora text-2xl text-slate-900 dark:text-white">{avgDays}</p>
      </div>
      {busiest.length > 0 && (
        <>
          <div className="w-px h-8 bg-slate-200 dark:bg-white/[0.08] hidden sm:block" />
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium mb-1">Busiest</p>
            <div className="flex gap-1.5">
              {busiest.map(s => {
                const def = STAGES.find(st => st.id === s.id)
                return (
                  <span key={s.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
                    style={{ backgroundColor: hexAlpha(def?.color ?? "#94a3b8", 0.12), borderColor: hexAlpha(def?.color ?? "#94a3b8", 0.3), color: def?.color }}>
                    {def?.icon} {def?.label} ({s.count})
                  </span>
                )
              })}
            </div>
          </div>
        </>
      )}
      <div className="ml-auto text-xs text-slate-400 hidden sm:block">
        Drag cards between columns to move clients
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export default function PipelineBoard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [raw, setRaw] = useState<PipelineClient[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Restore filters when returning from journeys
  const restoreSearch = searchParams.get("restoreSearch") ?? ""
  const restorePrograms = searchParams.get("restorePrograms") ?? ""
  const [search, setSearch] = useState(restoreSearch)
  const [selectedPrograms, setSelectedPrograms] = useState<Set<string>>(
    restorePrograms ? new Set(restorePrograms.split(",")) : new Set()
  )
  const [dragClientId, setDragClientId] = useState<string | null>(null)
  const [dragFromStage, setDragFromStage] = useState<string | null>(null)
  const [dragOverStage, setDragOverStage] = useState<string | null>(null)
  const [pendingMove, setPendingMove] = useState<{
    clientId: string; clientName: string; fromStage: string; toStage: string
  } | null>(null)
  const [moveNote, setMoveNote] = useState("")
  const [moveConfirmed, setMoveConfirmed] = useState(false)
  const [moving, setMoving] = useState(false)
  const boardRef = useRef<HTMLDivElement>(null)

  const [pendingSurveyCount, setPendingSurveyCount] = useState(0)

  useEffect(() => {
    fetch("/api/pipeline")
      .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json() })
      .then((r: any) => {
        if (r.error) throw new Error(r.error)
        setRaw(r.clients ?? [])
      })
      .catch(err => setError(err.message))
    fetch("/api/pending-surveys")
      .then(r => r.json())
      .then(d => setPendingSurveyCount(d.count ?? 0))
      .catch(() => {})
  }, [])

  // Group raw clients into stage buckets
  function groupByStage(clients: PipelineClient[]): PipelineData {
    const grouped: PipelineData = {}
    for (const client of clients) {
      const dbStage = client.stage ?? "intake"
      const stageId = DB_STAGE_MAP[dbStage] ?? dbStage
      if (!grouped[stageId]) grouped[stageId] = []
      grouped[stageId].push(client)
    }
    return grouped
  }

  // Derived data with local moves applied
  const [localMoves, setLocalMoves] = useState<Record<string, string>>({}) // clientId → stageId

  function getEffectiveStage(client: PipelineClient): string {
    if (localMoves[client.id]) return localMoves[client.id]
    const dbStage = client.stage ?? "intake"
    return DB_STAGE_MAP[dbStage] ?? dbStage
  }

  // Programs present in data
  const allPrograms = raw
    ? [...new Set(raw.map(c => c.program).filter(Boolean) as string[])]
      .sort((a, b) => ALL_PROGRAMS.indexOf(a) - ALL_PROGRAMS.indexOf(b))
    : []

  // Filtered and grouped data
  const data: PipelineData = {}
  if (raw) {
    for (const client of raw) {
      const matchSearch = !search || client.full_name.toLowerCase().includes(search.toLowerCase())
      const matchProg = selectedPrograms.size === 0 || (client.program && selectedPrograms.has(client.program))
      if (!matchSearch || !matchProg) continue
      const stageId = getEffectiveStage(client)
      if (!data[stageId]) data[stageId] = []
      data[stageId].push(client)
    }
  }

  function toggleProgram(prog: string) {
    setSelectedPrograms(prev => {
      const next = new Set(prev)
      if (next.has(prog)) next.delete(prog)
      else next.add(prog)
      return next
    })
  }

  function handleDragStart(clientId: string, fromStage: string) {
    setDragClientId(clientId)
    setDragFromStage(fromStage)
  }

  function handleDragEnd() {
    setDragClientId(null)
    setDragFromStage(null)
    setDragOverStage(null)
  }

  function handleDrop(toStageId: string) {
    if (!dragClientId || !dragFromStage || dragFromStage === toStageId) {
      handleDragEnd()
      return
    }
    const client = raw?.find(c => c.id === dragClientId)
    if (!client) { handleDragEnd(); return }
    setPendingMove({ clientId: dragClientId, clientName: client.full_name, fromStage: dragFromStage, toStage: toStageId })
    setMoveConfirmed(false)
    setMoveNote("")
    handleDragEnd()
  }

  async function handleMoveConfirm() {
    if (!pendingMove) return
    setMoving(true)
    const toStageDef = STAGES.find(s => s.id === pendingMove.toStage)
    const dbStage = toStageDef?.dbStage ?? pendingMove.toStage

    try {
      await fetch(`/api/clients/${pendingMove.clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: dbStage }),
      })
      if (moveNote.trim()) {
        await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientId: pendingMove.clientId,
            author: "Caseworker",
            content: `Moved to ${toStageDef?.label ?? pendingMove.toStage}: ${moveNote.trim()}`,
            noteType: "progress",
          }),
        })
      }
      setLocalMoves(prev => ({ ...prev, [pendingMove.clientId]: pendingMove.toStage }))
    } catch {
      // move failed silently; local state not updated
    }
    setPendingMove(null)
    setMoveNote("")
    setMoving(false)
  }

  function handleClientClick(clientId: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("clientId", clientId)
    params.set("fromPipeline", "1")
    if (search) params.set("pSearch", search)
    if (selectedPrograms.size > 0) params.set("pPrograms", [...selectedPrograms].join(","))
    router.push(`/journeys?${params.toString()}`)
  }

  if (error) {
    return (
      <div className="glass rounded-xl p-6 text-center">
        <p className="text-slate-500 dark:text-slate-400 text-sm">Failed to load pipeline: {error}</p>
      </div>
    )
  }

  if (!raw) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map(stage => (
          <div key={stage.id} className="min-w-[220px] max-w-[240px] flex-shrink-0 glass rounded-xl h-48 animate-pulse"
            style={{ borderTop: `3px solid ${hexAlpha(stage.color, 0.3)}` }} />
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* Controls: search + program filters */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search clients…"
            className="w-full glass rounded-lg pl-8 pr-8 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {allPrograms.map(prog => {
            const active = selectedPrograms.has(prog)
            const color = programColor(prog)
            return (
              <button
                key={prog}
                onClick={() => toggleProgram(prog)}
                className="px-2.5 py-1 rounded-full text-xs font-medium border transition-all"
                style={active
                  ? { backgroundColor: hexAlpha(color, 0.2), borderColor: hexAlpha(color, 0.5), color }
                  : { backgroundColor: "transparent", borderColor: "rgba(148,163,184,0.2)", color: "#94a3b8" }
                }
              >
                {programShortLabel(prog)}
              </button>
            )
          })}
          {selectedPrograms.size > 0 && (
            <button
              onClick={() => setSelectedPrograms(new Set())}
              className="px-2.5 py-1 rounded-full text-xs font-medium border border-slate-200 dark:border-white/[0.08] text-slate-400 hover:text-slate-600 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <SummaryRow data={data} />

      {/* Pipeline board */}
      <div ref={boardRef} className="flex gap-4 overflow-x-auto pb-4" data-tour="pipeline-board">
        {STAGES.map(stage => (
          <Column
            key={stage.id}
            stage={stage}
            clients={data[stage.id] ?? []}
            isDragOver={dragOverStage === stage.id}
            draggingClientId={dragClientId}
            pendingCount={stage.id === "survey" ? pendingSurveyCount : undefined}
            onDragOver={(e) => { e.preventDefault(); setDragOverStage(stage.id) }}
            onDragLeave={() => setDragOverStage(prev => prev === stage.id ? null : prev)}
            onDrop={(e) => { e.preventDefault(); handleDrop(stage.id) }}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClientClick={handleClientClick}
          />
        ))}
      </div>

      {/* Stage move dialog */}
      {pendingMove && (
        <MoveDialog
          clientName={pendingMove.clientName}
          fromStage={pendingMove.fromStage}
          toStage={pendingMove.toStage}
          note={moveNote}
          onNoteChange={setMoveNote}
          confirmed={moveConfirmed}
          onConfirmedChange={setMoveConfirmed}
          busy={moving}
          onConfirm={handleMoveConfirm}
          onCancel={() => setPendingMove(null)}
        />
      )}
    </div>
  )
}
