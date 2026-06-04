describe("llm", () => {
  beforeEach(() => {
    delete process.env.LLM_API_KEY
    delete process.env.LLM_PROVIDER
    jest.resetModules()
  })

  it("generate returns fallback when no API key", async () => {
    const { generate } = await import("@/lib/llm")
    const result = await generate("system", "user")
    expect(result).toContain("Configure LLM_API_KEY")
  })

  it("generateReport returns fallback when no API key", async () => {
    const { generateReport } = await import("@/lib/llm")
    const result = await generateReport("ircc", "Q1 2026", {})
    expect(result).toContain("Configure LLM_API_KEY")
  })

  it("answerQuestion returns fallback when no API key", async () => {
    const { answerQuestion } = await import("@/lib/llm")
    const result = await answerQuestion("How many clients?", {})
    expect(result).toContain("Configure LLM_API_KEY")
  })
})
