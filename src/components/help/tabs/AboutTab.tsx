import { GitBranch, ExternalLink, CheckCircle, AlertTriangle, ArrowRight, Zap, Shield, TrendingUp, Database, XCircle, Brain, MessageSquare, BarChart3, FileText, Cpu, RefreshCw } from "lucide-react"

const PROBLEMS = [
  {
    title: "Every funder gets a separate data entry, for the same client",
    desc: "IRCC, Employment Ontario, United Way, and the City of Toronto each have their own portal, their own column spec, and their own submission deadline. Staff copy-paste the same client record into four separate places every reporting cycle. When a field changes in one system, the others stay stale.",
  },
  {
    title: "Reporting takes 2–3 weeks and the data is already out of date",
    desc: "Narrative reports are written from scratch each quarter against whichever spreadsheet was last updated. By the time the report reaches a funder, the numbers no longer reflect reality. Staff spend significant time every quarter on work that should take hours.",
  },
  {
    title: "There is no single source of truth",
    desc: "Microsoft Forms feeds one spreadsheet. A separate Excel file tracks another program. Outcomes (the metric funders care about most) live in a third system entirely. Nobody can answer a cross-program question like 'how many clients moved from settlement to employment this year?' without a manual audit.",
  },
  {
    title: "Privacy compliance depends on staff remembering a rule",
    desc: "PHIPA requires a hard wall between mental health records and all other programs. In spreadsheets and shared drives, enforcing that wall means hoping every caseworker remembers every time. One accidental column paste or sheet share is a compliance incident.",
  },
  {
    title: "Exit surveys are optional and the results go nowhere",
    desc: "Client satisfaction data is collected inconsistently, sits in a folder, and is never aggregated. Funders ask about client outcomes and satisfaction. Skills for Change cannot answer with confidence because the data structure doesn't support it. Caseworkers who want to improve can't see the patterns.",
  },
]

const JOURNEY_STAGES = [
  { stage: "Outreach", before: "Word of mouth, paper flyers, cold calls. No tracking of who was contacted or responded.", after: "Source tracked at intake: walk-in, referral, MS Forms, partner agency. Every channel logged and reportable." },
  { stage: "Vetting", before: "Caseworker interviews never formally recorded. Notes on paper or personal spreadsheets. Institutional memory lost when staff turn over.", after: "Structured case notes with author, type, and timestamp. Full searchable history per client, accessible to the whole team." },
  { stage: "Eligibility", before: "Eligibility criteria vary by caseworker. No standard checklist. Inconsistent decisions across the same program.", after: "Program-specific eligibility outcomes seeded at intake. Tier-based tracking: immediate, intermediate, and ultimate goals." },
  { stage: "Intake", before: "Each caseworker has their own MS Forms or Word doc version. 10+ variants in circulation. Fields differ, consents differ, nothing aligns.", after: "One standardized intake per program. Single submission populates all programs and all funders simultaneously." },
  { stage: "Training", before: "Attendance tracked in separate spreadsheets. No link to outcomes data. Funder can't see training progress in real time.", after: "Stage updated in real time. Outcomes progress visible on the client journey card immediately. Caseworker notes timestamped." },
  { stage: "Placement", before: "Placement data in a separate Excel file. Employment Ontario gets one export, IRCC gets another, both created manually each quarter.", after: "One data entry generates CSV exports for every funder in their exact required column format, on demand, in seconds." },
  { stage: "Survey", before: "Exit survey optional and caseworker-dependent. Response rates under 20%. Results sit in a folder, never aggregated or actioned.", after: "Auto-sent on journey close. Satisfaction score, recommend rate, and barriers captured and charted. Feeds analytics instantly." },
  { stage: "Reporting", before: "Narrative reports written from scratch each quarter. Takes 2–3 weeks. Data is stale by submission date.", after: "AI drafts a narrative from live SQL data in seconds. Monthly or ad-hoc. Funder-specific format applied automatically." },
]

