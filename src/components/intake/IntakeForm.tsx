"use client"
import { useState, useEffect } from "react"
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
const SOURCES = ["Walk-in","Referral from partner","Online search","Community event","Previous client","Other"]
const AGE_GROUPS = ["18-24","25-34","35-44","45-54","55+"]
const GENDERS = ["Woman","Man","Non-binary","Two-Spirit","Transgender woman","Transgender man","Genderfluid","Agender","Gender non-conforming","Genderqueer","Bigender","Questioning","Self-describe…","Prefer not to say"]

interface FormState {
  // Personal
  full_name: string
  primary_language: string
  immigration_stream: string
  country_of_origin: string
  age_group: string
  gender: string
  gender_self_describe: string
  phone: string
  email: string
  source: string
  // Program
  program: string
  consent_cross_program: boolean
  // Consent
  consent_data_use: boolean
  consent_followup: boolean
  consent_aggregate: boolean
}

export default function IntakeForm() {
  const [form, setForm] = useState<FormState>({
    full_name: "",
    primary_language: "English",
    immigration_stream: "Refugee",
    country_of_origin: "",
    age_group: "25-34",
    gender: "Prefer not to say",
    gender_self_describe: "",
    phone: "",
    email: "",
    source: "Walk-in",
    program: "settlement",
    consent_cross_program: false,
    consent_data_use: false,
    consent_followup: false,
    consent_aggregate: true,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string,string>>({})

  useEffect(() => {
    function handler(e: Event) {
      const data = (e as CustomEvent).detail
      setForm(prev => ({ ...prev, ...data }))
    }
    window.addEventListener("demo:fill-intake", handler)
    return () => window.removeEventListener("demo:fill-intake", handler)
  }, [])

  const funder = FUNDER_MAP[form.program] ?? "ircc"

  function update(field: keyof FormState, value: string | boolean) {
    setForm(p => ({ ...p, [field]: value }))
    setErrors(p => { const n = {...p}; delete n[field]; return n })
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const errs: Record<string,string> = {}
    if (!form.full_name.trim()) errs.full_name = "Name is required"
    if (!form.consent_data_use) errs.consent_data_use = "Required consent must be given to register"
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.full_name,
          primary_language: form.primary_language,
          immigration_stream: form.immigration_stream,
          program: form.program,
          funder,
          consent_cross_program: form.consent_cross_program,
          // Forward-compatible fields
          country_of_origin: form.country_of_origin,
          age_group: form.age_group,
          gender: form.gender === "Self-describe…" ? (form.gender_self_describe.trim() || "Self-describe…") : form.gender,
          phone: form.phone,
          email: form.email,
          source: form.source,
          consent_followup: form.consent_followup,
          consent_aggregate: form.consent_aggregate,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      window.dispatchEvent(new CustomEvent("demo:intake-registered", { detail: { clientId: data.clientId } }))
      toast.success(`${form.full_name} registered in ${PROGRAMS.find(p=>p.value===form.program)?.label}`)
      setForm({
        full_name: "",
        primary_language: "English",
        immigration_stream: "Refugee",
        country_of_origin: "",
        age_group: "25-34",
        gender: "Prefer not to say",
        gender_self_describe: "",
        phone: "",
        email: "",
        source: "Walk-in",
        program: "settlement",
        consent_cross_program: false,
        consent_data_use: false,
        consent_followup: false,
        consent_aggregate: true,
      })
    } catch(err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (field: string) =>
    `w-full ov-input border ${errors[field] ? "border-rose-500" : "border-[var(--ov-input-border)]"} rounded-lg px-3 py-2.5 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-emerald-500/60 transition-colors`
  const labelClass = "block text-slate-500 dark:text-slate-400 text-sm mb-1.5"
  const sectionHeadingClass = "font-sora text-base font-semibold text-slate-800 dark:text-white mb-4"

  return (
    <form id="intake-form" onSubmit={submit} className="space-y-5">

      {/* Section 1: Personal Information */}
      <div className="glass rounded-xl p-6 space-y-5">
        <h2 className={sectionHeadingClass}>Personal Information</h2>

        <div>
          <label className={labelClass}>Full Name *</label>
          <input
            name="full_name"
            value={form.full_name}
            onChange={e => update("full_name", e.target.value)}
            className={inputClass("full_name")}
            placeholder="Client full name"
          />
          {errors.full_name && <p className="text-rose-500 dark:text-rose-400 text-xs mt-1">{errors.full_name}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Primary Language</label>
            <select value={form.primary_language} onChange={e => update("primary_language", e.target.value)} className={inputClass("")}>
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Immigration Stream</label>
            <select value={form.immigration_stream} onChange={e => update("immigration_stream", e.target.value)} className={inputClass("")}>
              {STREAMS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Country of Origin</label>
          <input
            value={form.country_of_origin}
            onChange={e => update("country_of_origin", e.target.value)}
            className={inputClass("")}
            placeholder="Country you came from"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Age Group</label>
            <select value={form.age_group} onChange={e => update("age_group", e.target.value)} className={inputClass("")}>
              {AGE_GROUPS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Gender</label>
            <select value={form.gender} onChange={e => update("gender", e.target.value)} className={inputClass("")}>
              {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            {form.gender === "Self-describe…" && (
              <input
                value={form.gender_self_describe}
                onChange={e => update("gender_self_describe", e.target.value)}
                placeholder="Please describe your gender identity"
                className={`${inputClass("")} mt-2`}
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Phone Number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => update("phone", e.target.value)}
              className={inputClass("")}
              placeholder="e.g. 416-555-0100"
            />
          </div>
          <div>
            <label className={labelClass}>Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={e => update("email", e.target.value)}
              className={inputClass("")}
              placeholder="client@example.com"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>How did you hear about us?</label>
          <select value={form.source} onChange={e => update("source", e.target.value)} className={inputClass("")}>
            {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Section 2: Program Details */}
      <div className="glass rounded-xl p-6 space-y-5">
        <h2 className={sectionHeadingClass}>Program Details</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Program</label>
            <select name="program" value={form.program} onChange={e => update("program", e.target.value)} className={inputClass("")}>
              {PROGRAMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Funder</label>
            <div className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 text-sm">
              {FUNDER_LABELS[funder]}
            </div>
          </div>
        </div>

        {form.program === "mental_health" && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
            <Shield size={16} className="text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0" />
            <p className="text-rose-600 dark:text-rose-300 text-sm">Mental Health records are protected under PHIPA and cannot be shared with other programs.</p>
          </div>
        )}

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="consent_cross"
            checked={form.consent_cross_program}
            onChange={e => update("consent_cross_program", e.target.checked)}
            className="mt-1 accent-emerald-500"
          />
          <label htmlFor="consent_cross" className="text-slate-500 dark:text-slate-400 text-sm cursor-pointer">
            Enable cross-program consent (client has verbally consented to data sharing across programs for integrated support)
          </label>
        </div>
      </div>

      {/* Section 3: Consent & Privacy */}
      <div className="glass rounded-xl p-6 space-y-4">
        <h2 className={sectionHeadingClass}>Consent &amp; Privacy</h2>

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="consent_data_use"
            checked={form.consent_data_use}
            onChange={e => update("consent_data_use", e.target.checked)}
            className="mt-1 accent-emerald-500"
          />
          <label htmlFor="consent_data_use" className={`text-sm cursor-pointer ${errors.consent_data_use ? "text-rose-600 dark:text-rose-400" : "text-slate-500 dark:text-slate-400"}`}>
            I consent to my data being used for program delivery and funder reporting <span className="text-rose-600 dark:text-rose-400">*</span>
          </label>
        </div>
        {errors.consent_data_use && <p className="text-rose-500 dark:text-rose-400 text-xs -mt-2 ml-6">{errors.consent_data_use}</p>}

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="consent_followup"
            checked={form.consent_followup}
            onChange={e => update("consent_followup", e.target.checked)}
            className="mt-1 accent-emerald-500"
          />
          <label htmlFor="consent_followup" className="text-slate-500 dark:text-slate-400 text-sm cursor-pointer">
            I consent to being contacted for follow-up surveys and check-ins
          </label>
        </div>

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="consent_aggregate"
            checked={form.consent_aggregate}
            onChange={e => update("consent_aggregate", e.target.checked)}
            className="mt-1 accent-emerald-500"
          />
          <label htmlFor="consent_aggregate" className="text-slate-500 dark:text-slate-400 text-sm cursor-pointer">
            I consent to my anonymized data being included in aggregate program statistics
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        data-tour="intake-submit"
        className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold rounded-lg transition-colors text-sm"
      >
        {loading ? "Registering..." : "Register Client"}
      </button>
    </form>
  )
}
