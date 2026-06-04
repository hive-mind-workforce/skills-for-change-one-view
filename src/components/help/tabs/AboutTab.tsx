import { GitBranch, ExternalLink, CheckCircle, Award, Users, Heart, Star } from "lucide-react"

const VALUES = [
  { name: "Excellence", desc: "We deliver quality in all that we do, with commitment to measurable results and accountability to our clients, employees, employers, and funders.", color: "text-emerald-400" },
  { name: "Transparency", desc: "We hold ourselves accountable to transparently communicating our progress and outcomes — essential to maintaining the trust we have earned.", color: "text-indigo-400" },
  { name: "Empathy", desc: "We treat all individuals with empathy, compassion, and understanding so that clients feel respected and supported holistically through their journey.", color: "text-cyan-400" },
  { name: "Inclusivity", desc: "We recognize inclusivity and diversity as essential for a supportive environment where everyone can express their whole selves.", color: "text-amber-400" },
  { name: "Respect", desc: "We respect and value the diversity of our team and those we serve, behaving with integrity and compassion to ensure dignity for all.", color: "text-violet-400" },
  { name: "Results", desc: "We deliver measurable results and create positive impact, holding ourselves accountable for the promises made in our Vision and Mission.", color: "text-rose-400" },
]

const AWARDS = [
  "Citizenship and Immigration Canada Citation of Citizenship Award",
  "Conference Board of Canada Community Learning Award",
  "Ontario Ministry of Citizenship and Immigration Newcomer Champion Award",
]

