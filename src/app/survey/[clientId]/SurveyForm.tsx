"use client"
import { useState, useEffect, useRef } from "react"
import { Star, CheckCircle, Send } from "lucide-react"

interface Props {
  clientId: string
}

export default function SurveyForm({ clientId }: Props) {
  const [info, setInfo] = useState<{ client_name: string; enrolment_id: string; program: string; already_submitted: boolean } | null>(null)
  const [loading, setLoading] = useState(true)
  const [satisfaction, setSatisfaction] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [wouldRecommend, setWouldRecommend] = useState(false)
  const [barriers, setBarriers] = useState("")
  const [successStory, setSuccessStory] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const submitFnRef = useRef<() => Promise<void>>(async () => {})

  useEffect(() => {
    fetch(`/api/survey-form/${clientId}`)
      .then(r => r.json())
      .then(d => {
        setInfo(d)
        if (d.already_submitted) setSubmitted(true)
      })
      .catch(() => setError("Could not load survey. Please contact Skills for Change."))
      .finally(() => setLoading(false))
  }, [clientId])

  async function submit() {
    if (!info || satisfaction === 0) return
    setSubmitting(true)
    setError("")
    try {
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          enrolmentId: info.enrolment_id,
          satisfaction,
          wouldRecommend,
          barriers: barriers || null,
          successStory: successStory || null,
          role: "client",
        }),
      })
      if (!res.ok) throw new Error("Submission failed")
      // Advance client stage to complete
      await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: "complete", role: "caseworker" }),
      })
      setSubmitted(true)
      window.dispatchEvent(new CustomEvent("demo:survey-done", { detail: { clientId } }))
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // Keep ref current so demo:submit-survey always calls the latest closure
  submitFnRef.current = submit

  // Dispatch demo:survey-form-ready when loaded and ready for input
  useEffect(() => {
    if (!loading && info && !submitted) {
      window.dispatchEvent(new CustomEvent("demo:survey-form-ready", { detail: {
        clientId,
        enrolmentId: info.enrolment_id,
      }}))
    }
  }, [loading, info, submitted, clientId])

  // Demo event listeners
  useEffect(() => {
    function fillHandler(e: Event) {
      const d = (e as CustomEvent).detail
      if (d.satisfaction !== undefined) setSatisfaction(d.satisfaction)
      if (d.wouldRecommend !== undefined) setWouldRecommend(d.wouldRecommend)
      if (d.barriers !== undefined) setBarriers(d.barriers)
      if (d.successStory !== undefined) setSuccessStory(d.successStory)
    }
    function submitHandler() { submitFnRef.current() }
    window.addEventListener("demo:fill-survey", fillHandler)
    window.addEventListener("demo:submit-survey", submitHandler)
    return () => {
      window.removeEventListener("demo:fill-survey", fillHandler)
      window.removeEventListener("demo:submit-survey", submitHandler)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#060610]">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (error && !info) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#060610] p-6">
        <div className="text-center max-w-sm">
          <p className="text-rose-400 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#060610] p-6">
        <div className="text-center max-w-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
            <CheckCircle size={32} className="text-emerald-400" />
          </div>
          <h2 className="font-sora text-2xl text-white">Thank you{info?.client_name ? `, ${info.client_name.split(" ")[0]}` : ""}!</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Your feedback has been received by Skills for Change. It helps us improve our programs for future clients.
          </p>
          <a
            href={`/journeys?clientId=${clientId}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-sm font-medium transition-colors"
          >
            ← Back to journey overview
          </a>
          <p className="text-xs text-slate-500">You may also close this window.</p>
        </div>
      </div>
    )
  }

  const STAR_LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"]
  const display = hovered || satisfaction

  return (
    <div className="min-h-screen bg-[#060610] flex items-start justify-center p-6 py-16">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs mb-2">
            Skills for Change · Exit Survey
          </div>
          <h1 className="font-sora text-3xl text-white">
            How did we do{info?.client_name ? `, ${info.client_name.split(" ")[0]}` : ""}?
          </h1>
          <p className="text-slate-400 text-sm">
            Your feedback helps us serve newcomers better. This takes 2 minutes.
          </p>
        </div>

        {/* Satisfaction */}
        <div id="survey-satisfaction" className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 space-y-4">
          <label className="block text-sm font-medium text-slate-200">
            How satisfied were you with the program? <span className="text-rose-400">*</span>
          </label>
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setSatisfaction(n)}
                className="transition-transform hover:scale-110 focus:outline-none"
              >
                <Star
                  size={36}
                  style={{
                    color: n <= display ? "#f59e0b" : undefined,
                    fill: n <= display ? "#f59e0b" : "none",
                  }}
                  className={n <= display ? "" : "text-slate-600"}
                />
              </button>
            ))}
            {display > 0 && (
              <span className="text-sm text-amber-400 ml-1">{STAR_LABELS[display]}</span>
            )}
          </div>
        </div>

        {/* Would recommend */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <div className="relative mt-0.5 flex-shrink-0">
              <input
                type="checkbox"
                checked={wouldRecommend}
                onChange={e => setWouldRecommend(e.target.checked)}
                className="sr-only"
              />
              <div
                onClick={() => setWouldRecommend(v => !v)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${wouldRecommend ? "bg-emerald-500 border-emerald-500" : "border-slate-500"}`}
              >
                {wouldRecommend && <CheckCircle size={12} className="text-white" />}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">I would recommend Skills for Change to others</p>
              <p className="text-xs text-slate-500 mt-0.5">Friends, family members, or colleagues who might benefit from our programs</p>
            </div>
          </label>
        </div>

        {/* Barriers */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 space-y-3">
          <label className="block text-sm font-medium text-slate-200">
            Did you face any barriers during the program? <span className="text-slate-500">(optional)</span>
          </label>
          <input
            value={barriers}
            onChange={e => setBarriers(e.target.value)}
            placeholder="e.g. childcare, transportation, language support…"
            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
          />
        </div>

        {/* Success story */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 space-y-3">
          <label className="block text-sm font-medium text-slate-200">
            Tell us about your experience <span className="text-slate-500">(optional)</span>
          </label>
          <textarea
            value={successStory}
            onChange={e => setSuccessStory(e.target.value)}
            placeholder="What changed for you? What did you achieve? How has your life improved?"
            rows={4}
            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors resize-none"
          />
        </div>

        {error && <p className="text-rose-400 text-sm text-center">{error}</p>}

        <button
          id="survey-submit"
          onClick={submit}
          disabled={satisfaction === 0 || submitting}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors"
        >
          <Send size={15} />
          {submitting ? "Submitting…" : "Submit Feedback"}
        </button>

        <p className="text-center text-xs text-slate-600">
          Your response goes directly to Skills for Change staff. It will not be shared with third parties.
        </p>
      </div>
    </div>
  )
}
