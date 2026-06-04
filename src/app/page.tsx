"use client"
import { Suspense } from "react"
import Header from "@/components/layout/Header"
import TopNav from "@/components/layout/TopNav"
import BottomNav from "@/components/layout/BottomNav"
import RoleBanner from "@/components/RoleBanner"
import Dashboard from "@/components/dashboard/Dashboard"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--ov-bg)] relative flex flex-col">
      <div className="fixed inset-0 mesh-bg pointer-events-none" aria-hidden />
      <div className="fixed inset-0 grid-overlay opacity-[0.4] pointer-events-none" aria-hidden />
      <Suspense fallback={null}>
        <Header />
        <TopNav />
        <RoleBanner />
      </Suspense>
      <main className="relative z-10 pb-24 md:pb-8">
        <Suspense fallback={<div className="p-8 text-slate-400">Loading...</div>}>
          <Dashboard />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <BottomNav />
      </Suspense>
    </div>
  )
}
