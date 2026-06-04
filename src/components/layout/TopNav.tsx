"use client"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Home, Plus, Download, Sparkles, HelpCircle } from "lucide-react"

const TABS = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/intake", label: "Intake", icon: Plus },
  { href: "/export", label: "Export", icon: Download },
  { href: "/ai", label: "AI Reports", icon: Sparkles },
  { href: "/help", label: "Help", icon: HelpCircle },
]

export default function TopNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const role = searchParams.get("role") ?? "admin"

  return (
    <nav className="hidden md:flex items-center sticky top-16 z-40 bg-slate-950 border-b border-white/[0.15] px-4 gap-0.5 shadow-[0_1px_0_0_rgba(16,185,129,0.15)]">
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={`${href}?role=${role}`}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-all ${
              active
                ? "border-emerald-400 text-emerald-400 bg-emerald-500/5"
                : "border-transparent text-slate-300 hover:text-white hover:bg-white/[0.06]"
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
