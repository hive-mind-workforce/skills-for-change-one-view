import { Lock, Shield, Eye, BarChart2, Key, Database, Server, AlertTriangle, CheckCircle, Wifi, FileKey } from "lucide-react"

const SECURITY_CARDS = [
  {
    icon: Database,
    title: "Encrypted at Rest",
    color: "#10b981",
    badge: "AES-256",
    desc: "All client data stored in Neon Postgres is encrypted on disk using AES-256. Encryption is applied at the storage layer; no unencrypted data ever touches the volume.",
  },
  {
    icon: Wifi,
    title: "Encrypted in Transit",
    color: "#6366f1",
    badge: "TLS 1.3",
    desc: "Every connection between the browser, the Next.js server, and the database uses TLS 1.3. No plaintext traffic on any path. Certificate pinning is enforced by the hosting layer.",
  },
  {
    icon: Key,
    title: "Secrets Management",
    color: "#f59e0b",
    badge: "Env-only",
    desc: "Database credentials, LLM API keys, and the bearer token are stored exclusively as environment variables in the hosting platform. They are never committed to git, never logged, and never sent to the client.",
  },
  {
    icon: FileKey,
    title: "Full Audit Trail",
    color: "#a855f7",
    badge: "Append-only",
    desc: "Every write, export, and AI query is logged to the audit_log table with role, IP, and timestamp. Logs are append-only; no application code path can modify or delete them.",
  },
]

const ENCRYPTION_DETAILS = [
  {
    title: "Database encryption at rest",
    icon: Database,
    color: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/[0.04]",
    points: [
      "Neon Postgres (Vercel's managed database) encrypts all stored data using AES-256-GCM.",
      "Encryption keys are managed by Neon's key management service, rotated automatically, and never exposed to application code.",
      "Backups and write-ahead logs (WAL) are encrypted with the same scheme; no gap in coverage.",
      "Point-in-time recovery (PITR) retains encrypted snapshots. Restoring a backup does not decrypt the data at rest.",
    ],
  },
  {
    title: "Data in transit",
    icon: Wifi,
    color: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-500/20",
    bg: "bg-indigo-500/[0.04]",
    points: [
      "All browser-to-server traffic is HTTPS. HTTP connections are rejected at the edge (Vercel enforces redirect).",
      "Server-to-database connections use SSL/TLS with certificate verification. The POSTGRES_URL connection string includes sslmode=require.",
      "API tokens (ONEVIEW_API_KEY bearer auth) are transmitted only over HTTPS and checked on every request before any data is returned.",
      "TLS 1.0 and 1.1 are disabled at the CDN layer. Minimum TLS 1.2; TLS 1.3 preferred.",
    ],
  },
  {
    title: "Secrets and key management",
    icon: Key,
    color: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
    bg: "bg-amber-500/[0.04]",
    points: [
      "POSTGRES_URL, POSTGRES_PASSWORD, and LLM_API_KEY are injected at deploy time as environment variables. They are never present in source code or build artifacts.",
      "The .env.local file is listed in .gitignore, committed by default to prevent accidental credential exposure.",
      "The ONEVIEW_API_KEY bearer token for AI agent access is scoped to /api/query and /api/export only. Leaking it does not grant access to raw PII.",
      "Key rotation: replace the env var in the hosting dashboard and redeploy. No code change required.",
    ],
  },
  {
    title: "Access controls and isolation",
    icon: Shield,
    color: "text-violet-600 dark:text-violet-400",
    border: "border-violet-500/20",
    bg: "bg-violet-500/[0.04]",
    points: [
      "No direct database access from the browser. All queries run server-side in Next.js API routes. The database is never exposed on a public port.",
      "Role-based access is enforced at the query layer: caseworker queries include a WHERE program = $1 filter; admin queries are unrestricted.",
      "The PHI Wall is a Postgres Row Level Security policy (phi_wall) on the enrolments table. Cross-program queries add a redundant WHERE filter for defense in depth.",
      "Viewer role receives only aggregated, anonymized metrics. PII columns (full_name, phone, email) are never returned to Viewer-scoped requests.",
    ],
  },
]

