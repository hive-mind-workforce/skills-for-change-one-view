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
    <nav className="hidden md:flex items-center bg-[#08081a] border-b border-white/[0.12] px-4 gap-0.5">
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={`${href}?role=${role}`}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-all ${
              active
                ? "border-emerald-400 text-emerald-400 bg-emerald-500/5"
                : "border-transparent text-slate-400 hover:text-white hover:bg-white/[0.04]"
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
