# OneView

> Capture once, report to every funder.

OneView is a client outcomes tracking and funder reporting platform for Skills for Change (SfC), a Toronto nonprofit serving immigrants and refugees across 8 programs with 4 different funders.

## Quick Start

```bash
npm install
cp .env.example .env.local
# Fill in your POSTGRES_URL and LLM_API_KEY
npm run dev
# Visit http://localhost:3000
# On first load, /api/init seeds 16,247 demo clients
```

## Architecture

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 15 App Router | Server components, API routes, Vercel deployment |
| Language | TypeScript | Type safety throughout |
| Styling | Tailwind CSS 4 + shadcn/ui | Utility-first, accessible components |
| Database | Vercel Postgres (Neon) | All client and outcomes data |
| LLM | Provider-agnostic (lib/llm.ts) | AI narrative generation |
| Charts | Recharts | Program breakdown visualizations |
| Demo Tour | driver.js | 8-step guided walkthrough |
| Deployment | Vercel | Automatic preview and production deploys |

## Key Files

```
src/lib/db.ts          Database layer: all SQL queries, seed, audit log
src/lib/llm.ts         LLM helper: Gemini/Claude/Groq provider abstraction
src/lib/funders.ts     Funder config and CSV export mapping engine
src/lib/helpers.ts     Formatting utilities
src/app/page.tsx       Dashboard (main page)
src/app/intake/        Client intake form
src/app/export/        Funder CSV export (hero feature)
src/app/ai/            AI report writer and Q&A
src/app/help/          Help screen (6 tabs, interactive architecture diagram)
src/app/api/           All REST API routes
src/components/help/tabs/ArchitectureTab.tsx  Interactive 7-layer diagram
public/llms.txt        AI agent discoverability index
public/openapi.json    Full OpenAPI 3.1 spec
```

## Data Model

```sql
clients        (id, full_name, primary_language, immigration_stream, created_at)
enrolments     (id, client_id->clients, program, funder, consent_cross_program, enrolled_at)
outcomes       (id, enrolment_id->enrolments, tier, label, achieved, recorded_at)
audit_log      (id, action, entity, detail jsonb, user_role, source_ip, at)
report_cache   (id, funder, period, narrative, created_at)
```

Programs: settlement, employment, language, mental_health, trades, mentoring, youth, women
Funders: ircc (settlement+language), eo (employment+trades), uw (mental_health+youth), city (mentoring+women)

## API Reference

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | /api/health | Public | Uptime check |
| GET | /api/init | Public | Init DB + seed if empty |
| GET | /api/migrate | Public | Run CREATE TABLE IF NOT EXISTS |
| GET | /api/clients | Caseworker+ | List clients with metrics |
| POST | /api/clients | Caseworker+ | Create client + enrolment + outcomes |
| POST | /api/export | Admin+ | Generate funder CSV |
| POST | /api/draft-report | Admin+ | AI narrative (cache-first) |
| POST | /api/query | Caseworker+ | AI Q&A grounded in metrics |
| POST | /api/reset | Admin | Truncate + re-seed |
| GET | /api/provider | Public | Current LLM provider |

## Environment Variables

```bash
LLM_PROVIDER=gemini          # claude | gemini | groq
LLM_API_KEY=...              # provider API key
POSTGRES_URL=...             # auto-injected by Vercel Postgres
POSTGRES_PRISMA_URL=...      # pooled connection
POSTGRES_URL_NON_POOLING=... # direct connection
POSTGRES_USER=...
POSTGRES_HOST=...
POSTGRES_PASSWORD=...
POSTGRES_DATABASE=...
ONEVIEW_API_KEY=...          # AI Agent bearer token
```

## RBAC

| Role | Auth Method | Permissions |
|---|---|---|
| Admin | ?role=admin | Full access: all programs, export, reset |
| Caseworker | ?role=caseworker | Program-scoped reads, create clients |
| Viewer | ?role=viewer | Read-only dashboards, no PII |
| AI Agent | Authorization: Bearer token | /api/query and /api/export only |

Demo mode uses the ?role= query parameter. Production would use JWT.

## Privacy and Compliance

PHI Wall: `AND e.program != 'mental_health'` is applied to EVERY cross-program SQL query. This is a PHIPA hard rule enforced at the database layer. No role or consent flag can override it.

Consent levels:
1. Program consent (automatic) - data used for program's funder only
2. Cross-program consent (explicit opt-in) - stored as consent_cross_program=true
3. Dashboard aggregation (implied) - anonymized aggregate metrics only

Privacy laws by program:
- Settlement/Language: Federal Privacy Act
- Employment/Trades: FIPPA (Ontario)
- Mental Health: PHIPA (PHI Wall always applies)
- Youth: CYFSA Part X

## Design System

Background: #060610 (near-black)
Glassmorphism: backdrop-filter:blur(12px) bg-white/[0.03] border border-white/[0.08]
Primary accent: #10b981 (emerald-500)
Font: Sora 800 for headings (class: font-sora), Inter for body
CSS classes: .glass, .mesh-bg, .grid-overlay, .font-sora

## Git Workflow

```
feature/my-feature -> dev (preview URL) -> main (production)
```
All changes on feature branches. PR to dev for preview. Promote to main for production demo.

## Integration Guide

Power Automate field mapping (Microsoft Forms to OneView):
| Form Field | API Field |
|---|---|
| Full Name | full_name |
| Language | primary_language |
| Immigration Background | immigration_stream |
| Program | program |
| Consent Shared | consent_cross_program |

Excel/SharePoint: Export historical records as CSV, map to OneView schema, bulk import via POST /api/clients.

## Running Tests

```bash
npm test              # Jest unit tests
npm run test:coverage # Coverage report
npm run test:e2e      # Playwright e2e (requires running dev server)
```

## Deployment

1. Connect GitHub repo to Vercel
2. Add Vercel Postgres database to the project
3. Set LLM_PROVIDER and LLM_API_KEY environment variables
4. Deploy: `vercel --prod`
5. Visit /api/init on first load to seed data

## Dev Rules

- Never save screenshots, snapshots, or test artifacts to the project root. Use `tests/test-results/` for Playwright output.
- Dev server runs on port 3010 (not 3000, which is reserved for other apps).
- Never commit `.env`, `.env.local`, API keys, passwords, or credentials to git.
- GitHub org: `hive-mind-workforce` — all remotes and PRs use this account.
