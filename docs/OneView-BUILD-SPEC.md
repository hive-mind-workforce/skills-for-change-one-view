# OneView — Build Spec (Claude Code Kickoff)

> Hackathon prototype for **Skills for Change** (Toronto nonprofit, immigrant/refugee services).
> Goal: a **live, deployable web app** judges can use from a URL. Build time ~24h, solo full-stack engineer.
> This spec is the source of truth. Build the **thinnest believable vertical slice**, not the full vision.

---

## 1. What OneView is (positioning)

OneView is **not a CRM**. It is the **last-mile funder-reporting + AI monitoring-and-evaluation (M&E) layer** that sits on top of whatever systems an agency already uses. It turns **one client intake** into (a) a consolidated, org-wide view the agency can't currently see, and (b) the **funder-specific files** each government system requires.

One-liner: **"Capture once, report to every funder."**

---

## 2. Non-negotiable design principles

These three rules must survive into the code. They are the credibility of the whole project.

1. **The funder boundary is FILES, not live APIs.** Government systems (iCARE for settlement, EOIS-CaMS for employment) do **not** accept external API integration. OneView **generates files / pre-filled worksheets** for staff to upload or key in. Never draw or build a live API push into a funder system. (Bulk file upload to iCARE is the IRCC-endorsed path — ~75% of records already arrive that way.)
2. **AI never invents numbers.** All metrics are computed **deterministically in SQL / server code**. The LLM is given those computed numbers as context and only **writes prose around them** (funder narratives) or **answers questions using only supplied numbers**. A human reviews/signs off. This is the anti-hallucination guarantee.
3. **All data is synthetic.** No real client data. The UI should state this. (Ties to the privacy story: real deployment would run in a Canadian region with consent + PHI controls.)

---

