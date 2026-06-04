export const runtime = "nodejs"

export async function GET() {
  return Response.json({ provider: process.env.LLM_PROVIDER ?? "gemini" })
}
