import type { Metadata } from "next"
import { Sora, Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import DemoTour from "@/components/DemoTour"

const sora = Sora({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-sora" })
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "OneView | Skills for Change",
  description: "Capture once, report to every funder. Outcomes tracking for Toronto nonprofits.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${sora.variable} ${inter.variable}`}>
      <body className="bg-[#060610] text-slate-100 antialiased" style={{ fontFamily: "var(--font-inter, Inter, sans-serif)" }}>
        {children}
        <DemoTour />
        <Toaster theme="dark" position="top-right" />
      </body>
    </html>
  )
}
