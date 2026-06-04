import OpenAI from "openai"
import Anthropic from "@anthropic-ai/sdk"

const PROVIDER = process.env.LLM_PROVIDER ?? "gemini"
const KEY = process.env.LLM_API_KEY ?? ""

const CONFIGS: Record<string, { baseURL?: string; model: string }> = {
  gemini: { baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/", model: "gemini-2.0-flash-exp" },
  groq: { baseURL: "https://api.groq.com/openai/v1", model: "llama-3.3-70b-versatile" },
  claude: { model: "claude-sonnet-4-6" },
}

export async function generate(system: string, user: string): Promise<string> {
  if (!KEY) return "Configure LLM_API_KEY environment variable to enable AI features."
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

export async function generateReport(funder: string, period: string, metrics: object): Promise<string> {
  const system = "You are a grant reporting assistant for Skills for Change, a Toronto nonprofit serving immigrants and refugees. Write professional, data-driven narrative paragraphs for funder reports. Use the exact numbers provided. Be specific, compelling, and evidence-based. No generic filler."
  const user = `Write a 2-3 paragraph funding narrative for ${funder.toUpperCase()} for the period ${period}. Base every claim on these metrics:\n${JSON.stringify(metrics, null, 2)}\nHighlight outcome achievements, client diversity, and program impact.`
  return generate(system, user)
}

export async function answerQuestion(question: string, metrics: object): Promise<string> {
  const system = "You are a program analyst for Skills for Change. Answer questions about program data using only the provided metrics. Be concise and specific. If the answer is not in the metrics, say so."
  const user = `Question: ${question}\n\nProgram metrics:\n${JSON.stringify(metrics, null, 2)}`
  return generate(system, user)
}
