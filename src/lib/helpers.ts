export function formatDate(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d
  return date.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" })
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-CA")
}

const PROGRAM_LABELS: Record<string, string> = {
  settlement: "Settlement Services",
  employment: "Employment Services",
  language: "LINC Language Training",
  mental_health: "Mental Health and Wellness",
  trades: "Skilled Trades Programs",
  mentoring: "Mentoring for Change",
  youth: "Youth Programs",
  women: "Women's Programs",
}

const FUNDER_LABELS: Record<string, string> = {
  ircc: "Immigration, Refugees and Citizenship Canada",
  eo: "Employment Ontario",
  uw: "Community Foundations",
  city: "City of Toronto",
}

const PROGRAM_COLORS: Record<string, string> = {
  settlement: "#10b981",
  employment: "#6366f1",
  language: "#06b6d4",
  mental_health: "#f43f5e",
  trades: "#f59e0b",
  mentoring: "#8b5cf6",
  youth: "#3b82f6",
  women: "#ec4899",
}

export function programLabel(p: string): string {
  return PROGRAM_LABELS[p] ?? p
}

export function funderLabel(f: string): string {
  return FUNDER_LABELS[f] ?? f
}

export function programColor(p: string): string {
  return PROGRAM_COLORS[p] ?? "#94a3b8"
}

export function getRole(searchParams: Record<string, string> | URLSearchParams): string {
  if (searchParams instanceof URLSearchParams) {
    return searchParams.get("role") ?? "admin"
  }
  return searchParams["role"] ?? "admin"
}
