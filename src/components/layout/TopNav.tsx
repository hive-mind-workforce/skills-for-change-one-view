"use client"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Home, Plus, Download, Sparkles, Info, Lock, Route, ScrollText } from "lucide-react"

const TABS = [
  { href: "/", label: "Dashboard", icon: Home, minRole: "viewer", tour: "dashboard" },
  { href: "/intake", label: "Intake", icon: Plus, minRole: "caseworker", tour: "intake" },
  { href: "/journeys", label: "Journeys", icon: Route, minRole: "caseworker", tour: "journeys" },
  { href: "/export", label: "Export", icon: Download, minRole: "admin", tour: "export" },
  { href: "/ai", label: "AI Reports", icon: Sparkles, minRole: "caseworker", tour: "ai" },
  { href: "/audit", label: "Audit", icon: ScrollText, minRole: "admin", tour: "audit" },
  { href: "/about", label: "About", icon: Info, minRole: "viewer", tour: "about" },
]

const ROLE_RANK: Record<string, number> = { viewer: 0, caseworker: 1, admin: 2 }

function canAccess(role: string, minRole: string) {
  return (ROLE_RANK[role] ?? 0) >= (ROLE_RANK[minRole] ?? 0)
}

export default function TopNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const role = searchParams.get("role") ?? "admin"

  return (
    <nav className="hidden md:flex items-center sticky top-16 z-40 bg-[var(--ov-header-bg)] border-b border-black/[0.08] dark:border-white/[0.15] px-4 gap-0.5 shadow-[0_1px_0_0_rgba(16,185,129,0.1)] transition-colors duration-200">
      {TABS.map(({ href, label, icon: Icon, minRole, tour }) => {
        const active = pathname === href
        const allowed = canAccess(role, minRole)
        if (!allowed) {
          return (
            <span
              key={href}
              title={`Requires ${minRole} role`}
              className="flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 border-transparent text-slate-300 dark:text-slate-600 cursor-not-allowed select-none"
            >
              <Icon size={15} />
              {label}
              <Lock size={11} className="text-slate-300 dark:text-slate-700" />
            </span>
          )
        }
        return (
          <Link
            key={href}
            href={`${href}?role=${role}`}
            data-tour={tour}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-all ${
              active
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
                : "border-transparent text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
            }`}
          >
            <Icon size={15} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
