import { GitBranch, ExternalLink, CheckCircle, AlertTriangle, ArrowRight, Zap, Shield, TrendingUp, Database } from "lucide-react"

const PROBLEMS = [
  { title: "Data entered multiple times per client on different systems", desc: "Each funder (IRCC, Employment Ontario, Community Foundations, City of Toronto) has its own portal with its own column spec. Staff copy-paste the same client record into each one, every reporting cycle." },
  { title: "Reporting takes weeks, not hours", desc: "Narrative reports are written from scratch against whatever spreadsheet is most current. By the time they're submitted, the numbers are stale. Staff spend 3–4 weeks per quarter on reporting alone." },
  { title: "No single source of truth", desc: "Microsoft Forms feeds one spreadsheet. Salesforce tracks another set of interactions. Neither talks to the other. Outcomes (the metric funders care about most) live in a third system entirely." },
  { title: "Privacy compliance is manual", desc: "PHIPA requires a hard wall between mental health records and all other programs. Enforcing that wall in spreadsheets and shared drives depends on staff remembering a rule, not the system preventing the violation." },
]

const SHORT_TERM = [
  "OneView sits alongside Microsoft Forms and Salesforce: no rip-and-replace, no disruption",
  "Power Automate webhook: Forms submissions automatically land in OneView with zero staff behavior change",
  "Salesforce Outbound Message routes to OneView's /api/clients endpoint: additive, not a replacement",
  "Staff get a live dashboard immediately, without waiting for a system migration",
  "Funder CSV exports are generated in each funder's exact column format on demand",
  "AI narrative reports are drafted from real SQL data in seconds, not weeks",
]

const LONG_TERM = [
  { title: "OneView becomes the system of record", desc: "As caseworkers use the native intake form directly, the dependency on Microsoft Forms shrinks. OneView stores every client, every enrolment, every outcome in a structured, queryable database.", icon: Database, color: "text-emerald-400" },
  { title: "Salesforce dependency eliminated", desc: "Salesforce is an expensive general-purpose CRM. OneView is purpose-built for nonprofit program delivery and funder reporting. Over 2–3 years, OneView's client and outcomes data replaces what Salesforce tracks today, at a fraction of the cost.", icon: TrendingUp, color: "text-indigo-400" },
  { title: "Real-time outcomes, not quarterly retrospectives", desc: "When intake, enrolment, and outcomes live in one place, funders can receive a live dashboard link instead of a static report. The Q1 narrative writes itself. The PHI Wall is enforced by the database, not a staff checklist.", icon: Zap, color: "text-amber-400" },
  { title: "Privacy enforced by architecture, not process", desc: "PHIPA, FIPPA, and CYFSA rules are encoded as SQL constraints and consent flags, not policy documents. No staff training refresher can override them. No spreadsheet formula accidentally crosses a compliance line.", icon: Shield, color: "text-rose-400" },
]

const FEASIBILITY = [
  { label: "Week 1", desc: "Deploy to Vercel. Connect Microsoft Forms via Power Automate webhook. Staff see a live unified dashboard immediately, no behavior change required.", color: "text-emerald-400" },
  { label: "30–90 days", desc: "AI tooling migrates historical Salesforce client records into OneView. Data mapping, deduplication, and validation happen in hours, not months of manual work.", color: "text-indigo-400" },
  { label: "3–6 months", desc: "Teams use native OneView intake directly. Microsoft Forms retired. Salesforce kept only for donor and employer CRM, not client tracking. Quarterly reports generated in minutes.", color: "text-amber-400" },
  { label: "12 months", desc: "Full system of record. AI drafts all funder narratives. Structured data feeds replace manual portal uploads. Zero dependency on external form tools.", color: "text-violet-400" },
]

