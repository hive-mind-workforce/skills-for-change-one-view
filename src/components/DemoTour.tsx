"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DemoTour() {
  const router = useRouter()

  useEffect(() => {
    const startTour = async () => {
      const { driver } = await import("driver.js")
      await import("driver.js/dist/driver.css")

      const role = new URLSearchParams(window.location.search).get("role") ?? "admin"
      const qs = window.location.search

      function waitForElement(selector: string, timeout = 4000): Promise<boolean> {
        if (document.querySelector(selector)) return Promise.resolve(true)
        return new Promise(resolve => {
          const start = Date.now()
          const id = setInterval(() => {
            if (document.querySelector(selector)) {
              clearInterval(id)
              resolve(true)
            } else if (Date.now() - start > timeout) {
              clearInterval(id)
              resolve(false)
            }
          }, 100)
        })
      }

      // Always start from dashboard so first-step elements are present
      if (window.location.pathname !== "/") {
        router.push(`/${qs}`)
        await waitForElement("#dashboard-hero", 4000)
      }

      const driverObj = driver({
        animate: true,
        overlayColor: "rgba(6,6,16,0.88)",
        smoothScroll: true,
        allowClose: true,
        stagePadding: 8,
        popoverClass: "oneview-tour",
      })

      const adminJourney = [
        {
          element: "#dashboard-hero",
          popover: {
            title: "Marcus needs to file Q1 reports — today",
            description: "Programs Director at Skills for Change. Four funders, four different column specs, one deadline. He opens OneView instead of five Excel spreadsheets and four funder portals.",
            side: "bottom",
          },
        },
        {
          element: "#metric-cards",
          popover: {
            title: "Live metrics — no spreadsheet needed",
            description: "Active clients, outcome rates, cross-program enrolments — all computed live from the database. The numbers Marcus needs for his narrative are already here.",
            side: "bottom",
          },
        },
        {
          element: "#program-chart",
          popover: {
            title: "Program breakdown at a glance",
            description: "Employment and Trades are at capacity. Settlement has room. This context goes straight into the funder narratives — no manual chart building.",
            side: "top",
          },
        },
        {
          element: "[data-tour=export]",
          popover: {
            title: "Step 1: Generate the IRCC submission",
            description: "Marcus clicks Export. He selects IRCC. OneView shapes the CSV to iCARE's exact column specification — 312 client records, ready for bulk upload in seconds.",
            side: "right",
            onNextClick: () => {
              router.push(`/export${qs}`)
              waitForElement("[data-tour=ai]", 4000).then(() => driverObj.moveNext())
            },
          },
        },
        {
          element: "[data-tour=ai]",
          popover: {
            title: "Step 2: Generate the narrative report",
            description: "CSV filed. Now the written report. Marcus opens AI Report Writer. SQL has already computed all the figures — the AI writes prose around verified numbers only. No hallucinations.",
            side: "right",
            onNextClick: () => {
              router.push(`/ai${qs}`)
              waitForElement("#ai-hero,main", 4000).then(() => driverObj.moveNext())
            },
          },
        },
        {
          popover: {
            title: "Four funders. Under 10 minutes.",
            description: "Marcus repeats for Employment Ontario, United Way, and City of Toronto. What used to take weeks of copy-pasting and narrative writing now takes a single session. The data was always there — OneView just makes it usable.",
            showButtons: ["close"],
          },
        },
      ]

      const caseworkerJourney = [
        {
          element: "#dashboard-hero",
          popover: {
            title: "Amara's shift starts",
            description: "Settlement caseworker at Skills for Change. She checks the dashboard — 47 active clients this week, 68% with outcomes on track. Then a new client walks in.",
            side: "bottom",
          },
        },
        {
          element: "#metric-cards",
          popover: {
            title: "Everything she needs to start the conversation",
            description: "Cross-program enrolments, active counts, outcomes achieved — Amara can see the full picture before the intake session begins. No separate system to check.",
            side: "bottom",
          },
        },
        {
          element: "[data-tour=intake]",
          popover: {
            title: "One form. Every program.",
            description: "A new client just arrived from Ethiopia. Amara clicks Register a Client. The same form covers all programs — she enters the client's details once, not once per funder.",
            side: "right",
            onNextClick: () => {
              router.push(`/intake${qs}`)
              waitForElement("#intake-form", 4000).then(() => driverObj.moveNext())
            },
          },
        },
        {
          element: "#intake-form",
          popover: {
            title: "Details captured once, available everywhere",
            description: "Name, language, immigration stream, program. Amara selects Settlement — OneView automatically resolves the correct funder (IRCC). No lookup, no manual mapping.",
            side: "right",
          },
        },
        {
          popover: {
            title: "Outcomes tracking starts at registration",
            description: "When Amara submits, OneView seeds three outcome tiers — immediate, intermediate, and ultimate — for the client's program. No follow-up data entry. No separate outcomes spreadsheet. The system tracks from day one.",
            showButtons: ["close"],
          },
        },
      ]

      const viewerJourney = [
        {
          element: "#dashboard-hero",
          popover: {
            title: "Board member review — no data request needed",
            description: "A board member checks in before the quarterly meeting. She's logged in as Viewer — aggregate data only, no individual client records, no PII.",
            side: "bottom",
          },
        },
        {
          element: "#metric-cards",
          popover: {
            title: "The numbers that matter, always current",
            description: "Active clients, outcomes achieved, cross-program enrolments. She has what she needs for the funding conversation without asking staff for a report.",
            side: "bottom",
          },
        },
        {
          element: "#program-chart",
          popover: {
            title: "Relative program performance",
            description: "Mental Health and Employment are at capacity. Youth has room to grow. This context shapes the board's priorities — visible at a glance, no presentation needed.",
            side: "top",
          },
        },
        {
          element: "[data-tour=about]",
          popover: {
            title: "Full documentation — always available",
            description: "The About section includes architecture diagrams, privacy compliance maps, and the full migration plan. Accessible to all roles including Viewer.",
            side: "right",
          },
        },
        {
          popover: {
            title: "Access boundaries enforced by the system",
            description: "Intake, Export, and AI Report Writer are locked for Viewers. The system enforces this structurally — no accidental access to PII, no funder data exposure. Role switching is in the top bar.",
            showButtons: ["close"],
          },
        },
      ]

      const journeys: Record<string, object[]> = { admin: adminJourney, caseworker: caseworkerJourney, viewer: viewerJourney }
      driverObj.setSteps(journeys[role] ?? adminJourney)
      driverObj.drive()
    }

    window.addEventListener("start-demo", startTour)
    return () => window.removeEventListener("start-demo", startTour)
  }, [router])

  return null
}
