export const runtime = "nodejs"
import { NextRequest } from "next/server"
import { initDB, getAnalyticsData } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    await initDB()
    const data = await getAnalyticsData()
    return Response.json(data)
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
