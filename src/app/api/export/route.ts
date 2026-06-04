export const runtime = "nodejs"
import { NextRequest } from "next/server"
import { getClients } from "@/lib/db"
import { generateCSV, FUNDERS } from "@/lib/funders"

export async function POST(req: NextRequest) {
  try {
    const { funder } = await req.json()
    if (!funder || !FUNDERS[funder]) {
      return Response.json({ error: "Invalid funder" }, { status: 400 })
    }
    const { clients } = await getClients()
    const { headers, rows } = generateCSV(funder, clients)
    return Response.json({ headers, rows, funder, label: FUNDERS[funder].label, count: rows.length })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
