export const runtime = "nodejs"
import { NextRequest } from "next/server"
import { addEnrolment, logAudit } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const { client_id, program, consent_cross_program = false } = await req.json()
    if (!client_id || !program) {
      return Response.json({ error: "client_id and program are required" }, { status: 400 })
    }
    const result = await addEnrolment(client_id, program, consent_cross_program)
    await logAudit("add_enrolment", "enrolment", { client_id, program }, "admin", req.headers.get("x-forwarded-for") ?? "")
    return Response.json(result, { status: 201 })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
