"use client"
import { useState, useEffect } from "react"
import { Download, Zap, Settings2, Plus, X, Pencil, Check, ChevronUp, ChevronDown } from "lucide-react"
import NarrativePanel from "./NarrativePanel"
import { FUNDERS as FUNDER_CONFIGS } from "@/lib/funders"

// ── Types ─────────────────────────────────────────────────────────────────────

type ColumnItem = {
  id: string
  label: string
  field: string
  enabled: boolean
}

type ExportData = {
  headers: string[]
  rows: string[][]
  rawData: Record<string, string>[]
}

// All possible fields from rawData that users can add as custom columns
const EXTRA_FIELDS: { field: string; label: string }[] = [
  { field: "country_of_origin", label: "Country of Origin" },
  { field: "age_group",         label: "Age Group" },
  { field: "gender",            label: "Gender" },
  { field: "source",            label: "Referral Source" },
  { field: "stage",             label: "Current Stage" },
  { field: "consent_cross_program", label: "Cross-Program Consent" },
  { field: "total_achieved",    label: "Total Outcomes Achieved" },
  { field: "total_outcomes",    label: "Total Outcomes (All)" },
  { field: "funder",            label: "Funder Code" },
]

const FUNDERS = [
  { key: "ircc",  label: "IRCC",               sub: "Immigration, Refugees and Citizenship Canada",       programs: ["Settlement Services","LINC Language Training"],      color: "#10b981", stat: "7,130 clients",  photo: "https://images.unsplash.com/photo-1569025690938-a00729c9e1f9?w=400&q=60" },
  { key: "eo",    label: "Employment Ontario",   sub: "Ministry of Labour, Training and Skills Development", programs: ["Employment Services","Skilled Trades"],              color: "#6366f1", stat: "6,360 clients",  photo: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&q=60" },
  { key: "uw",    label: "Community Foundations",sub: "Toronto Foundation · Laidlaw Foundation · United Way", programs: ["Mental Health and Wellness","Youth Programs"],      color: "#f59e0b", stat: "2,860 clients",  photo: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&q=60" },
  { key: "city",  label: "City of Toronto",      sub: "Social Development, Finance and Administration",     programs: ["Mentoring for Change","Women's Programs"],           color: "#8b5cf6", stat: "2,790 clients",  photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=60" },
]

function buildDefaultColumns(funderKey: string): ColumnItem[] {
  const config = FUNDER_CONFIGS[funderKey]
  if (!config) return []
  return config.csvHeaders.map((h, i) => ({
    id: `default-${i}`,
    label: h,
    field: `__header_${i}`,
    enabled: true,
  }))
}

// ── Column manager ────────────────────────────────────────────────────────────

interface ColumnManagerProps {
  columns: ColumnItem[]
  onChange: (cols: ColumnItem[]) => void
  exportData: ExportData | null
}

function ColumnManager({ columns, onChange, exportData }: ColumnManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState("")
  const [showAddPicker, setShowAddPicker] = useState(false)

  function startEdit(col: ColumnItem) {
    setEditingId(col.id)
    setEditLabel(col.label)
  }

  function commitEdit(id: string) {
    onChange(columns.map(c => c.id === id ? { ...c, label: editLabel.trim() || c.label } : c))
    setEditingId(null)
  }

  function toggleEnabled(id: string) {
    onChange(columns.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c))
  }

  function deleteColumn(id: string) {
    onChange(columns.filter(c => c.id !== id))
  }

  function moveUp(idx: number) {
    if (idx === 0) return
    const next = [...columns]
    ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
    onChange(next)
  }

  function moveDown(idx: number) {
    if (idx === columns.length - 1) return
    const next = [...columns]
    ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
    onChange(next)
  }

  function addField(field: string, label: string) {
    if (columns.some(c => c.field === field)) return
    onChange([...columns, { id: `extra-${field}`, label, field, enabled: true }])
    setShowAddPicker(false)
  }

  const usedFields = new Set(columns.map(c => c.field))
  const availableExtras = EXTRA_FIELDS.filter(f => !usedFields.has(f.field))

  return (
    <div className="space-y-2">
      {columns.map((col, idx) => (
        <div key={col.id} className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${col.enabled ? "bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.08]" : "bg-transparent border-dashed border-slate-200 dark:border-white/[0.06] opacity-50"}`}>
          {/* Up/Down */}
          <div className="flex flex-col gap-0.5 flex-shrink-0">
            <button onClick={() => moveUp(idx)} className="text-slate-300 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-20" disabled={idx === 0}>
              <ChevronUp size={12} />
            </button>
            <button onClick={() => moveDown(idx)} className="text-slate-300 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-20" disabled={idx === columns.length - 1}>
              <ChevronDown size={12} />
            </button>
          </div>

          {/* Enable toggle */}
          <button
            onClick={() => toggleEnabled(col.id)}
            className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${col.enabled ? "bg-emerald-500 border-emerald-500" : "border-slate-300 dark:border-slate-600"}`}
          >
            {col.enabled && <Check size={9} className="text-white" />}
          </button>

          {/* Label (editable) */}
          <div className="flex-1 min-w-0">
            {editingId === col.id ? (
              <input
                value={editLabel}
                onChange={e => setEditLabel(e.target.value)}
                onBlur={() => commitEdit(col.id)}
                onKeyDown={e => { if (e.key === "Enter") commitEdit(col.id); if (e.key === "Escape") setEditingId(null) }}
                autoFocus
                className="w-full text-sm glass rounded px-2 py-0.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
            ) : (
              <span className="text-sm text-slate-700 dark:text-slate-300 truncate block">{col.label}</span>
            )}
            {col.field.startsWith("__header") && (
              <span className="text-xs text-slate-400">default column</span>
            )}
            {!col.field.startsWith("__header") && (
              <span className="text-xs text-slate-400">{col.field}</span>
            )}
          </div>

          {/* Actions */}
          <button onClick={() => startEdit(col)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex-shrink-0 p-0.5">
            <Pencil size={12} />
          </button>
          <button onClick={() => deleteColumn(col.id)} className="text-slate-400 hover:text-rose-500 flex-shrink-0 p-0.5">
            <X size={13} />
          </button>
        </div>
      ))}

      {/* Add column */}
      <div className="relative">
        <button
          onClick={() => setShowAddPicker(!showAddPicker)}
          disabled={availableExtras.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs hover:border-emerald-500/60 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={12} /> Add column
        </button>
        {showAddPicker && availableExtras.length > 0 && (
          <div className="absolute top-full mt-1 left-0 z-20 glass rounded-xl shadow-xl border border-slate-200 dark:border-white/[0.12] w-52">
            {availableExtras.map(f => (
              <button
                key={f.field}
                onClick={() => addField(f.field, f.label)}
                className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors border-b border-slate-100 dark:border-white/[0.06] last:border-0 first:rounded-t-xl last:rounded-b-xl"
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main export panel ─────────────────────────────────────────────────────────

export default function ExportPanel() {
  const [selected, setSelected] = useState<string | null>(null)
  const [showColumnMgr, setShowColumnMgr] = useState(false)
  const [columns, setColumns] = useState<ColumnItem[]>([])
  const [exportData, setExportData] = useState<ExportData | null>(null)
  const [exportLoading, setExportLoading] = useState(false)
  const [narrative, setNarrative] = useState<{ text: string; cached: boolean } | null>(null)
  const [narrativeLoading, setNarrativeLoading] = useState(false)

  function selectFunder(key: string) {
    setSelected(key)
    setNarrative(null)            // clear cached narrative for previous funder
    setExportData(null)
    setShowColumnMgr(false)
    setColumns(buildDefaultColumns(key))
  }

  async function loadExportData() {
    if (!selected) return
    setExportLoading(true)
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ funder: selected }),
      })
      const data = await res.json()
      setExportData(data)
    } finally {
      setExportLoading(false)
    }
  }

  async function downloadCSV() {
    if (!selected) return
    let data = exportData
    if (!data) {
      setExportLoading(true)
      try {
        const res = await fetch("/api/export", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ funder: selected }),
        })
        data = await res.json()
        setExportData(data)
      } finally {
        setExportLoading(false)
      }
    }
    if (!data) return

    const enabledCols = columns.filter(c => c.enabled)
    const csvHeaders = enabledCols.map(c => c.label)
    const csvRows = (data.rawData ?? []).map((rawRow: Record<string, string>, rowIdx: number) => {
      return enabledCols.map(col => {
        if (col.field.startsWith("__header_")) {
          const headerIdx = parseInt(col.field.replace("__header_", ""), 10)
          return data!.rows[rowIdx]?.[headerIdx] ?? ""
        }
        return rawRow[col.field] ?? ""
      })
    })

    const csv = [csvHeaders.join(","), ...csvRows.map(r => r.map(c => `"${(c ?? "").replace(/"/g, '""')}"`).join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `${selected}-export.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  async function generateNarrative() {
    if (!selected) return
    setNarrativeLoading(true); setNarrative(null)
    const res = await fetch("/api/draft-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ funder: selected, period: "Q1 2026" }),
    })
    const data = await res.json()
    setNarrative({ text: data.narrative ?? data.error ?? "Failed to generate report.", cached: data.cached ?? false })
    setNarrativeLoading(false)
  }

  const selectedFunder = FUNDERS.find(f => f.key === selected)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-sora text-3xl text-slate-900 dark:text-white">Funder Export</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Generate funder-specific reports instantly, shaped to their exact column specification.</p>
      </div>

      {/* Funder selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FUNDERS.map(f => (
          <button
            key={f.key}
            onClick={() => selectFunder(f.key)}
            className={`glass-hover text-left rounded-xl border overflow-hidden transition-all ${selected === f.key ? "border-emerald-400/50 ring-1 ring-emerald-400/30" : "border-slate-200 dark:border-white/[0.08]"}`}
          >
            <div className="relative h-24">
              <img src={f.photo} alt={f.label} className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${f.color}66, #06061099)` }} />
              <div className="absolute inset-0 p-4 flex items-end">
                <div>
                  <div className="font-sora text-lg text-white">{f.label}</div>
                  <div className="text-white/70 text-xs">{f.stat}</div>
                </div>
              </div>
            </div>
            <div className="p-4" style={{ borderTop: `2px solid ${f.color}40` }}>
              <div className="text-slate-400 text-xs mb-2">{f.sub}</div>
              <div className="flex flex-wrap gap-1.5">
                {f.programs.map(p => (
                  <span key={p} className="px-2 py-0.5 rounded-full text-xs text-slate-600 dark:text-slate-300" style={{ background: `${f.color}22` }}>{p}</span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Export options */}
      {selected && (
        <div className="glass rounded-xl p-5 space-y-4 animate-fade-in">
          <h2 className="font-medium text-slate-700 dark:text-slate-200">Export Options: {selectedFunder?.label}</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={downloadCSV}
              disabled={exportLoading}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-black text-sm font-medium rounded-lg transition-colors"
            >
              <Download size={14} /> {exportLoading ? "Preparing…" : "Download CSV"}
            </button>
            <button
              onClick={generateNarrative}
              className="flex items-center gap-2 px-4 py-2 glass border border-slate-200 dark:border-white/[0.1] hover:border-slate-300 dark:hover:border-white/[0.2] text-slate-700 dark:text-slate-200 text-sm rounded-lg transition-colors"
            >
              <Zap size={14} className="text-amber-500 dark:text-amber-400" /> Generate AI Report
            </button>
            <button
              onClick={() => { if (!exportData && !exportLoading) loadExportData(); setShowColumnMgr(!showColumnMgr) }}
              className="flex items-center gap-2 px-4 py-2 glass border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 text-sm rounded-lg transition-colors"
            >
              <Settings2 size={14} /> {showColumnMgr ? "Hide" : "Manage"} Columns
            </button>
          </div>

          {/* Column manager */}
          {showColumnMgr && (
            <div className="border border-slate-200 dark:border-white/[0.08] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Column Configuration: {selectedFunder?.label}
                </p>
                <p className="text-xs text-slate-400">{columns.filter(c => c.enabled).length} of {columns.length} enabled</p>
              </div>
              <ColumnManager columns={columns} onChange={setColumns} exportData={exportData} />
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
                Rename columns by clicking the pencil icon. Use arrows to reorder. Uncheck to exclude from CSV.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Narrative output */}
      {(narrativeLoading || narrative) && (
        <NarrativePanel
          narrative={narrative?.text ?? ""}
          funder={selected ?? ""}
          period="Q1 2026"
          cached={narrative?.cached ?? false}
          loading={narrativeLoading}
        />
      )}

      {/* Integration Story */}
      <div className="glass rounded-xl p-5">
        <h2 className="font-sora text-lg text-slate-700 dark:text-slate-200 mb-4">Integration Story</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { title: "Microsoft Forms", desc: "Power Automate webhook. 20 min setup, zero staff behavior change.", icon: "📋", color: "text-blue-600 dark:text-blue-400" },
            { title: "SharePoint / Excel", desc: "Historical Excel data migrated once via CSV import. SharePoint used for file storage alongside OneView.", icon: "📊", color: "text-cyan-600 dark:text-cyan-400" },
            { title: "iCARE / EOIS-CaMS", desc: "CSV export shaped to government spec. Compliant bulk upload.", icon: "🏛️", color: "text-amber-600 dark:text-amber-400" },
          ].map((item, i) => (
            <div key={i} className="flex gap-3 p-4 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/[0.06]">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className={`font-medium text-sm ${item.color}`}>{item.title}</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
          <span><strong className="text-emerald-600 dark:text-emerald-400">4</strong> funders</span>
          <span><strong className="text-indigo-600 dark:text-indigo-400">8</strong> programs</span>
          <span><strong className="text-amber-600 dark:text-amber-400">1</strong> system of record</span>
        </div>
      </div>
    </div>
  )
}
