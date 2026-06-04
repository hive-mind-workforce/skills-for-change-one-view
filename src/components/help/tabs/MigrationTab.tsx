import { CheckCircle, Clock, DollarSign, TrendingDown, AlertCircle, Calendar } from "lucide-react"

const PHASES = [
  {
    label: "Week 1",
    color: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/[0.04]",
    tasks: [
      { task: "Deploy to any hosting provider via dashboard (no code required)", effort: "Half day" },
      { task: "Set environment variables in the hosting dashboard (database URL, LLM key)", effort: "1 hour" },
      { task: "Visit /api/init in the browser to initialize the database schema", effort: "5 minutes" },
      { task: "Connect Microsoft Forms via Power Automate HTTP action (low-code)", effort: "1 day" },
      { task: "Validate end-to-end data flow with a test submission", effort: "Half day" },
      { task: "Staff access unified dashboard with no behavior change required", effort: "0 hours" },
    ],
    totalEffort: "2–3 days setup",
    cost: "Low",
    costNote: "Hosting setup + first month",
  },
  {
    label: "Month 1–2",
    color: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-500/20",
    bg: "bg-indigo-500/[0.04]",
    tasks: [
      { task: "Export historical client records from Excel/SharePoint as CSV (no code required)", effort: "1 day" },
      { task: "AI-assisted field mapping: Excel columns to OneView schema", effort: "2–4 days" },
      { task: "Run migration with deduplication and validation", effort: "3–5 days" },
      { task: "Caseworker review of migrated records for accuracy", effort: "1 week (shared)" },
      { task: "Parallel run: both systems active while data is verified", effort: "Up to 4 weeks" },
      { task: "Staff begin using native OneView intake for new clients", effort: "Training below" },
    ],
    totalEffort: "3–5 weeks (setup + caseworker review)",
    cost: "Moderate",
    costNote: "Setup time + AI API usage",
  },
  {
    label: "Month 3–6",
    color: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
    bg: "bg-amber-500/[0.04]",
    tasks: [
      { task: "Staff onboarding to native OneView intake form", effort: "4–8 hrs per person" },
      { task: "Decommission Microsoft Forms intake flow in Power Automate", effort: "Half day" },
      { task: "Archive Excel/SharePoint client files as read-only historical record", effort: "Half day" },
      { task: "Funder CSV exports replace manual portal uploads", effort: "Half day setup" },
      { task: "AI narrative reports replace manually written quarterly reports", effort: "Half day setup" },
      { task: "Full system of record: all intake, outcomes, and reporting in OneView", effort: "Target: Month 6" },
    ],
    totalEffort: "Ongoing (staff onboarding)",
    cost: "Moderate",
    costNote: "Onboarding + transition support",
  },
]

const CURRENT_COSTS = [
  { item: "Excel / SharePoint maintenance", annual: "Staff time", notes: "No licensing cost, but significant manual effort: re-entry, export formatting, version control across caseworkers" },
  { item: "Microsoft Forms", annual: "$0", notes: "Included in existing Microsoft 365 subscription" },
  { item: "System maintenance (integrations, exports)", annual: "Variable", notes: "Ongoing effort to keep manual exports and integrations functional each quarter" },
  { item: "Staff reporting time", annual: "Significant", notes: "Multiple staff, multiple weeks per quarter; redirected to client work with OneView" },
]

const ONEVIEW_COSTS = [
  { item: "Hosting (any provider)", annual: "$500–1,200", notes: "Scales with usage; entry tier is sufficient for typical nonprofit volumes" },
  { item: "Postgres database", annual: "Included or $200–500", notes: "Many hosts include Postgres; a dedicated instance is available if needed" },
  { item: "LLM API (reports + Q&A)", annual: "$200–600", notes: "Usage-based; cost per report is fractions of a cent at current model pricing" },
  { item: "Maintenance", annual: "Minimal", notes: "Open source, self-hosted; no vendor lock-in or per-seat licensing" },
]

