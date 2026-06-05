<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# OneView: AI Agent Reference

OneView is a client outcomes tracking and funder reporting platform for **Skills for Change (SfC)**, a Toronto nonprofit serving immigrants and refugees. It manages ~19,000 demo clients across 8 programs and 4 funders.

---

## Base URLs

| Environment | URL |
|---|---|
| Production | `https://sfc-oneview.vercel.app` |
| Local dev | `http://localhost:3010` |

---

## Authentication

### Demo mode (query parameter)

Append `?role=<role>` to any request:

```
GET /api/clients?role=admin
GET /api/analytics?role=caseworker
```

### AI Agent mode (Bearer token)

Only `/api/query` and `/api/export` accept this method:

```
POST /api/query
Authorization: Bearer <ONEVIEW_API_KEY>
Content-Type: application/json
```

### RBAC roles

| Role | Access |
|---|---|
| `admin` | Full access: all programs, export, reset, AI reports |
| `caseworker` | Program-scoped reads, create clients, AI Q&A |
| `viewer` | Read-only dashboards, no PII |
| `ai_agent` | Bearer token only; `/api/query` and `/api/export` |

---

## Key API Endpoints

### Client data

```
GET /api/clients?role=admin
```
Returns the full client list with enrolment and outcomes metrics.

```
GET /api/journey?clientId=<uuid>&role=admin
```
Returns the complete journey for a single client: enrolments, outcomes, surveys, and audit trail.

### Analytics and pipeline

```
GET /api/analytics?role=admin
```
Returns program analytics, survey satisfaction stats, and outcome achievement counts.

```
GET /api/pipeline?role=admin
```
Returns client counts broken down by pipeline stage across all programs.

### AI Q&A

```
POST /api/query
Content-Type: application/json

{ "question": "How many clients completed employment training this quarter?", "role": "admin" }
```
The response is an AI-generated answer grounded in live database metrics.

### Funder CSV export

```
POST /api/export
Content-Type: application/json

{ "funder": "ircc", "role": "admin" }
```
Valid funder values: `ircc`, `eo`, `uw`, `city`. Returns a CSV file scoped to the funder's programs.

### AI narrative report

```
POST /api/draft-report
Content-Type: application/json

{ "funder": "ircc", "period": "Q1 2026", "role": "admin" }
```
Returns a cached-or-generated narrative report suitable for funder submission.

### Utility

```
GET /api/health          — uptime check
GET /api/init            — initialize DB and seed demo data (16,247+ clients)
GET /api/provider        — current LLM provider name
```

---

## Data Model

### clients
| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| full_name | text | PII |
| primary_language | text | |
| immigration_stream | text | |
| stage | text | see pipeline stages below |
| country_of_origin | text | |
| age_group | text | |
| gender | text | |
| phone | text | PII |
| email | text | PII |
| source | text | referral source |
| created_at | timestamptz | |

### enrolments
| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| client_id | uuid | foreign key to clients |
| program | text | see programs below |
| funder | text | see funders below |
| consent_cross_program | boolean | explicit opt-in required |
| enrolled_at | timestamptz | |

### outcomes
| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| enrolment_id | uuid | foreign key to enrolments |
| tier | text | `immediate`, `intermediate`, or `ultimate` |
| label | text | outcome description |
| achieved | boolean | |
| recorded_at | timestamptz | |

### surveys
| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| client_id | uuid | foreign key to clients |
| enrolment_id | uuid | foreign key to enrolments |
| satisfaction | integer | 1-5 scale |
| would_recommend | boolean | |
| barriers | text | open text |
| success_story | text | open text |
| created_at | timestamptz | |

### audit_log
| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| action | text | e.g. `create_client`, `export_csv` |
| entity | text | table name affected |
| detail | jsonb | structured change payload |
| user_role | text | role that triggered the action |
| source_ip | text | |
| at | timestamptz | |

### report_cache
| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| funder | text | |
| period | text | e.g. `Q1 2026` |
| narrative | text | AI-generated text |
| created_at | timestamptz | |

---

## Programs and Funders

| Funder | Programs | Governing law |
|---|---|---|
| `ircc` | settlement, language | Federal Privacy Act |
| `eo` | employment, trades | FIPPA (Ontario) |
| `uw` | mental_health, youth | PHIPA / CYFSA Part X |
| `city` | mentoring, women | Municipal FIPPA |

---

## Pipeline Stages

Clients move through these stages in order:

```
outreach -> vetting -> eligibility -> intake -> training -> placement -> survey -> complete
                                                                                -> dropped
```

Use `GET /api/pipeline?role=admin` to retrieve counts at each stage.

---

## PHI Wall (Critical)

Mental health records are **permanently excluded** from all cross-program queries. The following clause is applied at the SQL layer on every multi-program query:

```sql
AND e.program != 'mental_health'
```

No role, consent flag, or API parameter can override this. It is a hard PHIPA compliance rule enforced in `src/lib/db.ts`. Do not attempt to bypass it; any query that would expose mental_health records across program boundaries must be rejected.

---

## Consent Model

Cross-program data sharing requires explicit client opt-in (`consent_cross_program = true`). Even with consent, the PHI Wall applies: mental health data never crosses program boundaries.

1. Program consent (automatic): data used for that program's funder only.
2. Cross-program consent (explicit opt-in): stored as `consent_cross_program = true` on the enrolment.
3. Dashboard aggregation (implied): anonymized aggregate metrics only, no PII.

---

## Example: Typical Agent Workflow

```bash
# 1. Check the platform is live
curl https://sfc-oneview.vercel.app/api/health

# 2. Ask a question grounded in live data
curl -X POST https://sfc-oneview.vercel.app/api/query \
  -H "Authorization: Bearer $ONEVIEW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"question": "What percentage of IRCC clients achieved language outcomes this quarter?"}'

# 3. Export data for a funder
curl -X POST https://sfc-oneview.vercel.app/api/export \
  -H "Authorization: Bearer $ONEVIEW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"funder": "ircc"}' \
  --output ircc_export.csv
```

---

## Source Files (for code contributors)

| File | Purpose |
|---|---|
| `src/lib/db.ts` | All SQL queries, seed logic, audit log |
| `src/lib/funders.ts` | Funder config and CSV export mapping |
| `src/lib/llm.ts` | LLM provider abstraction (Gemini, Claude, Groq) |
| `src/lib/helpers.ts` | Formatting utilities |
| `src/app/api/` | All REST API route handlers |
| `public/openapi.json` | Full OpenAPI 3.1 spec |
| `public/llms.txt` | AI agent discoverability index |
