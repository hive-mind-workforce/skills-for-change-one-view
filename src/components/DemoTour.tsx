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

      function waitForElement(selector: string, timeout = 5000): Promise<boolean> {
        if (document.querySelector(selector)) return Promise.resolve(true)
        return new Promise(resolve => {
          const start = Date.now()
          const id = setInterval(() => {
            if (document.querySelector(selector)) {
              clearInterval(id); resolve(true)
            } else if (Date.now() - start > timeout) {
              clearInterval(id); resolve(false)
            }
          }, 100)
        })
      }

      if (window.location.pathname !== "/") {
        router.push(`/${qs}`)
        await waitForElement("#dashboard-hero", 5000)
      }

      const driverObj = driver({
        animate: true,
        overlayColor: "rgba(6,6,16,0.88)",
        smoothScroll: true,
        allowClose: true,
        stagePadding: 8,
        popoverClass: "oneview-tour",
      })

      // ── ADMIN: full E2E flow ──────────────────────────────────────────────
      const adminJourney = [
        {
          element: "#dashboard-hero",
          popover: {
            title: "Marcus needs to file Q1 reports. Due today.",
            description: "Programs Director at Skills for Change. Four funders, four different column specs, one deadline. He opens OneView instead of five Excel spreadsheets and four funder portals.",
            side: "bottom",
          },
        },
        {
          element: "#metric-cards",
          popover: {
            title: "Live metrics: no spreadsheet needed",
            description: "Active clients, outcome rates, cross-program enrolments, all computed live from the database. The numbers Marcus needs for his narrative are already here.",
            side: "bottom",
          },
        },
        {
          element: "[data-tour=analytics]",
          popover: {
            title: "Step 1: Understand the data",
            description: "Marcus opens Analytics. World map, monthly intake trend, program performance, demographic breakdown, and satisfaction scores — all from the same database, no pivot tables.",
            side: "right",
            onNextClick: () => {
              router.push(`/analytics${qs}`)
              waitForElement("#analytics-hero-metrics", 5000).then(() => driverObj.moveNext())
            },
          },
        },
        {
          element: "#analytics-hero-metrics",
          popover: {
            title: "Four numbers that matter to every funder",
            description: "Satisfaction rate, placement rate, drop-off rate, and survey responses. Each is computed from real data; nothing is hand-entered. Marcus screenshots this for the board deck.",
            side: "bottom",
          },
        },
        {
          element: "#analytics-trend",
          popover: {
            title: "Intake is accelerating",
            description: "The monthly trend shows whether intake capacity is growing or contracting. Funders ask about this every cycle; the answer used to require pulling three spreadsheets.",
            side: "top",
          },
        },
        {
          element: "[data-tour=pipeline]",
          popover: {
            title: "Step 2: Check pipeline health",
            description: "Marcus opens Pipeline. Every client is on a board from Outreach to Complete. He can see which programs have bottlenecks before writing the narrative.",
            side: "right",
            onNextClick: () => {
              router.push(`/pipeline${qs}`)
              waitForElement("[data-tour=pipeline-board]", 5000).then(() => driverObj.moveNext())
            },
          },
        },
        {
          element: "[data-tour=pipeline-board]",
          popover: {
            title: "8 stages, every client tracked",
            description: "Outreach → Vetting → Eligibility → Intake → Training → Placement → Complete → Survey. When a caseworker moves a client, the dashboard and reports update instantly.",
            side: "bottom",
          },
        },
        {
          element: "[data-tour=intake]",
          popover: {
            title: "Step 3: Register a new client",
            description: "A new client just walked in. Amara clicks Register a Client. The same form covers all programs; she enters the client's details once, not once per funder.",
            side: "right",
            onNextClick: () => {
              router.push(`/intake${qs}`)
              waitForElement("#intake-form", 5000).then(() => driverObj.moveNext())
            },
          },
        },
        {
          element: "#intake-form",
          popover: {
            title: "One submission, all programs",
            description: "Name, language, immigration stream, program. Selecting the program automatically resolves the funder. OneView seeds outcome tiers at intake; no follow-up data entry required.",
            side: "right",
          },
        },
        {
          element: "[data-tour=journeys]",
          popover: {
            title: "Step 4: Review a client journey",
            description: "Marcus clicks Journeys. He picks a client, sees their full timeline: enrolments, outcome tier progress, case notes from every caseworker, and the exit survey score.",
            side: "right",
            onNextClick: () => {
              router.push(`/journeys${qs}`)
              waitForElement("[data-tour=recent-clients]", 5000).then(() => driverObj.moveNext())
            },
          },
        },
        {
          element: "[data-tour=recent-clients]",
          popover: {
            title: "Recent clients, one click away",
            description: "The last 10 registered clients are shown immediately. No search required. Click any card to pull their full journey, notes, and survey results.",
            side: "bottom",
          },
        },
        {
          element: "[data-tour=export]",
          popover: {
            title: "Step 5: Generate the IRCC submission",
            description: "Marcus clicks Export. He selects IRCC. OneView shapes the CSV to iCARE's exact column specification: all matching clients, correct headers, ready for bulk upload in seconds.",
            side: "right",
            onNextClick: () => {
              router.push(`/export${qs}`)
              waitForElement("[data-tour=ai]", 5000).then(() => driverObj.moveNext())
            },
          },
        },
        {
          element: "[data-tour=ai]",
          popover: {
            title: "Step 6: Generate the narrative report",
            description: "CSV filed. Now the written report. Marcus opens AI Report Writer. SQL has already computed all the figures; the AI writes prose around verified numbers only.",
            side: "right",
            onNextClick: () => {
              router.push(`/ai${qs}`)
              waitForElement("#ai-hero,main", 5000).then(() => driverObj.moveNext())
            },
          },
        },
        {
          popover: {
            title: "Four funders. Under 10 minutes.",
            description: "Marcus repeats for Employment Ontario, United Way, and City of Toronto. What used to take weeks of copy-pasting and narrative writing now takes a single session. The data was always there; OneView makes it usable.",
            showButtons: ["close"],
          },
        },
      ]

      // ── CASEWORKER flow ───────────────────────────────────────────────────
      const caseworkerJourney = [
        {
          element: "#dashboard-hero",
          popover: {
            title: "Amara's shift starts",
            description: "Settlement caseworker at Skills for Change. She checks the dashboard: 47 active clients this week, 68% with outcomes on track. Then a new client walks in.",
            side: "bottom",
          },
        },
        {
          element: "#metric-cards",
          popover: {
            title: "Everything she needs to start the conversation",
            description: "Cross-program enrolments, active counts, outcomes achieved. Amara can see the full picture before the intake session begins. No separate system to check.",
            side: "bottom",
          },
        },
        {
          element: "[data-tour=intake]",
          popover: {
            title: "One form. Every program.",
            description: "A new client just arrived from Ethiopia. Amara clicks Register a Client. The same form covers all programs; she enters the client's details once, not once per funder.",
            side: "right",
            onNextClick: () => {
              router.push(`/intake${qs}`)
              waitForElement("#intake-form", 5000).then(() => driverObj.moveNext())
            },
          },
        },
        {
          element: "#intake-form",
          popover: {
            title: "Details captured once, available everywhere",
            description: "Name, language, immigration stream, program. Amara selects Settlement; OneView automatically resolves the correct funder (IRCC). No lookup, no manual mapping.",
            side: "right",
          },
        },
        {
          element: "[data-tour=journeys]",
          popover: {
            title: "Follow up on existing clients",
            description: "Amara opens Journeys to check on a client she saw last week. She can see outcomes progress, add a case note from today's call, and view the exit survey if it's been completed.",
            side: "right",
            onNextClick: () => {
              router.push(`/journeys${qs}`)
              waitForElement("[data-tour=recent-clients]", 5000).then(() => driverObj.moveNext())
            },
          },
        },
        {
          element: "[data-tour=recent-clients]",
          popover: {
            title: "Recent clients, one click away",
            description: "The last 10 registered clients appear automatically. Amara finds her client instantly without typing, clicks the card, and sees the full journey timeline.",
            showButtons: ["close"],
          },
        },
      ]

      // ── VIEWER flow ───────────────────────────────────────────────────────
      const viewerJourney = [
        {
          element: "#dashboard-hero",
          popover: {
            title: "Board member review: no data request needed",
            description: "A board member checks in before the quarterly meeting. She's logged in as Viewer: aggregate data only, no individual client records, no PII.",
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
          element: "[data-tour=analytics]",
          popover: {
            title: "Deep analytics, no PII",
            description: "The Analytics page shows world map, demographic breakdown, monthly trend, and program performance. All aggregate; no individual client data is visible to viewers.",
            side: "right",
            onNextClick: () => {
              router.push(`/analytics${qs}`)
              waitForElement("#analytics-hero-metrics", 5000).then(() => driverObj.moveNext())
            },
          },
        },
        {
          element: "#analytics-hero-metrics",
          popover: {
            title: "Satisfaction and outcomes at a glance",
            description: "Satisfaction rate, placement rate, drop-off rate. The board uses these four numbers in every funding conversation.",
            side: "bottom",
          },
        },
        {
          element: "[data-tour=about]",
          popover: {
            title: "Full documentation: always available",
            description: "The About section includes architecture diagrams, privacy compliance maps, and the full migration plan. Accessible to all roles including Viewer.",
            side: "right",
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
