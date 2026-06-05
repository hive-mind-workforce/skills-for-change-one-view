export const runtime = "nodejs"
import { NextRequest } from "next/server"
import { initDB, getClientNotes, addClientNote, logAudit } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const clientId = req.nextUrl.searchParams.get("clientId")
    if (!clientId) return Response.json({ error: "clientId required" }, { status: 400 })
    await initDB()
    const notes = await getClientNotes(clientId)
    return Response.json(notes)
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { clientId, content, noteType } = body
    const author = body.author ?? body.authorRole ?? "caseworker"
    if (!clientId || !content) {
      return Response.json({ error: "clientId and content required" }, { status: 400 })
    }
    await initDB()
    const note = await addClientNote(clientId, author, content, noteType)
    await logAudit("add_note", "case_notes", { clientId, author, noteType: noteType ?? "general" }, "caseworker", req.headers.get("x-forwarded-for") ?? "")
    return Response.json(note, { status: 201 })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
