import { FUNDERS, generateCSV, programToFunder } from "@/lib/funders"

describe("funders", () => {
  it("has all 4 funders", () => {
    expect(FUNDERS).toHaveProperty("ircc")
    expect(FUNDERS).toHaveProperty("eo")
    expect(FUNDERS).toHaveProperty("uw")
    expect(FUNDERS).toHaveProperty("city")
  })

  const funderKeys = ["ircc","eo","uw","city"] as const
  funderKeys.forEach(key => {
    describe(`${key} config`, () => {
      it("has required fields", () => {
        const f = FUNDERS[key]
        expect(typeof f.label).toBe("string")
        expect(Array.isArray(f.programs)).toBe(true)
        expect(f.programs.length).toBeGreaterThan(0)
        expect(typeof f.color).toBe("string")
        expect(Array.isArray(f.csvHeaders)).toBe(true)
        expect(f.csvHeaders.length).toBeGreaterThan(0)
        expect(typeof f.mapRow).toBe("function")
      })
      it("mapRow returns object with all header keys", () => {
        const f = FUNDERS[key]
        const mockClient = { id:"test-uuid-1234", full_name:"Test Client", primary_language:"English", immigration_stream:"Refugee" }
        const mockEnrolment = { program:f.programs[0], funder:key, enrolled_at:"2026-01-01" }
        const row = f.mapRow(mockClient, mockEnrolment, [])
        f.csvHeaders.forEach(h => expect(row).toHaveProperty(h))
      })
    })
  })

  describe("generateCSV", () => {
    it("returns headers and rows", () => {
      const { headers, rows } = generateCSV("ircc", [])
      expect(Array.isArray(headers)).toBe(true)
      expect(Array.isArray(rows)).toBe(true)
    })
    it("filters to funder programs", () => {
      const clients = [
        { id:"1", full_name:"Test", primary_language:"English", immigration_stream:"Refugee", program:"settlement", funder:"ircc" },
        { id:"2", full_name:"Test2", primary_language:"Arabic", immigration_stream:"Refugee", program:"employment", funder:"eo" },
      ]
      const { rows } = generateCSV("ircc", clients)
      expect(rows.length).toBe(1)
    })
  })

  describe("programToFunder", () => {
    it("maps settlement to ircc", () => expect(programToFunder("settlement")).toBe("ircc"))
    it("maps employment to eo", () => expect(programToFunder("employment")).toBe("eo"))
    it("maps mental_health to uw", () => expect(programToFunder("mental_health")).toBe("uw"))
    it("maps women to city", () => expect(programToFunder("women")).toBe("city"))
  })
})
