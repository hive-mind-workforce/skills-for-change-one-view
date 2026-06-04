const COLORS: Record<string, string> = {
  ircc: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  eo: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  uw: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  city: "bg-violet-500/20 text-violet-300 border-violet-500/30",
}

const LABELS: Record<string, string> = {
  ircc: "IRCC", eo: "Emp. Ontario", uw: "United Way", city: "City of TO",
}

export default function FunderBadge({ funder }: { funder: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${COLORS[funder] ?? "bg-slate-500/20 text-slate-300 border-slate-500/30"}`}>
      {LABELS[funder] ?? funder}
    </span>
  )
}
