"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Cpu, BarChart3, X } from "lucide-react"

function waitForElement(selector: string, timeout = 5000): Promise<boolean> {
  if (typeof document !== "undefined" && document.querySelector(selector)) return Promise.resolve(true)
  return new Promise(resolve => {
    const start = Date.now()
    const id = setInterval(() => {
      if (document.querySelector(selector)) { clearInterval(id); resolve(true) }
      else if (Date.now() - start > timeout) { clearInterval(id); resolve(false) }
    }, 100)
  })
}

function waitForEvent<T = unknown>(name: string, timeout = 8000): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      window.removeEventListener(name, handler)
      reject(new Error(`Timeout waiting for ${name}`))
    }, timeout)
    function handler(e: Event) {
      clearTimeout(id)
      window.removeEventListener(name, handler)
      resolve((e as CustomEvent).detail as T)
    }
    window.addEventListener(name, handler)
  })
}

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

export default function DemoTour() {
  const router = useRouter()
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    function onStartDemo() { setShowPicker(true) }
    window.addEventListener("start-demo", onStartDemo)
    return () => window.removeEventListener("start-demo", onStartDemo)
  }, [])

  async function startJourneyFlow() {
    setShowPicker(false)
    const { driver } = await import("driver.js")
    await import("driver.js/dist/driver.css")

    router.push("/intake?role=admin")
    await waitForElement("#intake-form", 6000)
    await delay(400)

    window.dispatchEvent(new CustomEvent("demo:fill-intake", { detail: {
      full_name: "Layla Hassan",
      phone: "+1 416-555-0192",
      email: "layla.hassan@email.com",
      primary_language: "Somali",
      immigration_stream: "Refugee",
      country_of_origin: "Somalia",
      age_group: "25-34",
      gender: "Woman",
      source: "Referral from partner",
      program: "employment",
      consent_cross_program: true,
      consent_data_use: true,
      consent_followup: true,
      consent_aggregate: true,
    }}))
    await delay(600)

    const d = driver({
      animate: true,
      overlayColor: "rgba(6,6,16,0.60)",
      smoothScroll: true,
      allowClose: true,
      stagePadding: 8,
      popoverClass: "oneview-tour",
    })

    let registeredClientId = ""

    d.setSteps([
      {
        element: "#intake-form",
        popover: {
          title: "Registering Layla Hassan",
          description: "A refugee from Somalia enrolling in Employment Services. The form is pre-filled with contact details, demographics, and data consent including cross-program sharing. Click Next to register her.",
          side: "right" as const,
          onNextClick: async () => {
            try {
              const submitBtn = document.querySelector('[data-tour="intake-submit"]') as HTMLButtonElement | null
              submitBtn?.click()
              const { clientId } = await waitForEvent<{ clientId: string }>("demo:intake-registered", 8000)
              registeredClientId = clientId
              router.push(`/journeys?clientId=${clientId}&role=admin`)
              await waitForEvent("demo:journey-loaded", 8000)
              await delay(300)
            } catch { /* let tour continue */ }
            finally { d.moveNext() }
          },
        },
      },
      {
        element: "[data-tour='journey-stage-bar']",
        popover: {
          title: "Pipeline stages",
          description: "Layla starts at Intake. The stage bar tracks her from Outreach to Complete. Caseworkers click any stage to advance. Every change is logged in the audit trail.",
          side: "bottom" as const,
        },
      },
      {
        element: "[data-tour='journey-outcomes']",
        popover: {
          title: "Three outcome tiers seeded at intake",
          description: "Immediate, Intermediate, and Ultimate outcomes are created automatically at enrollment. Click Next to mark all three achieved and then enroll Layla in Mental Health Support.",
          side: "bottom" as const,
          onNextClick: async () => {
            try {
              // Mark each employment outcome achieved using a fixed delay per toggle
              for (let i = 0; i < 3; i++) {
                const btn = document.querySelector('[data-tour="journey-outcomes"] button[title="Mark as achieved"]') as HTMLButtonElement | null
                if (!btn) break
                btn.click()
                await delay(1000)
              }
              // Open Add Program panel and pre-select Mental Health
              const addBtn = document.querySelector('[data-tour="journey-add-program"] button') as HTMLButtonElement | null
              addBtn?.click()
              await delay(500)
              window.dispatchEvent(new CustomEvent("demo:set-new-program", { detail: { program: "mental_health" } }))
              await delay(300)
            } catch { /* continue */ }
            finally { d.moveNext() }
          },
        },
      },
      {
        element: "[data-tour='journey-add-program']",
        popover: {
          title: "Adding Mental Health Support",
          description: "Layla needs mental health services too. Selecting Mental Health enforces the PHIPA wall via Row Level Security. No cross-program query can touch these records. Click Next to enroll.",
          side: "bottom" as const,
          onNextClick: async () => {
            try {
              const buttons = document.querySelectorAll('[data-tour="journey-add-program"] button')
              const enrolBtn = Array.from(buttons).find(b => b.textContent?.trim() === "Enroll") as HTMLButtonElement | null
              if (enrolBtn) {
                enrolBtn.click()
                await waitForEvent("demo:journey-loaded", 8000)
                await waitForElement('[data-tour="journey-phi-card"]', 3000)
                await delay(300)
              }
            } catch { /* continue */ }
            finally { d.moveNext() }
          },
        },
      },
      {
        element: "[data-tour='journey-phi-card']",
        popover: {
          title: "PHIPA wall active",
          description: "Mental Health records are walled off by Row Level Security in Postgres. No aggregate report, AI prompt, or cross-program query can include this data, regardless of role or consent flags.",
          side: "right" as const,
        },
      },
      {
        element: "[data-tour='journey-notes']",
        popover: {
          title: "Caseworker notes",
          description: "Every client interaction is documented here. Click Next to record a progress note and mark all Mental Health outcomes achieved before closing the journey.",
          side: "top" as const,
          onNextClick: async () => {
            try {
              // Save the caseworker note
              window.dispatchEvent(new CustomEvent("demo:fill-note", { detail: {
                content: "Layla completed the resume workshop and three mock interviews. Strong candidate for software QA roles. Referred for job placement support. Client motivated and ready to proceed.",
                noteType: "interview",
              }}))
              await delay(400)
              const saveBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent?.trim() === "Save Note") as HTMLButtonElement | null
              if (saveBtn && !saveBtn.disabled) {
                saveBtn.click()
                await delay(1000)
              }
              // Mark all remaining Mental Health outcomes achieved before advancing
              let remaining = document.querySelectorAll('button[title="Mark as achieved"]')
              let safetyCount = 0
              while (remaining.length > 0 && safetyCount < 10) {
                safetyCount++
                ;(remaining[0] as HTMLButtonElement).click()
                await delay(1000)
                remaining = document.querySelectorAll('button[title="Mark as achieved"]')
              }
            } catch { /* continue */ }
            finally { d.moveNext() }
          },
        },
      },
      {
        element: "[data-tour='journey-complete-btn']",
        popover: {
          title: "All outcomes achieved",
          description: "All Employment and Mental Health outcomes are marked complete. Click Next to open the journey completion dialog and generate Layla's survey link.",
          side: "bottom" as const,
          onNextClick: async () => {
            try {
              const completeBtn = document.querySelector('[data-tour="journey-complete-btn"]') as HTMLButtonElement | null
              if (completeBtn) {
                completeBtn.click()
                // Wait until the dialog is actually rendered before advancing
                await waitForElement('[data-tour="journey-complete-dialog"]', 4000)
                await delay(200)
              }
            } catch { /* continue */ }
            finally { d.moveNext() }
          },
        },
      },
      {
        element: "[data-tour='journey-complete-dialog']",
        popover: {
          title: "Survey link ready to send",
          description: "OneView generates a unique survey link for Layla. In production this goes to her by email automatically. Caseworkers can also copy and resend the link at any time. Click Next to send it and close the journey.",
          side: "top" as const,
          onNextClick: async () => {
            try {
              // Ensure the dialog is open; re-open if it somehow closed
              let sendBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent?.includes("Send Survey")) as HTMLButtonElement | null
              if (!sendBtn) {
                const completeBtn = document.querySelector('[data-tour="journey-complete-btn"]') as HTMLButtonElement | null
                completeBtn?.click()
                await waitForElement('[data-tour="journey-complete-dialog"]', 3000)
                sendBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent?.includes("Send Survey")) as HTMLButtonElement | null
              }
              if (sendBtn) {
                sendBtn.click()
                await delay(2000)
              }
              if (registeredClientId) {
                router.push(`/survey/${registeredClientId}`)
                await waitForEvent("demo:survey-form-ready", 12000)
                window.dispatchEvent(new CustomEvent("demo:fill-survey", { detail: {
                  satisfaction: 5,
                  wouldRecommend: true,
                  barriers: "",
                  successStory: "Thanks to the employment program, I found a full-time role as a software tester within three months. Skills for Change changed everything for my family.",
                }}))
                await delay(400)
              }
            } catch { /* continue */ }
            finally { d.moveNext() }
          },
        },
      },
      {
        element: "#survey-satisfaction",
        popover: {
          title: "Layla's exit survey: 5 stars",
          description: "The survey form is pre-filled. In production, this link goes directly to the client by email. Click Next to submit.",
          side: "bottom" as const,
          onNextClick: async () => {
            try {
              window.dispatchEvent(new CustomEvent("demo:submit-survey"))
              await waitForEvent("demo:survey-done", 10000)
              router.push(`/journeys?clientId=${registeredClientId}&role=admin`)
              await waitForEvent("demo:journey-loaded", 8000)
              await waitForElement('[data-tour="journey-survey-result"]', 5000)
              await delay(300)
            } catch { /* continue */ }
            finally { d.moveNext() }
          },
        },
      },
      {
        element: "[data-tour='journey-survey-result']",
        popover: {
          title: "Journey complete",
          description: "Layla's rating and success story are captured. They feed directly into program analytics and AI-generated insights. The full journey: intake, enrollments, outcomes, and survey, is now audited and reportable to every funder.",
          showButtons: ["close"],
        },
      },
    ])

    d.drive()
  }

  async function startReportingFlow() {
    setShowPicker(false)
    const { driver } = await import("driver.js")
    await import("driver.js/dist/driver.css")

    router.push("/analytics?role=admin")
    await waitForElement("#analytics-hero-metrics", 6000)

    const d = driver({
      animate: true,
      overlayColor: "rgba(6,6,16,0.60)",
      smoothScroll: true,
      allowClose: true,
      stagePadding: 8,
      popoverClass: "oneview-tour",
    })

    d.setSteps([
      {
        element: "#analytics-hero-metrics",
        popover: {
          title: "Live program metrics",
          description: "Satisfaction rate, placement rate, drop-off rate, and survey count. Each figure is computed directly from Postgres. No pivot tables, no manual refresh.",
          side: "bottom" as const,
        },
      },
      {
        element: "#analytics-trend",
        popover: {
          title: "Monthly intake trend",
          description: "Funders ask about intake volume growth every quarter. This chart answers that question from live data, not a spreadsheet that someone last updated three weeks ago.",
          side: "top" as const,
        },
      },
      {
        element: "[data-tour='export']",
        popover: {
          title: "Funder CSV export",
          description: "Each funder requires a different column specification. Click Next to open Export and see IRCC, Employment Ontario, United Way, and City of Toronto exports generated on demand.",
          side: "right" as const,
          onNextClick: async () => {
            try {
              router.push("/export?role=admin")
              await waitForElement('[data-tour="export-funders"]', 6000)
              await delay(200)
            } catch { /* continue */ }
            finally { d.moveNext() }
          },
        },
      },
      {
        element: "[data-tour='export-funders']",
        popover: {
          title: "Four funders, exact column specs",
          description: "Select any funder to generate a compliance-ready CSV shaped to their portal's exact specification. IRCC gets iCARE format. Employment Ontario gets EOIS-CaMS format. The file downloads in seconds.",
          side: "top" as const,
        },
      },
      {
        element: "[data-tour='ai']",
        popover: {
          title: "AI narrative reports",
          description: "The written report comes next. Click Next to open the AI Report Writer. SQL has already computed all the figures; the AI writes prose around verified numbers only.",
          side: "right" as const,
          onNextClick: async () => {
            try {
              router.push("/ai?role=admin")
              await waitForElement('[data-tour="ai-report-section"]', 6000)
              await delay(200)
            } catch { /* continue */ }
            finally { d.moveNext() }
          },
        },
      },
      {
        element: "[data-tour='ai-report-section']",
        popover: {
          title: "Narrative from live SQL",
          description: "Select a funder and reporting period, then click Generate Report. The LLM receives a grounded metrics snapshot: no PII, no individual records, only verified aggregates. A compliance-ready narrative appears in seconds.",
          side: "bottom" as const,
        },
      },
      {
        element: "[data-tour='audit']",
        popover: {
          title: "Audit log",
          description: "Every write operation is logged with timestamp, role, and IP. PHIPA, FIPPA, and MFIPPA all require audit trails. Click Next to view the full record.",
          side: "right" as const,
          onNextClick: async () => {
            try {
              router.push("/audit?role=admin")
              await waitForElement('[data-tour="audit-table"]', 6000)
              await delay(200)
            } catch { /* continue */ }
            finally { d.moveNext() }
          },
        },
      },
      {
        element: "[data-tour='audit-table']",
        popover: {
          title: "Complete audit trail",
          description: "Every intake, stage change, note, consent update, and export is captured here automatically. No staff action required. Exportable for compliance review on demand.",
          showButtons: ["close"],
        },
      },
    ])

    d.drive()
  }

  if (!showPicker) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0d0d1e] border border-white/[0.12] rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-sora text-xl text-white">Choose a demo flow</h2>
            <p className="text-slate-500 text-sm mt-0.5">Both flows run with live data.</p>
          </div>
          <button onClick={() => setShowPicker(false)} className="text-slate-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={startJourneyFlow}
            className="flex items-start gap-4 p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-left transition-colors group"
          >
            <div className="p-2.5 rounded-lg bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500/25 transition-colors flex-shrink-0">
              <Cpu size={20} />
            </div>
            <div>
              <div className="text-white font-medium text-sm">Client Journey</div>
              <div className="text-slate-400 text-xs mt-1 leading-relaxed">Intake to complete: register Layla Hassan, track pipeline stages, toggle outcomes, add Mental Health (PHIPA wall), close with exit survey.</div>
            </div>
          </button>
          <button
            onClick={startReportingFlow}
            className="flex items-start gap-4 p-5 rounded-xl border border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10 text-left transition-colors group"
          >
            <div className="p-2.5 rounded-lg bg-indigo-500/15 text-indigo-400 group-hover:bg-indigo-500/25 transition-colors flex-shrink-0">
              <BarChart3 size={20} />
            </div>
            <div>
              <div className="text-white font-medium text-sm">Reporting</div>
              <div className="text-slate-400 text-xs mt-1 leading-relaxed">Analytics, funder CSV export, AI narrative generation, and audit log: everything a program director needs for a quarterly funder submission.</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
