"use client"
import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { Copy, CheckCircle } from "lucide-react"

const DIAGRAMS = [
  {
    title: "Database Schema (ERD)",
    description: "Five tables with referential integrity. clients and enrolments are the core entities; outcomes, audit_log, and report_cache hang off them.",
    code: `erDiagram
    clients {
        uuid id PK
        string full_name
        string primary_language
        string immigration_stream
        timestamp created_at
    }
    enrolments {
        uuid id PK
        uuid client_id FK
        string program
        string funder
        boolean consent_cross_program
        timestamp enrolled_at
    }
    outcomes {
        uuid id PK
        uuid enrolment_id FK
        string tier
        string label
        boolean achieved
        timestamp recorded_at
    }
    audit_log {
        uuid id PK
        string action
        string entity
        jsonb detail
        string user_role
        string source_ip
        timestamp at
    }
    report_cache {
        uuid id PK
        string funder
        string period
        text narrative
        timestamp created_at
    }
    clients ||--o{ enrolments : "enrolled in"
    enrolments ||--o{ outcomes : "tracks"`,
  },
  {
    title: "System Context",
    description: "OneView sits between intake sources (Microsoft Forms, Salesforce, direct UI) and funder reporting systems. All data paths converge on one Postgres database.",
    code: `graph TB
    subgraph intake [Intake Sources]
        MF[Microsoft Forms]
        SF[Salesforce CRM]
        UI[Direct Intake UI]
    end
    subgraph core [OneView]
        API[Next.js API Routes]
        DB[(Postgres Database)]
        LLM[LLM Engine]
    end
    subgraph funders [Funder Systems]
        IC[iCARE - IRCC]
        EO[EOIS-CaMS - Employment Ontario]
        UW[United Way Portal]
        CT[City of Toronto]
    end
    MF -->|Power Automate webhook| API
    SF -->|Outbound Message| API
    UI -->|Direct submission| API
    API <--> DB
    API --> LLM
    API -->|CSV export| IC
    API -->|CSV export| EO
    API -->|CSV export| UW
    API -->|CSV export| CT`,
  },
  {
    title: "Data Flow",
    description: "From intake to funder report: client data enters once, SQL aggregates it, the LLM writes narrative around verified figures only.",
    code: `flowchart LR
    A[Client Intake] --> B[POST /api/clients]
    B --> C[(clients)]
    B --> D[(enrolments)]
    D --> E[(outcomes\nseeded at intake)]
    C & D & E --> F[GET /api/clients\nSQL aggregation]
    F --> G[Dashboard metrics]
    F --> H[POST /api/export]
    H --> I[Funder CSV\nper spec]
    F --> J[POST /api/draft-report]
    J --> K[SQL metrics\nas JSON]
    K --> L[LLM narrative\ngrounded in data]
    L --> M[(report_cache)]
    I -->|Staff uploads| N[Funder portal]`,
  },
  {
    title: "RBAC Permissions",
    description: "Four roles with explicit access boundaries. AI Agent uses a Bearer token for API-only access to export and query endpoints.",
    code: `graph LR
    subgraph roles [Roles]
        AD[Admin]
        CW[Caseworker]
        VI[Viewer]
        AG[AI Agent]
    end
    subgraph pages [Features]
        DA[Dashboard]
        IN[Intake]
        EX[Export]
        AI[AI Reports]
        HE[Help]
    end
    AD -->|full access| DA & IN & EX & AI & HE
    CW -->|read + create| DA
    CW -->|create clients| IN
    CW -->|Q and A only| AI
    CW -->|read| HE
    VI -->|read only| DA & HE
    AG -->|Bearer token| EX & AI`,
  },
  {
    title: "Privacy Architecture",
    description: "Consent and compliance enforced structurally. The PHI Wall is a database constraint — not a policy document.",
    code: `flowchart TD
    A[Data request] --> B{Program?}
    B -->|mental_health| C[PHI Wall\nAlways excluded\nPHIPA enforced]
    B -->|settlement / language| D[Federal Privacy Act\nPurpose limitation]
    B -->|employment / trades| E[FIPPA Ontario\nCollection limitation]
    B -->|youth| F[CYFSA Part X\nEnhanced minor protections]
    D & E & F --> G{Cross-program\nconsent on record?}
    G -->|No| H[Program-scoped\ndata only]
    G -->|Yes| I[Cross-program view\nexcluding mental_health]
    C --> J[Siloed permanently\nnever aggregated]`,
  },
]

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] rounded transition-colors">
      {copied ? <CheckCircle size={12} className="text-emerald-400" /> : <Copy size={12} />}
      {copied ? "Copied" : "Copy source"}
    </button>
  )
}

function MermaidDiagram({ code, id }: { code: string; id: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [error, setError] = useState(false)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  useEffect(() => {
    let cancelled = false
    async function render() {
      try {
        const mermaid = (await import("mermaid")).default
        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? "dark" : "default",
          themeVariables: isDark ? {
            background: "transparent",
            primaryColor: "#10b981",
            primaryTextColor: "#e2e8f0",
            primaryBorderColor: "#10b981",
            lineColor: "#475569",
            secondaryColor: "#1e293b",
            tertiaryColor: "#0f172a",
            edgeLabelBackground: "#0f172a",
            clusterBkg: "#0f172a",
            clusterBorder: "#334155",
            titleColor: "#e2e8f0",
            nodeTextColor: "#e2e8f0",
            fontFamily: "Inter, sans-serif",
          } : {
            background: "transparent",
            primaryColor: "#10b981",
            primaryTextColor: "#1e293b",
            primaryBorderColor: "#10b981",
            lineColor: "#94a3b8",
            fontFamily: "Inter, sans-serif",
          },
        })
        const { svg } = await mermaid.render(`mermaid-${id}`, code)
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg
        }
      } catch {
        if (!cancelled) setError(true)
      }
    }
    render()
    return () => { cancelled = true }
  }, [code, id, isDark])

  if (error) return <p className="text-slate-500 text-xs p-4">Diagram rendering unavailable in this environment.</p>
  return <div ref={ref} className="w-full overflow-x-auto" />
}

export default function DiagramsTab() {
  return (
    <div className="space-y-8">
      <p className="text-slate-500 dark:text-slate-500 text-sm">Engineering diagrams in Mermaid format. Each diagram is AI agent readable — copy the source for use in prompts, CI pipelines, or documentation tools.</p>
      {DIAGRAMS.map((d, i) => (
        <div key={i} className="glass rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-white/[0.06] flex items-start justify-between gap-4">
            <div>
              <h3 className="font-sora text-base text-slate-900 dark:text-white">{d.title}</h3>
              <p className="text-slate-500 text-xs mt-0.5">{d.description}</p>
            </div>
            <CopyButton code={d.code} />
          </div>
          <div className="p-5 bg-slate-50 dark:bg-[#050510]">
            <MermaidDiagram code={d.code} id={`d${i}`} />
          </div>
        </div>
      ))}
    </div>
  )
}