const AI_FEATURES = [
  {
    icon: BarChart3,
    title: "Analytics Insights",
    badge: "Live",
    badgeColor: "bg-indigo-500/10 text-indigo-400",
    desc: "The LLM receives a full program metrics snapshot and returns 5 prioritised, actionable insights in JSON. Each names the program, states the finding, and classifies it as success, warning, or info.",
    fallback: "Without an LLM key, five statistical comparisons run automatically: best program vs org average outcome rate, programs below average, top intake channel by volume, and client satisfaction vs the 3.8 sector benchmark.",
  },
  {
    icon: FileText,
    title: "Funder Narrative Reports",
    badge: "Cached",
    badgeColor: "bg-indigo-500/10 text-indigo-400",
    desc: "AI drafts a full funder narrative (2–3 paragraphs) from live SQL data: client counts, outcome rates, demographics, and program highlights. Cached in Postgres so the same funder+period doesn't re-invoke the LLM.",
    fallback: "Template-based narrative fills in metric placeholders from SQL when no LLM key is set.",
  },
  {
    icon: MessageSquare,
    title: "Program Q&A",
    badge: "Grounded",
    badgeColor: "bg-indigo-500/10 text-indigo-400",
    desc: "Staff ask natural-language questions about program data. The API pulls live metrics from SQL first, then sends both the question and the metrics to the LLM. Every answer is grounded in real data.",
    fallback: "Returns the raw metric summary directly if the LLM is unavailable.",
  },
  {
    icon: Cpu,
    title: "Historical Data Migration",
    badge: "Roadmap",
    badgeColor: "bg-amber-500/10 text-amber-400",
    desc: "AI-assisted mapping of existing Excel and SharePoint client records into OneView's Postgres schema. The LLM infers column mappings, resolves name inconsistencies, and flags duplicates for human review before import.",
    fallback: "CSV column mapping template with manual field alignment.",
  },
  {
    icon: FileText,
    title: "Intake Document Analysis",
    badge: "Roadmap",
    badgeColor: "bg-amber-500/10 text-amber-400",
    desc: "Caseworkers upload scanned eligibility documents (landing papers, employment records) at intake. The LLM extracts structured fields and pre-fills the intake form, reducing manual entry from ~15 minutes to under 2 minutes.",
    fallback: "Manual field entry; document stored for caseworker reference.",
  },
  {
    icon: Zap,
    title: "How It Works",
    badge: null,
    badgeColor: "",
    desc: null,
    fallback: null,
    detail: [
      { label: "Provider abstraction", text: "lib/llm.ts wraps Gemini, Claude, and Groq behind a single generate() call. Switch providers by changing one env variable." },
      { label: "No PII in prompts", text: "All LLM calls receive aggregated metrics only, never client names, IDs, or individual records." },
      { label: "PHI Wall enforced", text: "Mental health program data is excluded from every analytics query before it reaches the LLM, by SQL constraint." },
    ],
  },
]

const TECH_STACK = [
  { name: "Next.js 15", note: "App Router, server components, API routes" },
  { name: "TypeScript", note: "End-to-end type safety" },
  { name: "Tailwind CSS 4", note: "Utility-first styling" },
  { name: "shadcn/ui", note: "Accessible component library" },
  { name: "Vercel Postgres (Neon)", note: "All client and outcomes data" },
  { name: "Recharts", note: "Program breakdown visualisations" },
  { name: "driver.js", note: "8-step guided demo tour" },
  { name: "Vercel", note: "Deployment and preview environments" },
]

