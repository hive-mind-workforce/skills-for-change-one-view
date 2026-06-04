export const runtime = "nodejs"
import { NextRequest } from "next/server"
import { initDB, getClients, createClient, logAudit } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    await initDB()
    const data = await getClients()
    return Response.json(data)
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { full_name, program, primary_language = "", immigration_stream = "", funder = "", consent_cross_program = false } = body
    if (!full_name || !program) {
      return Response.json({ error: "full_name and program are required" }, { status: 400 })
    }
    const programFunderMap: Record<string, string> = {
      settlement: "ircc", language: "ircc", employment: "eo", trades: "eo",
      mental_health: "uw", youth: "uw", mentoring: "city", women: "city",
    }
    const resolvedFunder = funder || programFunderMap[program] || "ircc"
    const result = await createClient({ full_name, primary_language, immigration_stream, program, funder: resolvedFunder, consent_cross_program })
    await logAudit("create_client", "client", { full_name, program, funder: resolvedFunder }, "admin", req.headers.get("x-forwarded-for") ?? "")
    return Response.json(result, { status: 201 })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
