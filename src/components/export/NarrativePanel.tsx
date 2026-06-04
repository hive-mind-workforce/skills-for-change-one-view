"use client"
interface NarrativePanelProps {
  narrative: string; funder: string; period: string; cached: boolean; loading: boolean
}
export default function NarrativePanel({ narrative, funder, period, cached, loading }: NarrativePanelProps) {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-white/[0.08] flex items-center justify-between" style={{background:"linear-gradient(90deg,rgba(16,185,129,0.1),transparent)"}}>
        <div>
          <span className="font-medium text-slate-200">{funder.toUpperCase()} Report</span>
          <span className="text-slate-500 text-sm ml-2">{period}</span>
        </div>
        {cached && <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30">Cached</span>}
      </div>
      <div className="p-5">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(4)].map((_,i) => <div key={i} className="h-4 bg-white/[0.06] rounded" style={{width:`${[100,85,92,70][i]}%`}} />)}
          </div>
        ) : (
          <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">{narrative}</p>
        )}
      </div>
    </div>
  )
}
