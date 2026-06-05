"use client"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Header from "@/components/layout/Header"
import TopNav from "@/components/layout/TopNav"
import BottomNav from "@/components/layout/BottomNav"
import RoleBanner from "@/components/RoleBanner"
import AccessRestricted from "@/components/AccessRestricted"
import JourneyViewer from "@/components/journeys/JourneyViewer"
import { Route } from "lucide-react"

function JourneysContent() {
  const searchParams = useSearchParams()
  const role = searchParams.get("role") ?? "admin"
  if (role === "viewer") return <AccessRestricted requiredRole="caseworker" currentRole={role} />
  return <JourneyViewer />
}

export default function JourneysPage() {
  return (
    <div className="min-h-screen bg-[var(--ov-bg)] relative flex flex-col">
      <div className="fixed inset-0 mesh-bg pointer-events-none" aria-hidden />
      <div className="fixed inset-0 grid-overlay opacity-[0.4] pointer-events-none" aria-hidden />
      <Suspense fallback={null}><Header /></Suspense>
      <Suspense fallback={null}><TopNav /></Suspense>
      <Suspense fallback={null}><RoleBanner /></Suspense>
      <main className="relative z-10 pb-24 md:pb-8 max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="mb-6 flex items-center gap-3">
          <Route size={22} className="text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
          <div>
            <h1 className="font-sora text-3xl text-slate-900 dark:text-white">Client Journeys</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-sm">View a client's full program history, outcomes, and consent status across all enrollments.</p>
          </div>
        </div>
        <Suspense fallback={null}><JourneysContent /></Suspense>
      </main>
      <Suspense fallback={null}><BottomNav /></Suspense>
    </div>
  )
}
