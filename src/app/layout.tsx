import type { Metadata } from "next"
import { Sora, Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import DemoTour from "@/components/DemoTour"
import { ThemeProvider } from "next-themes"

const sora = Sora({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-sora" })
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "OneView | Skills for Change",
  description: "Capture once, report to every funder. Outcomes tracking for Toronto nonprofits.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="bg-[var(--ov-bg)] text-slate-900 dark:text-slate-100 antialiased transition-colors duration-200" style={{ fontFamily: "var(--font-inter, Inter, sans-serif)" }}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
          <DemoTour />
          <Toaster theme="system" position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
