export const runtime = "nodejs"
import { NextRequest } from "next/server"
import { getCachedReport, cacheReport, getClients, logAudit } from "@/lib/db"
import { generateReport } from "@/lib/llm"
import { FUNDERS } from "@/lib/funders"

export async function POST(req: NextRequest) {
  try {
    const { funder, period, forceLive = false } = await req.json()
    if (!funder || !period) {
      return Response.json({ error: "funder and period are required" }, { status: 400 })
    }

    if (!forceLive) {
      const cached = await getCachedReport(funder, period)
      if (cached) return Response.json({ narrative: cached, cached: true })
    }

    const { clients, metrics } = await getClients()
    const config = FUNDERS[funder]
    const funderClients = clients.filter((c: any) => config?.programs.includes(c.program))
    const funderMetrics = {
      funder: config?.label ?? funder,
      period,
      totalClients: funderClients.length,
      programs: config?.programs ?? [],
      crossProgram: funderClients.filter((c: any) => c.consent_cross_program).length,
      overallOutcomesAchievedPct: metrics.outcomesAchievedPct,
    }

    const narrative = await generateReport(funder, period, funderMetrics)
    await cacheReport(funder, period, narrative)
    await logAudit("generate_report", "report", { funder, period, cached: false }, "admin", req.headers.get("x-forwarded-for") ?? "")
    return Response.json({ narrative, cached: false, metrics: funderMetrics })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
