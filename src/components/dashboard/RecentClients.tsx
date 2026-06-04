"use client"
import { useSearchParams, useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import ProgramBadge from "@/components/ProgramBadge"
import FunderBadge from "@/components/FunderBadge"
import { formatDate } from "@/lib/helpers"

export default function RecentClients({ clients }: { clients: any[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function goToJourney(clientId: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("clientId", clientId)
    router.push(`/journeys?${params.toString()}`)
  }

  if (!clients.length) return <div className="glass rounded-xl p-5 text-slate-500 text-sm">No clients yet.</div>
  return (
    <div className="glass rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-100 dark:border-white/[0.06] hover:bg-transparent">
            <TableHead className="text-slate-500 dark:text-slate-400">Name</TableHead>
            <TableHead className="text-slate-500 dark:text-slate-400 hidden sm:table-cell">Language</TableHead>
            <TableHead className="text-slate-500 dark:text-slate-400">Program</TableHead>
            <TableHead className="text-slate-500 dark:text-slate-400 hidden md:table-cell">Funder</TableHead>
            <TableHead className="text-slate-500 dark:text-slate-400 hidden lg:table-cell">Enrolled</TableHead>
            <TableHead className="text-slate-500 dark:text-slate-400 text-right">Outcomes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((c, i) => (
            <TableRow
              key={i}
              onClick={() => goToJourney(c.id)}
              className="border-slate-100 dark:border-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/[0.02] cursor-pointer"
            >
              <TableCell className="text-slate-800 dark:text-slate-200 font-medium">{c.full_name}</TableCell>
              <TableCell className="text-slate-500 dark:text-slate-400 hidden sm:table-cell">{c.primary_language}</TableCell>
              <TableCell><ProgramBadge program={c.program} /></TableCell>
              <TableCell className="hidden md:table-cell"><FunderBadge funder={c.funder} /></TableCell>
              <TableCell className="text-slate-500 dark:text-slate-400 hidden lg:table-cell">{formatDate(c.enrolled_at)}</TableCell>
              <TableCell className="text-right text-slate-500 dark:text-slate-400 text-sm">{c.outcomes_achieved}/{c.outcomes_total}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
