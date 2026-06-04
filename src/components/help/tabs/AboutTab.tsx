import { GitBranch, ExternalLink, CheckCircle, AlertTriangle, ArrowRight, Zap, Shield, TrendingUp, Database, XCircle } from "lucide-react"

const JOURNEY_STAGE_SUMMARY = [
  {
    stage: "Outreach",
    problem: "No source tracking; referral channel unknown",
    solution: "Source tracked, referral partner recorded",
  },
  {
    stage: "Vetting",
    problem: "Notes lost in email, no structure, no search",
    solution: "Structured notes, AI summary, searchable timeline",
  },
  {
    stage: "Eligibility",
    problem: "Manual checklist per caseworker, never recorded",
    solution: "Rule-based engine, auto-check, audit trail",
  },
  {
    stage: "Intake",
    problem: "10+ different form versions, data inconsistent",
    solution: "Standardized form, consent captured, program auto-assigned",
  },
  {
    stage: "Training",
    problem: "Excel spreadsheets, no real-time visibility",
    solution: "Real-time module tracking, milestone alerts",
  },
  {
    stage: "Placement",
    problem: "Not tracked; funder can't see employment outcomes",
    solution: "Employer DB, sector, wage data, retention follow-up",
  },
  {
    stage: "Survey",
    problem: "Optional, ~20% completion rate, results in a drawer",
    solution: "Auto-sent on close, mandatory, feeds analytics instantly",
  },
  {
    stage: "Reporting",
    problem: "Manual quarterly reports, 2-3 weeks to produce",
    solution: "Ad-hoc and monthly, AI-drafted in seconds, funder-shaped CSV",
  },
]

const JOURNEY_STAGES = [
  { stage: "Outreach", before: "Word of mouth, paper flyers, cold calls. No tracking of who was contacted or responded.", after: "Source tracked at intake: walk-in, referral, MS Forms, partner agency. Every touchpoint logged in one place." },
  { stage: "Vetting", before: "Caseworker interviews never formally recorded. Notes on paper or personal spreadsheets. No institutional memory when staff turn over.", after: "Structured case notes with author, type, and timestamp. Full searchable history per client, accessible to the whole team." },
  { stage: "Eligibility", before: "Eligibility criteria vary by caseworker. No standard checklist. Inconsistent decisions across the same program.", after: "Program-specific eligibility outcomes seeded at intake. Tier-based tracking: immediate, intermediate, and ultimate." },
  { stage: "Intake", before: "Each caseworker has their own MS Forms or Word doc version. 10+ variants in circulation at any time.", after: "One standardized intake per program. Configurable fields. Single submission populates all programs and all funders." },
  { stage: "Training", before: "Training attendance tracked in separate spreadsheets. No link to outcomes data or funder reporting.", after: "Stage updated to training in real time. Outcomes progress visible on the client journey card immediately." },
  { stage: "Placement", before: "Placement data in a separate Excel file. Employment Ontario gets one export, IRCC gets another — both created manually.", after: "One data entry generates CSV exports for every funder in their exact required column format, on demand." },
  { stage: "Survey", before: "Exit survey optional and caseworker-dependent. Response rates under 20 percent. No aggregate analysis possible.", after: "Standardized exit survey required to close a journey. Satisfaction score, recommend rate, and barriers captured and charted." },
  { stage: "Reporting", before: "Narrative reports written from scratch each quarter. Takes two to three weeks. Data is often stale by submission date.", after: "AI drafts narrative from live SQL data in seconds. Monthly or ad-hoc. Funder-specific format applied automatically." },
]

const PROBLEMS = [
  { title: "Data entered multiple times per client on different systems", desc: "Each funder (IRCC, Employment Ontario, Community Foundations, City of Toronto) has its own portal with its own column spec. Staff copy-paste the same client record into each one, every reporting cycle." },
  { title: "Reporting takes weeks, not hours", desc: "Narrative reports are written from scratch against whatever spreadsheet is most current. By the time they're submitted, the numbers are stale. Staff spend significant time each quarter on reporting that could be automated." },
  { title: "No single source of truth", desc: "Microsoft Forms feeds one spreadsheet. A separate Excel file tracks another set of interactions. Neither talks to the other. Outcomes (the metric funders care about most) live in a third system entirely." },
  { title: "Privacy compliance is manual", desc: "PHIPA requires a hard wall between mental health records and all other programs. Enforcing that wall in spreadsheets and shared drives depends on staff remembering a rule, not the system preventing the violation." },
]

const SHORT_TERM = [
  "New client intake goes directly into OneView's Postgres database from day one",
  "Power Automate bridges any in-flight Microsoft Forms submissions during transition — staff change nothing while the switchover happens",
  "Historical Excel/SharePoint records imported once via CSV mapping — data consolidates automatically into OneView",
  "OneView becomes the single integration point for funder portals and reporting tools, replacing manual Excel exports",
  "Funder CSV exports generated on demand in each funder's exact column format, straight from the database",
  "AI narrative reports drafted from live SQL data in seconds",
]

