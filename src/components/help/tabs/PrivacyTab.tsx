import { Lock, Shield, Eye, BarChart2 } from "lucide-react"

export default function PrivacyTab() {
  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { icon: <Eye size={18} />, title:"Program Consent", level:"Automatic", desc:"Client enrolled in a program. Data used only for that program's funder reporting.", color:"#10b981" },
          { icon: <Shield size={18} />, title:"Cross-Program Consent", level:"Explicit Opt-In", desc:"Client verbally consents. Caseworker checks box. Data can be used across programs for integrated reporting.", color:"#6366f1" },
          { icon: <BarChart2 size={18} />, title:"Dashboard Aggregation", level:"Implied", desc:"Anonymized aggregate metrics in admin dashboard. No PII. No individual consent required.", color:"#f59e0b" },
        ].map((c,i) => (
          <div key={i} className="glass rounded-xl p-5" style={{borderTop:`3px solid ${c.color}`}}>
            <div className="flex items-center gap-2 mb-2" style={{color:c.color}}>
              {c.icon}
              <span className="font-sora text-sm">{c.title}</span>
            </div>
            <div className="text-xs text-slate-500 mb-2">{c.level}</div>
            <p className="text-slate-400 text-sm">{c.desc}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-xl p-5 border-l-4 border-rose-500">
        <div className="flex items-center gap-2 mb-2">
          <Lock size={18} className="text-rose-400" />
          <h3 className="font-sora text-lg text-rose-400">PHI Wall</h3>
        </div>
        <p className="text-slate-400 text-sm mb-3">Mental Health records are ALWAYS siloed under PHIPA (Personal Health Information Protection Act). No role, consent flag, or configuration can override this — it is enforced at the database layer on every cross-program query.</p>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.08]">
          <h3 className="font-sora text-lg text-slate-200">Privacy Law Map</h3>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/[0.06]">
            <th className="text-left px-5 py-3 text-slate-400 font-medium">Program</th>
            <th className="text-left px-5 py-3 text-slate-400 font-medium">Governing Law</th>
            <th className="text-left px-5 py-3 text-slate-400 font-medium hidden md:table-cell">Key Rule</th>
          </tr></thead>
          <tbody>
            {[
              ["Settlement, Language","Federal Privacy Act","Purpose limitation, consent for secondary use"],
              ["Employment, Trades","FIPPA (Ontario)","Collection limitation, access controls"],
              ["Mental Health","PHIPA","PHI Wall always applies, no exceptions"],
              ["Youth","CYFSA Part X","Enhanced protections for minors"],
            ].map(([prog,law,rule],i) => (
              <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                <td className="px-5 py-3 text-slate-300">{prog}</td>
                <td className="px-5 py-3 text-emerald-400">{law}</td>
                <td className="px-5 py-3 text-slate-500 hidden md:table-cell">{rule}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="glass rounded-xl p-5">
        <h3 className="font-sora text-lg text-slate-200 mb-1">Audit Log</h3>
        <p className="text-slate-500 text-sm mb-3">Every write and export operation is logged with the action, affected entity, role, detail payload, and source IP. The log is append-only and cannot be modified through the application.</p>
        <pre className="bg-black/40 rounded-lg p-3 text-xs text-slate-400 font-mono overflow-x-auto">{`action           | entity  | user_role  | detail                                              | source_ip   | at
-----------------+---------+------------+-----------------------------------------------------+-------------+---------------------------
create_client    | client  | caseworker | {"full_name":"A. Hassan","program":"settlement"}     | 142.250.x.x | 2026-06-04 09:15:23
view_clients     | clients | caseworker | {"program":"settlement","count":47}                 | 142.250.x.x | 2026-06-04 09:18:44
export           | ircc    | admin      | {"funder":"ircc","rows":312,"period":"Q1 2026"}     | 198.51.x.x  | 2026-06-04 09:22:11
ai_query         | query   | caseworker | {"question":"Clients who achieved employment?"}     | 142.250.x.x | 2026-06-04 09:30:44
generate_report  | report  | admin      | {"funder":"ircc","period":"Q1 2026","cached":false} | 198.51.x.x  | 2026-06-04 09:31:02
export           | eo      | admin      | {"funder":"eo","rows":189,"period":"Q1 2026"}       | 198.51.x.x  | 2026-06-04 09:35:17
create_client    | client  | caseworker | {"full_name":"M. Osei","program":"employment"}      | 142.250.x.x | 2026-06-04 10:02:08
generate_report  | report  | admin      | {"funder":"uw","period":"Q1 2026","cached":true}    | 198.51.x.x  | 2026-06-04 10:15:44`}</pre>
      </div>
    </div>
  )
}
