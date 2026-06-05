"use client"
import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Shield, RefreshCw } from "lucide-react"
import { formatDate } from "@/lib/helpers"

const ACTION_COLORS: Record<string, string> = {
  create_client: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  export: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  ai_query: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20",
  generate_report: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
  view_clients: "text-slate-600 dark:text-slate-400 bg-slate-500/10 border-slate-500/20",
  reset: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20",
}

const ROLE_COLORS: Record<string, string> = {
  admin: "text-emerald-600 dark:text-emerald-400",
  caseworker: "text-indigo-600 dark:text-indigo-400",
  viewer: "text-slate-600 dark:text-slate-400",
}

const PAGE_SIZE = 25

export default function AuditTable() {
  const [rows, setRows] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState("")

  const load = useCallback(async (p: number) => {
    setLoading(true); setError(null)
    try {
      const res = await fetch(`/api/audit?limit=${PAGE_SIZE}&offset=${p * PAGE_SIZE}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setRows(data.rows); setTotal(data.total)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(page) }, [page, load])

  const filtered = filter
    ? rows.filter(r => r.action.includes(filter) || r.user_role?.includes(filter) || r.entity?.includes(filter))
    : rows

  const totalPages = Math.ceil(total / PAGE_SIZE)

  if (error) return <div className="p-6 text-rose-500 dark:text-rose-400 text-sm">Error: {error}</div>

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2 flex-wrap">
          {["", "create_client", "export", "ai_query", "generate_report", "reset"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                filter === f
                  ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  : "bg-slate-100 dark:bg-white/[0.04] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.2]"
              }`}
            >
              {f || "All"}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs">
          <span>{total.toLocaleString()} total entries</span>
          <button onClick={() => load(page)} className="p-1 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" title="Refresh">
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/[0.08]">
                <th className="text-left px-4 py-3 text-slate-500 dark:text-slate-400 font-medium text-xs whitespace-nowrap">Timestamp</th>
                <th className="text-left px-4 py-3 text-slate-500 dark:text-slate-400 font-medium text-xs">Action</th>
                <th className="text-left px-4 py-3 text-slate-500 dark:text-slate-400 font-medium text-xs hidden sm:table-cell">Entity</th>
                <th className="text-left px-4 py-3 text-slate-500 dark:text-slate-400 font-medium text-xs hidden md:table-cell">Role</th>
                <th className="text-left px-4 py-3 text-slate-500 dark:text-slate-400 font-medium text-xs hidden lg:table-cell">IP</th>
                <th className="text-right px-4 py-3 text-slate-500 dark:text-slate-400 font-medium text-xs">Detail</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i} className="border-b border-slate-50 dark:border-white/[0.04]">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-slate-200 dark:bg-white/[0.06] rounded animate-pulse" style={{ width: `${[120, 90, 70, 80, 100, 40][j]}px` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500 text-sm">No audit entries found.</td></tr>
              ) : (
                filtered.map((row) => (
                  <>
                    <tr
                      key={row.id}
                      className="border-b border-slate-50 dark:border-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.02] cursor-pointer transition-colors"
                      onClick={() => setExpanded(expanded === row.id ? null : row.id)}
                    >
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs font-mono whitespace-nowrap">
                        {new Date(row.at).toLocaleString("en-CA", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border font-mono ${ACTION_COLORS[row.action] ?? "text-slate-500 bg-slate-500/10 border-slate-500/20"}`}>
                          {row.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-xs hidden sm:table-cell">{row.entity}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`flex items-center gap-1 text-xs font-medium ${ROLE_COLORS[row.user_role] ?? "text-slate-500"}`}>
                          <Shield size={10} />{row.user_role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 dark:text-slate-500 text-xs font-mono hidden lg:table-cell">{row.source_ip || "N/A"}</td>
                      <td className="px-4 py-3 text-right">
                        {expanded === row.id
                          ? <ChevronUp size={14} className="ml-auto text-slate-400 dark:text-slate-500" />
                          : <ChevronDown size={14} className="ml-auto text-slate-400 dark:text-slate-500" />}
                      </td>
                    </tr>
                    {expanded === row.id && (
                      <tr key={`${row.id}-detail`} className="border-b border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.02]">
                        <td colSpan={6} className="px-4 py-3">
                          <pre className="text-xs font-mono text-slate-600 dark:text-slate-300 bg-white dark:bg-black/30 rounded-lg p-3 overflow-x-auto border border-slate-100 dark:border-white/[0.06]">
                            {JSON.stringify(row.detail, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-white/[0.08]">
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Page {page + 1} of {totalPages} · {total.toLocaleString()} entries
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
