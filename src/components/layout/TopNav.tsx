"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Plus, Download, Sparkles, Info } from "lucide-react"

const TABS = [
  { href: "/", label: "Dashboard", icon: Home, tour: "dashboard" },
  { href: "/intake", label: "Intake", icon: Plus, tour: "intake" },
  { href: "/export", label: "Export", icon: Download, tour: "export" },
  { href: "/ai", label: "AI Reports", icon: Sparkles, tour: "ai" },
  { href: "/help", label: "Help", icon: Info, tour: "help" },
]

export default function TopNav() {
  const pathname = usePathname()
  return (
    <nav className="hidden md:flex glass border-b border-white/[0.08] px-6 gap-1">
      {TABS.map(({ href, label, icon: Icon, tour }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            data-tour={tour}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              active
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600"
            }`}
          >
            <Icon size={16} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
