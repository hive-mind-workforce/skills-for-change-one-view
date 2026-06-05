"use client"
import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Search, CheckCircle, Circle, Lock, Users, ChevronRight, FileText, Phone, Calendar, Eye, Star, Plus, X, Pencil, Trash2, ClipboardList, AlertTriangle, ArrowLeft, Mail, UserMinus, CheckCheck, BarChart3, Send } from "lucide-react"
import ProgramBadge from "@/components/ProgramBadge"
import FunderBadge from "@/components/FunderBadge"
import { formatDate, programLabel, programColor, countryName } from "@/lib/helpers"

const TIER_ORDER = ["immediate", "intermediate", "ultimate"]
const TIER_LABELS: Record<string, string> = { immediate: "Immediate", intermediate: "Intermediate", ultimate: "Ultimate" }

const NOTE_TYPE_COLORS: Record<string, string> = {
  interview: "#8b5cf6",
  call: "#3b82f6",
  meeting: "#10b981",
  observation: "#f59e0b",
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NOTE_ICONS: Record<string, React.ComponentType<any>> = {
  interview: Users,
  call: Phone,
  meeting: Calendar,
  observation: Eye,
}

interface CaseNote {
  id: string
  client_id: string
  author_role: string
  note_type: string
  content: string
  created_at: string
}

interface Survey {
  id: string
  client_id: string
  enrolment_id: string
  satisfaction: number | null
  would_recommend: boolean
  outcome_confirmed: boolean
  drop_reason: string | null
  comments: string | null
  completed_at: string
}

function SurveyPendingPanel({ clientId, clientName, onSimulate }: { clientId: string; clientName: string; onSimulate: () => void }) {
  const [copied, setCopied] = useState(false)
  const [pending, setPending] = useState<{ days_waiting: number } | null>(null)
  const surveyUrl = typeof window !== "undefined" ? `${window.location.origin}/survey/${clientId}` : `/survey/${clientId}`

  useEffect(() => {
    fetch("/api/pending-surveys")
      .then(r => r.json())
      .then(d => {
        const match = (d.pending ?? []).find((p: any) => p.id === clientId)
        if (match) setPending(match)
      })
      .catch(() => {})
  }, [clientId])

  function copyLink() {
    navigator.clipboard.writeText(surveyUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const daysWaiting = pending ? Math.max(0, Math.round(pending.days_waiting)) : null

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-500/[0.06] border border-blue-500/20">
        <Mail size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">Survey sent to {clientName}</p>
            {daysWaiting !== null && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${daysWaiting > 7 ? "bg-amber-500/20 text-amber-600 dark:text-amber-400" : "bg-blue-500/10 text-blue-600 dark:text-blue-400"}`}>
                {daysWaiting}d waiting, no response yet
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Share the link below if the email didn't arrive.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08]">
        <span className="text-xs text-slate-500 dark:text-slate-400 truncate flex-1 font-mono">{surveyUrl}</span>
        <button
          onClick={copyLink}
          className="flex-shrink-0 px-3 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.08] hover:bg-slate-200 dark:hover:bg-white/[0.14] text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
        <a
          href={surveyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 px-3 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-medium transition-colors"
        >
          Open →
        </a>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { label: "Email Sent", icon: Mail, done: true },
          { label: "Client Reviews", icon: Eye, done: false },
          { label: "Survey Filled", icon: ClipboardList, done: false },
          { label: "Results Received", icon: CheckCircle, done: false },
          { label: "Analytics Updated", icon: BarChart3, done: false },
        ].map((step, i) => {
          const Icon = step.icon
          return (
            <div key={i} className="flex items-center gap-2 flex-shrink-0">
              <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${step.done ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-white/[0.06] text-slate-400"}`}>
                <Icon size={11} /> {step.label}
              </div>
              {i < 4 && <div className="w-3 h-px bg-slate-200 dark:bg-white/[0.1] flex-shrink-0" />}
            </div>
          )
        })}
      </div>

      <button
        onClick={onSimulate}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-amber-400/50 text-amber-600 dark:text-amber-400 text-sm hover:bg-amber-500/5 transition-colors"
      >
        <ClipboardList size={14} /> Simulate: Client fills survey →
      </button>
    </div>
  )
}

