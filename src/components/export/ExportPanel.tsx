"use client"
import { useState } from "react"
import { Download, Zap, FileText } from "lucide-react"
import NarrativePanel from "./NarrativePanel"

const FUNDERS = [
  { key:"ircc", label:"IRCC", sub:"Immigration, Refugees and Citizenship Canada", programs:["Settlement","Language"], color:"#10b981" },
  { key:"eo", label:"Employment Ontario", sub:"Ministry of Labour, Training and Skills Development", programs:["Employment","Trades"], color:"#6366f1" },
  { key:"uw", label:"United Way", sub:"United Way Greater Toronto", programs:["Mental Health","Youth"], color:"#f59e0b" },
  { key:"city", label:"City of Toronto", sub:"Social Development Finance and Administration", programs:["Mentoring","Women's"], color:"#8b5cf6" },
]

export default function ExportPanel() {
  const [selected, setSelected] = useState<string|null>(null)
  const [showColumns, setShowColumns] = useState(false)
  const [narrative, setNarrative] = useState<{text:string,cached:boolean}|null>(null)
  const [narrativeLoading, setNarrativeLoading] = useState(false)

  async function downloadCSV() {
    if (!selected) return
    const res = await fetch("/api/export", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({funder:selected}) })
    const data = await res.json()
    if (!data.headers) return
    const csv = [data.headers.join(","), ...data.rows.map((r:string[]) => r.map((c:string) => `"${c}"`).join(","))].join("\n")
    const blob = new Blob([csv], {type:"text/csv"})
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href=url; a.download=`${selected}-export.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  async function generateNarrative() {
    if (!selected) return
    setNarrativeLoading(true); setNarrative(null)
    const res = await fetch("/api/draft-report", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({funder:selected, period:"Q1 2026"}) })
    const data = await res.json()
    setNarrative({ text: data.narrative, cached: data.cached })
    setNarrativeLoading(false)
  }

  const selectedFunder = FUNDERS.find(f => f.key === selected)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-sora text-3xl text-white">Funder Export</h1>
        <p className="text-slate-400 mt-1">Generate funder-specific reports instantly, shaped to their exact column specification.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FUNDERS.map(f => (
          <button
            key={f.key}
            onClick={() => setSelected(f.key)}
            className={`glass-hover text-left p-5 rounded-xl border transition-all ${selected===f.key ? "border-emerald-400/50 bg-emerald-500/5" : "border-white/[0.08]"}`}
            style={{ borderLeftWidth: 3, borderLeftColor: f.color }}
          >
            <div className="font-sora text-lg text-white">{f.label}</div>
            <div className="text-slate-500 text-xs mt-0.5 mb-3">{f.sub}</div>
            <div className="flex flex-wrap gap-1.5">
              {f.programs.map(p => <span key={p} className="px-2 py-0.5 bg-white/[0.06] rounded-full text-xs text-slate-300">{p}</span>)}
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="glass rounded-xl p-5 space-y-4 animate-fade-in">
          <h2 className="font-medium text-slate-200">Export Options: {selectedFunder?.label}</h2>
          <div className="flex flex-wrap gap-3">
            <button onClick={downloadCSV} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-medium rounded-lg transition-colors">
              <Download size={14} /> Download CSV
            </button>
            <button onClick={generateNarrative} className="flex items-center gap-2 px-4 py-2 glass border border-white/[0.1] hover:border-white/[0.2] text-slate-200 text-sm rounded-lg transition-colors">
              <Zap size={14} className="text-amber-400" /> Generate AI Report
            </button>
            <button onClick={() => setShowColumns(!showColumns)} className="flex items-center gap-2 px-4 py-2 glass border border-white/[0.08] text-slate-400 text-sm rounded-lg transition-colors">
              <FileText size={14} /> {showColumns ? "Hide" : "Preview"} Columns
            </button>
          </div>
          {showColumns && (
            <div className="bg-black/30 rounded-lg p-3 text-xs text-emerald-300 font-mono">
              <p className="text-slate-400 mb-1">CSV columns for {selectedFunder?.label}:</p>
            </div>
          )}
        </div>
      )}

      {(narrativeLoading || narrative) && (
        <NarrativePanel
          narrative={narrative?.text ?? ""}
          funder={selected ?? ""}
          period="Q1 2026"
          cached={narrative?.cached ?? false}
          loading={narrativeLoading}
        />
      )}

      <div className="glass rounded-xl p-5">
        <h2 className="font-sora text-lg text-slate-200 mb-4">Integration Story</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { title:"Microsoft Forms", desc:"Power Automate webhook. 20 min setup, zero staff behavior change.", icon:"📋", color:"text-blue-400" },
            { title:"Salesforce", desc:"REST webhook from Salesforce to OneView. Additive, not replacement.", icon:"☁️", color:"text-cyan-400" },
            { title:"iCARE / EOIS-CaMS", desc:"CSV export shaped to government spec. Compliant bulk upload.", icon:"🏛️", color:"text-amber-400" },
          ].map((item, i) => (
            <div key={i} className="flex gap-3 p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className={`font-medium text-sm ${item.color}`}>{item.title}</p>
                <p className="text-slate-400 text-xs mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-6 text-sm text-slate-400">
          <span><strong className="text-emerald-400">4</strong> funders</span>
          <span><strong className="text-indigo-400">8</strong> programs</span>
          <span><strong className="text-amber-400">1</strong> system of record</span>
        </div>
      </div>
    </div>
  )
}