export default function AboutTab() {
  return (
    <div className="space-y-8">

      <div className="glass rounded-xl p-8 text-center">
        <p className="text-emerald-400 text-sm uppercase tracking-widest mb-2">Skills for Change · Toronto</p>
        <h2 className="font-sora text-5xl text-white mb-3">OneView</h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">Capture once, report to every funder. A single system of record for 8 programs, 4 funders, and 20,000+ clients: built to eliminate the data fragmentation that costs SfC weeks of staff time every quarter.</p>
        <div className="flex flex-wrap justify-center items-center gap-6 mt-8">
          <div className="text-center">
            <div className="font-sora text-4xl text-emerald-400">20,000+</div>
            <div className="text-slate-500 text-sm">clients served annually</div>
          </div>
          <div className="w-px h-12 bg-white/[0.08]" />
          <div className="text-center">
            <div className="font-sora text-4xl text-rose-400">3+ systems</div>
            <div className="text-slate-500 text-sm">client data split across today</div>
          </div>
          <div className="w-px h-12 bg-white/[0.08]" />
          <div className="text-center">
            <div className="font-sora text-4xl text-amber-400">3–4 wks</div>
            <div className="text-slate-500 text-sm">per quarter on reporting</div>
          </div>
          <div className="w-px h-12 bg-white/[0.08]" />
          <div className="text-center">
            <div className="font-sora text-4xl text-indigo-400">1×</div>
            <div className="text-slate-500 text-sm">with OneView</div>
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <AlertTriangle size={16} className="text-rose-400" />
          <h3 className="font-sora text-lg text-rose-400">The Problem with the Current System</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {PROBLEMS.map((p, i) => (
            <div key={i} className="p-4 bg-rose-500/[0.04] border border-rose-500/[0.12] rounded-xl">
              <div className="flex items-start gap-2 mb-2">
                <span className="text-rose-400 font-bold text-sm mt-0.5 flex-shrink-0">✕</span>
                <p className="text-slate-200 text-sm font-medium">{p.title}</p>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed pl-4">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <ArrowRight size={16} className="text-emerald-400" />
          <h3 className="font-sora text-lg text-emerald-400">Short-Term: Works Alongside What You Have</h3>
        </div>
        <p className="text-slate-500 text-sm mb-5 ml-6">No rip-and-replace. OneView connects to Microsoft Forms and Salesforce today via webhooks: staff change nothing, but now have a unified dashboard and on-demand funder exports.</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {SHORT_TERM.map((item, i) => (
            <div key={i} className="flex items-start gap-2 p-3 bg-emerald-500/[0.04] border border-emerald-500/[0.08] rounded-lg">
              <CheckCircle size={13} className="text-emerald-400 mt-0.5 flex-shrink-0" />
              <span className="text-slate-300 text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={16} className="text-indigo-400" />
          <h3 className="font-sora text-lg text-indigo-400">Long-Term: Eliminating the Dependencies</h3>
        </div>
        <p className="text-slate-500 text-sm mb-5 ml-6">With AI tooling, what would have taken 2–3 years of manual migration can happen in 3–12 months. OneView grows from an integration layer into the full system of record, replacing Microsoft Forms as the intake channel and Salesforce as the client tracking tool, at a fraction of the combined cost.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {LONG_TERM.map((item, i) => (
            <div key={i} className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <item.icon size={15} className={item.color} />
                <p className={`text-sm font-medium ${item.color}`}>{item.title}</p>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="font-sora text-lg text-slate-200 mb-5">Migration Path</h3>
        <div className="grid sm:grid-cols-4 gap-3">
          {FEASIBILITY.map((f, i) => (
            <div key={i} className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
              <div className={`font-sora text-sm mb-2 ${f.color}`}>{f.label}</div>
              <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="font-sora text-lg text-slate-200 mb-3">Technology Stack</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {["Next.js 15","TypeScript","Tailwind CSS 4","shadcn/ui","Vercel Postgres (Neon)","Recharts","driver.js","MIT License"].map(t => (
            <span key={t} className="px-3 py-1 bg-white/[0.04] border border-white/[0.08] rounded-full text-slate-300 text-sm">{t}</span>
          ))}
        </div>
        <p className="text-slate-500 text-xs">Registered Charity: 121471858RR0001 · Serving Toronto and Hamilton · Est. 1982</p>
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
        <a
          href="https://skillsforchange.org"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-5 py-3 glass border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 rounded-xl transition-colors"
        >
          <ExternalLink size={14} />
          <span className="font-medium">skillsforchange.org</span>
        </a>
        <div className="flex items-center gap-2 px-5 py-3 glass rounded-xl border border-white/[0.06] text-slate-500 text-sm">
          SfC Hackathon 2026
        </div>
      </div>
    </div>
  )
}
