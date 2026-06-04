"use client"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Home, Plus, Download, Sparkles, HelpCircle, Lock } from "lucide-react"

const TABS = [
  { href: "/", label: "Dashboard", icon: Home, minRole: "viewer" },
  { href: "/intake", label: "Intake", icon: Plus, minRole: "caseworker" },
  { href: "/export", label: "Export", icon: Download, minRole: "admin" },
  { href: "/ai", label: "AI", icon: Sparkles, minRole: "caseworker" },
  { href: "/help", label: "Help", icon: HelpCircle, minRole: "viewer" },
]

const ROLE_RANK: Record<string, number> = { viewer: 0, caseworker: 1, admin: 2 }

function canAccess(role: string, minRole: string) {
  return (ROLE_RANK[role] ?? 0) >= (ROLE_RANK[minRole] ?? 0)
}

export default function BottomNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const role = searchParams.get("role") ?? "admin"

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden bg-[#08081a] border-t border-white/[0.12]" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      {TABS.map(({ href, label, icon: Icon, minRole }) => {
        const active = pathname === href
        const allowed = canAccess(role, minRole)
        if (!allowed) {
          return (
            <span
              key={href}
              className="flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs text-slate-700 cursor-not-allowed relative"
            >
              <Icon size={20} />
              <span>{label}</span>
              <Lock size={9} className="absolute top-2 right-[calc(50%-14px)]" />
            </span>
          )
        }
        return (
          <Link
            key={href}
            href={`${href}?role=${role}`}
            className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs transition-colors ${
              active ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Icon size={20} className={active ? "drop-shadow-[0_0_6px_#10b981]" : ""} />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