export default function PrivacyTab() {
  return (
    <div className="space-y-8">

      {/* ── Security at a Glance ── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SECURITY_CARDS.map((card, i) => (
          <div key={i} className="glass rounded-xl p-5" style={{ borderTop: `3px solid ${card.color}` }}>
            <div className="flex items-center justify-between mb-3">
              <card.icon size={18} style={{ color: card.color }} />
              <span className="px-2 py-0.5 rounded-full text-xs font-mono" style={{ background: `${card.color}22`, color: card.color }}>{card.badge}</span>
            </div>
            <p className="font-sora text-sm text-slate-900 dark:text-white mb-2">{card.title}</p>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* ── Encryption and security in detail ── */}
      <div className="space-y-4">
        <h3 className="font-sora text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <Lock size={16} className="text-emerald-500" />
          How Data Is Protected
        </h3>
        {ENCRYPTION_DETAILS.map((section, i) => (
          <div key={i} className={`glass rounded-xl p-5 border ${section.border}`}>
            <div className={`flex items-center gap-2 mb-4 ${section.color}`}>
              <section.icon size={15} />
              <span className="font-sora text-sm font-semibold">{section.title}</span>
            </div>
            <ul className="space-y-2">
              {section.points.map((point, j) => (
                <li key={j} className="flex items-start gap-2">
                  <CheckCircle size={12} className={`${section.color} mt-0.5 flex-shrink-0`} />
                  <span className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Consent Model ── */}
      <div>
        <h3 className="font-sora text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Eye size={16} className="text-emerald-500" />
          Consent Model
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: <Eye size={18} />, title: "Program Consent", level: "Automatic", desc: "Client enrolled in a program. Data used only for that program's funder reporting.", color: "#10b981" },
            { icon: <Shield size={18} />, title: "Cross-Program Consent", level: "Explicit Opt-In", desc: "Client verbally consents. Caseworker checks box. Data can be used across programs for integrated reporting.", color: "#6366f1" },
            { icon: <BarChart2 size={18} />, title: "Dashboard Aggregation", level: "Implied", desc: "Anonymized aggregate metrics in admin dashboard. No PII. No individual consent required.", color: "#f59e0b" },
          ].map((c, i) => (
            <div key={i} className="glass rounded-xl p-5" style={{ borderTop: `3px solid ${c.color}` }}>
              <div className="flex items-center gap-2 mb-2" style={{ color: c.color }}>
                {c.icon}
                <span className="font-sora text-sm">{c.title}</span>
              </div>
              <div className="text-xs text-slate-500 mb-2">{c.level}</div>
              <p className="text-slate-400 text-sm">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── PHI Wall ── */}
      <div className="glass rounded-xl p-5 border-l-4 border-rose-500">
        <div className="flex items-center gap-2 mb-3">
          <Lock size={18} className="text-rose-600 dark:text-rose-400" />
          <h3 className="font-sora text-lg text-rose-400">PHI Wall (PHIPA)</h3>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Mental Health records are permanently siloed under the Personal Health Information Protection Act (PHIPA). No role, consent flag, or configuration can override this; it is enforced structurally at the database layer.</p>
        <div className="bg-rose-500/[0.06] border border-rose-500/20 rounded-lg p-4 space-y-2">
          {[
            "Enforced by a Postgres Row Level Security policy (phi_wall) on the enrolments table: program != 'mental_health' OR bypass flag set.",
            "No application code path can retrieve mental health records in a cross-program context.",
            "Mental Health enrolments and outcomes are accessible only within the mental_health program scope.",
            "Enforced at the database layer, not as a UI toggle or role permission that could be misconfigured.",
          ].map((point, i) => (
            <div key={i} className="flex items-start gap-2">
              <AlertTriangle size={12} className="text-rose-500 mt-0.5 flex-shrink-0" />
              <span className="text-rose-700 dark:text-rose-300 text-xs leading-relaxed">{point}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Privacy Law Map ── */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-white/[0.08]">
          <h3 className="font-sora text-lg text-slate-700 dark:text-slate-200">Privacy Law by Program</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-white/[0.06]">
              <th className="text-left px-5 py-3 text-slate-500 dark:text-slate-400 font-medium">Program</th>
              <th className="text-left px-5 py-3 text-slate-500 dark:text-slate-400 font-medium">Governing Law</th>
              <th className="text-left px-5 py-3 text-slate-500 dark:text-slate-400 font-medium hidden md:table-cell">Key Rule</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Settlement, Language", "Federal Privacy Act", "Purpose limitation, consent for secondary use"],
              ["Employment, Trades", "FIPPA (Ontario)", "Collection limitation, access controls"],
              ["Mental Health", "PHIPA", "PHI Wall always applies, no exceptions"],
              ["Youth", "CYFSA Part X", "Enhanced protections for minors"],
            ].map(([prog, law, rule], i) => (
              <tr key={i} className="border-b border-slate-50 dark:border-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                <td className="px-5 py-3 text-slate-700 dark:text-slate-300">{prog}</td>
                <td className="px-5 py-3 text-emerald-600 dark:text-emerald-400">{law}</td>
                <td className="px-5 py-3 text-slate-500 hidden md:table-cell">{rule}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Audit Log ── */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-white/[0.08]">
          <h3 className="font-sora text-lg text-slate-700 dark:text-slate-200">Audit Log</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Every write and export operation is logged. Append-only; no application code path can modify or delete entries.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.02]">
                <th className="text-left px-4 py-2.5 text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">Action</th>
                <th className="text-left px-4 py-2.5 text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">Entity</th>
                <th className="text-left px-4 py-2.5 text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">Role</th>
                <th className="text-left px-4 py-2.5 text-slate-500 dark:text-slate-400 font-medium hidden lg:table-cell">Detail</th>
                <th className="text-left px-4 py-2.5 text-slate-500 dark:text-slate-400 font-medium hidden md:table-cell whitespace-nowrap">Source IP</th>
                <th className="text-left px-4 py-2.5 text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {[
                { action: "create_client",   entity: "client",  role: "caseworker", detail: '{"full_name":"A. Hassan","program":"settlement"}',    ip: "142.250.x.x", at: "2026-06-04 09:15:23", roleColor: "text-indigo-600 dark:text-indigo-400" },
                { action: "view_clients",    entity: "clients", role: "caseworker", detail: '{"program":"settlement","count":47}',                 ip: "142.250.x.x", at: "2026-06-04 09:18:44", roleColor: "text-indigo-600 dark:text-indigo-400" },
                { action: "export",          entity: "ircc",    role: "admin",      detail: '{"funder":"ircc","rows":312,"period":"Q1 2026"}',      ip: "198.51.x.x",  at: "2026-06-04 09:22:11", roleColor: "text-emerald-600 dark:text-emerald-400" },
                { action: "ai_query",        entity: "query",   role: "caseworker", detail: '{"question":"Clients who achieved employment?"}',      ip: "142.250.x.x", at: "2026-06-04 09:30:44", roleColor: "text-indigo-600 dark:text-indigo-400" },
                { action: "generate_report", entity: "report",  role: "admin",      detail: '{"funder":"ircc","period":"Q1 2026","cached":false}',  ip: "198.51.x.x",  at: "2026-06-04 09:31:02", roleColor: "text-emerald-600 dark:text-emerald-400" },
                { action: "export",          entity: "eo",      role: "admin",      detail: '{"funder":"eo","rows":189,"period":"Q1 2026"}',        ip: "198.51.x.x",  at: "2026-06-04 09:35:17", roleColor: "text-emerald-600 dark:text-emerald-400" },
                { action: "create_client",   entity: "client",  role: "caseworker", detail: '{"full_name":"M. Osei","program":"employment"}',       ip: "142.250.x.x", at: "2026-06-04 10:02:08", roleColor: "text-indigo-600 dark:text-indigo-400" },
                { action: "generate_report", entity: "report",  role: "admin",      detail: '{"funder":"uw","period":"Q1 2026","cached":true}',     ip: "198.51.x.x",  at: "2026-06-04 10:15:44", roleColor: "text-emerald-600 dark:text-emerald-400" },
              ].map((row, i) => (
                <tr key={i} className="border-b border-slate-50 dark:border-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                  <td className="px-4 py-2.5 font-mono text-emerald-700 dark:text-emerald-400 whitespace-nowrap">{row.action}</td>
                  <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.entity}</td>
                  <td className={`px-4 py-2.5 whitespace-nowrap ${row.roleColor}`}>{row.role}</td>
                  <td className="px-4 py-2.5 font-mono text-slate-400 dark:text-slate-500 hidden lg:table-cell max-w-xs truncate">{row.detail}</td>
                  <td className="px-4 py-2.5 text-slate-400 dark:text-slate-500 hidden md:table-cell font-mono whitespace-nowrap">{row.ip}</td>
                  <td className="px-4 py-2.5 text-slate-400 dark:text-slate-500 font-mono whitespace-nowrap">{row.at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
