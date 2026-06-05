import { Lock } from "lucide-react"

const PIPELINE_STAGES = [
  {
    stage: "Outreach",
    key: "outreach",
    color: "#3b82f6",
    icon: "📣",
    amara: "A caseworker from Skills for Change meets Amara at a newcomer settlement fair in Scarborough. Her name and contact are recorded as an outreach lead in OneView.",
    privacy: "No personal data stored yet. Source channel logged for reporting.",
  },
  {
    stage: "Vetting",
    key: "vetting",
    color: "#8b5cf6",
    icon: "🔍",
    amara: "Amara comes in for a walk-in screening. The caseworker reviews her immigration status and program eligibility. Notes are timestamped and attached to her record.",
    privacy: "Structured case notes replace personal spreadsheets. Full team visibility replaces institutional memory risk.",
  },
  {
    stage: "Eligibility",
    key: "eligibility",
    color: "#f59e0b",
    icon: "✅",
    amara: "Amara meets IRCC criteria for Settlement Services. Her eligibility is confirmed in OneView. Program-level consent is automatically recorded.",
    privacy: "Program consent (automatic). Data scoped to IRCC only. No cross-program sharing yet.",
  },
  {
    stage: "Intake (Enrolled)",
    key: "intake",
    color: "#10b981",
    icon: "🏠",
    amara: "Amara is enrolled in Settlement Services. One intake form populates her record across all IRCC programs. Her caseworker checks the cross-program consent checkbox with verbal permission.",
    privacy: "consent_cross_program set to true. Enables integrated support across programs when Amara moves forward.",
  },
  {
    stage: "Training",
    key: "training",
    color: "#06b6d4",
    icon: "📚",
    amara: "Amara joins Language classes (IRCC) and then Employment Services (Employment Ontario). Her case file, including Settlement history, is visible across authorized programs. Alongside, she accesses Mental Health counselling.",
    privacy: null,
    phiWall: true,
    phiNote: "Mental Health records activate the PHI Wall immediately. Amara's counselling sessions are permanently siloed under PHIPA: invisible in cross-program view regardless of consent level. Enforced by a Postgres Row Level Security policy.",
    mainPrivacy: "Cross-program view shows Settlement and Language history to Employment caseworker. PHIPA records excluded structurally.",
  },
  {
    stage: "Placement",
    key: "placement",
    color: "#ec4899",
    icon: "💼",
    amara: "Amara is placed in a software QA role at a local tech employer through Employment Ontario's program. The placement is recorded in OneView and generates an Employment Ontario CSV export row automatically.",
    privacy: "Stage updated in real time. CSV for EO (EOIS-CaMS format) ready on demand with no re-entry.",
  },
  {
    stage: "Survey",
    key: "survey",
    color: "#a855f7",
    icon: "📝",
    amara: "An exit survey link is auto-sent when Amara's journey closes. She rates her experience 5/5, says she would recommend Skills for Change, and leaves a testimonial. Results aggregate to the analytics dashboard immediately.",
    privacy: "Survey linked to client record by ID. Satisfaction and recommend-rate fed into program metrics. Success story displayed with the client's name and program on the analytics dashboard.",
  },
  {
    stage: "Completed",
    key: "complete",
    color: "#22c55e",
    icon: "🎓",
    amara: "Amara's journey is marked complete. Her record contributes to the program success rate, funder narrative, and outcomes dashboard. A caseworker can pull a cross-program view of her full journey in one click.",
    privacy: "Aggregate: anonymized in program statistics. Cross-program: visible with consent. PII: role-gated. PHIPA records: siloed permanently.",
  },
]

export default function JourneyTab() {
  return (
    <div className="space-y-8">
      <div className="glass rounded-xl p-6">
        <h2 className="font-sora text-2xl text-slate-900 dark:text-white mb-1">Amara&apos;s Journey</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">How one client moves through all nine pipeline stages while her privacy is protected at every step.</p>
      </div>

      {/* Pipeline stage bar */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center gap-1 flex-wrap">
          {PIPELINE_STAGES.map((s, i) => (
            <div key={s.key} className="flex items-center gap-1">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: `${s.color}22`, border: `2px solid ${s.color}50` }}>
                  <span className="text-xs">{i + 1}</span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 whitespace-nowrap">{s.stage.split(" ")[0]}</span>
              </div>
              {i < PIPELINE_STAGES.length - 1 && (
                <div className="w-6 h-px bg-slate-200 dark:bg-white/[0.08] mb-5 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {PIPELINE_STAGES.map((step, i) => (
          <div key={step.key} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0" style={{ background: `${step.color}22`, border: `2px solid ${step.color}50` }}>
                {step.icon}
              </div>
              {i < PIPELINE_STAGES.length - 1 && <div className="w-px flex-1 mt-2 bg-slate-200 dark:bg-white/[0.08]" />}
            </div>
            <div className={`flex-1 glass rounded-xl p-4 mb-4 ${step.phiWall ? "border border-rose-500/30" : ""}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: step.color }} />
                <span className="font-sora text-sm font-semibold text-slate-900 dark:text-white">{step.stage}</span>
                <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: `${step.color}22`, color: step.color }}>{step.key}</span>
                {step.phiWall && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-rose-500/20 text-rose-400 text-xs rounded-full border border-rose-500/30">
                    <Lock size={10} /> PHIPA Branch
                  </span>
                )}
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-3 leading-relaxed">{step.amara}</p>
              {step.phiWall ? (
                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-white/[0.03] rounded-lg border border-slate-100 dark:border-white/[0.06]">
                    <span className="text-emerald-500 text-xs mt-0.5">🔐</span>
                    <p className="text-slate-500 text-xs">{step.mainPrivacy}</p>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-rose-500/10 rounded-lg border border-rose-500/20">
                    <Lock size={14} className="text-rose-400 mt-0.5 flex-shrink-0" />
                    <p className="text-rose-600 dark:text-rose-300 text-xs">{step.phiNote}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-white/[0.03] rounded-lg border border-slate-100 dark:border-white/[0.06]">
                  <span className="text-emerald-500 text-xs mt-0.5">🔐</span>
                  <p className="text-slate-500 text-xs">{step.privacy}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
