# OneView — Context, Research & Judging Reference

> Companion to **OneView-BUILD-SPEC.md**. The build spec says *what* to build; this says *why*.
> Use it to keep every build decision aligned with the client's reality and the judging rubric.
> Hackathon client: **Skills for Change** (Toronto). Solo full-stack build, ~24h, deploy to Vercel.

---

## 0. Confidence key (read first)

Throughout, facts are tagged:
- **[Confirmed]** — verified via research / official sources.
- **[Inferred]** — reasonable deduction, not confirmed; phrase carefully on stage.
- **[Design]** — our proposed design, not an observed fact about the client.

Three things to never overstate:
1. SfC's stack is Microsoft **[Inferred]** from their public forms running on forms.office.com. Say "their existing Microsoft environment," not "they have Power Platform licensed."
2. The Amara user journey and cross-program client linking are **[Design]**, built on sector norms — validate with SfC, don't assert as their current workflow.
3. Exact iCARE / EOIS-CaMS file schemas are **not public** — a real build needs SfC's templates in a discovery phase.

---

## 1. The organization

- **Legal name:** Skills for Change of Metro Toronto. Founded **1982**. Registered charity **BN 121471858RR0001**. **[Confirmed]**
- **Scale:** **16,000–20,000 clients/year**, **25+ programs**, 3 offices (2 Toronto, 1 Hamilton), **unionized** workforce. **[Confirmed]**
- **Mission:** employment, settlement, language, mentorship, entrepreneurship for newcomers, refugees, women, youth, seniors, Black communities, and employers.
- **Operating budget:** not published as one figure; grant footprint suggests low-double-digit millions. **[Inferred]** — pull exact total revenue from CRA Charities Listing / CharityData.ca by BN for the deck.

### Strategic context that matters
- **Google.org AI Opportunity Fund (June 2025):** SfC is **1 of 4 Canadian orgs**, receiving **~$2.7M CAD**, to launch an AI-skilling program for communities with high unemployment. **[Confirmed]**
  - **Implication:** AI is already in SfC's strategy and they have a Google relationship → an internal AI tool that mirrors their external AI mission resonates with this leadership; defaulting the demo LLM to **Gemini (free)** is narratively coherent.
  - **Caveat:** that money is for *client-facing* AI training, **not** internal tools. Never imply it funds OneView.
- **Example funder contract:** IRCC "Arrive Ready" pre-arrival agreement = **~$1.95M over Apr 2025–Mar 2028**. **[Confirmed]** Illustrates the contract-heavy, multi-agreement revenue model.

---

## 2. The problem (this is the brief)

The challenge has **two halves** — most teams will only build the first:
1. **Consolidate** fragmented client data across programs into one org-wide picture.
2. **Keep feeding the funder systems** — continue meeting reporting/compliance obligations to each funder platform.

The second half is the hard, valuable part. OneView is built around it.

### Why the data is fragmented (sector-documented pain) **[Confirmed]**
- Each program answers to a different funder with its own mandatory system.
- The same client gets entered multiple times into multiple systems → duplicate work, inconsistent data, reports that don't reconcile.
- Data is **trapped in funder systems**, so the org can't do its own internal trend analysis or tell its own story.
- Staff/volunteer turnover makes manual, undocumented workflows fragile.

### The three official challenges (OneView addresses all three in one flow)
1. **AI-enabled M&E framework** → the AI brain (deterministic metrics → LLM narrative → human sign-off).
2. **Integrated data system / CRM** → the consolidation spine + funder-reporting layer.
3. **Change management (unionized workplace)** → solved *by design*: OneView reduces workload (capture once instead of 3×), so it's "time back," not "new surveillance."

---

## 3. Funder → system map (the integration reality) **[Confirmed]**

| Program area | Funder | System | Integration mechanism |
|---|---|---|---|
| Settlement, Language | **IRCC** (federal) | **OCMS → iCARE** | **Bulk file upload** — IRCC-endorsed; ~75% of records already arrive this way |
| Employment, Trades | **Employment Ontario** | **EOIS-CaMS** (IBM Cúram) | **No external integration** — manual entry; OneView outputs a pre-filled worksheet |
| Mental Health, Youth | **United Way** | custom | custom stat + narrative report |
| Mentoring, Women | **City of Toronto** | custom | custom report |

**THE decision-driving fact:** funder systems (iCARE, EOIS-CaMS) **do not accept live API integration**. EOIS-CaMS explicitly won't integrate with external systems (compatibility + privacy). So OneView's boundary is **files, not APIs**. Anyone drawing a live API arrow into a funder system is wrong, and informed judges/SfC staff will catch it.

