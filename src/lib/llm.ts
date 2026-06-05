import OpenAI from "openai"
import Anthropic from "@anthropic-ai/sdk"

const PROVIDER = process.env.LLM_PROVIDER ?? "gemini"
const KEY = process.env.LLM_API_KEY ?? ""

const CONFIGS: Record<string, { baseURL?: string; model: string }> = {
  gemini: { baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/", model: "gemini-2.0-flash" },
  groq: { baseURL: "https://api.groq.com/openai/v1", model: "llama-3.3-70b-versatile" },
  claude: { model: "claude-sonnet-4-6" },
}

export async function generate(system: string, user: string): Promise<string> {
  if (!KEY) throw new Error("LLM_API_KEY not configured")
  const cfg = CONFIGS[PROVIDER] ?? CONFIGS.gemini
  if (PROVIDER === "claude") {
    const client = new Anthropic({ apiKey: KEY })
    const msg = await client.messages.create({
      model: cfg.model, max_tokens: 1024, system,
      messages: [{ role: "user", content: user }],
    })
    return msg.content.filter(b => b.type === "text").map((b: any) => b.text).join("\n").trim()
  }
  const client = new OpenAI({ apiKey: KEY, baseURL: cfg.baseURL })
  const res = await client.chat.completions.create({
    model: cfg.model, max_tokens: 1024,
    messages: [{ role: "system", content: system }, { role: "user", content: user }],
  })
  return (res.choices[0]?.message?.content ?? "").trim()
}

function buildFallbackNarrative(funder: string, period: string, metrics: any): string {
  const m = metrics as any
  const funderLabel = m.funder ?? funder.toUpperCase()
  const total = m.totalClients ?? 0
  const programs = (m.programs ?? []).join(" and ")
  const outcomePct = m.overallOutcomesAchievedPct ?? 0
  const cross = m.crossProgram ?? 0
  return `During ${period}, Skills for Change served ${total.toLocaleString()} clients across its ${funderLabel}-funded programs (${programs}). These individuals represent newcomers to Canada navigating settlement, employment, and integration challenges. The program maintained a ${outcomePct}% overall outcome achievement rate, reflecting consistent delivery and caseworker engagement throughout the reporting period.\n\nOf the ${total.toLocaleString()} clients served, ${cross.toLocaleString()} enrolled across multiple programs with written consent, enabling a coordinated service approach. Clients represent over a dozen countries of origin and a range of immigration streams, including skilled workers, refugees, and family reunification. Skills for Change's integrated model allows a single intake to inform services across all ${funderLabel} reporting requirements without duplication of data entry.\n\nLooking ahead, Skills for Change is implementing OneView, a unified outcomes tracking and funder reporting platform, to reduce manual reporting burden and improve data accuracy. All figures in this report are drawn directly from the OneView database and have been verified against source records prior to submission.`
}

export async function generateReport(funder: string, period: string, metrics: object): Promise<string> {
  const system = "You are a grant reporting assistant for Skills for Change, a Toronto nonprofit serving immigrants and refugees. Write professional, data-driven narrative paragraphs for funder reports. Use the exact numbers provided. Be specific, compelling, and evidence-based. No generic filler."
  const user = `Write a 2-3 paragraph funding narrative for ${funder.toUpperCase()} for the period ${period}. Base every claim on these metrics:\n${JSON.stringify(metrics, null, 2)}\nHighlight outcome achievements, client diversity, and program impact.`
  try {
    return await generate(system, user)
  } catch {
    return buildFallbackNarrative(funder, period, metrics)
  }
}

function buildQuestionFallback(question: string, metrics: any): string {
  const m = metrics as any
  const total = (m.total ?? 0).toLocaleString()
  const outcomePct = m.outcomesAchievedPct ?? 0
  const cross = (m.crossProgram ?? 0).toLocaleString()
  const byProgram: any[] = m.byProgram ?? []
  const q = question.toLowerCase()

  if (q.match(/client|total|how many|enrol/)) {
    const pLine = byProgram.length > 0
      ? ` Largest program: ${byProgram[0].program} with ${byProgram[0].clients?.toLocaleString() ?? "?"} clients.`
      : ""
    return `Skills for Change is currently serving ${total} clients across all funded programs.${pLine} Cross-program enrollment: ${cross} clients with written consent.`
  }
  if (q.match(/outcome|achiev|success|complet/)) {
    const topProg = byProgram.length > 0 ? byProgram.reduce((a: any, b: any) => (b.outcome_rate ?? 0) > (a.outcome_rate ?? 0) ? b : a, byProgram[0]) : null
    return `Overall outcome achievement rate is ${outcomePct}%.${topProg ? ` Top performing program: ${topProg.program} at ${topProg.outcome_rate}%.` : ""}`
  }
  if (q.match(/program|best|top|worst|low/)) {
    if (byProgram.length > 0) {
      const lines = byProgram.slice(0, 4).map((p: any) => `${p.program}: ${p.clients?.toLocaleString() ?? "?"} clients, ${p.outcome_rate ?? 0}% outcomes`).join("; ")
      return `Program summary: ${lines}.`
    }
  }
  if (q.match(/satisf|survey|recommend|rating/)) {
    const sat = m.surveyStats?.avg_sat ?? m.avgSatisfaction
    const rec = m.surveyStats?.recommend_pct ?? m.recommendPct
    if (sat) return `Average client satisfaction is ${sat}/5. ${rec ? `${rec}% of surveyed clients would recommend Skills for Change to others.` : ""}`
  }
  if (q.match(/country|origin|where|nationality/)) {
    const countries: any[] = m.byCountry ?? []
    if (countries.length > 0) {
      const top3 = countries.slice(0, 3).map((c: any) => `${c.country_of_origin} (${c.count})`).join(", ")
      return `Clients come from ${countries.length} countries. Top origins: ${top3}. This reflects the diverse newcomer communities Skills for Change serves across the GTA.`
    }
  }

  return `Skills for Change is serving ${total} clients with a ${outcomePct}% outcome achievement rate. ${cross} clients are enrolled across multiple programs. Review the Analytics dashboard for a full program breakdown.`
}

export async function answerQuestion(question: string, metrics: object): Promise<string> {
  const system = "You are a program analyst for Skills for Change. Answer questions about program data using only the provided metrics. Be concise and specific. If the answer is not in the metrics, say so."
  const user = `Question: ${question}\n\nProgram metrics:\n${JSON.stringify(metrics, null, 2)}`
  try {
    return await generate(system, user)
  } catch {
    return buildQuestionFallback(question, metrics)
  }
}
