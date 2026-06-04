export const runtime = "nodejs"
export const maxDuration = 60
import { NextRequest } from "next/server"
import { sql } from "@vercel/postgres"
import { initDB, seedDatabase } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    await sql`TRUNCATE clients RESTART IDENTITY CASCADE`
    await sql`TRUNCATE audit_log RESTART IDENTITY`
    await sql`TRUNCATE report_cache RESTART IDENTITY`
    await initDB()
    await seedDatabase()
    return Response.json({ success: true, message: "Database reset and re-seeded with demo data" })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
