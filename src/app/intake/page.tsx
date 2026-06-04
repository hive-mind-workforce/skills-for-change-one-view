"use client"
import { Suspense } from "react"
import Header from "@/components/layout/Header"
import TopNav from "@/components/layout/TopNav"
import BottomNav from "@/components/layout/BottomNav"
import RoleBanner from "@/components/RoleBanner"
import IntakeForm from "@/components/intake/IntakeForm"
import { Users, Shield, Zap, RefreshCw } from "lucide-react"

const PROGRAM_PHOTOS: Record<string, string> = {
  settlement: "https://images.unsplash.com/photo-1569025690938-a00729c9e1f9?w=600&q=70",
  employment: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=70",
  language: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=70",
  mental_health: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=600&q=70",
  trades: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=70",
  mentoring: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=70",
  youth: "https://images.unsplash.com/photo-1571624436279-b272aff752b5?w=600&q=70",
  women: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=70",
}

const SIDEBAR_ITEMS = [
  { icon: Users, title: "One intake, every program", desc: "A single registration feeds all 8 programs and 4 funders. No re-entry of client data.", color: "text-emerald-400" },
  { icon: Zap, title: "Power Automate ready", desc: "Microsoft Forms submissions route here automatically via Power Automate. Zero staff behavior change.", color: "text-indigo-400" },
  { icon: Shield, title: "Privacy by design", desc: "PHIPA wall enforced at database level. Cross-program consent is explicit and recorded.", color: "text-rose-400" },
  { icon: RefreshCw, title: "Real-time outcomes", desc: "Outcomes are seeded at intake and tracked through immediate, intermediate, and ultimate tiers.", color: "text-amber-400" },
]

export default function IntakePage() {
  return (
    <div className="min-h-screen bg-[#060610] relative">
      <div className="fixed inset-0 mesh-bg pointer-events-none" aria-hidden />
      <div className="fixed inset-0 grid-overlay opacity-[0.4] pointer-events-none" aria-hidden />
      <Suspense fallback={null}><Header /></Suspense>
      <Suspense fallback={null}><TopNav /></Suspense>
      <Suspense fallback={null}><RoleBanner /></Suspense>
      <main className="relative z-10 pb-24 md:pb-8 max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="font-sora text-3xl text-white">Register a Client</h1>
          <p className="text-slate-400 mt-1">One intake, any program. Data captured once, available everywhere.</p>
        </div>
        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3">
            <Suspense fallback={null}><IntakeForm /></Suspense>
          </div>
          <div className="md:col-span-2 space-y-4">
            <div className="relative h-40 rounded-xl overflow-hidden">
              <img
                src={PROGRAM_PHOTOS.settlement}
                alt="Community intake"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060610] via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4">
                <p className="text-white text-sm font-medium">Skills for Change</p>
                <p className="text-slate-300 text-xs">Serving 20,000+ clients annually</p>
              </div>
            </div>
            {SIDEBAR_ITEMS.map((item) => (
              <div key={item.title} className="glass rounded-xl p-4 flex gap-3">
                <item.icon size={18} className={`${item.color} flex-shrink-0 mt-0.5`} />
                <div>
                  <p className={`text-sm font-medium ${item.color}`}>{item.title}</p>
                  <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Suspense fallback={null}><BottomNav /></Suspense>
    </div>
  )
}
