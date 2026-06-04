"use client"
import { useEffect } from "react"

export default function DemoTour() {
  useEffect(() => {
    const startTour = async () => {
      const { driver } = await import("driver.js")
      await import("driver.js/dist/driver.css")
      const driverObj = driver({
        animate: true,
        overlayColor: "rgba(6,6,16,0.85)",
        smoothScroll: true,
        allowClose: true,
        stagePadding: 8,
        popoverClass: "oneview-tour",
        steps: [
          { element: "#dashboard-hero", popover: { title: "OneView", description: "Capture once, report to every funder. 16,247 clients across 8 programs.", side: "bottom" } },
          { element: "#metric-cards", popover: { title: "Live Metrics", description: "Real-time SQL-computed program stats. Always accurate.", side: "bottom" } },
          { element: "#program-chart", popover: { title: "Program Breakdown", description: "Every program at a glance in one chart.", side: "top" } },
          { element: "[data-tour=intake]", popover: { title: "One Intake Form", description: "Single form feeds every program. Microsoft Forms bridges here via Power Automate.", side: "right" } },
          { element: "[data-tour=export]", popover: { title: "Smart Export", description: "Select a funder. OneView shapes the CSV to their exact column specification.", side: "right" } },
          { element: "[data-tour=ai]", popover: { title: "AI Report Writer", description: "SQL computes numbers. AI writes narrative. No hallucinations.", side: "right" } },
          { element: "[data-tour=help]", popover: { title: "Presentation Ready", description: "Interactive architecture diagram. Every layer documented and clickable.", side: "right" } },
          { popover: { title: "Built for Skills for Change", description: "Open source, AI-agent ready, deployed on Vercel. The complete solution.", showButtons: ["close"] } },
        ],
      })
      driverObj.drive()
    }

    window.addEventListener("start-demo", startTour)
    return () => window.removeEventListener("start-demo", startTour)
  }, [])

  return null
}
