"use client"
import { Suspense } from "react"
import Header from "@/components/layout/Header"
import TopNav from "@/components/layout/TopNav"
import BottomNav from "@/components/layout/BottomNav"
import RoleBanner from "@/components/RoleBanner"
import ExportPanel from "@/components/export/ExportPanel"

export default function ExportPage() {
  return (
    <div className="min-h-screen bg-[#060610] relative">
      <div className="fixed inset-0 mesh-bg pointer-events-none" aria-hidden />
      <div className="fixed inset-0 grid-overlay opacity-[0.4] pointer-events-none" aria-hidden />
      <Suspense fallback={null}><Header /></Suspense>
      <Suspense fallback={null}><TopNav /></Suspense>
      <Suspense fallback={null}><RoleBanner /></Suspense>
      <main className="relative z-10 pb-24 md:pb-8 max-w-5xl mx-auto px-4 py-8">
        <Suspense fallback={null}><ExportPanel /></Suspense>
      </main>
      <Suspense fallback={null}><BottomNav /></Suspense>
    </div>
  )
}
