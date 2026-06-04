import { formatDate, formatNumber, programLabel, funderLabel, programColor, getRole } from "@/lib/helpers"

describe("helpers", () => {
  describe("formatDate", () => {
    it("formats a date string", () => {
      const result = formatDate("2026-06-04")
      expect(result).toBeTruthy()
      expect(typeof result).toBe("string")
    })
    it("formats a Date object", () => {
      const result = formatDate(new Date("2026-01-15"))
      expect(result).toContain("Jan")
    })
  })

  describe("formatNumber", () => {
    it("formats zero", () => expect(formatNumber(0)).toBe("0"))
    it("formats thousands", () => expect(formatNumber(1000)).toMatch(/1[,.]?000/))
    it("formats large number", () => {
      const result = formatNumber(16247)
      expect(result).toContain("16")
    })
  })

  describe("programLabel", () => {
    const programs = ["settlement","employment","language","mental_health","trades","mentoring","youth","women"]
    programs.forEach(p => {
      it(`returns label for ${p}`, () => {
        const label = programLabel(p)
        expect(label.length).toBeGreaterThan(0)
        expect(typeof label).toBe("string")
      })
    })
  })

  describe("funderLabel", () => {
    it("returns IRCC for ircc", () => expect(funderLabel("ircc")).toBe("IRCC"))
    it("returns Employment Ontario for eo", () => expect(funderLabel("eo")).toBe("Employment Ontario"))
    it("returns United Way for uw", () => expect(funderLabel("uw")).toBe("United Way"))
    it("returns City of Toronto for city", () => expect(funderLabel("city")).toBe("City of Toronto"))
  })

  describe("programColor", () => {
    it("returns a hex color", () => {
      const color = programColor("settlement")
      expect(color).toMatch(/^#[0-9a-f]{6}$/i)
    })
    it("returns a color for all programs", () => {
      ["settlement","employment","language","mental_health","trades","mentoring","youth","women"].forEach(p => {
        const c = programColor(p)
        expect(c).toMatch(/^#/)
      })
    })
  })

  describe("getRole", () => {
    it("defaults to admin", () => expect(getRole({})).toBe("admin"))
    it("reads role from params", () => expect(getRole({role:"caseworker"})).toBe("caseworker"))
    it("reads from URLSearchParams", () => {
      const params = new URLSearchParams("role=viewer")
      expect(getRole(params)).toBe("viewer")
    })
  })
})
