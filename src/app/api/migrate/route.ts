export const runtime = "nodejs"
import { initDB } from "@/lib/db"

export async function GET() {
  try {
    await initDB()
    return Response.json({ migrated: true, tables: ["clients", "enrolments", "outcomes", "audit_log", "report_cache"] })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
