export const runtime = "nodejs"
import { NextRequest } from "next/server"
import { getClientsForExport, logAudit } from "@/lib/db"
import { generateCSVFromExport, FUNDERS } from "@/lib/funders"

function checkAuth(req: NextRequest): Response | null {
  const apiKey = process.env.ONEVIEW_API_KEY
  const role = new URL(req.url).searchParams.get("role")
  const auth = req.headers.get("authorization")
  if (apiKey) {
    if (auth !== `Bearer ${apiKey}` && role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }
  } else if (role !== "admin") {
    return Response.json({ error: "Admin role required" }, { status: 403 })
  }
  return null
}

export async function POST(req: NextRequest) {
  const authError = checkAuth(req)
  if (authError) return authError
  try {
    const { funder } = await req.json()
    const config = FUNDERS[funder]
    if (!funder || !config) {
      return Response.json({ error: "Invalid funder" }, { status: 400 })
    }
    const clients = await getClientsForExport(config.programs)
    const { headers, rows } = generateCSVFromExport(funder, clients)
    // Extended raw fields available for custom column configuration
    const rawData = clients.map((c: any) => {
      const outcomes: any[] = Array.isArray(c.outcomes) ? c.outcomes : []
      return {
        client_id: c.id?.substring(0, 8) ?? "",
        full_name: c.full_name ?? "",
        primary_language: c.primary_language ?? "",
        immigration_stream: c.immigration_stream ?? "",
        country_of_origin: c.country_of_origin ?? "",
        age_group: c.age_group ?? "",
        gender: c.gender ?? "",
        source: c.source ?? "",
        stage: c.stage ?? "",
        program: c.program ?? "",
        funder: c.funder ?? "",
        enrolled_at: c.enrolled_at ? new Date(c.enrolled_at).toISOString().split("T")[0] : "",
        consent_cross_program: c.consent_cross_program ? "Yes" : "No",
        immediate_outcomes: outcomes.filter((o: any) => o.tier === "immediate" && o.achieved).length.toString(),
        intermediate_outcomes: outcomes.filter((o: any) => o.tier === "intermediate" && o.achieved).length.toString(),
        ultimate_outcomes: outcomes.filter((o: any) => o.tier === "ultimate" && o.achieved).length.toString(),
        total_achieved: outcomes.filter((o: any) => o.achieved).length.toString(),
        total_outcomes: outcomes.length.toString(),
      }
    })
    await logAudit("export", funder, { funder, rows: rows.length }, "admin", req.headers.get("x-forwarded-for") ?? "")
    return Response.json({ headers, rows, rawData, funder, label: config.label, count: rows.length })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