**IRCC logic model (outcome tiers)** — use these for M&E rollups:
`immediate` (e.g. needs assessed & enrolled) → `intermediate` (skills/credential gained) → `ultimate` (employed/settled).

---

## 4. Competitor landscape & the wedge

### What exists **[Confirmed]**
- **Salesforce Nonprofit Cloud / Agentforce Nonprofit** — the gorilla. 10 free licenses (Power of Us), then **$36–60/user/mo, up to $300/user/mo for AI editions**; implementation **$10–30k**; needs a dedicated admin/consultant. **Already has AI** (Einstein Copilot / Agentforce: summaries, program performance summaries, drafting). → You **cannot** pitch "AI on a CRM" as novel.
- **Bonterra Apricot, CaseWorthy, Penelope, Casebook, Sumac, Exponent** — purpose-built case management; custom-quote pricing that escalates; heavier ones need real IT.
- **OCMS** (OCASI) — the sector's own CRM for settlement; fee-based; settlement-specific.

### The insight that none of them solve
Every one of these replaces your **internal** system of record — but **none push data into iCARE / EOIS-CaMS / OCMS**, because those funders block integration. So even after buying Salesforce, a caseworker **still re-keys every client into the funder portals by hand.** The incumbents leave the actual pain untouched.

### Positioning (commit to this)
**OneView is NOT a CRM. It's the last-mile funder-reporting + AI M&E layer that sits on top of whatever system of record the agency already uses (OCMS, spreadsheets, even Salesforce).**
- This makes every CRM a **complement, not a competitor.**
- It's more **feasible** (not rebuilding Salesforce) and more **defensible** (no product does it for the Canadian settlement sector).
- Headline: *"Everyone will build a CRM. The reason ours can't be bought off the shelf — and the reason it saves SfC money — is the funder layer underneath."*

---

## 5. Budget / cost story (viability) **[Confirmed pricing; figures illustrative]**

| | Buy off-the-shelf CRM + AI | OneView layer |
|---|---|---|
| Internal client database | ✅ | ✅ (or reuses theirs) |
| AI summaries / report drafting | ✅ (Einstein/Agentforce) | ✅ |
| **Feeds iCARE / EOIS-CaMS** | ❌ funders block it | ✅ generates the files |
| **Staff stop re-keying into funder portals** | ❌ | ✅ (the whole point) |
| Upfront | ~$10–30k implementation | Low — on tools they already have |
| Ongoing | ~$40k+/yr beyond 10 free seats | Pennies per AI report (Gemini free tier ≈ $0) |
| Maintenance | dedicated admin / consultant | low-code, staff-maintainable |

**Killer line:** the incumbent costs more **and** still leaves staff re-keying into iCARE and CaMS.

**Honesty caveats for the cost slide:**
- "~$0 software" only holds on a stack they already pay for; new premium licensing (e.g. premium Power Apps, paid LLM capacity) = a real number → "scoped in discovery."
- Build cost is real even if licenses aren't (someone's time). Mitigant: low-code, staff-maintainable.
- AI cost is variable per call, tiny, not flat-free (unless on a free tier).

---

## 6. Privacy & compliance (feasibility credibility) **[Confirmed law; some application Inferred]**

Different programs sit under **different laws at once** — this is why "one master record" is a consent-and-governance problem, not a free-for-all:
- **Settlement (IRCC):** federal **Privacy Act**; SfC collects under consent, reports per its Contribution Agreement.
- **Employment (Employment Ontario):** **FIPPA**; consent statement collected at registration.
- **Mental Health:** **PHIPA** — covers mental-health info and "mixed records." The sharpest constraint. **[Inferred: SfC may be a health-info custodian.]**
- **Youth:** possibly **CYFSA Part X**.
- **Nonprofit baseline:** **PIPEDA** generally exempts nonprofits unless engaged in commercial activity; Ontario has no general private-sector law → a patchwork.

