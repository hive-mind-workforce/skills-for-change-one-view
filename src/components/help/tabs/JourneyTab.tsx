import { Lock } from "lucide-react"

const STEPS = [
  { step: 1, title: "Settlement (IRCC)", program: "settlement", color: "#10b981", icon: "🏠", desc: "Amara arrives in Toronto and enrolls in Settlement Services. Program-level consent only. Her data is used for IRCC reporting.", privacy: "Program consent (automatic). Data scoped to IRCC only." },
  { step: 2, title: "Language Program (IRCC)", program: "language", color: "#06b6d4", icon: "🗣️", desc: "Amara joins Language classes to improve her English. Still within the IRCC umbrella. Caseworker can see her Settlement history.", privacy: "Same funder scope. No new consent needed." },
  { step: 3, title: "Cross-Program Consent", program: null, color: "#f59e0b", icon: "✅", desc: 'Amara moves toward Employment. Her caseworker asks: "Can we enable cross-program sharing so we can see your full journey?" Amara says yes.', privacy: "Explicit opt-in. consent_cross_program set to true. Caseworker checks box and records verbal consent." },
  { step: 4, title: "Employment (EO)", program: "employment", color: "#6366f1", icon: "💼", desc: "Amara joins Employment Services. With cross-program consent, her caseworker can now see her Settlement and Language journey to provide better-integrated support.", privacy: "Cross-program view enabled. Full journey visible to authorized caseworkers." },
  { step: 5, title: "Mental Health (PHIPA)", program: "mental_health", color: "#f43f5e", icon: "🔒", desc: "Amara accesses confidential Mental Health counselling. PHIPA activates the PHI Wall immediately. This record is NEVER accessible in cross-program view.", privacy: null, phiWall: true },
]

export default function JourneyTab() {
  return (
    <div className="space-y-8">
      <div className="glass rounded-xl p-6">
        <h2 className="font-sora text-2xl text-white mb-1">Amara's Journey</h2>
        <p className="text-slate-400 text-sm">How one client moves through multiple programs while her privacy is protected at every step.</p>
      </div>

      <div className="space-y-4">
        {STEPS.map((step, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0" style={{background:`${step.color}22`,border:`2px solid ${step.color}50`}}>
                {step.icon}
              </div>
              {i < STEPS.length - 1 && <div className="w-px flex-1 mt-2 bg-white/[0.08]" />}
            </div>
            <div className={`flex-1 glass rounded-xl p-4 mb-4 ${step.phiWall ? "border-rose-500/30" : ""}`} style={step.phiWall ? {borderColor:"rgba(244,63,94,0.3)"} : {}}>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-sora text-sm" style={{color:step.color}}>{step.title}</span>
                {step.program && (
                  <span className="px-2 py-0.5 rounded-full text-xs" style={{background:`${step.color}22`,color:step.color}}>{step.program}</span>
                )}
                {step.phiWall && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-rose-500/20 text-rose-400 text-xs rounded-full border border-rose-500/30">
                    <Lock size={10} /> PHIPA Protected
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-sm mb-3">{step.desc}</p>
              {step.phiWall ? (
                <div className="flex items-start gap-2 p-3 bg-rose-500/10 rounded-lg border border-rose-500/20">
                  <Lock size={14} className="text-rose-400 mt-0.5 flex-shrink-0" />
                  <p className="text-rose-300 text-xs">PHIPA hard rule: Mental Health records are ALWAYS siloed. This record is invisible in cross-program view regardless of consent level. Enforced at SQL level.</p>
                </div>
              ) : (
                <div className="flex items-start gap-2 p-3 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                  <span className="text-emerald-400 mt-0.5 text-xs">🔐</span>
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
