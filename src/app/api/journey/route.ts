export const runtime = "nodejs"
import { NextRequest } from "next/server"
import { initDB, getClientJourney } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    await initDB()
    const clientId = new URL(req.url).searchParams.get("clientId")
    if (!clientId) return Response.json({ error: "clientId required" }, { status: 400 })
    const data = await getClientJourney(clientId)
    if (!data) return Response.json({ error: "Client not found" }, { status: 404 })
    return Response.json(data)
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
