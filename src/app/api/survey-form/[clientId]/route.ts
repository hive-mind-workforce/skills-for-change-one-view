export const runtime = "nodejs"
import { NextRequest } from "next/server"
import { initDB, getClientSurvey } from "@/lib/db"
import { sql } from "@vercel/postgres"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params
    await initDB()
    const clientRes = await sql`
      SELECT c.id, c.full_name, e.id as enrolment_id, e.program
      FROM clients c
      JOIN enrolments e ON e.client_id = c.id
      WHERE c.id = ${clientId}
      ORDER BY e.enrolled_at DESC LIMIT 1`
    const row = clientRes.rows[0]
    if (!row) return Response.json({ error: "Not found" }, { status: 404 })
    const existing = await getClientSurvey(clientId)
    return Response.json({
      client_name: row.full_name,
      enrolment_id: row.enrolment_id,
      program: row.program,
      already_submitted: !!existing,
    })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
