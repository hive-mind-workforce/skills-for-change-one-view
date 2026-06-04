"use client"
import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Search, CheckCircle, Circle, Lock, Users, ChevronRight } from "lucide-react"
import ProgramBadge from "@/components/ProgramBadge"
import FunderBadge from "@/components/FunderBadge"
import { formatDate, programLabel, programColor } from "@/lib/helpers"

const TIER_ORDER = ["immediate", "intermediate", "ultimate"]
const TIER_LABELS: Record<string, string> = { immediate: "Immediate", intermediate: "Intermediate", ultimate: "Ultimate" }

export default function JourneyViewer() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<any | null>(null)
  const [journey, setJourney] = useState<any | null>(null)
  const [loadingJourney, setLoadingJourney] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipSearchRef = useRef(false)

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
        }
      })
      .finally(() => setLoadingJourney(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    try {
      const res = await fetch(`/api/journey?clientId=${client.id}`)
      setJourney(await res.json())
    } finally {
      setLoadingJourney(false)
    }
  }

  function clear() { setQuery(""); setResults([]); setSelected(null); setJourney(null) }

  return (
    <div className="space-y-6">
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

      {!selected && !journey && (
        <div className="glass rounded-xl p-8 text-center">
          <Users size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">Search for a client to view their program journey, outcomes, and consent status.</p>
          <p className="text-slate-400 dark:text-slate-600 text-xs mt-1">Try "Amara", "Carlos", or any name from the dataset.</p>
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
          <div className="glass rounded-xl p-5 flex flex-wrap items-start gap-4">
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
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-sora text-slate-800 dark:text-slate-200">{journey.enrolments.length}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">program{journey.enrolments.length !== 1 ? "s" : ""}</div>
            </div>
          </div>

          <div className="space-y-4">
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
                  <div className="flex-1 glass rounded-xl p-5 mb-4" style={isPhi ? { borderColor: "rgba(244,63,94,0.3)" } : {}}>
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
                        return (
                          <div key={tier} className="flex items-start gap-3">
                            <div className="mt-0.5 flex-shrink-0">
                              {outcome.achieved
                                ? <CheckCircle size={14} style={{ color }} />
                                : <Circle size={14} className="text-slate-300 dark:text-slate-600" />}
                            </div>
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
          </div>
        </div>
      )}
    </div>
  )
}
