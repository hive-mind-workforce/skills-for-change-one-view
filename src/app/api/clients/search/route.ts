export const runtime = "nodejs"
import { NextRequest } from "next/server"
import { initDB, searchClients } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    await initDB()
    const q = new URL(req.url).searchParams.get("q") ?? ""
    if (q.length < 2) return Response.json([])
    const clients = await searchClients(q)
    return Response.json(clients)
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
