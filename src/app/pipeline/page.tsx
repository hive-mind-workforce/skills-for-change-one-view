"use client"
import { Suspense } from "react"
import { Layers } from "lucide-react"
import Header from "@/components/layout/Header"
import TopNav from "@/components/layout/TopNav"
import BottomNav from "@/components/layout/BottomNav"
import RoleBanner from "@/components/RoleBanner"
import PipelineBoard from "@/components/pipeline/PipelineBoard"

export default function PipelinePage() {
  return (
    <div className="min-h-screen bg-[var(--ov-bg)] relative flex flex-col">
      <div className="fixed inset-0 mesh-bg pointer-events-none" aria-hidden />
      <div className="fixed inset-0 grid-overlay opacity-[0.4] pointer-events-none" aria-hidden />
      <Suspense fallback={null}><Header /></Suspense>
      <Suspense fallback={null}><TopNav /></Suspense>
      <Suspense fallback={null}><RoleBanner /></Suspense>
      <main className="relative z-10 pb-24 md:pb-8 max-w-[1400px] mx-auto px-4 py-8 w-full">
        <div className="mb-6 flex items-center gap-3">
          <Layers size={22} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <div>
            <h1 className="font-sora text-3xl text-slate-900 dark:text-white">Client Pipeline</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-sm">
              Every active client, mapped to their current stage in the program journey.
            </p>
          </div>
        </div>
        <Suspense fallback={<div className="p-8 text-slate-500 dark:text-slate-400 text-sm">Loading pipeline...</div>}>
          <PipelineBoard />
        </Suspense>
      </main>
      <Suspense fallback={null}><BottomNav /></Suspense>
    </div>
  )
}
