export const runtime = "nodejs"
import { NextRequest } from "next/server"
import { initDB, getAnalyticsData, getMonthlyIntakeTrend } from "@/lib/db"

function intervalToSince(interval: string | null): string | null {
  if (!interval || interval === "all") return null
  const now = new Date()
  const map: Record<string, number> = {
    "1d": 1, "7d": 7, "30d": 30, "90d": 90, "180d": 180, "365d": 365,
  }
  const days = map[interval]
  if (!days) return null
  const d = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  return d.toISOString()
}

export async function GET(req: NextRequest) {
  try {
    await initDB()
    const interval = req.nextUrl.searchParams.get("interval") ?? "all"
    const since = intervalToSince(interval)
    const [data, monthlyTrend] = await Promise.all([getAnalyticsData(since), getMonthlyIntakeTrend()])
    return Response.json({ ...data, monthlyTrend, interval, since })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
