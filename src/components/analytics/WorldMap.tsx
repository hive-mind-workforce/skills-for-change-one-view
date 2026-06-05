"use client"
import { useState, useCallback, useRef } from "react"
import { ComposableMap, Geographies, Geography } from "react-simple-maps"

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

const ALPHA2_TO_NUM: Record<string, number> = {
  SO: 706, IN: 356, SY: 760, PH: 608, CO: 170, NG: 566, ET: 231, UA: 804,
  MX: 484, CN: 156, PK: 586, BD: 50, KE: 404, GH: 288, JM: 388, BR: 76,
  EG: 818, IR: 364, AF: 4, TZ: 834, CA: 124, US: 840, GB: 826, FR: 250,
}

const COUNTRY_NAMES: Record<string, string> = {
  SO: "Somalia", IN: "India", SY: "Syria", PH: "Philippines", CO: "Colombia",
  NG: "Nigeria", ET: "Ethiopia", UA: "Ukraine", MX: "Mexico", CN: "China",
  PK: "Pakistan", BD: "Bangladesh", KE: "Kenya", GH: "Ghana", JM: "Jamaica",
  BR: "Brazil", EG: "Egypt", IR: "Iran", AF: "Afghanistan", TZ: "Tanzania",
}

interface TooltipState {
  name: string
  count: number
  x: number
  y: number
}

interface Props {
  byCountry: Array<{ country_of_origin: string; count: number | string }>
}

export default function WorldMap({ byCountry }: Props) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const countMap: Record<string, number> = {}
  let maxCount = 0
  for (const row of byCountry) {
    const n = typeof row.count === "string" ? parseInt(row.count) : row.count
    countMap[row.country_of_origin] = n
    if (n > maxCount) maxCount = n
  }

  function getColor(alpha2: string) {
    const count = countMap[alpha2]
    if (!count) return "#1e293b"
    const pct = count / maxCount
    if (pct > 0.8) return "#059669"
    if (pct > 0.6) return "#10b981"
    if (pct > 0.4) return "#34d399"
    if (pct > 0.2) return "#6ee7b7"
    return "#a7f3d0"
  }

  function getAlpha2(numericId: string): string | undefined {
    const num = parseInt(numericId)
    return Object.entries(ALPHA2_TO_NUM).find(([, v]) => v === num)?.[0]
  }

  const handleMouseEnter = useCallback((geo: any, evt: React.MouseEvent) => {
    const alpha2 = getAlpha2(geo.id)
    if (!alpha2 || !countMap[alpha2]) return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setTooltip({
      name: COUNTRY_NAMES[alpha2] ?? alpha2,
      count: countMap[alpha2],
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top,
    })
  }, [countMap])

  const handleMouseMove = useCallback((geo: any, evt: React.MouseEvent) => {
    const alpha2 = getAlpha2(geo.id)
    if (!alpha2 || !countMap[alpha2]) return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setTooltip(prev => prev ? { ...prev, x: evt.clientX - rect.left, y: evt.clientY - rect.top } : null)
  }, [countMap])

  const handleMouseLeave = useCallback(() => {
    setTooltip(null)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: 320 }}>
      <ComposableMap
        projection="geoNaturalEarth1"
        style={{ width: "100%", height: "100%" }}
        projectionConfig={{ scale: 147 }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const alpha2 = getAlpha2(geo.id)
              const count = alpha2 ? countMap[alpha2] ?? 0 : 0
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={getColor(alpha2 ?? "")}
                  stroke="#0f172a"
                  strokeWidth={0.4}
                  onMouseEnter={(evt) => handleMouseEnter(geo, evt)}
                  onMouseMove={(evt) => handleMouseMove(geo, evt)}
                  onMouseLeave={handleMouseLeave}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: count > 0 ? "#f59e0b" : "#1e293b", outline: "none", cursor: count > 0 ? "pointer" : "default" },
                    pressed: { outline: "none" },
                  }}
                />
              )
            })
          }
        </Geographies>
      </ComposableMap>

      {tooltip && (
        <div
          className="absolute z-10 pointer-events-none px-3 py-2 rounded-lg shadow-xl text-sm"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 36,
            background: "rgba(15,23,42,0.95)",
            border: "1px solid rgba(16,185,129,0.3)",
          }}
        >
          <p className="font-medium text-white">{tooltip.name}</p>
          <p className="text-emerald-400">{tooltip.count.toLocaleString()} clients</p>
        </div>
      )}

      <div className="absolute bottom-2 right-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-900/60 rounded-lg px-2 py-1">
        <span>Low</span>
        {["#a7f3d0","#6ee7b7","#34d399","#10b981","#059669"].map(c => (
          <div key={c} className="w-4 h-2 rounded-sm" style={{ background: c }} />
        ))}
        <span>High</span>
      </div>
    </div>
  )
}
