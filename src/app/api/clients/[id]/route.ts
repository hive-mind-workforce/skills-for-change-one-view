export const runtime = "nodejs"
import { NextRequest } from "next/server"
import { updateClient, deleteClient, logAudit } from "@/lib/db"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const allowed = ["full_name", "primary_language", "immigration_stream", "stage", "country_of_origin", "age_group", "gender"]
    const data: Record<string, any> = {}
    for (const key of allowed) {
      if (body[key] !== undefined) data[key] = body[key]
    }
    await updateClient(id, data)
    await logAudit("update_client", "client", { id, ...data }, body.role ?? "admin", req.headers.get("x-forwarded-for") ?? "")
    return Response.json({ ok: true })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const role = new URL(req.url).searchParams.get("role") ?? "admin"
    if (role !== "admin") return Response.json({ error: "Admin only" }, { status: 403 })
    await deleteClient(id)
    await logAudit("delete_client", "client", { id }, "admin", req.headers.get("x-forwarded-for") ?? "")
    return Response.json({ ok: true })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
