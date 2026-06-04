export const runtime = "nodejs"
import { NextRequest } from "next/server"
import { initDB, getPipelineClients } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    await initDB()
    const clients = await getPipelineClients(300)
    return Response.json({ clients })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
