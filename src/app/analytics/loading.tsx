export default function AnalyticsLoading() {
  return (
    <div className="min-h-screen bg-[var(--ov-bg)] relative flex flex-col">
      <div className="fixed inset-0 mesh-bg pointer-events-none" aria-hidden />
      <div className="fixed inset-0 grid-overlay opacity-[0.4] pointer-events-none" aria-hidden />
      <main className="relative z-10 pb-24 md:pb-8 max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Page heading skeleton */}
        <div className="mb-6 flex items-center gap-3 animate-pulse">
          <div className="w-6 h-6 rounded bg-white/[0.08] flex-shrink-0" />
          <div className="space-y-2">
            <div className="h-8 w-48 rounded bg-white/[0.08]" />
            <div className="h-4 w-72 rounded bg-white/[0.06]" />
          </div>
        </div>

        {/* Metric cards row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass rounded-xl p-5 space-y-3">
              <div className="h-4 w-24 rounded bg-white/[0.08]" />
              <div className="h-8 w-16 rounded bg-white/[0.08]" />
              <div className="h-3 w-20 rounded bg-white/[0.06]" />
            </div>
          ))}
        </div>

        {/* Chart + map row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 animate-pulse">
          <div className="glass rounded-xl p-5 h-64">
            <div className="h-4 w-32 rounded bg-white/[0.08] mb-4" />
            <div className="h-full w-full rounded bg-white/[0.04]" />
          </div>
          <div className="glass rounded-xl p-5 h-64">
            <div className="h-4 w-32 rounded bg-white/[0.08] mb-4" />
            <div className="h-full w-full rounded bg-white/[0.04]" />
          </div>
        </div>

        {/* Wide chart */}
        <div className="glass rounded-xl p-5 h-56 animate-pulse">
          <div className="h-4 w-40 rounded bg-white/[0.08] mb-4" />
          <div className="h-full w-full rounded bg-white/[0.04]" />
        </div>
      </main>
    </div>
  )
}
