# OneView — Skills for Change

**Capture once, report to every funder.**

OneView is a client outcomes tracking and funder reporting platform built for [Skills for Change](https://skillsforchange.org/), a Toronto nonprofit that has served newcomers and underserved communities since 1982. OneView eliminates duplicate data entry across 8 programs and 4 government funders, with AI-generated narrative reports and privacy-first architecture.

**Live demo:** https://sfc-oneview.vercel.app

---

## About Skills for Change

Skills for Change was founded in 1982 by five ESL teachers to help newcomers integrate into Canadian society. It has grown into one of Canada's leading settlement and employment services organizations, serving **20,000+ clients annually** across **25+ locations** in the Greater Toronto Area.

**Vision:** A Canada where everyone has equal opportunities to succeed.

**Mission:** Working with newcomers and underserved groups providing holistic solutions that bridge the gap between potential and opportunity for success in Canada.

Charity registration: 121471858RR0001

### Programs

| Program | Funder |
|---|---|
| Settlement Services | IRCC |
| LINC Language Training | IRCC |
| Employment Services | Employment Ontario |
| Skilled Trades | Employment Ontario |
| Mental Health and Wellness | Community Foundations |
| Youth Programs | Community Foundations |
| Mentoring for Change | City of Toronto |
| Women's Programs | City of Toronto |

---

## Features

- **Single intake form** — register a client once, data flows to all 8 programs and 4 funders
- **Funder-specific CSV export** — columns shaped to each funder's exact specification
- **AI narrative reports** — one-click Q1/Q2/annual report generation with cache
- **Real-time outcomes dashboard** — immediate, intermediate, and ultimate outcome tiers tracked from day one
- **PHI Wall** — PHIPA-compliant hard wall on mental health data enforced at the SQL layer
- **Cross-program consent** — explicit opt-in stored per enrolment, never assumed
- **Interactive help screen** — 6 tabs covering architecture, privacy, API, and integrations
- **Demo tour** — 8-step guided walkthrough (click "Start Demo" in the header)
- **RBAC** — Admin, Caseworker, Viewer, and AI Agent roles
- **Power Automate ready** — Microsoft Forms webhook integration, zero staff behavior change

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | Vercel Postgres (Neon) |
| LLM | Provider-agnostic (Gemini / Claude / Groq) |
| Charts | Recharts |
| Demo Tour | driver.js |
| Deployment | Vercel |

---

## Quick Start

```bash
git clone https://github.com/hive-mind-workforce/skills-for-change-one-view.git
cd skills-for-change-one-view
npm install
cp .env.example .env.local
# Edit .env.local with your POSTGRES_URL and LLM_API_KEY
npm run dev
```

Visit http://localhost:3000. On first load, `/api/init` seeds 19,140 demo clients across all 8 programs.

### Environment Variables

```bash
# LLM provider (gemini | claude | groq)
LLM_PROVIDER=gemini
LLM_API_KEY=your-api-key-here

# Vercel Postgres (auto-injected when using Vercel Postgres add-on)
POSTGRES_URL=...
POSTGRES_PRISMA_URL=...
POSTGRES_URL_NON_POOLING=...
POSTGRES_USER=...
POSTGRES_HOST=...
POSTGRES_PASSWORD=...
POSTGRES_DATABASE=...

# Bearer token for AI Agent API access
ONEVIEW_API_KEY=your-agent-token-here
```

---

## Demo Mode

Add `?role=admin`, `?role=caseworker`, or `?role=viewer` to any URL to switch roles.

| Role | Access |
|---|---|
| `?role=admin` | Full access: all programs, export, reset, AI reports |
| `?role=caseworker` | Program-scoped reads, create clients |
| `?role=viewer` | Read-only dashboards, no PII |

The live demo runs as admin by default: https://sfc-oneview.vercel.app/?role=admin

---

## API Reference

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | /api/health | Public | Uptime check |
| GET | /api/init | Public | Init DB and seed if empty |
| GET | /api/clients | Caseworker+ | List clients with metrics |
| POST | /api/clients | Caseworker+ | Create client, enrolment, and outcomes |
| POST | /api/export | Admin+ | Generate funder-specific CSV |
| POST | /api/draft-report | Admin+ | AI narrative (cache-first) |
| POST | /api/query | Caseworker+ | AI Q&A grounded in live metrics |
| POST | /api/reset | Admin | Truncate and re-seed database |
| GET | /api/provider | Public | Current LLM provider |

Full OpenAPI 3.1 spec: [`/public/openapi.json`](./public/openapi.json)

---

## Privacy and Compliance

**PHI Wall:** All cross-program SQL queries include `AND e.program != 'mental_health'`. This is a PHIPA hard rule enforced at the database layer — no role, consent flag, or API parameter can override it.

| Program | Privacy Law |
|---|---|
| Settlement, Language | Federal Privacy Act |
| Employment, Trades | FIPPA (Ontario) |
| Mental Health | PHIPA (PHI Wall always enforced) |
| Youth | CYFSA Part X |

Consent is tracked at three levels:
1. **Program consent** (automatic) — data used for that program's funder only
2. **Cross-program consent** (explicit opt-in) — stored as `consent_cross_program = true`
3. **Dashboard aggregation** (implied) — anonymized aggregate metrics only

---

## Data Model

```sql
clients        (id, full_name, primary_language, immigration_stream, created_at)
enrolments     (id, client_id, program, funder, consent_cross_program, enrolled_at)
outcomes       (id, enrolment_id, tier, label, achieved, recorded_at)
audit_log      (id, action, entity, detail jsonb, user_role, source_ip, at)
report_cache   (id, funder, period, narrative, created_at)
```

---

## Integrations

**Microsoft Forms via Power Automate**

| Form Field | API Field |
|---|---|
| Full Name | `full_name` |
| Language | `primary_language` |
| Immigration Background | `immigration_stream` |
| Program | `program` |
| Consent Shared | `consent_cross_program` |

Configure a Power Automate flow to POST to `/api/clients` on new form submission. 20-minute setup, no staff behavior change.

**Salesforce**

Configure an Outbound Message or REST webhook from Salesforce to POST to `/api/clients` with the same schema. Additive to existing Salesforce workflows, not a replacement.

**iCARE / EOIS-CaMS**

Use `/api/export` to generate a CSV shaped to the government-mandated column specification for compliant bulk upload.

---

## Deployment

1. Fork this repository
2. Connect to [Vercel](https://vercel.com) and add a Vercel Postgres database
3. Set `LLM_PROVIDER`, `LLM_API_KEY`, and `ONEVIEW_API_KEY` in Vercel environment variables
4. Deploy: `vercel --prod`
5. Visit `/api/init` once to seed the database

---

## Development

```bash
npm test                # Jest unit tests
npm run test:coverage   # Coverage report
npm run test:e2e        # Playwright e2e (requires running dev server)
npm run build           # Production build
npm run lint            # ESLint
```

### Git Workflow

```
feature/my-feature -> dev (preview URL) -> main (production)
```

All changes on feature branches. PR to `dev` for preview. Promote to `main` for production.

---

## License

MIT License. See [LICENSE](./LICENSE).

Built with care for [Skills for Change](https://skillsforchange.org/) — serving newcomers and underserved communities in Toronto since 1982.
