"use client"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Home, Plus, Download, Sparkles, HelpCircle } from "lucide-react"

const TABS = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/intake", label: "Intake", icon: Plus },
  { href: "/export", label: "Export", icon: Download },
  { href: "/ai", label: "AI", icon: Sparkles },
  { href: "/help", label: "Help", icon: HelpCircle },
]

export default function BottomNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const role = searchParams.get("role") ?? "admin"

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden bg-[#08081a] border-t border-white/[0.12]" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
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
