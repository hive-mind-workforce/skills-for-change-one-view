export const runtime = "nodejs"
import { sql } from "@vercel/postgres"

export async function GET() {
  try {
    await sql`SELECT 1`
    return Response.json({ status: "ok", db: true, version: "1.0.0" })
  } catch {
    return Response.json({ status: "error", db: false }, { status: 503 })
  }
}
