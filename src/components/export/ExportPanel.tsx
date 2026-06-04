"use client"
import { useState } from "react"
import { Download, Zap, FileText } from "lucide-react"
import NarrativePanel from "./NarrativePanel"
import { FUNDERS as FUNDER_CONFIGS } from "@/lib/funders"

const FUNDERS = [
  { key:"ircc", label:"IRCC", sub:"Immigration, Refugees and Citizenship Canada", programs:["Settlement Services","LINC Language Training"], color:"#10b981", stat:"7,130 clients", photo:"https://images.unsplash.com/photo-1569025690938-a00729c9e1f9?w=400&q=60" },
  { key:"eo", label:"Employment Ontario", sub:"Ministry of Labour, Training and Skills Development", programs:["Employment Services","Skilled Trades"], color:"#6366f1", stat:"6,360 clients", photo:"https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&q=60" },
  { key:"uw", label:"Community Foundations", sub:"Toronto Foundation · Laidlaw Foundation · United Way", programs:["Mental Health and Wellness","Youth Programs"], color:"#f59e0b", stat:"2,860 clients", photo:"https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&q=60" },
  { key:"city", label:"City of Toronto", sub:"Social Development, Finance and Administration", programs:["Mentoring for Change","Women's Programs"], color:"#8b5cf6", stat:"2,790 clients", photo:"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=60" },
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
        <h1 className="font-sora text-3xl text-slate-900 dark:text-white">Funder Export</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Generate funder-specific reports instantly, shaped to their exact column specification.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FUNDERS.map(f => (
          <button
            key={f.key}
            onClick={() => setSelected(f.key)}
            className={`glass-hover text-left rounded-xl border overflow-hidden transition-all ${selected===f.key ? "border-emerald-400/50 ring-1 ring-emerald-400/30" : "border-slate-200 dark:border-white/[0.08]"}`}
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
                {f.programs.map(p => <span key={p} className="px-2 py-0.5 rounded-full text-xs text-slate-600 dark:text-slate-300" style={{ background:`${f.color}22` }}>{p}</span>)}
              </div>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="glass rounded-xl p-5 space-y-4 animate-fade-in">
          <h2 className="font-medium text-slate-700 dark:text-slate-200">Export Options: {selectedFunder?.label}</h2>
          <div className="flex flex-wrap gap-3">
            <button onClick={downloadCSV} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-medium rounded-lg transition-colors">
              <Download size={14} /> Download CSV
            </button>
            <button onClick={generateNarrative} className="flex items-center gap-2 px-4 py-2 glass border border-slate-200 dark:border-white/[0.1] hover:border-slate-300 dark:hover:border-white/[0.2] text-slate-700 dark:text-slate-200 text-sm rounded-lg transition-colors">
              <Zap size={14} className="text-amber-500 dark:text-amber-400" /> Generate AI Report
            </button>
            <button onClick={() => setShowColumns(!showColumns)} className="flex items-center gap-2 px-4 py-2 glass border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 text-sm rounded-lg transition-colors">
              <FileText size={14} /> {showColumns ? "Hide" : "Preview"} Columns
            </button>
          </div>
          {showColumns && selected && FUNDER_CONFIGS[selected] && (
            <div className="bg-slate-100 dark:bg-black/30 rounded-lg p-4">
              <p className="text-slate-500 dark:text-slate-400 text-xs mb-3">CSV columns for {selectedFunder?.label} ({FUNDER_CONFIGS[selected].csvHeaders.length} columns):</p>
              <div className="flex flex-wrap gap-1.5">
                {FUNDER_CONFIGS[selected].csvHeaders.map((col, i) => (
                  <span key={col} className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs font-mono text-emerald-700 dark:text-emerald-300">
                    <span className="text-emerald-500/50">{i + 1}</span> {col}
                  </span>
                ))}
              </div>
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
        <h2 className="font-sora text-lg text-slate-700 dark:text-slate-200 mb-4">Integration Story</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { title:"Microsoft Forms", desc:"Power Automate webhook. 20 min setup, zero staff behavior change.", icon:"📋", color:"text-blue-600 dark:text-blue-400" },
            { title:"Salesforce", desc:"REST webhook from Salesforce to OneView. Additive, not replacement.", icon:"☁️", color:"text-cyan-600 dark:text-cyan-400" },
            { title:"iCARE / EOIS-CaMS", desc:"CSV export shaped to government spec. Compliant bulk upload.", icon:"🏛️", color:"text-amber-600 dark:text-amber-400" },
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
