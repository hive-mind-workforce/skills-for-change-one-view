# OneView: Design Specification
**Skills for Change · Hackathon 2026**
**Date:** 2026-06-04

---

## 1. Vision and One-Liner

> **Capture once, report to every funder.**

OneView is a client-outcomes platform for Skills for Change (SfC), a Toronto nonprofit serving immigrants and refugees across 8 programs with 4 different funders. Staff currently maintain separate spreadsheets and re-enter the same data into multiple government portals. OneView eliminates that by becoming the single source of truth: a live database that generates funder-specific exports, AI-written narratives, and program dashboards automatically.

**IDEO Criteria Alignment:**
- Desirability: Caseworkers input once; funders receive tailored reports instantly
- Feasibility: Next.js + Vercel Postgres, deploys in hours, additive to existing tools
- Viability: Free-tier viable; scales to full SfC roster day one
- Functionality: Live at a Vercel URL judges can click and explore

---

## 2. User Roles (RBAC)

| Role | Who | Permissions |
|---|---|---|
| **Admin** | Priya (Director) | Full access: all programs, all funders, TRUNCATE/reset, export all |
| **Caseworker** | Fatima (Settlement), David (Employment) | Program-scoped: own program only, create/edit clients in scope |
| **Viewer** | Board member, auditor | Read-only: dashboards and reports, no PII |
| **AI Agent** | External LLM via API key | API-key auth, scoped endpoints only (`/api/query`, `/api/export`) |

Role is stored in JWT claim `role`; middleware enforces it on every route. Mental Health records are siloed at the database level (PHI Wall); no role can cross this boundary except Admin with explicit consent flag.

Demo uses `?role=admin|caseworker|viewer` query param to simulate switching without a login screen (appropriate for hackathon judge UX).

---

## 3. Core Features

### 3.1 Client Intake
- Single form: name, language, immigration stream, program, funder
- Creates: `clients` row + `enrolments` row + seeds initial outcomes
- Cross-program re-enrolment: if client exists, prompt for consent upgrade (program to cross-program)
- Power Automate webhook receiver at `POST /api/clients`, same endpoint, same schema; Microsoft Forms integration requires zero code changes

### 3.2 Program Dashboard
- Metric cards: total clients, active, outcomes achieved %, cross-program count
- Program breakdown bar chart (Recharts)
- Recent clients table with program badges
- Funnel visualization: enrolled to immediate outcomes to intermediate to ultimate
- Filter by program, funder, date range

### 3.3 Funder Export (Hero Feature)
- Dropdown: IRCC / Employment Ontario / United Way / City of Toronto
- Config-driven mapping engine: funder schema lives in a JSON config object; adding a new funder means editing config only, no code changes
- CSV export shaped to exact funder column spec
- "Export to iCARE" path: generates bulk-upload CSV in iCARE's exact schema
- EOIS-CaMS: generates formatted CSV for manual upload (no live API; government blocks external integration)

### 3.4 AI Narrative (Draft Report)
- Select funder + reporting period to generate narrative paragraph
- Anti-hallucination guarantee: SQL computes all metrics deterministically first; LLM only writes prose around supplied numbers
- Cache-first: cached reports returned instantly, "Force regenerate" option
- Provider-agnostic: Gemini (default, free), Claude (highest quality), Groq (fastest), switched via `LLM_PROVIDER` env var

### 3.5 AI Q&A
- Free-text question about program metrics
- Same anti-hallucination approach: question + computed metrics fed to LLM
- Example: "How many IRCC clients achieved employment outcomes last quarter?"

### 3.6 Help Screen (6 tabs)
1. **About**: SfC mission, OneView purpose, GitHub link badge
2. **Architecture**: interactive clickable diagram (7 layers, 20 nodes, detail panel)
3. **User Journey**: Amara's cross-program story with privacy timeline
4. **Integrations**: Microsoft Forms + Salesforce story with flow diagrams
5. **Privacy and Consent**: PHI Wall, PHIPA rules, consent levels, privacy law map
6. **AI Agents**: llms.txt, openapi.json, CLAUDE.md walkthrough for autonomous use

### 3.7 Demo Tour
- driver.js overlay, 8 steps
- Covers: Dashboard, Intake form, Export, AI report, Help screen
- Triggered by "Start Demo" button in header
- Highlight + tooltip for each step, skip/next/prev controls

