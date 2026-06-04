export const runtime = "nodejs"
import { NextRequest } from "next/server"
import { initDB, getAuditLog, getAuditLogCount } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    await initDB()
    const url = new URL(req.url)
    const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50"), 100)
    const offset = parseInt(url.searchParams.get("offset") ?? "0")
    const [rows, total] = await Promise.all([getAuditLog(limit, offset), getAuditLogCount()])
    return Response.json({ rows, total, limit, offset })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
