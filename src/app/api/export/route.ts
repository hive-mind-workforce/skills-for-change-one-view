export const runtime = "nodejs"
import { NextRequest } from "next/server"
import { getClientsForExport, logAudit } from "@/lib/db"
import { generateCSVFromExport, FUNDERS } from "@/lib/funders"

export async function POST(req: NextRequest) {
  try {
    const { funder } = await req.json()
    const config = FUNDERS[funder]
    if (!funder || !config) {
      return Response.json({ error: "Invalid funder" }, { status: 400 })
    }
    const clients = await getClientsForExport(config.programs)
    const { headers, rows } = generateCSVFromExport(funder, clients)
    await logAudit("export", funder, { funder, rows: rows.length }, "admin", req.headers.get("x-forwarded-for") ?? "")
    return Response.json({ headers, rows, funder, label: config.label, count: rows.length })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
