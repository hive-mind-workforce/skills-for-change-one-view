"use client"
import { useState, useEffect, useRef } from "react"
import { X, Copy, CheckCircle, Maximize2 } from "lucide-react"
import { useTheme } from "next-themes"

const LAYERS = [
  { id: "sources", label: "Sources", nodes: [
    { id:"ms-forms", name:"Microsoft Forms", icon:"📋", color:"#3b82f6", desc:"Microsoft Forms intake. Power Automate webhook posts data to /api/clients in real time.", steps:["Staff fill out Microsoft Form","Power Automate trigger fires on submit","HTTP POST to /api/clients with mapped fields","Client created in OneView database"], code:"POST /api/clients\n{full_name, program, funder, ...}" },
    { id:"power-automate", name:"Power Automate", icon:"⚡", color:"#0078d4", desc:"Low-code bridge from Microsoft 365 to OneView. 20 minutes to configure, zero staff training required.", steps:["HTTP connector in Power Automate","Map form fields to API schema","POST to /api/clients endpoint","Monitor via audit_log table"], code:'{"full_name": "{{Name}}",\n "program": "settlement"}' },
    { id:"salesforce", name:"Salesforce", icon:"☁️", color:"#00a1e0", desc:"Salesforce Outbound Messages or REST webhooks post client data to OneView. CRM stays as source of truth; OneView adds outcomes layer.", steps:["Salesforce Outbound Message configured","Webhook URL set to /api/clients","Field mapping in Salesforce flow","Outcomes tracked separately in OneView"], code:'Salesforce Outbound Message\nto: /api/clients' },
    { id:"manual", name:"Manual Entry", icon:"✍️", color:"#94a3b8", desc:"Direct intake via the OneView UI. Caseworkers use the /intake page for walk-in clients or offline registrations.", steps:["Caseworker opens /intake page","Fills out client form","Submits to /api/clients","Success toast confirms registration"], code:'<IntakeForm />\n→ POST /api/clients' },
  ]},
  { id: "rbac", label: "RBAC + Auth", nodes: [
    { id:"jwt", name:"JWT Middleware", icon:"🔑", color:"#f59e0b", desc:"JWT claims carry the user role. Middleware validates on every request. Demo mode uses ?role= query param for judges.", steps:["Request arrives with ?role= or Bearer token","Middleware extracts role claim","Route handler receives role context","Caseworker-scoped queries applied"], code:'getRole(searchParams)\n// returns: admin|caseworker|viewer' },
    { id:"role-check", name:"Role Check", icon:"🛡️", color:"#f59e0b", desc:"Four roles: Admin (full access), Caseworker (program-scoped), Viewer (read-only), AI Agent (API key).", steps:["Admin: all programs, export, reset","Caseworker: own program clients only","Viewer: dashboards and reports, no PII","AI Agent: /api/query and /api/export only"], code:'roles: admin|caseworker\n       viewer|ai_agent' },
  ]},
  { id: "data", label: "Data + Privacy", nodes: [
    { id:"postgres", name:"Vercel Postgres", icon:"🗄️", color:"#10b981", desc:"Neon-backed Postgres via @vercel/postgres. 5 tables: clients, enrolments, outcomes, audit_log, report_cache.", steps:["CREATE TABLE IF NOT EXISTS for all 5 tables","gen_random_uuid() for PKs","Cascading deletes for referential integrity","Auto-seed 16,247 demo clients on first load"], code:'clients → enrolments\n  → outcomes\naudit_log | report_cache' },
    { id:"phi-wall", name:"PHI Wall", icon:"🔒", color:"#f43f5e", desc:"PHIPA hard rule: mental_health records are ALWAYS siloed. Enforced at the database layer on every cross-program query. No role, consent flag, or configuration can override it.", steps:["Enforced at database layer, not application layer","Applies to every cross-program query automatically","No role or consent flag can override it","Violations are structurally impossible"], code:"Enforced at DB layer\nNo application override\nPHIPA s.29 compliant" },
    { id:"consent", name:"Consent Model", icon:"✅", color:"#10b981", desc:"Three levels: program (auto), cross-program (explicit opt-in), dashboard aggregation (implied). Stored as consent_cross_program boolean.", steps:["Program consent: automatic on enrolment","Cross-program: caseworker checkbox + verbal consent","Aggregated dashboards: no PII, always allowed","Consent tracked in enrolments table"], code:"consent_cross_program: boolean\ndefault: false" },
    { id:"audit", name:"Audit Log", icon:"📝", color:"#6366f1", desc:"Every write operation logged to audit_log table. Tracks action, entity, user role, source IP, and timestamp.", steps:["create_client logged on intake","export logged on CSV download","ai_query logged on every question","report_generate logged on AI narrative"], code:"INSERT INTO audit_log\n(action, entity, detail,\n user_role, source_ip)" },
  ]},
  { id: "ai", label: "AI + M&E", nodes: [
    { id:"llm", name:"LLM Engine", icon:"🤖", color:"#8b5cf6", desc:"Provider-agnostic LLM helper. Gemini (default, free), Claude (highest quality), Groq (fastest). Switched via LLM_PROVIDER env var.", steps:["LLM_PROVIDER env var selects provider","OpenAI SDK for Gemini and Groq (compatible API)","Anthropic SDK for Claude","Falls back gracefully if no API key"], code:"LLM_PROVIDER=gemini|claude|groq\ngenerate(system, user)" },
    { id:"anti-halluc", name:"Anti-Hallucination", icon:"🎯", color:"#10b981", desc:"SQL computes all metrics deterministically first. LLM only writes prose around the supplied numbers. No LLM is asked to recall facts.", steps:["SQL aggregates: totals, outcomes, rates","Metrics passed as JSON to LLM prompt","LLM instructed to use only provided numbers","Every figure in narrative is SQL-verified"], code:"const metrics = await getClients()\n// LLM receives metrics as JSON" },
  ]},
  { id: "mapping", label: "Mapping Engine", nodes: [
    { id:"funder-config", name:"Funder Config", icon:"⚙️", color:"#f59e0b", desc:"Each funder is a config object in lib/funders.ts. Adding a new funder means editing one config object. Zero code changes to routes or DB.", steps:["FUNDERS object in lib/funders.ts","label, programs, color, csvHeaders, mapRow","generateCSV() uses config automatically","New funder = add one object to FUNDERS"], code:"FUNDERS.ircc = {\n  programs: ['settlement'],\n  csvHeaders: [...],\n  mapRow: (c,e,o) => ({...})\n}" },
  ]},
  { id: "boundary", label: "File Boundary", nodes: [
    { id:"file-boundary", name:"File Boundary", icon:"🏛️", color:"#f43f5e", desc:"Government systems (iCARE, EOIS-CaMS) do not allow live API integration. OneView generates compliant CSV files for bulk upload. This is a compliance feature, not a limitation.", steps:["Generate CSV shaped to iCARE schema","Staff uploads CSV to iCARE portal","EOIS-CaMS: same manual upload workflow","Audit trail maintained in OneView"], code:"POST /api/export\n→ CSV shaped to funder spec\n→ staff uploads to portal" },
  ]},
  { id: "funders", label: "Funder Systems", nodes: [
    { id:"icare", name:"iCARE (IRCC)", icon:"🍁", color:"#10b981", desc:"IRCC's iCARE system receives bulk upload CSVs from OneView. Covers Settlement and Language programs.", steps:["OneView generates iCARE-format CSV","Admin downloads from /export page","Upload to iCARE bulk upload portal","Reconciliation via audit_log"], code:"ircc.csvHeaders:\n['Client ID','Full Name',\n 'Program','Enrolled Date',...]" },
    { id:"eois", name:"EOIS-CaMS (EO)", icon:"🏢", color:"#6366f1", desc:"Employment Ontario's EOIS-CaMS system. Manual upload of formatted CSV. Covers Employment and Trades programs.", steps:["OneView generates EO-format CSV","Caseworker downloads from /export","Manual upload to EOIS-CaMS","No live API available from government"], code:"eo.csvHeaders:\n['Participant ID','Name',\n 'Program Type','Start Date',...]" },
    { id:"uw-portal", name:"United Way Portal", icon:"🤝", color:"#f59e0b", desc:"United Way Greater Toronto reporting portal. Custom report format for Mental Health and Youth programs.", steps:["Generate UW-format CSV","Include session counts and outcomes","Upload to UW reporting portal","Annual and quarterly cycles"], code:"uw.csvHeaders:\n['Case ID','Client Name',\n 'Sessions','Outcomes',...]" },
    { id:"city-reports", name:"City Reports", icon:"🏙️", color:"#8b5cf6", desc:"City of Toronto Social Development reporting. Covers Mentoring and Women's programs.", steps:["Generate City-format CSV","Include goal achievement data","Submit via City reporting portal","Quarterly reporting cycle"], code:"city.csvHeaders:\n['File Number','Name',\n 'Program','Goals',...]" },
  ]},
]