const MIGRATION_DAYS = [
  { label: "Week 1", color: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500", items: ["Deploy to any hosting provider with a Postgres database", "Set environment variables (database URL, LLM key) in the hosting dashboard", "Visit /api/init in the browser to initialise the database schema", "Connect Microsoft Forms via Power Automate HTTP action (low-code, half a day)", "Staff access a unified dashboard immediately with no behaviour change required"] },
  { label: "Month 1–2", color: "text-indigo-600 dark:text-indigo-400", dot: "bg-indigo-500", items: ["Export historical client records from Excel/SharePoint as CSV", "AI-assisted field mapping: Excel columns to OneView schema in days, not months", "Run migration with deduplication and validation; caseworkers review flagged records", "Parallel run: both systems active while data is verified", "Staff begin using native OneView intake for all new clients"] },
  { label: "Month 3–6", color: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500", items: ["Microsoft Forms intake flow decommissioned in Power Automate", "Excel/SharePoint client files archived as read-only historical record", "Funder CSV exports replace all manual portal uploads", "AI narrative reports replace manually written quarterly reports", "Full system of record: all intake, outcomes, and reporting in OneView"] },
]

const DESTINATION = [
  { title: "Postgres is the single source of truth", desc: "Every client, enrolment, and outcome lives in one structured, queryable Postgres database. No data split across Excel files, MS Forms, and SharePoint. Any question answerable in seconds.", icon: Database, color: "text-emerald-600 dark:text-emerald-400" },
  { title: "Excel and SharePoint retired for client tracking", desc: "Excel is a general-purpose tool built for numbers, not nonprofit program delivery. OneView's purpose-built backend handles client tracking, outcome recording, and funder reporting with structure that spreadsheets cannot provide.", icon: TrendingUp, color: "text-indigo-600 dark:text-indigo-400" },
  { title: "Real-time outcomes, not quarterly retrospectives", desc: "When intake, enrolment, and outcomes share one database, funders can receive a live dashboard link instead of a static report. Narrative reports write themselves from real SQL. The PHI Wall is a SQL constraint, not a staff checklist.", icon: Zap, color: "text-amber-600 dark:text-amber-400" },
  { title: "Compliance enforced by architecture", desc: "PHIPA, FIPPA, and CYFSA rules are encoded as SQL constraints and consent flags. No policy document or training refresher can be forgotten. No spreadsheet formula accidentally crosses a compliance line.", icon: Shield, color: "text-rose-600 dark:text-rose-400" },
]

export default function AboutTab() {
  return (
    <div className="space-y-8">

      {/* ── Hero ── */}
      <div className="glass rounded-xl p-8 text-center">
        <p className="text-emerald-600 dark:text-emerald-400 text-sm uppercase tracking-widest mb-2">Skills for Change · Toronto · Change-a-thon 2026</p>
        <h2 className="font-sora text-5xl text-slate-900 dark:text-white mb-3">OneView</h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">Capture once, report to every funder. One system of record across 8 programs and 4 funders, built to eliminate the fragmentation that costs Skills for Change weeks of staff time every quarter.</p>
        <div className="flex flex-wrap justify-center items-center gap-6 mt-8">
          <div className="text-center">
            <div className="font-sora text-3xl text-emerald-500">8 programs</div>
            <div className="text-slate-500 text-sm">one platform</div>
          </div>
          <div className="w-px h-12 bg-slate-200 dark:bg-white/[0.08]" />
          <div className="text-center">
            <div className="font-sora text-3xl text-indigo-500">4 funders</div>
            <div className="text-slate-500 text-sm">one data entry</div>
          </div>
          <div className="w-px h-12 bg-slate-200 dark:bg-white/[0.08]" />
          <div className="text-center">
            <div className="font-sora text-3xl text-amber-500">2–3 weeks</div>
            <div className="text-slate-500 text-sm">of quarterly reporting → seconds</div>
          </div>
          <div className="w-px h-12 bg-slate-200 dark:bg-white/[0.08]" />
          <div className="text-center">
            <div className="font-sora text-3xl text-rose-500">6 months</div>
            <div className="text-slate-500 text-sm">to full replacement</div>
          </div>
        </div>
      </div>

      {/* ── The Problem ── */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <AlertTriangle size={16} className="text-rose-600 dark:text-rose-400" />
          <h3 className="font-sora text-lg text-rose-600 dark:text-rose-400">The Problem with the Current System</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {PROBLEMS.map((p, i) => (
            <div key={i} className={`p-4 bg-rose-500/[0.04] border border-rose-500/[0.12] rounded-xl${i === PROBLEMS.length - 1 && PROBLEMS.length % 2 !== 0 ? " sm:col-span-2" : ""}`}>
              <div className="flex items-start gap-2 mb-2">
                <XCircle size={14} className="text-rose-500 mt-0.5 flex-shrink-0" />
                <p className="text-slate-800 dark:text-slate-200 text-sm font-medium">{p.title}</p>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed pl-5">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Client Journey: Before and After ── */}
      <div className="glass rounded-xl p-6">
        <h3 className="font-sora text-xl text-slate-900 dark:text-white mb-1">Client Journey: Before and After OneView</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Eight stages of the Skills for Change client lifecycle and what changes at every step.</p>
        <div className="space-y-3">
          {JOURNEY_STAGES.map(({ stage, before, after }) => (
            <div key={stage} className="grid md:grid-cols-[120px_1fr_1fr] gap-3 items-start">
              <div className="flex items-center gap-2 md:justify-end">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{stage}</span>
              </div>
              <div className="rounded-lg p-3 bg-rose-500/[0.06] border border-rose-500/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                  <span className="text-xs font-medium text-rose-600 dark:text-rose-400">Before</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{before}</p>
              </div>
              <div className="rounded-lg p-3 bg-emerald-500/[0.06] border border-emerald-500/20">
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

      {/* ── AI Features + Tech Stack ── */}
      <div className="glass rounded-xl p-6 border border-indigo-500/20 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10">
            <Brain size={18} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="font-sora text-lg text-slate-800 dark:text-slate-200">AI-Powered Features</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Every AI feature has a rule-based fallback so OneView works even without an LLM key.</p>
          </div>
          <span className="ml-auto px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium hidden sm:inline">Provider-agnostic: Gemini · Claude · Groq</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AI_FEATURES.map((f, i) => (
            <div key={i} className="p-4 bg-indigo-500/[0.04] border border-indigo-500/[0.12] rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <f.icon size={14} className="text-indigo-400" />
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{f.title}</span>
                {f.badge && <span className={`ml-auto px-1.5 py-0.5 rounded text-xs ${f.badgeColor}`}>{f.badge}</span>}
              </div>
              {f.desc && <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-2">{f.desc}</p>}
              {f.detail && (
                <div className="space-y-1.5">
                  {f.detail.map((d, j) => (
                    <div key={j} className="text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{d.label}:</span> {d.text}
                    </div>
                  ))}
                </div>
              )}
              {f.fallback && (
                <div className="flex items-center gap-1.5 p-2 rounded bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] mt-2">
                  <RefreshCw size={11} className="text-amber-400 flex-shrink-0" />
                  <span className="text-xs text-slate-400">{f.fallback}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div>
          <h4 className="font-sora text-base text-slate-700 dark:text-slate-200 mb-3">Technology Stack</h4>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-2">
            {TECH_STACK.map(t => (
              <div key={t.name} className="p-3 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-lg">
                <div className="text-slate-800 dark:text-slate-200 text-sm font-medium">{t.name}</div>
                <div className="text-slate-500 text-xs mt-0.5">{t.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Getting Started: Migration Begins Day One ── */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <ArrowRight size={16} className="text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-sora text-lg text-emerald-600 dark:text-emerald-400">Getting Started: Migration Begins Day One</h3>
        </div>
        <p className="text-slate-500 text-sm mb-6 ml-6">OneView is the destination, not a middleware layer. New data goes into Postgres from day one. Webhooks bridge existing systems during the transition so staff see no disruption while the switchover happens.</p>
        <div className="relative pl-6">
          <div className="absolute left-2 top-2 bottom-2 w-px bg-slate-200 dark:bg-white/[0.08]" />
          <div className="space-y-5">
            {MIGRATION_DAYS.map((phase, i) => (
              <div key={i} className="relative">
                <div className={`absolute -left-[18px] top-1.5 w-2.5 h-2.5 rounded-full ${phase.dot} ring-2 ring-[#060610]`} />
                <div className={`font-sora text-sm mb-2 ${phase.color}`}>{phase.label}</div>
                <div className="space-y-1.5">
                  {phase.items.map((item, j) => (
                    <div key={j} className="flex items-start gap-2 p-2.5 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.06] rounded-lg">
                      <CheckCircle size={12} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-600 dark:text-slate-300 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── The Destination: Full Replacement ── */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={16} className="text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-sora text-lg text-indigo-600 dark:text-indigo-400">The Destination: Full Replacement</h3>
        </div>
        <p className="text-slate-500 text-sm mb-5 ml-6">Microsoft Forms and Excel/SharePoint are fully retired as client tracking tools. OneView's Postgres database is the system of record. With AI-assisted data migration, what would have taken months of manual work happens in days.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {DESTINATION.map((item, i) => (
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

      {/* ── Links ── */}
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
        <div className="flex items-center gap-2 px-5 py-3 glass rounded-xl border border-indigo-500/20 text-indigo-400 text-sm">
          Team: Pivot Point
        </div>
      </div>
    </div>
  )
}
