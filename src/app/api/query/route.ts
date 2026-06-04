export const runtime = "nodejs"
import { NextRequest } from "next/server"
import { getClients, logAudit } from "@/lib/db"
import { answerQuestion } from "@/lib/llm"

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json()
    if (!question) return Response.json({ error: "question is required" }, { status: 400 })
    const { metrics } = await getClients()
    const answer = await answerQuestion(question, metrics)
    await logAudit("ai_query", "query", { question }, "caseworker", req.headers.get("x-forwarded-for") ?? "")
    return Response.json({ answer, metrics })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
