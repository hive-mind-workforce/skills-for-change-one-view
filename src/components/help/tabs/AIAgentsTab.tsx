import { ExternalLink } from "lucide-react"

export default function AIAgentsTab() {
  return (
    <div className="space-y-8">
      <div className="glass rounded-xl p-6">
        <h2 className="font-sora text-2xl text-slate-900 dark:text-white mb-1">Built for AI Agents</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Every artifact is designed so an AI coding agent can implement, extend, or audit OneView without human explanation.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { file:"CLAUDE.md", desc:"Build conventions, env vars, architecture, data model, API reference, integration guide. Start here.", link:"/CLAUDE.md", color:"#f59e0b" },
          { file:"/llms.txt", desc:"Answer.AI convention. Plain-text index of all endpoints, roles, data shapes, and integration notes.", link:"/llms.txt", color:"#10b981" },
          { file:"/openapi.json", desc:"Full OpenAPI 3.1 spec. Every route, request/response schema, auth model. Machine-readable.", link:"/openapi.json", color:"#6366f1" },
          { file:"/sitemap.xml", desc:"All public routes for SEO and AI crawlers.", link:"/sitemap.xml", color:"#8b5cf6" },
        ].map(a => (
          <a key={a.file} href={a.link} target="_blank" rel="noopener noreferrer" className="glass glass-hover rounded-xl p-5 group flex flex-col gap-2 transition-all" style={{borderLeft:`3px solid ${a.color}`}}>
            <div className="flex items-center justify-between">
              <span className="font-mono font-medium text-slate-700 dark:text-slate-200 text-sm">{a.file}</span>
              <ExternalLink size={14} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs">{a.desc}</p>
          </a>
        ))}
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="font-sora text-lg text-slate-700 dark:text-slate-200 mb-4">Agent Quickstart (5 steps)</h3>
        <div className="space-y-3">
          {[
            { step:1, title:"Read CLAUDE.md", code:"# CLAUDE.md contains the complete architecture\n# data model, API reference, and build conventions" },
            { step:2, title:"Verify connectivity", code:"curl https://sfc-oneview.vercel.app/api/health" },
            { step:3, title:"Query program metrics", code:'curl -X POST /api/query \\\n  -d \'{"question":"Total clients by program?"}\''},
            { step:4, title:"Generate funder narrative", code:'curl -X POST /api/draft-report \\\n  -d \'{"funder":"ircc","period":"Q1 2026"}\''},
            { step:5, title:"Export funder CSV", code:'curl -X POST /api/export \\\n  -d \'{"funder":"ircc"}\' > ircc-export.csv'},
          ].map(s => (
            <div key={s.step} className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center flex-shrink-0 mt-1">{s.step}</div>
              <div className="flex-1">
                <div className="text-slate-600 dark:text-slate-300 text-sm font-medium mb-1">{s.title}</div>
                <pre className="bg-slate-100 dark:bg-black/40 rounded-lg p-2.5 text-xs text-emerald-700 dark:text-emerald-300 font-mono whitespace-pre-wrap overflow-x-auto">{s.code}</pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
