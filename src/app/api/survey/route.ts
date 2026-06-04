export const runtime = "nodejs"
import { NextRequest } from "next/server"
import { createSurvey, logAudit } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { clientId, enrolmentId, satisfaction, wouldRecommend, barriers, successStory, role } = body
    if (!clientId || !enrolmentId) return Response.json({ error: "clientId and enrolmentId required" }, { status: 400 })
    await createSurvey({ clientId, enrolmentId, satisfaction: satisfaction ?? null, wouldRecommend: wouldRecommend ?? false, barriers, successStory })
    await logAudit("submit_survey", "survey", { clientId, satisfaction, wouldRecommend }, role ?? "caseworker", req.headers.get("x-forwarded-for") ?? "")
    return Response.json({ ok: true }, { status: 201 })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