export default function MigrationTab() {
  return (
    <div className="space-y-8">

      <div className="glass rounded-xl p-6">
        <div className="flex items-start gap-3 mb-5">
          <TrendingDown size={18} className="text-emerald-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-sora text-lg text-emerald-400">Cost Summary</h3>
            <p className="text-slate-500 text-sm mt-0.5">One-time migration investment offset by ongoing savings on licensing and staff time.</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 bg-rose-500/[0.04] border border-rose-500/[0.12] rounded-xl text-center">
            <div className="font-sora text-2xl text-rose-400 mb-1">50–70% lower</div>
            <div className="text-slate-400 text-sm font-medium">Annual licensing cost reduction</div>
            <div className="text-slate-600 text-xs mt-1">Staff reporting time recovered for client work</div>
          </div>
          <div className="p-4 bg-amber-500/[0.04] border border-amber-500/[0.12] rounded-xl text-center">
            <div className="font-sora text-2xl text-amber-400 mb-1">1–2 years</div>
            <div className="text-slate-400 text-sm font-medium">To recover migration investment</div>
            <div className="text-slate-600 text-xs mt-1">Setup time, data migration, staff onboarding</div>
          </div>
          <div className="p-4 bg-emerald-500/[0.04] border border-emerald-500/[0.12] rounded-xl text-center">
            <div className="font-sora text-2xl text-emerald-400 mb-1">Minimal</div>
            <div className="text-slate-400 text-sm font-medium">Ongoing annual cost</div>
            <div className="text-slate-600 text-xs mt-1">Hosting + database + AI APIs, no per-seat licensing</div>
          </div>
        </div>
        <div className="flex items-start gap-2 mt-4 p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.06] rounded-lg">
          <AlertCircle size={13} className="text-slate-500 mt-0.5 flex-shrink-0" />
          <p className="text-slate-500 text-xs leading-relaxed">All figures are illustrative estimates. Actual costs depend on hosting provider, data volume, and existing Microsoft 365 coverage.</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-sora text-lg text-slate-700 dark:text-slate-200 flex items-center gap-2"><Calendar size={16} className="text-slate-500 dark:text-slate-400" />Migration Timeline</h3>
        {PHASES.map((phase, i) => (
          <div key={i} className={`glass rounded-xl p-6 border ${phase.border}`}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <span className={`font-sora text-lg ${phase.color}`}>{phase.label}</span>
              <div className="flex flex-wrap gap-3">
                <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Clock size={12} className="text-slate-400 dark:text-slate-500" />{phase.totalEffort}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <DollarSign size={12} className="text-slate-400 dark:text-slate-500" />{phase.cost} <span className="text-slate-400 dark:text-slate-600">({phase.costNote})</span>
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {phase.tasks.map((t, j) => (
                <div key={j} className={`flex items-start justify-between gap-3 p-2.5 ${phase.bg} rounded-lg`}>
                  <div className="flex items-start gap-2">
                    <CheckCircle size={12} className={`${phase.color} mt-0.5 flex-shrink-0`} />
                    <span className="text-slate-600 dark:text-slate-300 text-sm">{t.task}</span>
                  </div>
                  <span className="text-slate-400 dark:text-slate-600 text-xs whitespace-nowrap flex-shrink-0">{t.effort}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="font-sora text-lg text-slate-700 dark:text-slate-200 mb-4">Current System: Annual Cost Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/[0.06]">
                <th className="text-left text-slate-500 text-xs pb-3 pr-4">Item</th>
                <th className="text-left text-slate-500 text-xs pb-3 pr-4 whitespace-nowrap">Est. Annual</th>
                <th className="text-left text-slate-500 text-xs pb-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {CURRENT_COSTS.map((row, i) => (
                <tr key={i}>
                  <td className="py-3 pr-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">{row.item}</td>
                  <td className="py-3 pr-4 text-rose-400 font-mono text-xs whitespace-nowrap">{row.annual}</td>
                  <td className="py-3 text-slate-500 text-xs leading-relaxed">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="font-sora text-lg text-slate-700 dark:text-slate-200 mb-4">OneView: Annual Cost Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/[0.06]">
                <th className="text-left text-slate-500 text-xs pb-3 pr-4">Item</th>
                <th className="text-left text-slate-500 text-xs pb-3 pr-4 whitespace-nowrap">Est. Annual</th>
                <th className="text-left text-slate-500 text-xs pb-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {ONEVIEW_COSTS.map((row, i) => (
                <tr key={i}>
                  <td className="py-3 pr-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">{row.item}</td>
                  <td className="py-3 pr-4 text-emerald-400 font-mono text-xs whitespace-nowrap">{row.annual}</td>
                  <td className="py-3 text-slate-500 text-xs leading-relaxed">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
