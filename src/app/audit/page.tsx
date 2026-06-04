"use client"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Header from "@/components/layout/Header"
import TopNav from "@/components/layout/TopNav"
import BottomNav from "@/components/layout/BottomNav"
import RoleBanner from "@/components/RoleBanner"
import AccessRestricted from "@/components/AccessRestricted"
import AuditTable from "@/components/audit/AuditTable"
import { ScrollText } from "lucide-react"

function AuditContent() {
  const searchParams = useSearchParams()
  const role = searchParams.get("role") ?? "admin"
  if (role !== "admin") return <AccessRestricted requiredRole="admin" currentRole={role} />
  return <AuditTable />
}

export default function AuditPage() {
  return (
    <div className="min-h-screen bg-[var(--ov-bg)] relative flex flex-col">
      <div className="fixed inset-0 mesh-bg pointer-events-none" aria-hidden />
      <div className="fixed inset-0 grid-overlay opacity-[0.4] pointer-events-none" aria-hidden />
      <Suspense fallback={null}><Header /></Suspense>
      <Suspense fallback={null}><TopNav /></Suspense>
      <Suspense fallback={null}><RoleBanner /></Suspense>
      <main className="relative z-10 pb-24 md:pb-8 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="mb-6 flex items-center gap-3">
          <ScrollText size={22} className="text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
          <div>
            <h1 className="font-sora text-3xl text-slate-900 dark:text-white">Audit Log</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-sm">Every write and export operation. Append-only, unmodifiable through the application.</p>
          </div>
        </div>
        <Suspense fallback={null}><AuditContent /></Suspense>
      </main>
      <Suspense fallback={null}><BottomNav /></Suspense>
    </div>
  )
}
