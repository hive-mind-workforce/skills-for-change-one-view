export interface FunderConfig {
  label: string
  programs: string[]
  color: string
  csvHeaders: string[]
  mapRow: (client: any, enrolment: any, outcomes: any[]) => Record<string, string>
}

export const PROGRAMS = ["settlement","employment","language","mental_health","trades","mentoring","youth","women"]

export const PROGRAM_TO_FUNDER: Record<string, string> = {
  settlement:"ircc", language:"ircc", employment:"eo", trades:"eo",
  mental_health:"uw", youth:"uw", mentoring:"city", women:"city"
}

export const FUNDERS: Record<string, FunderConfig> = {
  ircc: {
    label: "Immigration, Refugees and Citizenship Canada",
    programs: ["settlement","language"],
    color: "#10b981",
    csvHeaders: ["Client ID","Full Name","Primary Language","Immigration Stream","Program","Enrolled Date","Immediate Outcomes","Intermediate Outcomes","Ultimate Outcomes"],
    mapRow: (c, e, o) => ({
      "Client ID": c.id?.substring(0,8) ?? "",
      "Full Name": c.full_name ?? "",
      "Primary Language": c.primary_language ?? "",
      "Immigration Stream": c.immigration_stream ?? "",
      "Program": e.program ?? "",
      "Enrolled Date": e.enrolled_at ? new Date(e.enrolled_at).toISOString().split("T")[0] : "",
      "Immediate Outcomes": o.filter((x:any) => x.tier==="immediate" && x.achieved).length.toString(),
      "Intermediate Outcomes": o.filter((x:any) => x.tier==="intermediate" && x.achieved).length.toString(),
      "Ultimate Outcomes": o.filter((x:any) => x.tier==="ultimate" && x.achieved).length.toString(),
    }),
  },
  eo: {
    label: "Employment Ontario",
    programs: ["employment","trades"],
    color: "#6366f1",
    csvHeaders: ["Participant ID","Participant Name","Language Background","Immigration Stream","Program Type","Start Date","Resume Updated","Interviews Completed","Employment Secured"],
    mapRow: (c, e, o) => ({
      "Participant ID": c.id?.substring(0,8) ?? "",
      "Participant Name": c.full_name ?? "",
      "Language Background": c.primary_language ?? "",
      "Immigration Stream": c.immigration_stream ?? "",
      "Program Type": e.program ?? "",
      "Start Date": e.enrolled_at ? new Date(e.enrolled_at).toISOString().split("T")[0] : "",
      "Resume Updated": o.find((x:any) => x.label?.includes("Resume") && x.achieved) ? "Yes" : "No",
      "Interviews Completed": o.find((x:any) => x.label?.includes("interview") && x.achieved) ? "Yes" : "No",
      "Employment Secured": o.find((x:any) => x.label?.includes("Employment secured") && x.achieved) ? "Yes" : "No",
    }),
  },
  uw: {
    label: "United Way",
    programs: ["mental_health","youth"],
    color: "#f59e0b",
    csvHeaders: ["Case ID","Client Name","Primary Language","Program","Enrolment Date","Sessions Completed","Outcomes Achieved","Support Type"],
    mapRow: (c, e, o) => ({
      "Case ID": c.id?.substring(0,8) ?? "",
      "Client Name": c.full_name ?? "",
      "Primary Language": c.primary_language ?? "",
      "Program": e.program ?? "",
      "Enrolment Date": e.enrolled_at ? new Date(e.enrolled_at).toISOString().split("T")[0] : "",
      "Sessions Completed": o.filter((x:any) => x.achieved).length.toString(),
      "Outcomes Achieved": o.filter((x:any) => x.achieved).length.toString() + "/" + o.length.toString(),
      "Support Type": e.program === "mental_health" ? "Mental Health Support" : "Youth Program",
    }),
  },
  city: {
    label: "City of Toronto",
    programs: ["mentoring","women"],
    color: "#8b5cf6",
    csvHeaders: ["File Number","Client Name","Primary Language","Program","Start Date","Mentor Matched","Goals Achieved","Program Status"],
    mapRow: (c, e, o) => ({
      "File Number": c.id?.substring(0,8) ?? "",
      "Client Name": c.full_name ?? "",
      "Primary Language": c.primary_language ?? "",
      "Program": e.program ?? "",
      "Start Date": e.enrolled_at ? new Date(e.enrolled_at).toISOString().split("T")[0] : "",
      "Mentor Matched": o.find((x:any) => x.label?.includes("Mentor") && x.achieved) ? "Yes" : "No",
      "Goals Achieved": o.filter((x:any) => x.achieved).length.toString(),
      "Program Status": "Active",
    }),
  },
}

export function generateCSV(funder: string, clients: any[]): { headers: string[]; rows: string[][] } {
  const config = FUNDERS[funder]
  if (!config) return { headers: [], rows: [] }
  const filtered = clients.filter(c => config.programs.includes(c.program))
  const rows = filtered.map(c => {
    const row = config.mapRow(c, c, [])
    return config.csvHeaders.map(h => row[h] ?? "")
  })
  return { headers: config.csvHeaders, rows }
}

export function programToFunder(program: string): string {
  return PROGRAM_TO_FUNDER[program] ?? "ircc"
}
