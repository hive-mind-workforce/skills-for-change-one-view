"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Plus, Download, Sparkles, Info } from "lucide-react"

const TABS = [
  { href: "/", label: "Dashboard", icon: Home, tour: "dashboard" },
  { href: "/intake", label: "Intake", icon: Plus, tour: "intake" },
  { href: "/export", label: "Export", icon: Download, tour: "export" },
  { href: "/ai", label: "AI", icon: Sparkles, tour: "ai" },
  { href: "/help", label: "Help", icon: Info, tour: "help" },
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden glass border-t border-white/[0.08]" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      {TABS.map(({ href, label, icon: Icon, tour }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            data-tour={tour}
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
