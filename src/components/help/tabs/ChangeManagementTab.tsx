"use client"
import { AlertTriangle, CheckCircle, Calendar, BookOpen, BarChart2, Users, Heart, Clock, TrendingUp } from "lucide-react"

const WHY_FAILS = [
  {
    title: "Data re-entry fatigue",
    desc: "Staff currently enter the same client data into multiple systems every reporting cycle. New tools that add more entry are dead on arrival.",
  },
  {
    title: "Fear of automation",
    desc: "Caseworkers worry that reporting automation means their jobs are at risk. OneView handles paperwork; it doesn't replace the relationships they've built.",
  },
  {
    title: "Past system failures",
    desc: "SfC has tried new software before that didn't stick. Skepticism is earned. That's why this rollout starts with champions, not mandates.",
  },
]

const PROMISES = [
  {
    title: "Less work from day one",
    desc: "One intake form replaces 10+ caseworker versions. Reports that took weeks now take seconds. Staff get time back immediately.",
  },
  {
    title: "Your expertise still matters",
    desc: "OneView handles data; caseworkers handle people. The system surfaces insights; caseworkers interpret them for clients.",
  },
  {
    title: "Your voice shapes this",
    desc: "Program-specific intake forms are configurable. Role-based views mean caseworkers only see what's relevant to their programs.",
  },
]

const TIMELINE = [
  {
    period: "Weeks 1-2",
    label: "Champions Program",
    color: "text-indigo-600 dark:text-indigo-400",
    dot: "bg-indigo-500",
    border: "border-indigo-500/20",
    bg: "bg-indigo-500/[0.04]",
    desc: "Identify 1-2 staff per program as system champions. Deep training session. Champions become the first point of contact for questions — not IT.",
  },
  {
    period: "Weeks 3-4",
    label: "Parallel Running",
    color: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
    border: "border-amber-500/20",
    bg: "bg-amber-500/[0.04]",
    desc: "Both old system and OneView run simultaneously. Staff choose which to use. No mandates yet. Champions track which workflows are adopted first.",
  },
  {
    period: "Month 2",
    label: "Soft Cutover",
    color: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/[0.04]",
    desc: "OneView becomes primary. Old spreadsheets kept as backup. Champions hold weekly drop-in sessions. Success stories shared at all-hands.",
  },
  {
    period: "Month 3+",
    label: "Full Adoption",
    color: "text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500",
    border: "border-blue-500/20",
    bg: "bg-blue-500/[0.04]",
    desc: "Old systems retired. Champions become trainers for new staff. Monthly adoption metrics reviewed by leadership.",
  },
]

const METRICS = [
  {
    label: "Logins per week per caseworker",
    target: "5+ per active caseworker",
  },
  {
    label: "Intake forms via OneView vs old method",
    target: "80% via OneView by Month 2",
  },
  {
    label: "Time-to-report reduction",
    target: "From 2-3 weeks to under 1 hour",
  },
  {
    label: "Staff satisfaction score",
    target: "4.0+/5.0 (quarterly internal survey)",
  },
]

export default function ChangeManagementTab() {
  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="glass rounded-xl p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <Users size={28} className="text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <h2 className="font-sora text-3xl text-slate-900 dark:text-white mb-3">Making Change Stick</h2>
        <p className="text-slate-600 dark:text-slate-300 text-base max-w-2xl mx-auto">
          Staff buy-in is the hardest part of any system migration. This plan puts caseworkers first — reducing their workload immediately, not after a long adjustment period.
        </p>
      </div>

      {/* Why Change Fails */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <AlertTriangle size={16} className="text-rose-600 dark:text-rose-400" />
          <h3 className="font-sora text-lg text-rose-600 dark:text-rose-400">Why Change Fails</h3>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {WHY_FAILS.map((item, i) => (
            <div key={i} className="p-5 border border-rose-500/20 bg-rose-500/[0.04] rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={14} className="text-rose-600 dark:text-rose-400" />
                <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">{item.title}</p>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* The OneView Promise */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-sora text-lg text-emerald-600 dark:text-emerald-400">The OneView Promise</h3>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {PROMISES.map((item, i) => (
            <div key={i} className="p-5 border border-emerald-500/20 bg-emerald-500/[0.04] rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={14} className="text-emerald-600 dark:text-emerald-400" />
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{item.title}</p>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Rollout Timeline */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Calendar size={16} className="text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-sora text-lg text-indigo-600 dark:text-indigo-400">Rollout Timeline</h3>
        </div>
        <div className="relative pl-6">
          <div className="absolute left-2 top-2 bottom-2 w-px bg-slate-200 dark:bg-white/[0.08]" />
          <div className="space-y-5">
            {TIMELINE.map((phase, i) => (
              <div key={i} className="relative">
                <div className={`absolute -left-[18px] top-1.5 w-2.5 h-2.5 rounded-full ${phase.dot} ring-2 ring-[#060610]`} />
                <div className={`text-xs font-semibold mb-1 ${phase.color}`}>{phase.period} — {phase.label}</div>
                <div className={`p-4 border ${phase.border} ${phase.bg} rounded-xl`}>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{phase.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* What We Measure */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <BarChart2 size={16} className="text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-sora text-lg text-indigo-600 dark:text-indigo-400">What We Measure</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {METRICS.map((m, i) => (
            <div key={i} className="p-4 border border-indigo-500/20 bg-indigo-500/[0.04] rounded-xl">
              <p className="text-slate-800 dark:text-slate-200 text-sm font-medium mb-1">{m.label}</p>
              <p className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold">Target: {m.target}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
