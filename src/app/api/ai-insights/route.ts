export const runtime = "nodejs"
import { NextRequest } from "next/server"
import { generate } from "@/lib/llm"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { analytics } = body

    const system = `You are a senior program analyst for Skills for Change, a Toronto nonprofit serving immigrants and refugees across 8 programs and multiple funders. You analyze program data and produce concise, actionable insights for program managers and funders. Be specific, evidence-based, and direct. Focus on what to do, not just what the data shows.`

    const user = `Analyze this program analytics data and return EXACTLY 5 actionable insights as a JSON array. Each insight must be an object with:
- "title": short headline (max 10 words)
- "body": specific actionable recommendation with numbers (max 30 words)
- "type": "success" | "warning" | "info"
- "program": specific program name or "all"

Analytics data:
${JSON.stringify(analytics, null, 2)}

Return only valid JSON array, no other text.`

    const raw = await generate(system, user)

    // Try to parse JSON from the response
    let insights = []
    try {
      const jsonMatch = raw.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0])
      }
    } catch {
      insights = []
    }

    if (!insights.length) {
      return Response.json({ insights: [], fallback: true })
    }

    return Response.json({ insights, fallback: false })
  } catch (err: any) {
    return Response.json({ insights: [], fallback: true, error: err.message })
  }
}
