"use client"
import { useState } from "react"
import { Sparkles, CheckCircle, Send } from "lucide-react"
import NarrativePanel from "@/components/export/NarrativePanel"

const FUNDERS = [{value:"ircc",label:"IRCC"},{value:"eo",label:"Employment Ontario"},{value:"uw",label:"United Way"},{value:"city",label:"City of Toronto"}]
const PERIODS = ["Q1 2026","Q2 2026","Q3 2025","Q4 2025","Full Year 2025"]
const EXAMPLE_QUESTIONS = [
  "How many IRCC clients achieved employment last quarter?",
  "Which program has the highest outcome rate?",
  "How many cross-program clients are enrolled in 2026?",
]

export default function AIPanel() {
  const [funder, setFunder] = useState("ircc")
  const [period, setPeriod] = useState("Q1 2026")
  const [reportLoading, setReportLoading] = useState(false)
  const [report, setReport] = useState<{text:string,cached:boolean}|null>(null)
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState<string|null>(null)
  const [qLoading, setQLoading] = useState(false)

  async function generateReport() {
    setReportLoading(true); setReport(null)
    const res = await fetch("/api/draft-report", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({funder, period}) })
    const data = await res.json()
    setReport({ text: data.narrative, cached: data.cached })
    setReportLoading(false)
  }

  async function askQuestion() {
    if (!question.trim()) return
    setQLoading(true); setAnswer(null)
    const res = await fetch("/api/query", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({question}) })
    const data = await res.json()
    setAnswer(data.answer)
    setQLoading(false)
  }

  return (
    <div className="space-y-10">
      <section className="space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={20} className="text-emerald-400" />
            <h1 className="font-sora text-3xl text-white">AI Report Writer</h1>
          </div>
          <p className="text-slate-400">SQL computes the numbers. AI writes the narrative. Every figure is grounded in real data.</p>
          <div className="flex items-center gap-2 mt-2">
            <CheckCircle size={14} className="text-emerald-400" />
            <span className="text-emerald-400 text-xs">All figures verified against live database</span>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <select value={funder} onChange={e=>setFunder(e.target.value)} className="bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-emerald-500/60">
            {FUNDERS.map(f=><option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <select value={period} onChange={e=>setPeriod(e.target.value)} className="bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-emerald-500/60">
            {PERIODS.map(p=><option key={p} value={p}>{p}</option>)}
          </select>
          <button onClick={generateReport} disabled={reportLoading} className="flex-1 sm:flex-none px-6 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold rounded-lg transition-colors text-sm">
            {reportLoading ? "Generating..." : "Generate Report"}
          </button>
        </div>
        {(reportLoading || report) && <NarrativePanel narrative={report?.text??""} funder={funder} period={period} cached={report?.cached??false} loading={reportLoading} />}
      </section>

      <div className="border-t border-white/[0.06]" />

      <section className="space-y-5">
        <div>
          <h2 className="font-sora text-2xl text-white">Ask About Your Programs</h2>
          <p className="text-slate-400 text-sm mt-1">Get instant answers grounded in real program data.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_QUESTIONS.map(q => (
            <button key={q} onClick={()=>setQuestion(q)} className="px-3 py-1.5 glass border border-white/[0.08] hover:border-white/[0.2] text-slate-400 hover:text-slate-200 text-xs rounded-full transition-colors">
              {q}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <textarea
            value={question}
            onChange={e=>setQuestion(e.target.value)}
            placeholder="Ask anything about your program data..."
            className="flex-1 bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-emerald-500/60 resize-none h-16"
          />
          <button onClick={askQuestion} disabled={qLoading||!question.trim()} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black rounded-lg transition-colors">
            <Send size={16} />
          </button>
        </div>
        {(qLoading || answer) && (
          <div className="glass rounded-xl p-5">
            {qLoading ? (
              <div className="space-y-2 animate-pulse">
                {[...Array(3)].map((_,i)=><div key={i} className="h-4 bg-white/[0.06] rounded" />)}
              </div>
            ) : (
              <p className="text-slate-300 leading-relaxed text-sm">{answer}</p>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