const ARCH_DIAGRAMS = [
  {
    title: "Database Schema (ERD)",
    description: "Five tables with referential integrity. clients and enrolments are the core entities; outcomes, audit_log, and report_cache hang off them.",
    id: "arch-erd",
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
    id: "arch-context",
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
    id: "arch-flow",
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
    id: "arch-rbac",
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
    id: "arch-privacy",
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
        if (!cancelled && ref.current) ref.current.innerHTML = svg
      } catch { if (!cancelled) setError(true) }
    }
    render()
    return () => { cancelled = true }
  }, [code, id, isDark])

  if (error) return <p className="text-slate-500 text-xs p-4">Diagram rendering unavailable.</p>
  return <div ref={ref} className="w-full overflow-x-auto" />
}

interface Node { id:string; name:string; icon:string; color:string; desc:string; steps:string[]; code:string }

interface DiagramEntry { title: string; description: string; id: string; code: string }

export default function ArchitectureTab() {
  const [selected, setSelected] = useState<Node|null>(null)
  const [zoomed, setZoomed] = useState<DiagramEntry|null>(null)

  return (
    <div className="space-y-8">

    {zoomed && (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col animate-fade-in" onClick={() => setZoomed(null)}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]" onClick={e => e.stopPropagation()}>
          <div>
            <h3 className="font-sora text-lg text-white">{zoomed.title}</h3>
            <p className="text-slate-400 text-xs mt-0.5">{zoomed.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <CopyButton code={zoomed.code} />
            <button onClick={() => setZoomed(null)} className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/[0.08]">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6 bg-[#050510]" onClick={e => e.stopPropagation()}>
          <MermaidDiagram code={zoomed.code} id={`zoom-${zoomed.id}`} />
        </div>
      </div>
    )}

    <div className="flex gap-6 relative">
      <div className={`flex-1 space-y-3 transition-all duration-300 ${selected ? "opacity-60 md:opacity-100" : ""}`}>
        {LAYERS.map(layer => (
          <div key={layer.id}>
            <div className="text-xs text-slate-500 uppercase tracking-widest mb-1.5 px-1">{layer.label}</div>
            <div className={`flex flex-wrap gap-2 ${layer.id === "boundary" ? "relative" : ""}`}>
              {layer.id === "boundary" && (
                <div className="absolute inset-0 border-2 border-rose-500/30 rounded-xl pointer-events-none animate-pulse-border" />
              )}
              {layer.nodes.map(node => (
                <button
                  key={node.id}
                  onClick={() => setSelected(selected?.id === node.id ? null : node)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                    selected?.id === node.id
                      ? "ring-2 ring-offset-0 bg-slate-100 dark:bg-white/[0.08] text-slate-900 dark:text-white"
                      : "glass hover:bg-slate-50 dark:hover:bg-white/[0.06] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  style={{ borderLeft: `3px solid ${node.color}`, ...(selected?.id === node.id ? {ringColor: node.color} : {}) }}
                >
                  <span>{node.icon}</span>
                  <span className="font-medium text-xs">{node.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="w-80 flex-shrink-0 glass rounded-xl overflow-hidden animate-fade-in sticky top-4 self-start max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-white/[0.08] flex items-center justify-between" style={{background:`linear-gradient(90deg,${selected.color}22,transparent)`}}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{selected.icon}</span>
              <span className="font-sora text-sm text-slate-900 dark:text-white">{selected.name}</span>
            </div>
            <button onClick={() => setSelected(null)} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{selected.desc}</p>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">Flow</div>
              <ol className="space-y-1.5">
                {selected.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-500 dark:text-slate-400 text-xs">
                    <span className="text-emerald-400 font-mono flex-shrink-0">{i+1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">Code</div>
              <pre className="bg-slate-100 dark:bg-black/40 rounded-lg p-3 text-xs text-emerald-700 dark:text-emerald-300 font-mono whitespace-pre-wrap overflow-x-auto">{selected.code}</pre>
            </div>
          </div>
        </div>
      )}
    </div>

    <div className="space-y-6">
      {ARCH_DIAGRAMS.map((d) => (
        <div key={d.id} className="glass rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-white/[0.06] flex items-start justify-between gap-4">
            <div>
              <h3 className="font-sora text-base text-slate-900 dark:text-white">{d.title}</h3>
              <p className="text-slate-500 text-xs mt-0.5">{d.description}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <CopyButton code={d.code} />
              <button onClick={() => setZoomed(d)} className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] rounded transition-colors">
                <Maximize2 size={12} /> Expand
              </button>
            </div>
          </div>
          <div className="p-5 bg-slate-50 dark:bg-[#050510]">
            <MermaidDiagram code={d.code} id={d.id} />
          </div>
        </div>
      ))}
    </div>
    </div>
  )
}