**Privacy-by-design requirements (these stay in slides as the production vision — NOT built in 24h):**
consent-scoped consolidation · per-funder field scoping on export · **PHI partition** for mental-health data · role-based access · data minimization · **Canadian data residency** · immutable audit · **Privacy Impact Assessment before go-live** (mirroring IRCC's own iCARE PIA).

**On stage:** naming "settlement is federal, employment is FIPPA, mental health is PHIPA — so we consent-scope and partition health data, validated by a PIA" signals maturity most teams miss → scores **feasibility**.

**In the build:** the `consent_cross_program` flag on enrolments is the *visible nod* to this. Don't build the full consent ledger or PHI vault.

---

## 7. Judging criteria & how OneView maps

The rubric is the **IDEO desirability–feasibility–viability** lens (plus functionality). Note what's **absent**: no prize for raw innovation or technical wizardry. They reward a **credible, executable, cost-saving** solution. Don't over-engineer.

### 1. Desirability — *Does it address a distinct pain point? Clear addressable market / internal need?*
- Pain is real and documented (duplicate entry; data trapped in funder systems).
- "Addressable market" hint → mention this could scale to **other settlement agencies** (80+ in BC's umbrella alone; hundreds on OCMS). That's also a revenue angle.
- **Win it by:** opening on "the view they can't get today" + the duplicate-entry intake moment.

### 2. Feasibility — *Can SfC build/execute it well? Great UX?*
- The constraint: SfC is resource-limited, unionized, light IT. A heavy custom CRM **scores badly here**.
- **Win it by:** the "sits on tools they already have," low-code, staff-maintainable framing; the funder-file boundary (shows you understand the systems won't integrate); the privacy-by-design slide; simple UX for non-technical caseworkers.

### 3. Viability — *Clear value prop? Generates revenue / saves cost?*
- **Win it by:** the buy-vs-build TCO table (§5); quantified staff-hours saved; AI-is-cheap; the scale-to-other-agencies upside. Swap in SfC's real staff-seat count to make the $/yr concrete.

### 4. Functionality — *How does it work? Maturity of the prototype.*
- **Win it by:** the live Vercel URL judges can use; one clean end-to-end flow that actually works (intake → dashboard → export → AI narrative); the deterministic-metrics + grounded-AI design (no hallucinated numbers). Depth on one slice > breadth across five.

---

## 8. The end-to-end flow (for narration) **[Design — validate with SfC]**

1. **Capture once:** staff enter a client once; the form shows the chosen program's funder fields + consent.
2. **One master record:** consolidated store; a returning client (e.g. Settlement → Employment) links to the existing record — **consent-gated**, not automatic.
3. **Mapping engine:** every field tagged to the funder schema(s) that need it (config-driven, not hardcoded — so a funder schema change = edit config, not rewrite code).
4. **Last mile:** generate iCARE bulk file (upload via OCMS) / CaMS worksheet (fast manual entry) / custom reports.
5. **AI M&E brain:** consolidated data rolls up to logic-model tiers; AI drafts funder narratives from verified numbers; managers review + sign off; plain-language Q&A.
6. **Adoption loop:** less work for frontline staff = the change-management message for a unionized shop.

Composite personas for the demo (label as fabricated): **Amara** (client), **Fatima** (settlement counsellor), **David** (employment caseworker), **Priya** (program manager / M&E).

---

## 9. Sources (for verification / the deck)

- Skills for Change site & programs: https://skillsforchange.org
- Google.org AI Opportunity Fund (~$2.7M to SfC): https://betakit.com/google-allocates-13-million-in-funding-to-strengthen-canadas-ai-workforce/ ; SfC announcement: https://skillsforchange.org/google-ai-opportunity-fund-announcement
- IRCC "Arrive Ready" contribution: https://search.open.canada.ca/grants/record/cic,094-2024-2025-Q4-O268719007,current
- OCMS (OCASI Client Management System): https://ocasi.org/ocasi-client-management-system-ocms
- iCARE bulk upload / settlement data: https://www.canada.ca/content/dam/ircc/documents/pdf/english/corporate/settlement-resettlement-service-provider-information/data-research-reports/core-data-sources-settlement-resettlement.pdf
- EOIS-CaMS (no external integration): https://eopg.labour.gov.on.ca/en/resources/employment-ontario-information-systems/
- AMSSA sector CRM review (sector pain): https://km4s.ca/wp-content/uploads/CRM-Client-Management-Solutions-sector-review-AMSSA-2022.pdf
- Salesforce nonprofit pricing / Power of Us: https://www.salesforce.com/nonprofit/pricing/ ; TCO/implementation: https://pricingnow.com/question/salesforce-org-nonprofit-cloud-pricing/
- Privacy: PIPEDA/PHIPA overview: https://crpo.ca/resource-articles/personal-health-information-protection-act-phipa/ ; Ontario info-sharing guidance (FIPPA/PHIPA/CYFSA): https://www.ontario.ca/page/guidance-information-sharing
- IRCC Privacy Act / iCARE PIA: https://www.canada.ca/en/immigration-refugees-citizenship/corporate/transparency/access-information-privacy/privacy-impact-assessment/arrival-services-modules.html

---

*Pairs with OneView-BUILD-SPEC.md. Keep both open while building so technical choices stay tied to what scores.*
