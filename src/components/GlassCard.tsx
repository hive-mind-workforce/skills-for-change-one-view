import { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export default function GlassCard({ children, className, ...rest }: GlassCardProps) {
  return (
    <div className={cn("glass rounded-xl p-5", className)} {...rest}>
      {children}
    </div>
  )
}