### 3.8 AI-Agent Artifacts
- `/llms.txt`: plain-text index of every API endpoint, role, and data shape (Answer.AI convention)
- `/openapi.json`: full OpenAPI 3.1 spec, machine-readable
- `/sitemap.xml`: all public routes for SEO and crawlers
- `CLAUDE.md`: repo-root file with build conventions, env vars, architecture summary for coding agents
- `robots.txt`: allow all crawlers

---

## 4. Architecture

```
Sources          RBAC+Auth        Data+Privacy      AI M&E           Mapping Engine
─────────        ─────────        ────────────      ──────           ──────────────
Microsoft Forms  JWT Middleware    Vercel Postgres   LLM (Gemini/     Funder Config
Power Automate --► /api/clients    PHI Wall          Claude/Groq)     JSON objects
                  Role Check       Consent Model     Anti-halluc.     CSV Export
                  Caseworker-      Audit Log         Report Cache     iCARE schema
                  scoped queries                     Q&A grounding    EOIS schema

File Boundary (government systems do not allow live API; bulk upload only)
────────────────────────────────────────────────────────────────────────────
iCARE (IRCC)  <--  CSV export    EOIS-CaMS (EO)  <--  CSV export
Salesforce    <--  Outbound Msg  Custom reports  <--  PDF/CSV
```

**Key architectural principles:**
- File boundary is a feature, not a limitation; compliance requires audit trail, not live sync
- Config-driven mapping: `lib/funders.ts` exports one object per funder; changing column names means editing config
- PHI Wall: `enrolments.program = 'mental_health'` rows are filtered at SQL level before any JOIN
- Audit log: every write goes to `audit_log` table (action, entity, user_role, source_ip, timestamp)

---

## 5. Data Model

```sql
clients (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     text NOT NULL,
  primary_language text,
  immigration_stream text,
  created_at    timestamptz DEFAULT now()
)

enrolments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     uuid REFERENCES clients(id),
  program       text NOT NULL,  -- settlement|employment|language|mental_health|trades|mentoring|youth|women
  funder        text NOT NULL,  -- ircc|eo|uw|city
  consent_cross_program boolean DEFAULT false,
  enrolled_at   timestamptz DEFAULT now()
)

outcomes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrolment_id  uuid REFERENCES enrolments(id),
  tier          text NOT NULL,  -- immediate|intermediate|ultimate
  label         text NOT NULL,
  achieved      boolean DEFAULT false,
  recorded_at   timestamptz DEFAULT now()
)

audit_log (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action        text NOT NULL,  -- create_client|export|generate_report|query
  entity        text,
  detail        jsonb,
  user_role     text,
  source_ip     text,
  at            timestamptz DEFAULT now()
)
```

**Seed volumes:** Settlement 4,120 · Employment 5,380 · Language 3,010 · Mental Health 1,240 · Trades 980 · Mentoring 1,450 · Youth 1,620 · Women 1,340 = **~16,247 clients total**

---

## 6. API Routes

| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/api/clients` | Create client + enrolment + seed outcomes | Caseworker+ |
| GET | `/api/clients` | List with enrolments, outcome rollup, metrics | Caseworker+ |
| POST | `/api/draft-report` | LLM narrative, cache-first | Admin+ |
| POST | `/api/query` | LLM Q&A grounded in computed metrics | Caseworker+ |
| POST | `/api/export` | Funder-shaped CSV rows via mapping engine | Admin+ |
| POST | `/api/reset` | TRUNCATE all tables + re-seed demo data | Admin only |
| GET | `/api/health` | Uptime check, DB connectivity | Public |

All POST routes require `Content-Type: application/json`. AI Agent role uses `Authorization: Bearer <api-key>` header; other roles use `?role=` param in demo mode.

---

## 7. Privacy and Consent Model

### Consent Levels
1. **Program consent** (automatic): client enrolled in a program, data used for that program's reporting only
2. **Cross-program consent** (explicit, opt-in): client explicitly consents to data being used across programs for integrated reporting; stored as `consent_cross_program = true`
3. **Dashboard aggregation** (implied): anonymized aggregate metrics (no PII) used in admin dashboard; no individual consent required

### PHI Wall
Mental Health (`program = 'mental_health'`) records are **always siloed** regardless of consent level. This is a PHIPA hard rule. Implementation: every SQL query that crosses programs has an explicit `AND program != 'mental_health'` guard. No role can bypass this.

### Amara's Cross-Program Journey
1. Amara enrolls in Settlement (IRCC), program consent only
2. Amara moves to Employment (EO): caseworker sees prompt "Amara is already in Settlement. Enable cross-program view? (requires Amara's consent)"
3. Amara consents verbally, caseworker checks box, `consent_cross_program = true`
4. Amara's full journey visible in integrated view: Settlement, Language, Employment
5. If Amara later accesses Mental Health counselling, that record is PHI-walled and never appears in cross-program view

### Privacy Law Map
| Program | Governing Law |
|---|---|
| Settlement, Language | Federal Privacy Act |
| Employment, Trades | FIPPA (Ontario) |
| Mental Health | PHIPA (PHI Wall always applies) |
| Youth | CYFSA Part X |

---

## 8. Integration Story

### Microsoft Forms to OneView
- **Zero staff behavior change**: forms stay exactly as-is
- Power Automate flow: Form submitted, HTTP POST to `/api/clients` with mapped fields
- Mapping: Form field names to OneView schema (documented in CLAUDE.md)
- Timeline: approximately 20 minutes to configure Power Automate, no code deployment
- Additive: OneView enriches data, doesn't replace Forms

### Salesforce to OneView
- Salesforce Outbound Message or REST webhook posts to `POST /api/clients`
- Same endpoint, same schema; OneView is funder-agnostic about source
- Additive: Salesforce continues as CRM; OneView handles outcomes reporting layer

### What OneView Does Not Replace
- iCARE (IRCC's system of record): OneView generates bulk upload CSVs for it
- EOIS-CaMS (Employment Ontario): government system, no external API; OneView generates manual-upload CSV
- Salesforce: CRM stays; OneView adds outcomes reporting
- Microsoft Forms: intake stays; Power Automate bridges it

---

## 9. UI Design System

### Visual Identity
- **Design direction:** Human-Centered Impact (Direction B), light green, warm, not corporate
- **Background:** Near-black `#060610` with mesh gradient (green 9%, indigo 9%, cyan 5%)
- **Grid overlay:** 48px repeating grid at 1.8% opacity for depth
- **Glassmorphism:** `backdrop-filter: blur(12px)` cards with `rgba(255,255,255,0.03)` fill and `rgba(255,255,255,0.08)` border
- **Accent colors:** Green `#10b981` (primary), Indigo `#6366f1`, Amber `#f59e0b`, Violet `#8b5cf6`, Cyan `#06b6d4`, Rose `#f43f5e`

### Typography
- **Display:** Sora 800 weight, used for headlines, hero numbers, feature names
- **UI:** Inter, used for all body copy, labels, navigation
- **Editorial Bold direction:** Large Sora numbers in hero section (e.g. "16,247 Lives in Motion")

### Navigation
- **Desktop:** Top nav bar with tabs
- **Mobile:** Bottom tab bar (5 tabs: Dashboard, Intake, Export, AI, Help)
- Tab icons: outlined, active state with green accent + slight background
- Mobile-first breakpoints: tabs collapse to bottom bar at `< 768px`

### Imagery
- Hero: full-bleed photo overlay (community photos, not individual faces)
- Program cards: scene-based photos (classroom, office, workshop)
- No individual face avatars (privacy principle applied to design)

### Component Library
- **shadcn/ui** as base (Tailwind-native, accessible, zero runtime CSS)
- **Recharts** for all data visualizations
- **driver.js** for demo tour overlay
- Custom glassmorphism card component wrapping shadcn Card

---

## 10. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 15 (App Router) | Vercel-native, RSC, API routes |
| Language | TypeScript | Type safety, better AI agent tooling |
| Styling | Tailwind CSS 4 | Utility-first, co-located, shadcn compatible |
| Components | shadcn/ui | Accessible, composable, Tailwind-native |
| Charts | Recharts | React-native, composable, Tailwind-themeable |
| Database | Vercel Postgres (Neon) | Zero-config on Vercel, `@vercel/postgres` driver |
| LLM | Provider-agnostic (`lib/llm.ts`) | Gemini default (free), Claude (quality), Groq (speed) |
| Demo tour | driver.js | Lightweight, CSS-driven highlight overlay |
| Deployment | Vercel | Free tier, GitHub integration, instant preview URLs |
| Node version | 20+ | Required for `@vercel/postgres`, edge runtime |

