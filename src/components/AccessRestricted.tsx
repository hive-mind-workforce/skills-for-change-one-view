import { Lock } from "lucide-react"

interface Props {
  requiredRole: string
  currentRole: string
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  caseworker: "Caseworker",
  viewer: "Viewer",
}

export default function AccessRestricted({ requiredRole, currentRole }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center mb-6">
        <Lock size={28} className="text-slate-400 dark:text-slate-600" />
      </div>
      <h2 className="font-sora text-2xl text-slate-900 dark:text-white mb-2">Access Restricted</h2>
      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm leading-relaxed">
        This section requires <span className="text-slate-700 dark:text-slate-200 font-medium capitalize">{ROLE_LABELS[requiredRole] ?? requiredRole}</span> access.
        You are currently viewing as <span className="text-amber-500 dark:text-amber-400 font-medium capitalize">{ROLE_LABELS[currentRole] ?? currentRole}</span>.
      </p>
      <p className="text-slate-400 dark:text-slate-600 text-xs mt-4">Switch roles using the role selector in the header.</p>
    </div>
  )
}