export default function AboutTab() {
  return (
    <div className="space-y-8">
      <div className="glass rounded-xl p-8 text-center">
        <p className="text-emerald-400 text-sm uppercase tracking-widest mb-2">Skills for Change</p>
        <h2 className="font-sora text-5xl text-white mb-3">OneView</h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">Capture once, report to every funder. Built for the organization that has been building welcoming and equitable communities since 1982.</p>
        <div className="flex flex-wrap justify-center items-center gap-6 mt-8">
          <div className="text-center">
            <div className="font-sora text-4xl text-emerald-400">20,000+</div>
            <div className="text-slate-500 text-sm">clients served annually</div>
          </div>
          <div className="w-px h-12 bg-white/[0.08]" />
          <div className="text-center">
            <div className="font-sora text-4xl text-indigo-400">25+</div>
            <div className="text-slate-500 text-sm">programs and services</div>
          </div>
          <div className="w-px h-12 bg-white/[0.08]" />
          <div className="text-center">
            <div className="font-sora text-4xl text-amber-400">40+</div>
            <div className="text-slate-500 text-sm">years of community impact</div>
          </div>
          <div className="w-px h-12 bg-white/[0.08]" />
          <div className="text-center">
            <div className="font-sora text-4xl text-violet-400">1,000+</div>
            <div className="text-slate-500 text-sm">employer and community partners</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6 border-l-4 border-emerald-500/50">
          <div className="flex items-center gap-2 mb-3">
            <Star size={16} className="text-emerald-400" />
            <h3 className="font-sora text-lg text-emerald-400">Our Vision</h3>
          </div>
          <p className="text-slate-300 text-base leading-relaxed">
            A Canada where everyone has equal opportunities to succeed.
          </p>
          <p className="text-slate-500 text-sm mt-3 leading-relaxed">
            We are committed to striving for a Canada where newcomers and other underserved individuals have access to opportunities that empower them to succeed personally and professionally.
          </p>
        </div>
        <div className="glass rounded-xl p-6 border-l-4 border-indigo-500/50">
          <div className="flex items-center gap-2 mb-3">
            <Heart size={16} className="text-indigo-400" />
            <h3 className="font-sora text-lg text-indigo-400">Our Mission</h3>
          </div>
          <p className="text-slate-300 text-base leading-relaxed">
            Working with newcomers and underserved groups, providing holistic solutions that bridge the gap between potential and opportunity for success in Canada.
          </p>
          <p className="text-slate-500 text-sm mt-3 leading-relaxed">
            We enhance skill sets, opportunities, and access to good work for newcomers and underserved groups across Canada.
          </p>
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users size={16} className="text-slate-400" />
          <h3 className="font-sora text-lg text-slate-200">Our Story</h3>
        </div>
        <div className="space-y-3 text-slate-400 text-sm leading-relaxed">
          <p>
            In 1982, five English as a Second Language teachers identified a need and shared a vision for integrated skills and language training. That vision became <span className="text-slate-300">Toronto Office Skills</span>, the former name of the agency.
          </p>
          <p>
            As the immigrant and refugee community&apos;s needs changed, the agency evaluated itself, restructured, and raised funds to acquire a building — and what emerged from that process is the agency as we know it: <span className="text-emerald-400 font-medium">Skills for Change</span>.
          </p>
          <p>
            From its inception, Skills for Change assumed a leadership role to address policy issues, undertake public education and research on issues affecting immigrants and refugees, while pioneering innovative service models for internationally trained professionals.
          </p>
          <p>
            Today, Skills for Change serves <span className="text-slate-300">Newcomers and Refugees, Women, Youth, Seniors, Black Canadians, and Canadian employers</span> — offering employment, settlement, language training, mentorship, entrepreneurship, trades, and mental health programs across Toronto and Hamilton.
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {["Newcomers and Refugees","Women","Youth","Seniors","Black Canadians","Employers"].map(p => (
            <span key={p} className="px-3 py-1 bg-white/[0.04] border border-white/[0.08] rounded-full text-slate-400 text-xs">{p}</span>
          ))}
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award size={16} className="text-amber-400" />
          <h3 className="font-sora text-lg text-slate-200">Values and Recognition</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {VALUES.map(v => (
            <div key={v.name} className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
              <div className={`font-sora text-sm mb-2 ${v.color}`}>{v.name}</div>
              <p className="text-slate-500 text-xs leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {AWARDS.map(a => (
            <div key={a} className="flex items-start gap-2">
              <CheckCircle size={13} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <span className="text-slate-400 text-sm">{a}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <h3 className="font-sora text-lg text-rose-400 mb-3">The Problem</h3>
          <ul className="space-y-2">
            {[
              "4 different funder portals, each requiring different column specifications",
              "Staff re-enter the same client data multiple times per reporting cycle",
              "Spreadsheets diverge from portal records over time",
              "Narrative reports take weeks instead of hours",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-400 text-sm">
                <span className="text-rose-400 mt-0.5 flex-shrink-0">✕</span> {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="glass rounded-xl p-6">
          <h3 className="font-sora text-lg text-emerald-400 mb-3">The OneView Solution</h3>
          <ul className="space-y-2">
            {[
              "Capture client data once across all 8 programs",
              "Auto-generate funder exports in each funder's exact format",
              "AI writes narrative reports from real SQL-computed data",
              "Built-in privacy compliance: PHI Wall, consent model, full audit trail",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-400 text-sm">
                <CheckCircle size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" /> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Desirability", desc: "Caseworkers input once. Funders receive tailored reports in minutes, not weeks.", color: "text-emerald-400" },
          { label: "Feasibility", desc: "Next.js and Vercel Postgres. Deploys in hours, additive to Microsoft Forms and Salesforce.", color: "text-indigo-400" },
          { label: "Viability", desc: "Free-tier viable on Vercel. Scales to full SfC roster of 20,000+ clients from day one.", color: "text-amber-400" },
          { label: "Functionality", desc: "Live at a Vercel URL. Click, explore, generate real exports, and run the AI demo tour.", color: "text-violet-400" },
        ].map(c => (
          <div key={c.label} className="glass rounded-xl p-4">
            <div className={`font-sora text-sm ${c.color} mb-2`}>{c.label}</div>
            <p className="text-slate-400 text-xs leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="font-sora text-lg text-slate-200 mb-4">Technology Stack</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {["Next.js 15","TypeScript","Tailwind CSS 4","shadcn/ui","Vercel Postgres (Neon)","Recharts","driver.js","MIT License"].map(t => (
            <span key={t} className="px-3 py-1 bg-white/[0.04] border border-white/[0.08] rounded-full text-slate-300 text-sm">{t}</span>
          ))}
        </div>
        <p className="text-slate-500 text-xs">Registered Charity: 121471858RR0001 · Serving Toronto and Hamilton · Est. 1982</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href="https://github.com/hive-mind-workforce/skills-for-change-one-view"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-5 py-3 glass border border-white/[0.15] hover:border-white/[0.3] text-slate-200 rounded-xl transition-colors"
        >
          <GitBranch size={18} />
          <span className="font-medium">View Source on GitHub</span>
          <ExternalLink size={14} className="text-slate-500" />
        </a>
        <a
          href="https://skillsforchange.org"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-5 py-3 glass border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 rounded-xl transition-colors"
        >
          <ExternalLink size={14} />
          <span className="font-medium">skillsforchange.org</span>
        </a>
        <div className="flex items-center gap-2 px-5 py-3 glass rounded-xl border border-white/[0.06] text-slate-500 text-sm">
          SfC Hackathon 2026
        </div>
      </div>
    </div>
  )
}
