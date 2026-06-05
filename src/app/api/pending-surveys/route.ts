export const runtime = "nodejs"
import { NextRequest } from "next/server"
import { initDB, getPendingSurveys } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    await initDB()
    const pending = await getPendingSurveys()
    return Response.json({ pending, count: pending.length })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
