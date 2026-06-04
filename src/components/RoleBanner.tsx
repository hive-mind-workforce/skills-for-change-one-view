"use client"
import { useSearchParams } from "next/navigation"
import { AlertTriangle } from "lucide-react"

export default function RoleBanner() {
  const searchParams = useSearchParams()
  const role = searchParams.get("role") ?? "admin"
  if (role === "admin") return null
  return (
    <div className="w-full bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center gap-2 text-amber-300 text-sm">
      <AlertTriangle size={14} />
      Viewing as {role.charAt(0).toUpperCase() + role.slice(1)}. Some features are restricted.
    </div>
  )
}
