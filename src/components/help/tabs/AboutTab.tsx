import { GitBranch, ExternalLink, CheckCircle } from "lucide-react"

export default function AboutTab() {
  return (
    <div className="space-y-8">
      <div className="glass rounded-xl p-8 text-center">
        <p className="text-emerald-400 text-sm uppercase tracking-widest mb-2">Skills for Change</p>
        <h2 className="font-sora text-5xl text-white mb-3">OneView</h2>
        <p className="text-slate-400 text-lg">Toronto's leading multicultural settlement and employment nonprofit</p>
        <div className="flex justify-center items-center gap-6 mt-6">
          <div className="text-center">
            <div className="font-sora text-4xl text-emerald-400">16,247</div>
            <div className="text-slate-500 text-sm">clients served</div>
          </div>
          <div className="w-px h-12 bg-white/[0.08]" />
          <div className="text-center">
            <div className="font-sora text-4xl text-indigo-400">8</div>
            <div className="text-slate-500 text-sm">programs</div>
          </div>
          <div className="w-px h-12 bg-white/[0.08]" />
          <div className="text-center">
            <div className="font-sora text-4xl text-amber-400">4</div>
            <div className="text-slate-500 text-sm">funders</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <h3 className="font-sora text-lg text-rose-400 mb-3">The Challenge</h3>
          <ul className="space-y-2">
            {["4 funder portals, each with different column specs","Staff re-enter the same client data multiple times per reporting cycle","Spreadsheets diverge from what's in the portals","Reporting takes weeks instead of hours"].map((item,i) => (
              <li key={i} className="flex items-start gap-2 text-slate-400 text-sm">
                <span className="text-rose-400 mt-0.5">✕</span> {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="glass rounded-xl p-6">
          <h3 className="font-sora text-lg text-emerald-400 mb-3">The OneView Solution</h3>
          <ul className="space-y-2">
            {["Capture client data once, use everywhere","Auto-generate funder exports in their exact format","AI writes narrative reports from real SQL data","Built-in privacy compliance and audit trail"].map((item,i) => (
              <li key={i} className="flex items-start gap-2 text-slate-400 text-sm">
                <CheckCircle size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" /> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="font-sora text-lg text-slate-200 mb-4">Technology Stack</h3>
        <div className="flex flex-wrap gap-2">
          {["Next.js 15","TypeScript","Tailwind CSS","shadcn/ui","Vercel Postgres","Recharts","driver.js","MIT License"].map(t => (
            <span key={t} className="px-3 py-1 bg-white/[0.04] border border-white/[0.08] rounded-full text-slate-300 text-sm">{t}</span>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label:"Desirability", desc:"Caseworkers input once. Funders receive tailored reports instantly.", color:"text-emerald-400" },
          { label:"Feasibility", desc:"Next.js and Vercel Postgres. Deploys in hours, additive to existing tools.", color:"text-indigo-400" },
          { label:"Viability", desc:"Free-tier viable. Scales to full SfC roster on day one.", color:"text-amber-400" },
          { label:"Functionality", desc:"Live at a Vercel URL. Click, explore, and generate real exports.", color:"text-violet-400" },
        ].map(c => (
          <div key={c.label} className="glass rounded-xl p-4">
            <div className={`font-sora text-sm ${c.color} mb-2`}>{c.label}</div>
            <p className="text-slate-400 text-xs">{c.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href="https://github.com/hive-mind-workforce/skills-for-change-one-view"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-5 py-3 glass border border-white/[0.15] hover:border-white/[0.3] text-slate-200 rounded-xl transition-colors"
        >
          <GitBranch size={18} />
          <span className="font-medium">View Source on GitHub</span>
          <ExternalLink size={14} className="text-slate-500" />
        </a>
        <div className="flex items-center gap-2 px-5 py-3 glass rounded-xl border border-emerald-500/20 text-emerald-400 text-sm">
          SfC Hackathon 2026
        </div>
      </div>
    </div>
  )
}
