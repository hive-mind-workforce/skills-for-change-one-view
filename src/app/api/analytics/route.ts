export const runtime = "nodejs"
import { NextRequest } from "next/server"
import { initDB, getAnalyticsData, getMonthlyIntakeTrend } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    await initDB()
    const [data, monthlyTrend] = await Promise.all([getAnalyticsData(), getMonthlyIntakeTrend()])
    return Response.json({ ...data, monthlyTrend })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
