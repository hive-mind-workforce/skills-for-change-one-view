export const runtime = "nodejs"
import { getRecentClients } from "@/lib/db"

export async function GET() {
  try {
    const clients = await getRecentClients(20)
    return Response.json(clients)
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
