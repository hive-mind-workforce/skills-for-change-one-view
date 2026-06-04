"use client"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { programColor, programLabel, programShortLabel } from "@/lib/helpers"

interface ProgramChartProps {
  data: { program: string; count: number }[]
}

export default function ProgramChart({ data }: ProgramChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="glass rounded-lg p-3 text-sm">
        <p className="text-slate-800 dark:text-slate-200 font-medium">{programLabel(payload[0].payload.program)}</p>
        <p className="text-emerald-500 dark:text-emerald-400">{payload[0].value.toLocaleString()} clients</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <XAxis
          dataKey="program"
          tick={{ fill: "var(--ov-tick-color)", fontSize: 11 }}
          tickFormatter={(v) => programShortLabel(v)}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fill: "var(--ov-tick-color)", fontSize: 11 }} axisLine={false} tickLine={false} width={50} tickFormatter={v => (v/1000)+"k"} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--ov-chart-cursor, rgba(0,0,0,0.04))" }} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.program} fill={programColor(entry.program)} opacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