const LONG_TERM = [
  { title: "Postgres becomes the single source of truth", desc: "Every client, enrolment, and outcome lives in one structured, queryable Postgres database. This build uses Vercel Postgres (Neon) but any Postgres-compatible host works. No more data split across Excel files, MS Forms, and SharePoint.", icon: Database, color: "text-emerald-600 dark:text-emerald-400" },
  { title: "Excel and SharePoint retired for client tracking", desc: "Excel is a general-purpose tool built for numbers, not nonprofit program delivery. OneView's purpose-built backend handles client tracking, outcome recording, and funder reporting with structure that spreadsheets cannot provide.", icon: TrendingUp, color: "text-indigo-600 dark:text-indigo-400" },
  { title: "Real-time outcomes, not quarterly retrospectives", desc: "When intake, enrolment, and outcomes share one database, funders can receive a live dashboard link instead of a static report. Narrative reports write themselves from real SQL. The PHI Wall is a SQL constraint, not a staff checklist.", icon: Zap, color: "text-amber-600 dark:text-amber-400" },
  { title: "Compliance enforced by architecture", desc: "PHIPA, FIPPA, and CYFSA rules are encoded as SQL constraints and consent flags. No policy document or training refresher can be forgotten. No spreadsheet formula accidentally crosses a compliance line.", icon: Shield, color: "text-rose-600 dark:text-rose-400" },
]

const FEASIBILITY = [
  { label: "Week 1", desc: "Deploy to any hosting provider with a Postgres database. New intakes go into OneView directly. Power Automate bridges existing Forms submissions during transition. Staff see a unified dashboard immediately.", color: "text-emerald-600 dark:text-emerald-400" },
  { label: "Month 1–2", desc: "AI tooling maps and imports historical Excel/SharePoint records into OneView's Postgres schema. Data deduplication and validation in days, not months of manual work. Staff begin using native OneView intake alongside the transition.", color: "text-indigo-600 dark:text-indigo-400" },
  { label: "Month 3–6", desc: "Microsoft Forms and Excel client tracking fully retired. OneView is the system of record. All intake, outcomes, and funder reporting run through OneView's backend. AI drafts funder narratives from live data. Target: full replacement within 6 months.", color: "text-amber-600 dark:text-amber-400" },
]

