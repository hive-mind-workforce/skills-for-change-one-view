export const runtime = "nodejs"
import { NextRequest } from "next/server"
import { sql } from "@vercel/postgres"
import { logAudit } from "@/lib/db"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { consent_cross_program } = body
    if (consent_cross_program !== undefined) {
      await sql`UPDATE enrolments SET consent_cross_program = ${consent_cross_program} WHERE id = ${id}`
    }
    await logAudit("update_enrolment", "enrolment", { id, consent_cross_program }, body.role ?? "admin", req.headers.get("x-forwarded-for") ?? "")
    return Response.json({ ok: true })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
