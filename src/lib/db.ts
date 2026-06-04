import { sql, db } from "@vercel/postgres"
import { randomUUID } from "crypto"

export async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS clients (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      full_name text NOT NULL,
      primary_language text,
      immigration_stream text,
      created_at timestamptz DEFAULT NOW()
    )`
  await sql`
    CREATE TABLE IF NOT EXISTS enrolments (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
      program text NOT NULL,
      funder text NOT NULL,
      consent_cross_program boolean DEFAULT false,
      enrolled_at timestamptz DEFAULT NOW()
    )`
  await sql`
    CREATE TABLE IF NOT EXISTS outcomes (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      enrolment_id uuid REFERENCES enrolments(id) ON DELETE CASCADE,
      tier text NOT NULL,
      label text NOT NULL,
      achieved boolean DEFAULT false,
      recorded_at timestamptz DEFAULT NOW()
    )`
  await sql`
    CREATE TABLE IF NOT EXISTS audit_log (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      action text NOT NULL,
      entity text,
      detail jsonb,
      user_role text,
      source_ip text,
      at timestamptz DEFAULT NOW()
    )`
  await sql`
    CREATE TABLE IF NOT EXISTS report_cache (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      funder text NOT NULL,
      period text NOT NULL,
      narrative text NOT NULL,
      created_at timestamptz DEFAULT NOW(),
      UNIQUE(funder, period)
    )`
}

const FIRST_NAMES = ["Amara","Fatima","Mohammed","Ana","Carlos","Priya","David","Sarah","Yusuf","Mei","Elena","Amir","Rosa","James","Nadia","Omar","Linh","Kwame","Isabella","Hassan","Zara","Marco","Aisha","Daniel","Sofia","Ahmed","Maria","Kevin","Layla","Tobias","Nour","Grace","Ivan","Yasmin","Luis","Diane","Khalid","Tanya","Victor","Mira","Jerome","Hana","Ricardo","Olga","Jamal","Nadia","Elena","Boris","Chloe","Rafael"]
const LAST_NAMES = ["Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin","Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson","Walker","Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill","Flores","Green","Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell","Carter","Roberts","Patel"]
const LANGUAGES = ["English","Arabic","Somali","Spanish","Tagalog","Mandarin","Hindi","French","Portuguese","Ukrainian","Tigrinya","Amharic","Punjabi","Vietnamese","Persian"]
const STREAMS = ["Refugee","Economic Immigrant","Family Reunification","International Student","Temporary Worker"]

const PROGRAMS = ["settlement","employment","language","mental_health","trades","mentoring","youth","women"]
const PROGRAM_FUNDERS: Record<string,string> = {
  settlement:"ircc",language:"ircc",employment:"eo",trades:"eo",
  mental_health:"uw",youth:"uw",mentoring:"city",women:"city"
}
const SEED_VOLUMES: Record<string,number> = {
  settlement:4120,employment:5380,language:3010,mental_health:1240,
  trades:980,mentoring:1450,youth:1620,women:1340
}
const OUTCOME_LABELS: Record<string,string[]> = {
  settlement:["Settlement needs assessment and service plan completed","Referral to community, healthcare, or legal services completed","Successfully settled and independently navigating life in Canada"],
  employment:["Canadian-format resume and cover letter developed","Job interview coaching and placement support received","Employment secured in field of qualification"],
  language:["CLBA language assessment and CLB level confirmed","Intermediate to advanced language benchmarks achieved (CLB 4-6)","Language goals met — eligible for citizenship or further education"],
  mental_health:["Initial individual counselling session completed","Support group or wellness workshop attended","Ongoing personalized mental health care plan established"],
  trades:["Pre-apprenticeship skills assessment and safety certifications completed","Technical training and workplace readiness coaching underway","Trade certification or apprenticeship placement secured"],
  mentoring:["Matched with industry-specific mentor in field of practice","Three or more mentoring sessions completed; professional network expanded","Career goal achieved through mentoring relationship"],
  youth:["Enrolled in youth program with paid training component secured","Sector-specific skill workshops and career counselling completed","Paid work placement or post-secondary education pathway launched"],
  women:["Program intake and skills assessment completed","Skills training and sector-specific workshops attended","Employment, certification, or career advancement achieved"]
}

export async function seedDatabase() {
  const count = await sql`SELECT COUNT(*) as c FROM clients`
  if (parseInt(count.rows[0].c) > 0) return

  const CHUNK = 1000
  const conn = await db.connect()
  try {
    let clientIndex = 0
    for (const program of PROGRAMS) {
      const volume = SEED_VOLUMES[program]
      const funder = PROGRAM_FUNDERS[program]
      const labels = OUTCOME_LABELS[program]

      type Row = { clientId: string; enrolId: string; idx: number }
      const rows: Row[] = Array.from({ length: volume }, (_, i) => ({
        clientId: randomUUID(),
        enrolId: randomUUID(),
        idx: clientIndex + i,
      }))
      clientIndex += volume

      for (let start = 0; start < rows.length; start += CHUNK) {
        const chunk = rows.slice(start, start + CHUNK)

        const cVals = chunk.map((_, j) => `($${j * 4 + 1},$${j * 4 + 2},$${j * 4 + 3},$${j * 4 + 4})`).join(",")
        const cParams = chunk.flatMap(r => [
          r.clientId,
          FIRST_NAMES[r.idx % FIRST_NAMES.length] + " " + LAST_NAMES[(r.idx * 3) % LAST_NAMES.length],
          LANGUAGES[(r.idx * 7) % LANGUAGES.length],
          STREAMS[(r.idx * 5) % STREAMS.length],
        ])
        await conn.query(`INSERT INTO clients (id,full_name,primary_language,immigration_stream) VALUES ${cVals}`, cParams)

        const eVals = chunk.map((_, j) => `($${j * 5 + 1},$${j * 5 + 2},$${j * 5 + 3},$${j * 5 + 4},$${j * 5 + 5})`).join(",")
        const eParams = chunk.flatMap(r => [r.enrolId, r.clientId, program, funder, r.idx % 5 === 0])
        await conn.query(`INSERT INTO enrolments (id,client_id,program,funder,consent_cross_program) VALUES ${eVals}`, eParams)

        const oRows: string[] = []
        const oParams: (string | boolean)[] = []
        let p = 1
        for (let k = 0; k < chunk.length; k++) {
          const r = chunk[k], i = start + k
          for (const [tier, label, achieved] of [
            ["immediate", labels[0], i % 3 === 0],
            ["intermediate", labels[1], i % 5 === 0],
            ["ultimate", labels[2], i % 10 === 0],
          ] as [string, string, boolean][]) {
            oRows.push(`($${p},$${p + 1},$${p + 2},$${p + 3})`)
            oParams.push(r.enrolId, tier, label, achieved)
            p += 4
          }
        }
        await conn.query(`INSERT INTO outcomes (enrolment_id,tier,label,achieved) VALUES ${oRows.join(",")}`, oParams)
      }
    }
  } finally {
    conn.release()
  }
}

export async function getClients() {
  const [clientsRes, totalRes, programRes, crossRes, outcomesRes] = await Promise.all([
    sql`
      SELECT c.id, c.full_name, c.primary_language, c.immigration_stream, c.created_at,
        e.program, e.funder, e.consent_cross_program, e.enrolled_at,
        COUNT(o.id) FILTER (WHERE o.achieved = true) as outcomes_achieved,
        COUNT(o.id) as outcomes_total
      FROM clients c
      JOIN enrolments e ON e.client_id = c.id
      LEFT JOIN outcomes o ON o.enrolment_id = e.id
      GROUP BY c.id, e.id
      ORDER BY c.created_at DESC
      LIMIT 50`,
    sql`SELECT COUNT(*) as c FROM clients`,
    sql`SELECT program, COUNT(*) as count FROM enrolments GROUP BY program ORDER BY count DESC`,
    sql`SELECT COUNT(*) as c FROM enrolments WHERE consent_cross_program = true`,
    sql`SELECT COUNT(*) FILTER (WHERE achieved = true) as achieved, COUNT(*) as total FROM outcomes`,
  ])

  const total = parseInt(totalRes.rows[0].c)
  const byProgram: Record<string, number> = {}
  for (const row of programRes.rows) {
    byProgram[row.program] = parseInt(row.count)
  }
  const crossProgram = parseInt(crossRes.rows[0].c)
  const achievedOutcomes = parseInt(outcomesRes.rows[0].achieved)
  const totalOutcomes = parseInt(outcomesRes.rows[0].total)

  return {
    clients: clientsRes.rows,
    metrics: {
      total,
      active: total,
      crossProgram,
      outcomesAchievedPct: totalOutcomes > 0 ? Math.round((achievedOutcomes / totalOutcomes) * 100) : 0,
      byProgram,
    }
  }
}

export async function createClient(data: {
  full_name: string, primary_language: string, immigration_stream: string,
  program: string, funder: string, consent_cross_program?: boolean
}) {
  const clientResult = await sql`
    INSERT INTO clients (full_name, primary_language, immigration_stream)
    VALUES (${data.full_name}, ${data.primary_language}, ${data.immigration_stream})
    RETURNING id`
  const clientId = clientResult.rows[0].id

  const enrolResult = await sql`
    INSERT INTO enrolments (client_id, program, funder, consent_cross_program)
    VALUES (${clientId}, ${data.program}, ${data.funder}, ${data.consent_cross_program ?? false})
    RETURNING id`
  const enrolId = enrolResult.rows[0].id

  const labels = OUTCOME_LABELS[data.program] || ["Initial assessment","Progress milestone","Goal achieved"]
  await sql`INSERT INTO outcomes (enrolment_id,tier,label) VALUES (${enrolId},'immediate',${labels[0]})`
  await sql`INSERT INTO outcomes (enrolment_id,tier,label) VALUES (${enrolId},'intermediate',${labels[1]})`
  await sql`INSERT INTO outcomes (enrolment_id,tier,label) VALUES (${enrolId},'ultimate',${labels[2]})`

  return { clientId, enrolId }
}

export async function getCachedReport(funder: string, period: string) {
  const result = await sql`SELECT narrative FROM report_cache WHERE funder=${funder} AND period=${period}`
  return result.rows[0]?.narrative ?? null
}

export async function cacheReport(funder: string, period: string, narrative: string) {
  await sql`
    INSERT INTO report_cache (funder, period, narrative)
    VALUES (${funder}, ${period}, ${narrative})
    ON CONFLICT (funder, period) DO UPDATE SET narrative=EXCLUDED.narrative, created_at=NOW()`
}

export async function logAudit(action: string, entity: string, detail: object, userRole: string, sourceIp: string) {
  await sql`
    INSERT INTO audit_log (action, entity, detail, user_role, source_ip)
    VALUES (${action}, ${entity}, ${JSON.stringify(detail)}, ${userRole}, ${sourceIp})`
}