export default function AboutTab() {
  return (
    <div className="space-y-8">

      <div className="glass rounded-xl p-8 text-center">
        <p className="text-emerald-600 dark:text-emerald-400 text-sm uppercase tracking-widest mb-2">Skills for Change · Toronto</p>
        <h2 className="font-sora text-5xl text-slate-900 dark:text-white mb-3">OneView</h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">Capture once, report to every funder. A single system of record across multiple programs and funders: built to eliminate the data fragmentation that costs Skills for Change weeks of staff time every quarter.</p>
        <div className="flex flex-wrap justify-center items-center gap-6 mt-8">
          <div className="text-center">
            <div className="font-sora text-4xl text-emerald-500 dark:text-emerald-400">Multiple</div>
            <div className="text-slate-500 text-sm">programs in one platform</div>
          </div>
          <div className="w-px h-12 bg-slate-200 dark:bg-white/[0.08]" />
          <div className="text-center">
            <div className="font-sora text-4xl text-rose-500 dark:text-rose-400">All funders</div>
            <div className="text-slate-500 text-sm">one data entry</div>
          </div>
          <div className="w-px h-12 bg-slate-200 dark:bg-white/[0.08]" />
          <div className="text-center">
            <div className="font-sora text-4xl text-amber-500 dark:text-amber-400">Multiple systems</div>
            <div className="text-slate-500 text-sm">replaced by one</div>
          </div>
          <div className="w-px h-12 bg-slate-200 dark:bg-white/[0.08]" />
          <div className="text-center">
            <div className="font-sora text-4xl text-indigo-500 dark:text-indigo-400">1×</div>
            <div className="text-slate-500 text-sm">data entry with OneView</div>
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <ArrowRight size={16} className="text-slate-500 dark:text-slate-400" />
          <h3 className="font-sora text-lg text-slate-800 dark:text-slate-200">The Client Journey Today: How It Should Work</h3>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-5 ml-6">Every client passes through 8 stages. Today each stage is a data silo. OneView connects them into one auditable record.</p>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="p-4 border border-rose-500/20 bg-rose-500/[0.03] rounded-xl space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <XCircle size={14} className="text-rose-600 dark:text-rose-400" />
              <span className="font-sora text-sm text-rose-600 dark:text-rose-400">Current State: Manual and Fragmented</span>
            </div>
            {JOURNEY_STAGE_SUMMARY.map((s) => (
              <div key={s.stage} className="flex items-start gap-3 p-2 rounded-lg bg-rose-500/[0.04]">
                <span className="text-rose-600 dark:text-rose-400 font-bold text-xs mt-0.5 flex-shrink-0">✕</span>
                <div className="min-w-0">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 text-xs font-medium mr-2">{s.stage}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-xs">{s.problem}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border border-emerald-500/20 bg-emerald-500/[0.03] rounded-xl space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span className="font-sora text-sm text-emerald-600 dark:text-emerald-400">With OneView</span>
            </div>
            {JOURNEY_STAGE_SUMMARY.map((s) => (
              <div key={s.stage} className="flex items-start gap-3 p-2 rounded-lg bg-emerald-500/[0.04]">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs mt-0.5 flex-shrink-0">✓</span>
                <div className="min-w-0">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-medium mr-2">{s.stage}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-xs">{s.solution}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <AlertTriangle size={16} className="text-rose-600 dark:text-rose-400" />
          <h3 className="font-sora text-lg text-rose-600 dark:text-rose-400">The Problem with the Current System</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {PROBLEMS.map((p, i) => (
            <div key={i} className="p-4 bg-rose-500/[0.04] border border-rose-500/[0.12] rounded-xl">
              <div className="flex items-start gap-2 mb-2">
                <span className="text-rose-600 dark:text-rose-400 font-bold text-sm mt-0.5 flex-shrink-0">✕</span>
                <p className="text-slate-800 dark:text-slate-200 text-sm font-medium">{p.title}</p>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed pl-4">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <ArrowRight size={16} className="text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-sora text-lg text-emerald-600 dark:text-emerald-400">Getting Started: Migration Begins Day One</h3>
        </div>
        <p className="text-slate-500 text-sm mb-5 ml-6">OneView is the destination, not a middleware layer. New data goes into OneView's Postgres database from the start. Webhooks bridge existing systems during the transition so staff see no disruption while the switchover happens.</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {SHORT_TERM.map((item, i) => (
            <div key={i} className="flex items-start gap-2 p-3 bg-emerald-500/[0.04] border border-emerald-500/[0.08] rounded-lg">
              <CheckCircle size={13} className="text-emerald-400 mt-0.5 flex-shrink-0" />
              <span className="text-slate-600 dark:text-slate-300 text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={16} className="text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-sora text-lg text-indigo-600 dark:text-indigo-400">The Destination: Full Replacement</h3>
        </div>
        <p className="text-slate-500 text-sm mb-5 ml-6">Microsoft Forms and Excel/SharePoint are fully retired as client tracking tools. OneView's Postgres database is the system of record. The Next.js backend handles all intake, outcomes, and reporting. With AI-assisted data migration, what would have taken months of manual work can happen in days.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {LONG_TERM.map((item, i) => (
            <div key={i} className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.06] rounded-xl">
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
        <h3 className="font-sora text-lg text-slate-700 dark:text-slate-200 mb-5">Migration Path</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          {FEASIBILITY.map((f, i) => (
            <div key={i} className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.06] rounded-xl">
              <div className={`font-sora text-sm mb-2 ${f.color}`}>{f.label}</div>
              <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="font-sora text-xl text-slate-900 dark:text-white mb-1">Client Journey: Before and After OneView</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Eight stages of the SfC client lifecycle — and what changes with OneView at every step.</p>
        <div className="space-y-3">
          {JOURNEY_STAGES.map(({ stage, before, after }) => (
            <div key={stage} className="grid md:grid-cols-[120px_1fr_1fr] gap-3 items-start">
              <div className="flex items-center gap-2 md:justify-end">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{stage}</span>
              </div>
              <div className="rounded-lg p-3 bg-rose-500/8 border border-rose-500/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                  <span className="text-xs font-medium text-rose-600 dark:text-rose-400">Before</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{before}</p>
              </div>
              <div className="rounded-lg p-3 bg-emerald-500/8 border border-emerald-500/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">After</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{after}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="font-sora text-lg text-slate-700 dark:text-slate-200 mb-3">Technology Stack</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {["Next.js 15","TypeScript","Tailwind CSS 4","shadcn/ui","Postgres","Recharts","driver.js"].map(t => (
            <span key={t} className="px-3 py-1 bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-full text-slate-600 dark:text-slate-300 text-sm">{t}</span>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href="https://github.com/hive-mind-workforce/skills-for-change-one-view"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-5 py-3 glass border border-slate-200 dark:border-white/[0.15] hover:border-slate-300 dark:hover:border-white/[0.3] text-slate-700 dark:text-slate-200 rounded-xl transition-colors"
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
        <div className="flex items-center gap-2 px-5 py-3 glass rounded-xl border border-slate-100 dark:border-white/[0.06] text-slate-500 text-sm">
          Change-a-thon by Mastercard Changeworks 2026™
        </div>
      </div>
    </div>
  )
}
