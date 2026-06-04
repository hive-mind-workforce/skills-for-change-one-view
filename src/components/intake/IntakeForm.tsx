"use client"
import { useState } from "react"
import { toast } from "sonner"
import { Shield } from "lucide-react"

const LANGUAGES = ["English","French","Arabic","Spanish","Somali","Tagalog","Mandarin","Hindi","Portuguese","Ukrainian","Tigrinya","Amharic","Other"]
const STREAMS = ["Refugee","Economic Immigrant","Family Reunification","International Student","Temporary Worker","Other"]
const PROGRAMS = [
  { value: "settlement", label: "Settlement Services" },
  { value: "employment", label: "Employment Services" },
  { value: "language", label: "Language Programs" },
  { value: "mental_health", label: "Mental Health Support" },
  { value: "trades", label: "Skilled Trades" },
  { value: "mentoring", label: "Mentoring Program" },
  { value: "youth", label: "Youth Services" },
  { value: "women", label: "Women's Programs" },
]
const FUNDER_MAP: Record<string,string> = {
  settlement:"ircc",language:"ircc",employment:"eo",trades:"eo",mental_health:"uw",youth:"uw",mentoring:"city",women:"city"
}
const FUNDER_LABELS: Record<string,string> = { ircc:"IRCC",eo:"Employment Ontario",uw:"United Way",city:"City of Toronto" }

export default function IntakeForm() {
  const [form, setForm] = useState({ full_name:"",primary_language:"English",immigration_stream:"Refugee",program:"settlement",consent_cross_program:false })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string,string>>({})

  const funder = FUNDER_MAP[form.program] ?? "ircc"

  function update(field: string, value: any) {
    setForm(p => ({ ...p, [field]: value }))
    setErrors(p => { const n = {...p}; delete n[field]; return n })
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const errs: Record<string,string> = {}
    if (!form.full_name.trim()) errs.full_name = "Name is required"
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const res = await fetch("/api/clients", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({...form, funder}) })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success(`${form.full_name} registered in ${PROGRAMS.find(p=>p.value===form.program)?.label}`)
      setForm({ full_name:"",primary_language:"English",immigration_stream:"Refugee",program:"settlement",consent_cross_program:false })
    } catch(err:any) {
      toast.error(err.message ?? "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (field: string) => `w-full bg-white/[0.04] border ${errors[field]?"border-rose-500":"border-white/[0.1]"} rounded-lg px-3 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-emerald-500/60 transition-colors`
  const labelClass = "block text-slate-400 text-sm mb-1.5"

  return (
    <form onSubmit={submit} className="glass rounded-xl p-6 space-y-5">
      <div>
        <label className={labelClass}>Full Name *</label>
        <input name="full_name" value={form.full_name} onChange={e=>update("full_name",e.target.value)} className={inputClass("full_name")} placeholder="Client full name" />
        {errors.full_name && <p className="text-rose-400 text-xs mt-1">{errors.full_name}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Primary Language</label>
          <select value={form.primary_language} onChange={e=>update("primary_language",e.target.value)} className={inputClass("")}>
            {LANGUAGES.map(l=><option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Immigration Stream</label>
          <select value={form.immigration_stream} onChange={e=>update("immigration_stream",e.target.value)} className={inputClass("")}>
            {STREAMS.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Program</label>
          <select name="program" value={form.program} onChange={e=>update("program",e.target.value)} className={inputClass("")}>
            {PROGRAMS.map(p=><option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Funder</label>
          <div className="w-full bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2.5 text-slate-400 text-sm">{FUNDER_LABELS[funder]}</div>
        </div>
      </div>
      {form.program === "mental_health" && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
          <Shield size={16} className="text-rose-400 mt-0.5 flex-shrink-0" />
          <p className="text-rose-300 text-sm">Mental Health records are protected under PHIPA and cannot be shared with other programs.</p>
        </div>
      )}
      <div className="flex items-start gap-3">
        <input type="checkbox" id="consent" checked={form.consent_cross_program} onChange={e=>update("consent_cross_program",e.target.checked)} className="mt-1 accent-emerald-500" />
        <label htmlFor="consent" className="text-slate-400 text-sm cursor-pointer">
          Enable cross-program consent (client has verbally consented to data sharing across programs for integrated support)
        </label>
      </div>
      <button type="submit" disabled={loading} className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold rounded-lg transition-colors text-sm">
        {loading ? "Registering..." : "Register Client"}
      </button>
    </form>
  )
}
