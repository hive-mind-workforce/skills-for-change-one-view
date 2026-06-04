export const runtime = "nodejs"
import { NextRequest } from "next/server"
import { updateOutcome, logAudit } from "@/lib/db"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { achieved, role } = await req.json()
    if (typeof achieved !== "boolean") return Response.json({ error: "achieved (boolean) required" }, { status: 400 })
    await updateOutcome(id, achieved)
    await logAudit("update_outcome", "outcome", { id, achieved }, role ?? "caseworker", req.headers.get("x-forwarded-for") ?? "")
    return Response.json({ ok: true })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
