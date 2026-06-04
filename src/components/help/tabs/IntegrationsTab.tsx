import { CheckCircle, ArrowRight } from "lucide-react"

export default function IntegrationsTab() {
  return (
    <div className="space-y-8">
      <div className="glass rounded-xl p-6">
        <h2 className="font-sora text-2xl text-slate-900 dark:text-white mb-1">Works With Your Existing Tools</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">OneView is additive, not replacement. Staff keep their current workflows. OneView adds the outcomes layer.</p>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="font-sora text-lg text-blue-600 dark:text-blue-400 mb-4">Microsoft Forms</h3>
        <div className="flex items-center gap-2 flex-wrap text-sm mb-4">
          {["Microsoft Form","Power Automate","HTTP POST","/api/clients","OneView DB"].map((step, i, arr) => (
            <span key={i} className="flex items-center gap-2">
              <span className="px-3 py-1 glass rounded-lg text-slate-600 dark:text-slate-300">{step}</span>
              {i < arr.length - 1 && <ArrowRight size={14} className="text-slate-500" />}
            </span>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <div className="text-blue-600 dark:text-blue-400 font-medium text-sm mb-1">Setup Time</div>
            <div className="text-slate-500 dark:text-slate-400 text-xs">Approximately 20 minutes in Power Automate. No code deployment. No staff retraining.</div>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <div className="text-emerald-600 dark:text-emerald-400 font-medium text-sm mb-1">Staff Impact</div>
            <div className="text-slate-500 dark:text-slate-400 text-xs">Zero. Forms stay exactly as-is. Power Automate bridges in the background.</div>
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="font-sora text-lg text-cyan-600 dark:text-cyan-400 mb-4">SharePoint / Excel Migration</h3>
        <div className="flex items-center gap-2 flex-wrap text-sm mb-4">
          {["Excel / SharePoint","CSV Export","Data Mapping","Bulk Import","/api/clients","OneView DB"].map((step, i, arr) => (
            <span key={i} className="flex items-center gap-2">
              <span className="px-3 py-1 glass rounded-lg text-slate-600 dark:text-slate-300">{step}</span>
              {i < arr.length - 1 && <ArrowRight size={14} className="text-slate-500" />}
            </span>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
            <div className="text-cyan-600 dark:text-cyan-400 font-medium text-sm mb-1">Migration Approach</div>
            <div className="text-slate-500 dark:text-slate-400 text-xs">Export existing Excel/SharePoint data as CSV. AI-assisted field mapping to OneView schema. One-time import, then OneView is the system of record going forward.</div>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <div className="text-emerald-600 dark:text-emerald-400 font-medium text-sm mb-1">Staff Impact</div>
            <div className="text-slate-500 dark:text-slate-400 text-xs">Minimal. Excel files kept as read-only archive. Staff switch to OneView intake for all new clients. No parallel data entry required.</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-5">
          <h4 className="font-sora text-sm text-slate-600 dark:text-slate-300 mb-3">What OneView Replaces</h4>
          <ul className="space-y-2">
            {["Manual spreadsheet tracking","Re-entry of data into funder portals","Copy-paste narrative reports","Disconnected program silos"].map((item,i) => (
              <li key={i} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                <CheckCircle size={12} className="text-emerald-500 dark:text-emerald-400 flex-shrink-0" /> {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="glass rounded-xl p-5">
          <h4 className="font-sora text-sm text-slate-600 dark:text-slate-300 mb-3">What OneView Keeps</h4>
          <ul className="space-y-2">
            {["Microsoft Forms (bridges to OneView via Power Automate)","SharePoint (read-only archive of historical data)","iCARE (receives CSV uploads)","EOIS-CaMS (receives CSV uploads)"].map((item,i) => (
              <li key={i} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                <span className="text-amber-400 text-xs">→</span> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