## 3. Tech stack

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Hosting:** Vercel
- **Database:** Vercel Postgres (provision from Vercel dashboard → Storage; it's Neon-backed). Use `@vercel/postgres` or the Neon serverless driver. Connection string is injected as an env var.
- **LLM:** **provider-agnostic** — switch between Claude (paid, cheap), Google Gemini (free tier), or Groq (free tier) via ONE env var. Called **only** from server-side API routes (Node runtime, not Edge — set `export const runtime = 'nodejs'` in routes that hit Postgres/SDK).
- **Node:** 20+ (required by current SDKs).

### LLM setup — one helper, swappable provider

The whole app talks to the model through a single `generate(system, user)` function. Changing providers = changing env vars, no app code. Gemini and Groq both expose **OpenAI-compatible** endpoints, so they share the `openai` SDK; Claude uses its native SDK.

Install: `npm install openai @anthropic-ai/sdk`

**Env vars** (set in Vercel dashboard, never in code):
```
LLM_PROVIDER=gemini          # claude | gemini | groq
LLM_API_KEY=...              # the key for whichever provider is selected
```

**Provider reference (verify current model names at each provider's docs — they rotate):**
| Provider | Cost | Base URL | Example model | Notes |
|---|---|---|---|---|
| `gemini` | **Free tier** | `https://generativelanguage.googleapis.com/v1beta/openai/` | `gemini-2.5-flash` | Ties to SfC's Google relationship. Free-tier data may be used for product improvement — fine for synthetic data only. |
| `groq` | **Free tier** | `https://api.groq.com/openai/v1` | a current Groq-hosted Llama model | Extremely fast inference; great for snappy demo. |
| `claude` | Paid, ~cents/call | (native SDK) | `claude-sonnet-4-6` (or `claude-haiku-4-5` cheaper, `claude-opus-4-8` best) | Highest quality; whole demo costs ~$1–2. |

```ts
// lib/llm.ts
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const PROVIDER = process.env.LLM_PROVIDER ?? 'gemini';
const KEY = process.env.LLM_API_KEY!;

const CONFIG: Record<string, { baseURL?: string; model: string }> = {
  gemini: {
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    model: 'gemini-2.5-flash',
  },
  groq: {
    baseURL: 'https://api.groq.com/openai/v1',
    model: 'llama-3.3-70b-versatile', // confirm a current model in Groq docs
  },
  claude: { model: 'claude-sonnet-4-6' },
};

export async function generate(system: string, user: string): Promise<string> {
  const cfg = CONFIG[PROVIDER];

  if (PROVIDER === 'claude') {
    const client = new Anthropic({ apiKey: KEY });
    const msg = await client.messages.create({
      model: cfg.model,
      max_tokens: 1024,
      system,
      messages: [{ role: 'user', content: user }],
    });
    return msg.content.filter((b) => b.type === 'text').map((b: any) => b.text).join('\n').trim();
  }

  // gemini & groq via OpenAI-compatible interface
  const client = new OpenAI({ apiKey: KEY, baseURL: cfg.baseURL });
  const res = await client.chat.completions.create({
    model: cfg.model,
    max_tokens: 1024,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  });
  return (res.choices[0]?.message?.content ?? '').trim();
}
```

> **Default to `gemini`** for the demo: zero cost, and it aligns with SfC being a Google.org grantee — a real talking point on the feasibility/viability slides. Swap to `claude` or `groq` with two env-var changes if needed.

---

## 4. Architecture (layers)

```
PRESENTATION   Intake · Dashboard · AI Assistant · Export · Reset
      |
AI M&E LAYER   Deterministic metrics (SQL)  →  Claude writes prose / answers
      |
DATA LAYER     clients · enrolments · outcomes · consent   (Vercel Postgres)
      |
MAPPING ENGINE Funder "schema profiles": field map · code map · validation
      |
EXPORT ADAPTERS  iCARE bulk file · CaMS worksheet · custom report
- - - - - - - -  FILE BOUNDARY (no live API) - - - - - - - -
iCARE (upload) · EOIS-CaMS (manual) · United Way / City (reports)
```

The **mapping engine** is the core IP. Make it **config-driven** (a JS/JSON object per funder), not hardcoded, so adapting to a funder schema change = editing config, not rewriting code.

---

## 5. Data model (minimal slice)

Keep it small. Four tables.

**clients** (the golden record)
- `id` (uuid, pk)
- `full_name` (text)
- `primary_language` (text)
- `immigration_stream` (text)  — e.g. Refugee, Economic, Family
- `created_at` (timestamptz)

**enrolments** (client ↔ program ↔ funder)
- `id` (uuid, pk)
- `client_id` (fk → clients)
- `program` (text)  — see seed list
- `funder` (text)   — IRCC | EO | UW | CITY
- `consent_cross_program` (boolean)  — gates linking; default false
- `enrolled_at` (timestamptz)

**outcomes**
- `id` (uuid, pk)
- `enrolment_id` (fk → enrolments)
- `tier` (text)  — 'immediate' | 'intermediate' | 'ultimate'
- `label` (text) — e.g. "Needs assessed", "Skill gained", "Employed"
- `achieved` (boolean)
- `recorded_at` (timestamptz)

**(optional) audit_log** — `id, action, entity, detail, at` — nice-to-have for the "compliance" story; skip if short on time.

> NOTE: golden-record identity matching, consent ledger, and PHI vault are **out of scope for code** — they live in the slides as the production vision (see §11).

---

## 6. API routes & contracts

All under `/app/api/.../route.ts`, Node runtime.

```
POST /api/clients        body: { full_name, primary_language, immigration_stream, program }
                         → creates client + first enrolment + seeds an 'immediate' outcome
                         → { client }

GET  /api/clients        → consolidated list with enrolments + outcome rollup
                         → { clients: [...], metrics: {...} }

POST /api/draft-report   body: { funder, period, metrics }   // metrics computed server-side first
                         → LLM writes narrative grounded ONLY in metrics (see cache safeguard below)
                         → { narrative }

POST /api/query          body: { question, metrics }
                         → LLM answers using ONLY metrics
                         → { answer }

POST /api/export         body: { funder }
                         → builds funder-shaped rows from DB via the mapping engine
                         → { format, rows }   // iCARE bulk-file preview or CaMS worksheet

POST /api/reset          → TRUNCATE all tables, re-run idempotent seed → baseline
                         → { ok: true }
```

### Grounding prompts (use this shape)

**draft-report system prompt:**
> You are an M&E officer at a Canadian newcomer-serving nonprofit. Write a concise, funder-ready outcomes narrative (~180 words, plain professional prose, no headers). Use ONLY the numbers provided in the metrics JSON. Do not invent, estimate, or extrapolate any figure. Use the funder's outcome language.

**query system prompt:**
> Answer the question using ONLY the provided metrics JSON. Be specific and cite the numbers. 2–4 sentences. If the metrics can't answer it, say so plainly.

Always pass `metrics` (the computed numbers) in the user message. The model sees numbers, not raw PII.

### Demo safeguard: pre-cache one showcase report (do this — don't skip)

Free-tier LLMs have rate limits, and a live call can be slow or fail if several judges hit the AI at once. **Never let the demo depend on a live call succeeding under load.** Mitigation:

1. **Pre-generate** the narrative for the funder you'll demo (e.g. IRCC) once, ahead of time, and store the text — in a `cached_reports` table, a JSON file in the repo, or a constant.
2. On `/api/draft-report`, **serve the cached version instantly when it exists** for that funder+period; only call the live LLM on a cache miss or when a "regenerate (live)" toggle is on.
3. This gives you an **instant, reliable** report in the demo, plus the option to show a genuine live generation if conditions are good.

```ts
// in /api/draft-report
const cached = await getCachedReport(funder, period);
if (cached && !body.forceLive) return Response.json({ narrative: cached, cached: true });
const narrative = await generate(SYSTEM, buildUserPrompt(funder, period, metrics));
await saveCachedReport(funder, period, narrative);   // warm the cache
return Response.json({ narrative, cached: false });
```

Same idea optionally for the 2–3 sample questions on the AI Assistant screen: pre-cache their answers so the chips return instantly.

---

## 7. Seed data (synthetic, SfC-grounded)

**Programs → funder mapping:**
| Program | Funder code | Funder / system |
|---|---|---|
| Settlement Services | IRCC | IRCC → OCMS/iCARE (bulk upload) |
| Language Training | IRCC | IRCC → OCMS/iCARE |
| Employment Services | EO | Employment Ontario → EOIS-CaMS (manual) |
| Trades / TWS | EO | Employment Ontario → EOIS-CaMS |
| Mental Health | UW | United Way → custom report |
| Youth | UW | United Way → custom report |
| Mentoring | CITY | City of Toronto → custom report |
| Women / DWC | CITY | City of Toronto → custom report |

**Funder display labels:** IRCC = "IRCC · Settlement", EO = "Employment Ontario", UW = "United Way", CITY = "City of Toronto".

**Volume (seed ~ these totals so dashboard looks real, ~16–18k clients/yr org-wide):**
Settlement 4,120 · Employment 5,380 · Language 3,010 · Mental Health 1,240 · Trades 980 · Mentoring 1,450 · Youth 1,620 · Women 1,340.

**Outcome logic-model tiers (IRCC framework):**
- `immediate` — "Needs assessed & enrolled" (~92% of clients)
- `intermediate` — "Skill / credential gained" (~61%)
- `ultimate` — "Employed / settled" (~37%)

Seed a few **named synthetic clients** with multi-program journeys (e.g. one client enrolled in Settlement then Employment) so the "capture once / consolidated view" story is visible. Make clear in UI these are fabricated.

---

## 8. Screens (4 tabs + reset)

1. **Org Dashboard** (read-only, always pristine): stat cards (total clients, programs, funder systems, est. staff hrs saved), clients-by-program bar chart, outcomes funnel (immediate→intermediate→ultimate). This is the "view they can't get today."
2. **Unified Intake**: pick program → form shows required fields + consent toggle (cross-program). Submit → writes to DB → shows "one record created, queued for funder X" + est. minutes saved. This is the interactive bit judges try.
3. **AI M&E Assistant**: (a) pick funder → "Generate quarterly narrative" → calls `/api/draft-report`. (b) ask a question → `/api/query`. Show sample question chips. Note "grounded in verified data" in the UI.
4. **Funder Export** (the HERO): pick funder → "Build upload file" → calls `/api/export` → renders a formatted table preview (iCARE schema for IRCC; CaMS worksheet for EO). Include the honesty line: funder systems don't allow live integration, so OneView generates the file.
5. **Reset demo** button (header): confirm dialog → `/api/reset`.

---

## 9. Build sequence (protect this order)

1. Scaffold Next.js + Tailwind + Postgres + idempotent seed script. Deploy a "hello" to Vercel **early** to prove the pipeline.
2. Dashboard reading seeded data.
3. Intake (write path) + reset.
4. Export tab (the hero) — make it shine.
5. AI routes (draft-report + query). Build UI against a stub first, swap in the LLM last. **Warm the report cache** (pre-generate the showcase narrative) before rehearsal.
6. **HARD STOP on features** → polish, demo script, rehearse the click-path on the live URL.

Get to a deployed, demoable state by step 4. Everything after is upside.

---

## 10. Vercel deployment notes / gotchas

- Set `ANTHROPIC_API_KEY` in Vercel → Settings → Environment Variables. **Redeploy** after adding.
- API routes hitting Postgres or the SDK: `export const runtime = 'nodejs'` (not Edge).
- Watch serverless **function timeout** on the free tier — stream the report or keep `max_tokens` modest.
- **Idempotent seed:** reset must `TRUNCATE` then insert; runnable infinitely.
- **Shared DB caveat:** all judges share one database. Either accept that entries are visible to all, or scope rows by a session id. Decide before building intake.
- Put a **confirm step** on Reset so no one wipes data mid-demo.
- Never commit the API key. If it leaks to a public repo, rotate it.
- A `*.vercel.app` subdomain is fine for judging — no custom domain needed.

---

## 11. OUT OF SCOPE for code (stays in the slides as the production vision)

Do **not** build these in 24h — present them as the roadmap:
- Golden-record identity matching / dedupe
- Full versioned **consent ledger**
- **PHI vault** partition for Mental Health data (PHIPA)
- Real iCARE / EOIS-CaMS file-format fidelity (exact schemas aren't public — needs SfC discovery)
- Role-based access, audit, Privacy Impact Assessment, Canadian data residency
- Multi-stack (Microsoft/Google/OSS) adapters

---

## 12. Domain reference facts (for accuracy)

- **Settlement programs** report to **IRCC** via **OCMS → iCARE**; mechanism = **bulk file upload** (IRCC-endorsed).
- **Employment programs** report to **Employment Ontario** via **EOIS-CaMS**; CaMS **does not integrate with external systems** → manual entry, so OneView outputs a pre-filled worksheet.
- **United Way / City of Toronto** → custom stat + narrative reports.
- **IRCC logic model tiers:** immediate → intermediate → ultimate outcomes.
- Real deployment privacy regimes (mention, don't build): federal **Privacy Act** (IRCC), **FIPPA** (Employment Ontario), **PHIPA** (mental health), possibly **CYFSA Part X** (youth). Consolidation requires consent-scoping + PHI partition + a PIA.

---

## 13. Demo-safety checklist

- [ ] All data labelled synthetic in the UI
- [ ] Reset works and is confirm-gated
- [ ] AI never shows a number that isn't in the computed metrics
- [ ] **Showcase report (and sample-question answers) pre-cached so the demo never waits on / fails a live call**
- [ ] `LLM_PROVIDER` set + `LLM_API_KEY` valid in Vercel; redeployed after setting
- [ ] Export tab clearly explains the file boundary (no fake live sync)
- [ ] Live URL loads fast on mobile (judges may use phones)
- [ ] One clean end-to-end click-path rehearsed: intake → dashboard updates → export → AI narrative

---

*When the build is done, return to the planning chat with: the live URL, what shipped vs. cut, the real seed numbers used, and the final click-path — to build the pitch deck around the four judging criteria (Desirability, Feasibility, Viability, Functionality).*
