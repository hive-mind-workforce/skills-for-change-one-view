export const runtime = "nodejs"
import { NextRequest } from "next/server"
import { getCachedReport, cacheReport, getClientsForExport, logAudit } from "@/lib/db"
import { generateReport } from "@/lib/llm"
import { FUNDERS } from "@/lib/funders"
import { sql } from "@vercel/postgres"

export async function POST(req: NextRequest) {
  const role = new URL(req.url).searchParams.get("role")
  if (role !== "admin") {
    return Response.json({ error: "Admin role required" }, { status: 403 })
  }
  try {
    const { funder, period, forceLive = false } = await req.json()
    const config = FUNDERS[funder]
    if (!funder || !period) {
      return Response.json({ error: "funder and period are required" }, { status: 400 })
    }

    if (!forceLive) {
      const cached = await getCachedReport(funder, period)
      if (cached) return Response.json({ narrative: cached, cached: true })
    }

    const [funderClients, outcomesRes] = await Promise.all([
      getClientsForExport(config?.programs ?? []),
      sql`SELECT COUNT(*) FILTER (WHERE achieved = true) as achieved, COUNT(*) as total FROM outcomes`,
    ])

    const totalOutcomes = parseInt(outcomesRes.rows[0].total)
    const achievedOutcomes = parseInt(outcomesRes.rows[0].achieved)
    const crossProgram = funderClients.filter((c: any) => c.consent_cross_program).length

    const funderMetrics = {
      funder: config?.label ?? funder,
      period,
      totalClients: funderClients.length,
      programs: config?.programs ?? [],
      crossProgram,
      overallOutcomesAchievedPct: totalOutcomes > 0 ? Math.round((achievedOutcomes / totalOutcomes) * 100) : 0,
    }

    const narrative = await generateReport(funder, period, funderMetrics)
    await cacheReport(funder, period, narrative)
    await logAudit("generate_report", "report", { funder, period, cached: false }, "admin", req.headers.get("x-forwarded-for") ?? "")
    return Response.json({ narrative, cached: false, metrics: funderMetrics })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
