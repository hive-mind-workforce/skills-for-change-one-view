import { CheckCircle, Clock, DollarSign, TrendingDown, AlertCircle, Calendar } from "lucide-react"

const PHASES = [
  {
    label: "Week 1",
    color: "text-emerald-400",
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/[0.04]",
    tasks: [
      { task: "Deploy application to any hosting provider with a Postgres database", effort: "0.5 days" },
      { task: "Configure environment variables and database connection", effort: "2 hours" },
      { task: "Run /api/init to initialize schema", effort: "15 minutes" },
      { task: "Connect Microsoft Forms via Power Automate HTTP webhook", effort: "1 day" },
      { task: "Validate end-to-end data flow with test submissions", effort: "0.5 days" },
      { task: "Staff access unified dashboard — no behavior change required", effort: "0 hours" },
    ],
    totalEffort: "2–3 days IT",
    cost: "$200–500",
    costNote: "Hosting setup + first month",
  },
  {
    label: "Month 1–2",
    color: "text-indigo-400",
    border: "border-indigo-500/20",
    bg: "bg-indigo-500/[0.04]",
    tasks: [
      { task: "Export historical client records from Salesforce (CSV or API)", effort: "1 day" },
      { task: "AI-assisted schema mapping: Salesforce fields to OneView schema", effort: "2–4 days" },
      { task: "Run migration scripts with deduplication and validation", effort: "3–5 days" },
      { task: "Caseworker review of migrated records for accuracy", effort: "1 week (shared)" },
      { task: "Parallel run: both systems active, data reconciled nightly", effort: "Ongoing for 4 weeks" },
      { task: "Staff begin using native OneView intake for new clients", effort: "Training below" },
    ],
    totalEffort: "3–5 weeks (IT + caseworkers)",
    cost: "$3,000–6,000",
    costNote: "Developer time + AI API usage",
  },
  {
    label: "Month 3–6",
    color: "text-amber-400",
    border: "border-amber-500/20",
    bg: "bg-amber-500/[0.04]",
    tasks: [
      { task: "Staff training on native OneView intake form", effort: "4–8 hrs per user" },
      { task: "Decommission Microsoft Forms intake flow", effort: "1 day" },
      { task: "Cancel or reduce Salesforce client tracking licenses", effort: "Admin" },
      { task: "Funder CSV exports replace manual portal uploads", effort: "1 day setup" },
      { task: "AI narrative reports replace manually written quarterly reports", effort: "1 day setup" },
      { task: "Full system of record: all intake, outcomes, and reporting in OneView", effort: "Target: Month 6" },
    ],
    totalEffort: "Ongoing (staff adoption)",
    cost: "$3,000–5,000",
    costNote: "Training + transition support",
  },
]

const CURRENT_COSTS = [
  { item: "Salesforce licensing", annual: "$2,000–8,000", notes: "Power of Us gives 10 free seats; premium features, storage, and integrations add cost" },
  { item: "Microsoft Forms", annual: "$0", notes: "Included in existing Microsoft 365 subscription" },
  { item: "IT maintenance (integrations, exports)", annual: "$1,200–2,400", notes: "Estimated 2–4 hrs/month at $50/hr keeping exports and integrations functional" },
  { item: "Staff reporting time", annual: "Significant", notes: "Multiple staff, multiple weeks per quarter — redirected to client work with OneView" },
]

const ONEVIEW_COSTS = [
  { item: "Hosting (any provider)", annual: "$500–1,200", notes: "Scales with usage; entry tier sufficient for SfC's volume" },
  { item: "Postgres database", annual: "Included or $200–500", notes: "Many hosts include Postgres; dedicated instance if needed" },
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
            <p className="text-slate-500 text-sm mt-0.5">One-time migration cost offset by first-year savings on Salesforce licensing and staff time.</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 bg-rose-500/[0.04] border border-rose-500/[0.12] rounded-xl text-center">
            <div className="font-sora text-2xl text-rose-400 mb-1">$3,200–10,400</div>
            <div className="text-slate-400 text-sm font-medium">Current annual cost</div>
            <div className="text-slate-600 text-xs mt-1">Salesforce + IT maintenance</div>
          </div>
          <div className="p-4 bg-amber-500/[0.04] border border-amber-500/[0.12] rounded-xl text-center">
            <div className="font-sora text-2xl text-amber-400 mb-1">$6,200–11,500</div>
            <div className="text-slate-400 text-sm font-medium">One-time migration cost</div>
            <div className="text-slate-600 text-xs mt-1">Fully recovered within 1–2 years</div>
          </div>
          <div className="p-4 bg-emerald-500/[0.04] border border-emerald-500/[0.12] rounded-xl text-center">
            <div className="font-sora text-2xl text-emerald-400 mb-1">$900–2,300</div>
            <div className="text-slate-400 text-sm font-medium">OneView annual cost</div>
            <div className="text-slate-600 text-xs mt-1">Hosting + database + LLM API</div>
          </div>
        </div>
        <div className="flex items-start gap-2 mt-4 p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
          <AlertCircle size={13} className="text-slate-500 mt-0.5 flex-shrink-0" />
          <p className="text-slate-500 text-xs leading-relaxed">All figures are illustrative estimates. Actual costs depend on hosting provider, staff hourly rates, Salesforce contract terms, data volume, and whether existing Microsoft 365 licenses cover integration needs.</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-sora text-lg text-slate-200 flex items-center gap-2"><Calendar size={16} className="text-slate-400" />Migration Timeline</h3>
        {PHASES.map((phase, i) => (
          <div key={i} className={`glass rounded-xl p-6 border ${phase.border}`}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <span className={`font-sora text-lg ${phase.color}`}>{phase.label}</span>
              <div className="flex flex-wrap gap-3">
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock size={12} className="text-slate-500" />{phase.totalEffort}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  <DollarSign size={12} className="text-slate-500" />{phase.cost} <span className="text-slate-600">({phase.costNote})</span>
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {phase.tasks.map((t, j) => (
                <div key={j} className={`flex items-start justify-between gap-3 p-2.5 ${phase.bg} rounded-lg`}>
                  <div className="flex items-start gap-2">
                    <CheckCircle size={12} className={`${phase.color} mt-0.5 flex-shrink-0`} />
                    <span className="text-slate-300 text-sm">{t.task}</span>
                  </div>
                  <span className="text-slate-600 text-xs whitespace-nowrap flex-shrink-0">{t.effort}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="font-sora text-lg text-slate-200 mb-4">Current System: Annual Cost Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-slate-500 text-xs pb-3 pr-4">Item</th>
                <th className="text-left text-slate-500 text-xs pb-3 pr-4 whitespace-nowrap">Est. Annual</th>
                <th className="text-left text-slate-500 text-xs pb-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {CURRENT_COSTS.map((row, i) => (
                <tr key={i}>
                  <td className="py-3 pr-4 text-slate-300 whitespace-nowrap">{row.item}</td>
                  <td className="py-3 pr-4 text-rose-400 font-mono text-xs whitespace-nowrap">{row.annual}</td>
                  <td className="py-3 text-slate-500 text-xs leading-relaxed">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="font-sora text-lg text-slate-200 mb-4">OneView: Annual Cost Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-slate-500 text-xs pb-3 pr-4">Item</th>
                <th className="text-left text-slate-500 text-xs pb-3 pr-4 whitespace-nowrap">Est. Annual</th>
                <th className="text-left text-slate-500 text-xs pb-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {ONEVIEW_COSTS.map((row, i) => (
                <tr key={i}>
                  <td className="py-3 pr-4 text-slate-300 whitespace-nowrap">{row.item}</td>
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
