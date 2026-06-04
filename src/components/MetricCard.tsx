import GlassCard from "./GlassCard"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

interface MetricCardProps {
  label: string
  value: string | number
  sub?: string
  color?: string
  icon?: React.ReactNode
  trend?: number
  className?: string
}

export default function MetricCard({ label, value, sub, color, icon, trend, className }: MetricCardProps) {
  return (
    <GlassCard className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-start justify-between">
        <span className="text-slate-400 text-sm">{label}</span>
        {icon && <span className="text-slate-500">{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <span className="font-sora text-3xl" style={{ color: color ?? "#10b981" }}>{value}</span>
        {trend !== undefined && (
          trend >= 0
            ? <TrendingUp size={16} className="text-emerald-400 mb-1" />
            : <TrendingDown size={16} className="text-rose-400 mb-1" />
        )}
      </div>
      {sub && <span className="text-slate-500 text-xs">{sub}</span>}
    </GlassCard>
  )
}