---

## 11. Deployment and Repository

- **Repo:** https://github.com/hive-mind-workforce/skills-for-change-one-view
- **Vercel account:** https://vercel.com/hive-mind-workforces-projects
- **Git workflow:** feature branch, PR, `dev` (default, preview URL), `main` (production)
- **Branch strategy:** all code changes on feature branches, merge to `dev`, promote to `main` for demo

### Environment Variables
```
LLM_PROVIDER=gemini          # claude | gemini | groq
LLM_API_KEY=...              # provider API key
POSTGRES_URL=...             # auto-injected by Vercel Postgres
ONEVIEW_API_KEY=...          # for AI Agent role access
```

---

## 12. AI-Agent Readiness

Every artifact is designed to make it seamless for an AI coding agent to implement, extend, or audit OneView without human explanation:

- **CLAUDE.md** (repo root): build conventions, env var reference, architecture summary, data model, which file does what
- **llms.txt** (`/llms.txt`): Answer.AI 2024 convention, plain-text index of all endpoints, roles, data shapes, integration notes
- **openapi.json** (`/openapi.json`): Full OpenAPI 3.1 spec covering every route, request/response schema, auth model
- **JSDoc** on every exported function in `lib/`, including parameter types, return types, example usage
- **Inline comments** only where behaviour is non-obvious (PHI Wall SQL guards, cache invalidation logic)

---

## 13. Help Screen Tabs (Detail)

**Tab 1: About**
SfC mission statement, OneView problem and solution, technology summary, GitHub badge linking to public repo.

**Tab 2: Architecture**
Interactive diagram (7 layers, 20 clickable nodes). Click any node to open a detail panel with description, flow steps, code sample, and relevant chips. Layers: Sources, RBAC, Data+Privacy, AI M&E, Mapping Engine, File Boundary, Funder Systems.

**Tab 3: User Journey**
Amara's cross-program story: Settlement, Language, Employment, with privacy decision points annotated at each stage. PHI Wall trigger shown when Mental Health pathway branches off.

**Tab 4: Integrations**
Microsoft Forms + Power Automate flow diagram. Salesforce webhook flow. "What OneView replaces" vs "What it doesn't" table. 20-minute setup timeline for Power Automate.

**Tab 5: Privacy and Consent**
Three consent levels with icons and examples. PHI Wall rule callout. Privacy law map table by program. Audit log sample entries.

**Tab 6: AI Agents**
How AI agents can use OneView autonomously. Shows `/llms.txt` structure, links to `/openapi.json`, explains CLAUDE.md. Example agent workflow: query metrics, draft report, export CSV.

---

## 14. Demo Tour Steps (driver.js)

1. **Welcome**: "OneView: Capture once, report to every funder" overlay on hero
2. **Dashboard**: "16,247 clients across 8 programs. Real data, live." on metric cards
3. **Program Chart**: "One view of all programs. Click any bar to drill down."
4. **Intake Form**: "One intake, any program. Power Automate bridges Microsoft Forms here."
5. **Export Panel**: "Select a funder. OneView shapes the export automatically."
6. **AI Report**: "SQL computes the numbers. AI writes the narrative. No hallucinations."
7. **Help Architecture**: "Every layer is clickable. This diagram is the presentation."
8. **Finish**: "Built for Skills for Change. Open source. AI-agent ready." with GitHub link

---

## 15. Build Order

1. Initialize repo, push to GitHub, connect Vercel; deploy hello world to main
2. Scaffold Next.js + Tailwind + shadcn/ui, confirm Vercel preview
3. Vercel Postgres: create tables, seed 16,247 clients
4. `/api/clients` (POST + GET) + intake form UI
5. Dashboard page: metric cards + Recharts bar chart
6. `/api/export` + funder export UI (hero feature)
7. `/api/draft-report` + AI narrative UI
8. `/api/query` + AI Q&A UI
9. Help screen (6 tabs) + interactive architecture diagram
10. Demo tour (driver.js, 8 steps)
11. Supporting files: llms.txt, openapi.json, sitemap.xml, CLAUDE.md, robots.txt
12. Mobile polish: bottom tab bar, responsive breakpoints
13. Pre-cache showcase report, final Vercel deploy to main

---

*Spec written 2026-06-04. Contact: iamvisibletoday@gmail.com*
