export const runtime = "nodejs"
import { NextRequest } from "next/server"
import { initDB, getClientSurvey } from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params
    await initDB()
    const survey = await getClientSurvey(clientId)
    return Response.json({ survey })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