export default function JourneyViewer() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const role = searchParams.get("role") ?? "admin"

  // Back-to-pipeline link with filter restoration
  const fromPipeline = searchParams.get("fromPipeline") === "1"
  const pipelineBackUrl = (() => {
    if (!fromPipeline) return null
    const params = new URLSearchParams()
    if (role && role !== "admin") params.set("role", role)
    const pSearch = searchParams.get("pSearch")
    const pPrograms = searchParams.get("pPrograms")
    if (pSearch) params.set("restoreSearch", pSearch)
    if (pPrograms) params.set("restorePrograms", pPrograms)
    const qs = params.toString()
    return `/pipeline${qs ? `?${qs}` : ""}`
  })()

  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<any | null>(null)
  const [journey, setJourney] = useState<any | null>(null)
  const [loadingJourney, setLoadingJourney] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipSearchRef = useRef(false)

  const [notes, setNotes] = useState<CaseNote[]>([])
  const [addingNote, setAddingNote] = useState(false)
  const [noteText, setNoteText] = useState("")
  const [noteType, setNoteType] = useState("interview")
  const [submittingNote, setSubmittingNote] = useState(false)
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())

  const [survey, setSurvey] = useState<Survey | null>(null)
  const [recentClients, setRecentClients] = useState<any[]>([])
  const journeyRef = useRef<any>(null)

  // Edit state
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState<Record<string, string>>({})
  const [savingEdit, setSavingEdit] = useState(false)

  // Survey form state
  const [showSurveyForm, setShowSurveyForm] = useState(false)
  const [surveyForm, setSurveyForm] = useState({ satisfaction: 0, wouldRecommend: false, barriers: "", successStory: "" })
  const [savingSurvey, setSavingSurvey] = useState(false)

  // Delete confirmation
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [togglingOutcome, setTogglingOutcome] = useState<string | null>(null)

  // Add program state
  const [addingProgram, setAddingProgram] = useState(false)
  const [newProgram, setNewProgram] = useState("")
  const [newProgramConsent, setNewProgramConsent] = useState(false)
  const [savingProgram, setSavingProgram] = useState(false)

  // Complete journey / drop-off state
  const [completingJourney, setCompletingJourney] = useState(false)
  const [surveyEmailSent, setSurveyEmailSent] = useState(false)
  const [droppingOff, setDroppingOff] = useState(false)
  const [dropOffReason, setDropOffReason] = useState("No further contact")
  const [savingCompletion, setSavingCompletion] = useState(false)
  const [savingDropOff, setSavingDropOff] = useState(false)

  // Keep journeyRef current for demo event handlers
  useEffect(() => { journeyRef.current = journey }, [journey])

  // Demo: refresh journey on request
  useEffect(() => {
    async function handleRefresh() {
      const clientId = journeyRef.current?.client?.id
      if (!clientId) return
      const res = await fetch(`/api/journey?clientId=${clientId}`)
      const data = await res.json()
      setJourney(data)
      window.dispatchEvent(new CustomEvent("demo:journey-loaded", { detail: data }))
    }
    function handleSetNewProgram(e: Event) {
      const { program } = (e as CustomEvent).detail
      setNewProgram(program)
    }
    function handleFillNote(e: Event) {
      const { content, noteType: type } = (e as CustomEvent).detail
      if (content) setNoteText(content)
      if (type) setNoteType(type)
      setAddingNote(true)
    }
    window.addEventListener("demo:refresh-journey", handleRefresh)
    window.addEventListener("demo:set-new-program", handleSetNewProgram)
    window.addEventListener("demo:fill-note", handleFillNote)
    return () => {
      window.removeEventListener("demo:refresh-journey", handleRefresh)
      window.removeEventListener("demo:set-new-program", handleSetNewProgram)
      window.removeEventListener("demo:fill-note", handleFillNote)
    }
  }, [])

  // Load recent clients on mount for quick access
  useEffect(() => {
    fetch("/api/recent-clients")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setRecentClients(data) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const clientId = searchParams.get("clientId")
    if (!clientId) return
    setLoadingJourney(true)
    fetch(`/api/journey?clientId=${clientId}`)
      .then(r => r.json())
      .then(data => {
        if (data?.client) {
          skipSearchRef.current = true
          setSelected(data.client)
          setQuery(data.client.full_name)
          setJourney(data)
          window.dispatchEvent(new CustomEvent("demo:journey-loaded", { detail: data }))
        }
      })
      .finally(() => setLoadingJourney(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch notes and survey whenever the loaded journey changes; covers both URL load and search-select
  useEffect(() => {
    const clientId = journey?.client?.id
    if (!clientId) {
      setNotes([])
      setSurvey(null)
      return
    }
    fetch(`/api/notes?clientId=${clientId}`)
      .then(r => r.json())
      .then(data => setNotes(Array.isArray(data) ? data : []))
      .catch(() => setNotes([]))

    fetch(`/api/survey/${clientId}`)
      .then(r => r.json())
      .then(data => setSurvey(data?.survey ?? null))
      .catch(() => setSurvey(null))
  }, [journey?.client?.id])

  useEffect(() => {
    if (skipSearchRef.current) { skipSearchRef.current = false; return }
    if (query.length < 2) { setResults([]); return }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/clients/search?q=${encodeURIComponent(query)}`)
        setResults(await res.json())
      } finally {
        setSearching(false)
      }
    }, 300)
  }, [query])

  async function selectClient(client: any) {
    skipSearchRef.current = true
    setSelected(client); setResults([]); setQuery(client.full_name)
    setLoadingJourney(true); setJourney(null)
    setNotes([]); setSurvey(null); setAddingNote(false); setNoteText("")
    try {
      const res = await fetch(`/api/journey?clientId=${client.id}`)
      const journeyData = await res.json()
      setJourney(journeyData)
      window.dispatchEvent(new CustomEvent("demo:journey-loaded", { detail: journeyData }))
    } finally {
      setLoadingJourney(false)
    }
  }

  function clear() {
    setQuery(""); setResults([]); setSelected(null); setJourney(null)
    setNotes([]); setSurvey(null); setAddingNote(false); setNoteText("")
  }

  async function submitNote() {
    if (!noteText.trim() || !journey?.client?.id) return
    setSubmittingNote(true)
    try {
      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: journey.client.id,
          authorRole: role,
          noteType,
          content: noteText.trim(),
        }),
      })
      // Refresh notes list
      const res = await fetch(`/api/notes?clientId=${journey.client.id}`)
      const updated = await res.json()
      setNotes(Array.isArray(updated) ? updated : [])
      setNoteText("")
      setAddingNote(false)
    } finally {
      setSubmittingNote(false)
    }
  }

  function toggleExpand(id: string) {
    setExpandedNotes(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  function openEdit() {
    if (!journey?.client) return
    setEditForm({
      full_name: journey.client.full_name ?? "",
      primary_language: journey.client.primary_language ?? "",
      immigration_stream: journey.client.immigration_stream ?? "",
      country_of_origin: journey.client.country_of_origin ?? "",
      age_group: journey.client.age_group ?? "",
      gender: journey.client.gender ?? "",
      source: journey.client.source ?? "",
      stage: journey.client.stage ?? "intake",
    })
    setEditing(true)
  }

  async function saveEdit() {
    if (!journey?.client?.id) return
    setSavingEdit(true)
    try {
      // Update client fields: resolve self-describe gender to typed value
      const resolvedForm = { ...editForm }
      if (resolvedForm.gender === "Self-describe…") {
        resolvedForm.gender = resolvedForm.gender_self_describe?.trim() || "Self-describe…"
      }
      delete resolvedForm.gender_self_describe
      await fetch(`/api/clients/${journey.client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...resolvedForm, role }),
      })
      // Update consent on each enrolment if changed
      const consentUpdates = journey.enrolments
        .filter((e: any) => editForm[`consent_${e.id}`] !== undefined && String(editForm[`consent_${e.id}`]) !== String(e.consent_cross_program))
        .map((e: any) => fetch(`/api/enrolments/${e.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ consent_cross_program: editForm[`consent_${e.id}`] === "true", role }),
        }))
      await Promise.all(consentUpdates)
      const res = await fetch(`/api/journey?clientId=${journey.client.id}`)
      setJourney(await res.json())
      setEditing(false)
    } finally {
      setSavingEdit(false)
    }
  }

  async function toggleOutcome(outcomeId: string, current: boolean) {
    if (!journey?.client?.id) return
    setTogglingOutcome(outcomeId)
    try {
      await fetch(`/api/outcomes/${outcomeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ achieved: !current, role }),
      })
      const res = await fetch(`/api/journey?clientId=${journey.client.id}`)
      const journeyData = await res.json()
      setJourney(journeyData)
      window.dispatchEvent(new CustomEvent("demo:journey-loaded", { detail: journeyData }))
    } finally {
      setTogglingOutcome(null)
    }
  }

  async function submitSurvey() {
    if (!journey?.client?.id) return
    const enrolmentId = journey.enrolments?.[0]?.id
    if (!enrolmentId) return
    setSavingSurvey(true)
    try {
      await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: journey.client.id,
          enrolmentId,
          satisfaction: surveyForm.satisfaction || null,
          wouldRecommend: surveyForm.wouldRecommend,
          barriers: surveyForm.barriers || null,
          successStory: surveyForm.successStory || null,
          role,
        }),
      })
      if (journey.client.stage === "survey") {
        await fetch(`/api/clients/${journey.client.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage: "complete", role }),
        })
      }
      const [surveyRes, journeyRes] = await Promise.all([
        fetch(`/api/survey/${journey.client.id}`).then(r => r.json()),
        fetch(`/api/journey?clientId=${journey.client.id}`).then(r => r.json()),
      ])
      setSurvey(surveyRes.survey ?? null)
      setJourney(journeyRes)
      setSurveyEmailSent(false)
      setShowSurveyForm(false)
    } finally {
      setSavingSurvey(false)
    }
  }

  async function handleDelete() {
    if (!journey?.client?.id) return
    setDeleting(true)
    try {
      await fetch(`/api/clients/${journey.client.id}?role=${role}`, { method: "DELETE" })
      clear()
      setConfirmDelete(false)
    } finally {
      setDeleting(false)
    }
  }

  async function completeJourney() {
    if (!journey?.client?.id) return
    setSavingCompletion(true)
    try {
      await fetch(`/api/clients/${journey.client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: "survey", role }),
      })
      const res = await fetch(`/api/journey?clientId=${journey.client.id}`)
      setJourney(await res.json())
      setCompletingJourney(false)
      setSurveyEmailSent(true)
    } finally {
      setSavingCompletion(false)
    }
  }

  async function submitDropOff() {
    if (!journey?.client?.id) return
    setSavingDropOff(true)
    try {
      await fetch(`/api/clients/${journey.client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: "dropped", role }),
      })
      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: journey.client.id,
          content: `Client marked as dropped off. Reason: ${dropOffReason}`,
          noteType: "observation",
          role,
        }),
      })
      const [journeyRes, notesRes] = await Promise.all([
        fetch(`/api/journey?clientId=${journey.client.id}`).then(r => r.json()),
        fetch(`/api/notes?clientId=${journey.client.id}`).then(r => r.json()),
      ])
      setJourney(journeyRes)
      setNotes(Array.isArray(notesRes) ? notesRes : [])
      setDroppingOff(false)
    } finally {
      setSavingDropOff(false)
    }
  }

  const canAddNote = role === "admin" || role === "caseworker"
  const STAGES = ["outreach", "vetting", "eligibility", "intake", "training", "placement", "survey", "complete", "dropped"]
  const ALL_PROGRAMS = ["settlement", "employment", "language", "mental_health", "trades", "mentoring", "youth", "women"]

  async function addProgram() {
    if (!journey?.client?.id || !newProgram) return
    setSavingProgram(true)
    try {
      await fetch("/api/enrolments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: journey.client.id, program: newProgram, consent_cross_program: newProgramConsent }),
      })
      const res = await fetch(`/api/journey?clientId=${journey.client.id}`)
      const journeyData = await res.json()
      setJourney(journeyData)
      window.dispatchEvent(new CustomEvent("demo:journey-loaded", { detail: journeyData }))
      setAddingProgram(false)
      setNewProgram("")
      setNewProgramConsent(false)
    } finally {
      setSavingProgram(false)
    }
  }

  return (
    <div className="space-y-6">
      {pipelineBackUrl && (
        <button
          onClick={() => router.push(pipelineBackUrl)}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Pipeline
        </button>
      )}
      <div className="relative max-w-lg">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search client by name…"
          className="w-full ov-input rounded-xl pl-9 pr-10 py-3 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-emerald-500/60 transition-colors"
        />
        {query && (
          <button onClick={clear} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg leading-none">×</button>
        )}
        {results.length > 0 && (
          <div className="absolute top-full mt-1 left-0 right-0 z-20 glass rounded-xl overflow-hidden border border-slate-200 dark:border-white/[0.12] shadow-lg">
            {results.map((c: any) => (
              <button
                key={c.id}
                onClick={() => selectClient(c)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-colors border-b border-slate-100 dark:border-white/[0.06] last:border-0"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xs font-bold flex-shrink-0">
                  {c.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div className="text-slate-800 dark:text-slate-200 text-sm font-medium">{c.full_name}</div>
                  <div className="text-slate-500 dark:text-slate-400 text-xs">{c.primary_language} · {c.immigration_stream} · {c.enrolment_count} program{c.enrolment_count !== 1 ? "s" : ""}</div>
                </div>
                <ChevronRight size={14} className="ml-auto text-slate-400 flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
        {searching && (
          <div className="absolute top-full mt-1 left-0 right-0 z-20 glass rounded-xl px-4 py-3 text-slate-500 dark:text-slate-400 text-sm border border-slate-200 dark:border-white/[0.12]">
            Searching…
          </div>
        )}
      </div>

      {!selected && !journey && recentClients.length > 0 && (
        <div className="space-y-3" data-tour="recent-clients">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Recent Clients</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {recentClients.slice(0, 10).map((c: any) => (
              <button
                key={c.id}
                onClick={() => selectClient(c)}
                className="flex items-center gap-3 px-4 py-3 glass glass-hover rounded-xl border border-slate-200 dark:border-white/[0.08] text-left transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xs font-bold flex-shrink-0">
                  {c.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-slate-800 dark:text-slate-200 text-sm font-medium truncate">{c.full_name}</div>
                  <div className="text-slate-500 dark:text-slate-400 text-xs truncate">{c.primary_language} · {countryName(c.country_of_origin)}</div>
                </div>
                <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {!selected && !journey && recentClients.length === 0 && (
        <div className="glass rounded-xl p-8 text-center">
          <Users size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">Search for a client to view their program journey, outcomes, and consent status.</p>
        </div>
      )}

      {loadingJourney && (
        <div className="space-y-4 animate-pulse">
          <div className="h-20 bg-slate-200 dark:bg-white/[0.06] rounded-xl" />
          <div className="h-48 bg-slate-200 dark:bg-white/[0.06] rounded-xl" />
        </div>
      )}

      {journey && !loadingJourney && (
        <div className="space-y-6">
          <div className="glass rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-lg font-bold flex-shrink-0">
                {journey.client.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-sora text-2xl text-slate-900 dark:text-white">{journey.client.full_name}</h2>
                <div className="flex flex-wrap gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
                  <span>{journey.client.primary_language}</span>
                  <span>·</span>
                  <span>{journey.client.immigration_stream}</span>
                  <span>·</span>
                  <span>Registered {formatDate(journey.client.created_at)}</span>
                  {journey.client.stage && (
                    <><span>·</span><span className="capitalize font-medium text-emerald-600 dark:text-emerald-400">{journey.client.stage}</span></>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {canAddNote && (
                  <button onClick={openEdit} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.12] text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors">
                    <Pencil size={12} /> Edit
                  </button>
                )}
                {canAddNote && !["complete","survey","dropped"].includes(journey.client.stage ?? "") && (
                  <button onClick={() => setCompletingJourney(true)} data-tour="journey-complete-btn" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium transition-colors">
                    <CheckCheck size={12} /> Complete Journey
                  </button>
                )}
                {canAddNote && journey.client.stage !== "dropped" && (
                  <button onClick={() => setDroppingOff(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium transition-colors">
                    <UserMinus size={12} /> Drop Off
                  </button>
                )}
                {role === "admin" && !confirmDelete && (
                  <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium transition-colors">
                    <Trash2 size={12} /> Delete
                  </button>
                )}
                {role === "admin" && confirmDelete && (
                  <div className="flex items-center gap-2 p-2 rounded-lg border border-rose-500/30 bg-rose-500/5">
                    <AlertTriangle size={14} className="text-rose-500 flex-shrink-0" />
                    <span className="text-xs text-rose-600 dark:text-rose-400">Delete permanently?</span>
                    <button onClick={handleDelete} disabled={deleting} className="px-2 py-0.5 rounded bg-rose-500 hover:bg-rose-600 text-white text-xs disabled:opacity-50">
                      {deleting ? "..." : "Yes"}
                    </button>
                    <button onClick={() => setConfirmDelete(false)} className="px-2 py-0.5 rounded bg-slate-200 dark:bg-white/[0.1] text-slate-600 dark:text-slate-300 text-xs">No</button>
                  </div>
                )}
              </div>
            </div>

            {/* Stage progression bar */}
            {(() => {
              if (journey.client.stage === "dropped") {
                return (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <UserMinus size={14} className="text-amber-500 flex-shrink-0" />
                    <span className="text-sm text-amber-700 dark:text-amber-400 font-medium">Client has dropped off this program.</span>
                  </div>
                )
              }
              const PIPELINE_STAGES = [
                { db: "outreach",    label: "Outreach"  },
                { db: "vetting",     label: "Vetting"   },
                { db: "eligibility", label: "Eligible"  },
                { db: "intake",      label: "Enrolled"  },
                { db: "training",    label: "Training"  },
                { db: "placement",   label: "Placed"    },
                { db: "survey",      label: "Survey"    },
                { db: "complete",    label: "Complete"  },
              ]
              const currentIdx = PIPELINE_STAGES.findIndex(s => s.db === journey.client.stage)
              return (
                <div className="border-t border-slate-100 dark:border-white/[0.08] pt-4" data-tour="journey-stage-bar">
                  <div className="flex items-center gap-1 overflow-x-auto pb-1">
                    {PIPELINE_STAGES.map((s, i) => {
                      const isDone = currentIdx > i
                      const isCurrent = currentIdx === i
                      return (
                        <div key={s.db} className="flex items-center gap-1 flex-shrink-0">
                          <button
                            disabled={!canAddNote}
                            onClick={async () => {
                              if (!canAddNote || isCurrent) return
                              await fetch(`/api/clients/${journey.client.id}`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ stage: s.db, role }),
                              })
                              const res = await fetch(`/api/journey?clientId=${journey.client.id}`)
                              setJourney(await res.json())
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                              isCurrent
                                ? "bg-emerald-500 text-white shadow-sm"
                                : isDone
                                  ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 cursor-pointer hover:bg-emerald-500/30"
                                  : "bg-slate-100 dark:bg-white/[0.06] text-slate-400 dark:text-slate-500 cursor-pointer hover:bg-slate-200 dark:hover:bg-white/[0.12]"
                            }`}
                          >
                            {isDone && !isCurrent ? "✓ " : ""}{s.label}
                          </button>
                          {i < PIPELINE_STAGES.length - 1 && (
                            <div className={`w-4 h-px flex-shrink-0 ${isDone ? "bg-emerald-400/60" : "bg-slate-200 dark:bg-white/[0.08]"}`} />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })()}

            {/* Complete Journey dialog */}
            {completingJourney && (
              <div className="border-t border-slate-100 dark:border-white/[0.08] pt-4 space-y-3" data-tour="journey-complete-dialog">
                <div className="flex items-center gap-2">
                  <CheckCheck size={16} className="text-emerald-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Complete Client Journey</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Mail size={12} />
                    <span className="font-medium">To:</span>
                    <span>{journey.client.full_name}</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400"><span className="font-medium">Subject:</span> Your Skills for Change experience: quick survey</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                    "Thank you for completing the program. We'd love to hear about your experience. The survey takes 2 minutes and helps us improve for future clients."
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Survey link:</span>
                    <a
                      href={typeof window !== "undefined" ? `${window.location.origin}/survey/${journey.client.id}` : `/survey/${journey.client.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-mono truncate max-w-[260px]"
                    >
                      {typeof window !== "undefined" ? `${window.location.origin}/survey/${journey.client.id}` : `/survey/${journey.client.id}`}
                    </a>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">This will mark the journey as complete and queue a satisfaction survey to the client.</p>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setCompletingJourney(false)} className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">Cancel</button>
                  <button onClick={completeJourney} disabled={savingCompletion} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-medium transition-colors">
                    <Send size={11} /> {savingCompletion ? "Sending…" : "Send Survey & Complete"}
                  </button>
                </div>
              </div>
            )}

            {/* Drop Off dialog */}
            {droppingOff && (
              <div className="border-t border-slate-100 dark:border-white/[0.08] pt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <UserMinus size={16} className="text-amber-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Record Drop-Off</span>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Reason</label>
                  <select
                    value={dropOffReason}
                    onChange={e => setDropOffReason(e.target.value)}
                    className="w-full ov-input rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500/60"
                  >
                    {["Financial barriers","Found employment independently","Location or transportation issues","Schedule conflict","Program not suitable","No further contact"].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setDroppingOff(false)} className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">Cancel</button>
                  <button onClick={submitDropOff} disabled={savingDropOff} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-medium transition-colors">
                    {savingDropOff ? "Saving…" : "Confirm Drop-Off"}
                  </button>
                </div>
              </div>
            )}

            {/* Edit form */}
            {editing && canAddNote && (
              <div className="border-t border-slate-100 dark:border-white/[0.08] pt-4 space-y-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Edit Client Details</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
                    <input
                      value={editForm.full_name ?? ""}
                      onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))}
                      className="w-full ov-input rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-emerald-500/60"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Language</label>
                    <select value={editForm.primary_language ?? ""} onChange={e => setEditForm(f => ({ ...f, primary_language: e.target.value }))} className="w-full ov-input rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-emerald-500/60">
                      <option value="">Select...</option>
                      {["English","Arabic","Somali","Spanish","Tagalog","Mandarin","Hindi","French","Portuguese","Ukrainian","Tigrinya","Amharic","Punjabi","Vietnamese","Persian"].map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Immigration Stream</label>
                    <select value={editForm.immigration_stream ?? ""} onChange={e => setEditForm(f => ({ ...f, immigration_stream: e.target.value }))} className="w-full ov-input rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-emerald-500/60">
                      <option value="">Select...</option>
                      {["Refugee","Economic Immigrant","Family Reunification","International Student","Temporary Worker"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Country of Origin</label>
                    <select value={editForm.country_of_origin ?? ""} onChange={e => setEditForm(f => ({ ...f, country_of_origin: e.target.value }))} className="w-full ov-input rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-emerald-500/60">
                      <option value="">Select...</option>
                      {[["SO","Somalia"],["IN","India"],["SY","Syria"],["PH","Philippines"],["CO","Colombia"],["NG","Nigeria"],["ET","Ethiopia"],["UA","Ukraine"],["MX","Mexico"],["CN","China"],["PK","Pakistan"],["BD","Bangladesh"],["KE","Kenya"],["GH","Ghana"],["JM","Jamaica"],["BR","Brazil"],["EG","Egypt"],["IR","Iran"],["AF","Afghanistan"],["TZ","Tanzania"],["MR","Mauritania"],["SD","Sudan"],["SS","South Sudan"],["ER","Eritrea"],["VN","Vietnam"],["TR","Turkey"],["ID","Indonesia"],["RU","Russia"]].map(([code, name]) => <option key={code} value={code}>{name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Age Group</label>
                    <select value={editForm.age_group ?? ""} onChange={e => setEditForm(f => ({ ...f, age_group: e.target.value }))} className="w-full ov-input rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-emerald-500/60">
                      <option value="">Select...</option>
                      {["18-24","25-34","35-44","45-54","55+"].map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Gender</label>
                    <select value={editForm.gender ?? ""} onChange={e => setEditForm(f => ({ ...f, gender: e.target.value }))} className="w-full ov-input rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-emerald-500/60">
                      <option value="">Select...</option>
                      {["Woman","Man","Non-binary","Two-Spirit","Transgender woman","Transgender man","Genderfluid","Agender","Gender non-conforming","Genderqueer","Bigender","Questioning","Self-describe…","Prefer not to say"].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    {editForm.gender === "Self-describe…" && (
                      <input
                        value={editForm.gender_self_describe ?? ""}
                        onChange={e => setEditForm(f => ({ ...f, gender_self_describe: e.target.value }))}
                        placeholder="Please describe your gender identity"
                        className="w-full ov-input rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-emerald-500/60 mt-2"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Source</label>
                    <select value={editForm.source ?? ""} onChange={e => setEditForm(f => ({ ...f, source: e.target.value }))} className="w-full ov-input rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-emerald-500/60">
                      <option value="">Select...</option>
                      <option value="referral">Referral</option>
                      <option value="walk-in">Walk-in</option>
                      <option value="online">Online</option>
                      <option value="event">Event</option>
                      <option value="partner">Partner</option>
                      <option value="direct">Direct</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Stage</label>
                    <select value={editForm.stage ?? "intake"} onChange={e => setEditForm(f => ({ ...f, stage: e.target.value }))} className="w-full ov-input rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-emerald-500/60">
                      {STAGES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
                {journey?.enrolments?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cross-Program Consent</p>
                    {journey.enrolments.map((e: any) => (
                      <label key={e.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm[`consent_${e.id}`] !== undefined ? editForm[`consent_${e.id}`] === "true" : Boolean(e.consent_cross_program)}
                          onChange={ev => setEditForm(f => ({ ...f, [`consent_${e.id}`]: ev.target.checked ? "true" : "false" }))}
                          className="rounded border-slate-300 dark:border-white/20 accent-emerald-500"
                        />
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          <span className="font-medium capitalize">{e.program}</span>: allow data sharing across programs
                        </span>
                      </label>
                    ))}
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <button onClick={() => setEditing(false)} className="px-3 py-1.5 rounded-lg text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">Cancel</button>
                  <button onClick={saveEdit} disabled={savingEdit} className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-medium transition-colors">
                    {savingEdit ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4" data-tour="journey-outcomes">
            {journey.enrolments.map((enrol: any, i: number) => {
              const color = programColor(enrol.program)
              const outcomes = enrol.outcomes ?? []
              const achieved = outcomes.filter((o: any) => o.achieved).length
              const isPhi = enrol.program === "mental_health"
              return (
                <div key={enrol.id} className="flex gap-4">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ background: `${color}22`, border: `2px solid ${color}50`, color }}>
                      {i + 1}
                    </div>
                    {i < journey.enrolments.length - 1 && (
                      <div className="w-px flex-1 mt-2 bg-slate-200 dark:bg-white/[0.08]" />
                    )}
                  </div>
                  <div className="flex-1 glass rounded-xl p-5 mb-4" style={isPhi ? { borderColor: "rgba(244,63,94,0.3)" } : {}} {...(isPhi ? { "data-tour": "journey-phi-card" } : {})}>
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <ProgramBadge program={enrol.program} />
                        <FunderBadge funder={enrol.funder} />
                        {isPhi && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-rose-500/20 text-rose-500 dark:text-rose-400 text-xs rounded-full border border-rose-500/30">
                            <Lock size={10} /> PHIPA
                          </span>
                        )}
                        {enrol.consent_cross_program && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-full border border-emerald-500/30">
                            <CheckCircle size={10} /> Cross-program consent
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">{formatDate(enrol.enrolled_at)}</span>
                    </div>

                    <div className="space-y-2">
                      {TIER_ORDER.map(tier => {
                        const outcome = outcomes.find((o: any) => o.tier === tier)
                        if (!outcome) return null
                        const isToggling = togglingOutcome === outcome.id
                        return (
                          <div key={tier} className="flex items-start gap-3">
                            <button
                              className="mt-0.5 flex-shrink-0 disabled:opacity-50 transition-opacity"
                              disabled={!canAddNote || isToggling}
                              onClick={() => canAddNote && toggleOutcome(outcome.id, outcome.achieved)}
                              title={canAddNote ? (outcome.achieved ? "Mark as not achieved" : "Mark as achieved") : ""}
                            >
                              {isToggling
                                ? <div className="w-3.5 h-3.5 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                                : outcome.achieved
                                  ? <CheckCircle size={14} style={{ color }} />
                                  : <Circle size={14} className="text-slate-300 dark:text-slate-600" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">{TIER_LABELS[tier]}</span>
                                {outcome.achieved && (
                                  <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: `${color}22`, color }}>Achieved</span>
                                )}
                              </div>
                              <p className="text-slate-600 dark:text-slate-300 text-sm mt-0.5 leading-snug">{outcome.label}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex gap-1">
                        {outcomes.map((o: any, j: number) => (
                          <div key={j} className="w-2 h-2 rounded-full" style={{ background: o.achieved ? color : "#e2e8f0" }} />
                        ))}
                      </div>
                      <span>{achieved}/{outcomes.length} outcomes achieved</span>
                    </div>
                  </div>
                </div>
              )
            })}

            {canAddNote && (() => {
              const enrolled = new Set(journey.enrolments.map((e: any) => e.program))
              const available = ALL_PROGRAMS.filter(p => !enrolled.has(p))
              if (available.length === 0) return null
              return (
                <div className="flex gap-4" data-tour="journey-add-program">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-white/[0.06] text-slate-400">
                      <Plus size={16} />
                    </div>
                  </div>
                  <div className="flex-1">
                    {!addingProgram ? (
                      <button
                        onClick={() => { setAddingProgram(true); setNewProgram(available[0]) }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-slate-300 dark:border-white/[0.15] text-slate-500 dark:text-slate-400 hover:border-emerald-400 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 text-sm transition-colors w-full justify-center"
                      >
                        <Plus size={14} /> Add Program
                      </button>
                    ) : (
                      <div className="glass rounded-xl p-4 space-y-3 border border-white/[0.12]">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Enroll in Program</span>
                          <button onClick={() => setAddingProgram(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={14} /></button>
                        </div>
                        <select
                          value={newProgram}
                          onChange={e => setNewProgram(e.target.value)}
                          className="w-full ov-input rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500/60"
                        >
                          {available.map(p => (
                            <option key={p} value={p}>{programLabel(p)}</option>
                          ))}
                        </select>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newProgramConsent}
                            onChange={e => setNewProgramConsent(e.target.checked)}
                            className="rounded border-slate-300 dark:border-white/[0.2] text-emerald-500"
                          />
                          <span className="text-xs text-slate-500 dark:text-slate-400">Cross-program consent obtained</span>
                        </label>
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setAddingProgram(false)} className="px-3 py-1.5 rounded-lg text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">Cancel</button>
                          <button
                            onClick={addProgram}
                            disabled={savingProgram}
                            className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-medium transition-colors"
                          >
                            {savingProgram ? "Enrolling…" : "Enroll"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>

          {/* CASE NOTES SECTION */}
          <div className="glass rounded-xl p-5 space-y-4" data-tour="journey-notes">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-slate-500 dark:text-slate-400" />
                <h3 className="font-sora text-lg text-slate-900 dark:text-white">Caseworker Notes</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-white/[0.08] text-slate-600 dark:text-slate-400">
                  {notes.length}
                </span>
              </div>
              {canAddNote && !addingNote && (
                <button
                  onClick={() => setAddingNote(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium transition-colors"
                >
                  <Plus size={13} /> Add Note
                </button>
              )}
            </div>

            {/* Add note form */}
            {addingNote && canAddNote && (
              <div className="glass rounded-xl p-4 space-y-3 border border-white/[0.12]">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">New Note</span>
                  <button
                    onClick={() => { setAddingNote(false); setNoteText("") }}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>
                <select
                  value={noteType}
                  onChange={e => setNoteType(e.target.value)}
                  className="w-full ov-input rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-emerald-500/60 transition-colors"
                >
                  <option value="interview">Interview</option>
                  <option value="call">Call</option>
                  <option value="meeting">Meeting</option>
                  <option value="observation">Observation</option>
                </select>
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Enter note content…"
                  rows={4}
                  className="w-full ov-input rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-emerald-500/60 transition-colors resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => { setAddingNote(false); setNoteText("") }}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitNote}
                    disabled={!noteText.trim() || submittingNote}
                    className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors"
                  >
                    {submittingNote ? "Saving…" : "Save Note"}
                  </button>
                </div>
              </div>
            )}

            {/* Notes list */}
            {notes.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-4">No case notes yet.</p>
            ) : (
              <div className="space-y-3">
                {notes.map(note => {
                  const color = NOTE_TYPE_COLORS[note.note_type] ?? "#6b7280"
                  const Icon = NOTE_ICONS[note.note_type] ?? FileText
                  const isExpanded = expandedNotes.has(note.id)
                  const lines = note.content.split("\n")
                  const isLong = note.content.length > 240 || lines.length > 3
                  return (
                    <div key={note.id} className="flex gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: `${color}22`, border: `1.5px solid ${color}50` }}
                      >
                        <Icon size={14} style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                            style={{ background: `${color}22`, color }}
                          >
                            {note.note_type}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{note.author_role}</span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">{formatDate(note.created_at)}</span>
                        </div>
                        <p className={`text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap ${!isExpanded && isLong ? "line-clamp-3" : ""}`}>
                          {note.content}
                        </p>
                        {isLong && (
                          <button
                            onClick={() => toggleExpand(note.id)}
                            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline mt-1"
                          >
                            {isExpanded ? "Show less" : "Show more"}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* SURVEY RESULT CARD */}
          {survey && survey.satisfaction != null && (
            <div className="glass rounded-xl p-5 space-y-3" data-tour="journey-survey-result" style={{ borderColor: "rgba(245,158,11,0.25)" }}>
              <div className="flex items-center gap-2">
                <Star size={18} className="text-amber-500 dark:text-amber-400" />
                <h3 className="font-sora text-lg text-slate-900 dark:text-white">Exit Survey</h3>
                {survey.would_recommend && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-full border border-emerald-500/30">
                    <CheckCircle size={10} /> Would recommend
                  </span>
                )}
                <span className="ml-auto flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs rounded-full border border-emerald-500/20">
                  <BarChart3 size={10} /> Feeds Analytics
                </span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <Star key={n} size={20}
                    style={{ color: n <= survey.satisfaction! ? "#f59e0b" : undefined, fill: n <= survey.satisfaction! ? "#f59e0b" : "none" }}
                    className={n <= survey.satisfaction! ? "" : "text-slate-300 dark:text-slate-600"}
                  />
                ))}
                <span className="text-sm text-slate-600 dark:text-slate-400 ml-2">{survey.satisfaction}/5</span>
              </div>
              {(survey as any).barriers && (
                <p className="text-xs text-slate-500 dark:text-slate-400">Barriers reported: {(survey as any).barriers}</p>
              )}
              {(survey as any).success_story && (
                <blockquote className="border-l-2 border-amber-400 pl-3 text-slate-600 dark:text-slate-300 text-sm italic leading-relaxed">
                  {(survey as any).success_story}
                </blockquote>
              )}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100 dark:border-white/[0.06]">
                {[
                  { label: "Email Sent", icon: Mail, done: true },
                  { label: "Client Reviewed", icon: Eye, done: true },
                  { label: "Survey Filled", icon: ClipboardList, done: true },
                  { label: "Results Received", icon: CheckCircle, done: true },
                  { label: "Analytics Updated", icon: BarChart3, done: true },
                ].map((step, i) => {
                  const Icon = step.icon
                  return (
                    <div key={i} className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        <Icon size={10} /> {step.label}
                      </div>
                      {i < 4 && <div className="w-3 h-px bg-emerald-400/40 flex-shrink-0" />}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* SURVEY FLOW */}
          {canAddNote && !survey && (
            <div className="glass rounded-xl p-5 space-y-4" data-tour="journey-survey-section" style={{ borderColor: "rgba(245,158,11,0.2)" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList size={18} className="text-amber-500 dark:text-amber-400" />
                  <h3 className="font-sora text-lg text-slate-900 dark:text-white">Exit Survey</h3>
                  {journey.client.stage === "survey"
                    ? <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">Survey sent</span>
                    : <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">Not sent</span>
                  }
                </div>
                {!showSurveyForm && journey.client.stage !== "survey" && (
                  <button onClick={() => setShowSurveyForm(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-medium transition-colors">
                    <Plus size={13} /> Record Survey
                  </button>
                )}
              </div>

              {/* Survey pipeline flow */}
              {(journey.client.stage === "survey" || surveyEmailSent) && !showSurveyForm && (
                <SurveyPendingPanel
                  clientId={journey.client.id}
                  clientName={journey.client.full_name}
                  onSimulate={() => setShowSurveyForm(true)}
                />
              )}

              {showSurveyForm && (
                <div className="space-y-4 border-t border-slate-100 dark:border-white/[0.08] pt-4">
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-2">Satisfaction (1–5 stars)</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button key={n} onClick={() => setSurveyForm(f => ({ ...f, satisfaction: n }))}
                          className="transition-transform hover:scale-110">
                          <Star size={28}
                            style={{ color: n <= surveyForm.satisfaction ? "#f59e0b" : undefined, fill: n <= surveyForm.satisfaction ? "#f59e0b" : "none" }}
                            className={n <= surveyForm.satisfaction ? "" : "text-slate-300 dark:text-slate-600"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={surveyForm.wouldRecommend} onChange={e => setSurveyForm(f => ({ ...f, wouldRecommend: e.target.checked }))}
                      className="w-4 h-4 accent-emerald-500 rounded" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Client would recommend Skills for Change to others</span>
                  </label>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Barriers faced (optional)</label>
                    <input value={surveyForm.barriers} onChange={e => setSurveyForm(f => ({ ...f, barriers: e.target.value }))}
                      placeholder="e.g. language, childcare, transportation…"
                      className="w-full ov-input rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-amber-500/60" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Success story (optional)</label>
                    <textarea value={surveyForm.successStory} onChange={e => setSurveyForm(f => ({ ...f, successStory: e.target.value }))}
                      placeholder="Brief description of the client's outcome…"
                      rows={3}
                      className="w-full ov-input rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-amber-500/60 resize-none" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setShowSurveyForm(false)} className="px-3 py-1.5 rounded-lg text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">Cancel</button>
                    <button onClick={submitSurvey} disabled={!surveyForm.satisfaction || savingSurvey}
                      className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-medium transition-colors">
                      {savingSurvey ? "Saving…" : "Submit Survey"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
