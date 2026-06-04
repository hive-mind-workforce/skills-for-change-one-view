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
          <Lock size={18} className="text-rose-600 dark:text-rose-400" />
          <h3 className="font-sora text-lg text-rose-400">PHI Wall</h3>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">Mental Health records are ALWAYS siloed under PHIPA (Personal Health Information Protection Act). No role, consent flag, or configuration can override this; it is enforced at the database layer on every cross-program query.</p>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-white/[0.08]">
          <h3 className="font-sora text-lg text-slate-700 dark:text-slate-200">Privacy Law Map</h3>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-100 dark:border-white/[0.06]">
            <th className="text-left px-5 py-3 text-slate-500 dark:text-slate-400 font-medium">Program</th>
            <th className="text-left px-5 py-3 text-slate-500 dark:text-slate-400 font-medium">Governing Law</th>
            <th className="text-left px-5 py-3 text-slate-500 dark:text-slate-400 font-medium hidden md:table-cell">Key Rule</th>
          </tr></thead>
          <tbody>
            {[
              ["Settlement, Language","Federal Privacy Act","Purpose limitation, consent for secondary use"],
              ["Employment, Trades","FIPPA (Ontario)","Collection limitation, access controls"],
              ["Mental Health","PHIPA","PHI Wall always applies, no exceptions"],
              ["Youth","CYFSA Part X","Enhanced protections for minors"],
            ].map(([prog,law,rule],i) => (
              <tr key={i} className="border-b border-slate-50 dark:border-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                <td className="px-5 py-3 text-slate-700 dark:text-slate-300">{prog}</td>
                <td className="px-5 py-3 text-emerald-600 dark:text-emerald-400">{law}</td>
                <td className="px-5 py-3 text-slate-500 hidden md:table-cell">{rule}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-white/[0.08]">
          <h3 className="font-sora text-lg text-slate-700 dark:text-slate-200">Audit Log</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Every write and export operation is logged. Append-only; cannot be modified through the application.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.02]">
                <th className="text-left px-4 py-2.5 text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">Action</th>
                <th className="text-left px-4 py-2.5 text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">Entity</th>
                <th className="text-left px-4 py-2.5 text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">Role</th>
                <th className="text-left px-4 py-2.5 text-slate-500 dark:text-slate-400 font-medium hidden lg:table-cell">Detail</th>
                <th className="text-left px-4 py-2.5 text-slate-500 dark:text-slate-400 font-medium hidden md:table-cell whitespace-nowrap">Source IP</th>
                <th className="text-left px-4 py-2.5 text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {[
                { action:"create_client",   entity:"client",   role:"caseworker", detail:'{"full_name":"A. Hassan","program":"settlement"}',     ip:"142.250.x.x", at:"2026-06-04 09:15:23", roleColor:"text-indigo-600 dark:text-indigo-400" },
                { action:"view_clients",    entity:"clients",  role:"caseworker", detail:'{"program":"settlement","count":47}',                  ip:"142.250.x.x", at:"2026-06-04 09:18:44", roleColor:"text-indigo-600 dark:text-indigo-400" },
                { action:"export",          entity:"ircc",     role:"admin",      detail:'{"funder":"ircc","rows":312,"period":"Q1 2026"}',       ip:"198.51.x.x",  at:"2026-06-04 09:22:11", roleColor:"text-emerald-600 dark:text-emerald-400" },
                { action:"ai_query",        entity:"query",    role:"caseworker", detail:'{"question":"Clients who achieved employment?"}',       ip:"142.250.x.x", at:"2026-06-04 09:30:44", roleColor:"text-indigo-600 dark:text-indigo-400" },
                { action:"generate_report", entity:"report",   role:"admin",      detail:'{"funder":"ircc","period":"Q1 2026","cached":false}',   ip:"198.51.x.x",  at:"2026-06-04 09:31:02", roleColor:"text-emerald-600 dark:text-emerald-400" },
                { action:"export",          entity:"eo",       role:"admin",      detail:'{"funder":"eo","rows":189,"period":"Q1 2026"}',         ip:"198.51.x.x",  at:"2026-06-04 09:35:17", roleColor:"text-emerald-600 dark:text-emerald-400" },
                { action:"create_client",   entity:"client",   role:"caseworker", detail:'{"full_name":"M. Osei","program":"employment"}',        ip:"142.250.x.x", at:"2026-06-04 10:02:08", roleColor:"text-indigo-600 dark:text-indigo-400" },
                { action:"generate_report", entity:"report",   role:"admin",      detail:'{"funder":"uw","period":"Q1 2026","cached":true}',      ip:"198.51.x.x",  at:"2026-06-04 10:15:44", roleColor:"text-emerald-600 dark:text-emerald-400" },
              ].map((row, i) => (
                <tr key={i} className="border-b border-slate-50 dark:border-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                  <td className="px-4 py-2.5 font-mono text-emerald-700 dark:text-emerald-400 whitespace-nowrap">{row.action}</td>
                  <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.entity}</td>
                  <td className={`px-4 py-2.5 whitespace-nowrap ${row.roleColor}`}>{row.role}</td>
                  <td className="px-4 py-2.5 font-mono text-slate-400 dark:text-slate-500 hidden lg:table-cell max-w-xs truncate">{row.detail}</td>
                  <td className="px-4 py-2.5 text-slate-400 dark:text-slate-500 hidden md:table-cell font-mono whitespace-nowrap">{row.ip}</td>
                  <td className="px-4 py-2.5 text-slate-400 dark:text-slate-500 font-mono whitespace-nowrap">{row.at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
