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
  await sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS stage text DEFAULT 'intake'`
  await sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS source text DEFAULT 'direct'`
  await sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS country_of_origin text DEFAULT 'CA'`
  await sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS age_group text DEFAULT '25-34'`
  await sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS gender text DEFAULT 'prefer_not_to_say'`
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
  await sql`CREATE TABLE IF NOT EXISTS case_notes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
    author text NOT NULL,
    content text NOT NULL,
    note_type text DEFAULT 'general',
    created_at timestamptz DEFAULT NOW()
  )`
  await sql`CREATE TABLE IF NOT EXISTS surveys (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
    enrolment_id uuid REFERENCES enrolments(id) ON DELETE CASCADE,
    satisfaction int CHECK (satisfaction BETWEEN 1 AND 5),
    would_recommend boolean,
    barriers text,
    success_story text,
    completed_at timestamptz DEFAULT NOW()
  )`
  await sql`CREATE TABLE IF NOT EXISTS placements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
    employer text,
    role_title text,
    sector text,
    wage_hourly numeric,
    placed_at timestamptz DEFAULT NOW(),
    duration_days int
  )`
}

const FIRST_NAMES = ["Amara","Fatima","Mohammed","Ana","Carlos","Priya","David","Sarah","Yusuf","Mei","Elena","Amir","Rosa","James","Nadia","Omar","Linh","Kwame","Isabella","Hassan","Zara","Marco","Aisha","Daniel","Sofia","Ahmed","Maria","Kevin","Layla","Tobias","Nour","Grace","Ivan","Yasmin","Luis","Diane","Khalid","Tanya","Victor","Mira","Jerome","Hana","Ricardo","Olga","Jamal","Boris","Chloe","Rafael","Aditi","Tariq","Yemi","Ingrid","Soren","Leila","Arjun","Chioma","Emeka","Fiona","Gabriel","Halima","Idris","Jamilah","Kenji","Lena","Moussa","Nkechi","Pavel","Quynh","Rahim","Svetlana","Thabo","Ursula","Valentina","Wanjiku","Xochitl","Yolanda","Zuberi","Abena","Bakar","Comfort","Desta","Elan","Freya","Gao","Hira","Ismail","Jaya","Kofi","Lila","Mamadou","Njeri","Olumide","Pita","Rashida","Siham","Taini","Uche","Veronika","Wendell","Xiomara","Yara","Zineb","Adaeze","Biruk","Celeste","Dayo","Elif","Farida","Gopal","Hyun","Imani","Jomo","Awa","Beata","Ceren","Dina","Ezra","Florencia","Ghada","Hiroshi","Ilham","Juanita","Kamau","Luz","Miriam","Natasha","Obi","Paloma","Reza","Salma","Tenzin","Amira","Blessing","Chinara","Demba","Ekene","Fatou","Giselle","Hamid","Ifeoma","Jawad","Kalkidan"]
const LAST_NAMES = ["Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin","Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson","Walker","Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill","Flores","Green","Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell","Carter","Roberts","Patel","Osei","Mensah","Diallo","Tremblay","Bergeron","Kovacs","Petrov","Okafor","Abubakar","Mwangi","Kimani","Nkosi","Dlamini","Abdi","Warsame","Hassan","Ibrahim","Mohamud","Yilmaz","Demir","Kaya","Ahmadi","Rahimi","Hosseini","Tran","Pham","Santos","Ferreira","Oliveira","Sharma","Verma","Gupta","Singh","Kumar","Kaur","Fernandez","Reyes","Cruz","Morales","Jimenez","Romero","Alves","Carvalho","Lima","Sousa","Andrade","Barbosa","Cunha","Fonseca","Gomes","Park","Kim","Chen","Lin","Zhang","Wu","Wang","Li","Nakamura","Tanaka","Sato","Yamamoto","Ito","Coulibaly","Ndiaye","Toure","Traore","Keita","Diop","Olu","Achebe","Nwosu","Eze","Ramos","Vargas","Medina","Guerrero","Ortega","Castillo","Espinoza","Vega","Ochoa","Silva","Souza","Costa","Pereira","Rodrigues","Almeida","Ribeiro","Aziz","Bakr","Nassar","Boateng","Asante","Gyamfi"]
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
  language:["CLBA language assessment and CLB level confirmed","Intermediate to advanced language benchmarks achieved (CLB 4-6)","Language goals met; eligible for citizenship or further education"],
  mental_health:["Initial individual counselling session completed","Support group or wellness workshop attended","Ongoing personalized mental health care plan established"],
  trades:["Pre-apprenticeship skills assessment and safety certifications completed","Technical training and workplace readiness coaching underway","Trade certification or apprenticeship placement secured"],
  mentoring:["Matched with industry-specific mentor in field of practice","Three or more mentoring sessions completed; professional network expanded","Career goal achieved through mentoring relationship"],
  youth:["Enrolled in youth program with paid training component secured","Sector-specific skill workshops and career counselling completed","Paid work placement or post-secondary education pathway launched"],
  women:["Program intake and skills assessment completed","Skills training and sector-specific workshops attended","Employment, certification, or career advancement achieved"]
}

const STAGES = ["outreach","vetting","eligibility","intake","training","placement","survey","complete"]
const SOURCES = ["referral","walk_in","microsoft_forms","partner_agency","website","phone"]
const COUNTRIES = ["SO","IN","SY","PH","CO","NG","ET","UA","MX","CN","PK","BD","KE","GH","JM","BR","EG","IR","AF","TZ"]
const AGE_GROUPS = ["18-24","25-34","35-44","45-54","55+"]
const GENDERS = ["female","male","non_binary","prefer_not_to_say"]
const BARRIERS_LIST = ["Transportation","Language barrier","Childcare","Work schedule","None"]
const NOTE_AUTHORS = ["Maria Santos","James Osei","Priya Sharma","Ahmed Hassan","Laura Tremblay"]
const NOTE_CONTENTS = [
  "Initial assessment completed. Client shows strong motivation and clear goals.",
  "Follow-up call: client is progressing well in training. Attendance excellent.",
  "Interview prep session completed. Resume polished to Canadian standard.",
  "Eligibility confirmed. All documentation reviewed and in order.",
  "Client placed successfully with employer partner. Follow-up scheduled in 30 days."
]
const NOTE_TYPES = ["assessment","progress","coaching","eligibility","placement"]

const EMPLOYERS = ['Deloitte','CIBC','RBC','Shopify','Rogers','Bell','SickKids','TTC','City of Toronto','Hudson Bay','Tim Hortons','Amazon Canada','Google Canada','Microsoft Canada','Loblaw','Scotiabank','TD Bank','Maple Leaf Foods','University of Toronto','York University']
const ROLES = ['Software Developer','Data Analyst','Healthcare Assistant','Project Coordinator','Administrative Assistant','Warehouse Associate','Customer Service Rep','Accounting Clerk','IT Support Specialist','Marketing Coordinator','Trades Apprentice','Network Technician','HR Assistant','Payroll Clerk','Lab Technician']
const SECTORS = ['technology','healthcare','trades','admin','food-service','retail','education','finance','other']
const WAGES_HOURLY = [17, 20, 24, 28, 32, 38, 45, 52]

export async function seedDatabase() {
  const count = await sql`SELECT COUNT(*) as c FROM clients`
  if (parseInt(count.rows[0].c) > 0) return

  const CHUNK = 1000
  const conn = await db.connect()
  try {
    let clientIndex = 0

    type AllRow = { clientId: string; enrolId: string; idx: number; program: string }
    const allRows: AllRow[] = []

    for (const program of PROGRAMS) {
      const volume = SEED_VOLUMES[program]
      const funder = PROGRAM_FUNDERS[program]
      const labels = OUTCOME_LABELS[program]

      type Row = { clientId: string; enrolId: string; idx: number }
      const rows: Row[] = Array.from({ length: volume }, (_, i) => {
        const idx = clientIndex + i
        return {
          clientId: randomUUID(),
          enrolId: randomUUID(),
          idx,
        }
      })
      clientIndex += volume

      for (const row of rows) {
        allRows.push({ ...row, program })
      }

      for (let start = 0; start < rows.length; start += CHUNK) {
        const chunk = rows.slice(start, start + CHUNK)

        // 9 fields per client row: id, full_name, primary_language, immigration_stream, stage, source, country_of_origin, age_group, gender
        const cVals = chunk.map((_, j) =>
          `($${j * 9 + 1},$${j * 9 + 2},$${j * 9 + 3},$${j * 9 + 4},$${j * 9 + 5},$${j * 9 + 6},$${j * 9 + 7},$${j * 9 + 8},$${j * 9 + 9})`
        ).join(",")
        const cParams = chunk.flatMap(r => [
          r.clientId,
          FIRST_NAMES[r.idx % FIRST_NAMES.length] + " " + LAST_NAMES[Math.floor(r.idx / FIRST_NAMES.length) % LAST_NAMES.length],
          LANGUAGES[(r.idx * 7) % LANGUAGES.length],
          STREAMS[(r.idx * 5) % STREAMS.length],
          STAGES[(r.idx * 3) % 8],
          SOURCES[(r.idx * 11) % 6],
          COUNTRIES[(r.idx * 7 + Math.floor(r.idx / 3)) % 20],
          AGE_GROUPS[(r.idx * 3) % 5],
          GENDERS[(r.idx * 3) % 4],
        ])
        await conn.query(
          `INSERT INTO clients (id,full_name,primary_language,immigration_stream,stage,source,country_of_origin,age_group,gender) VALUES ${cVals}`,
          cParams
        )

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

    // Seed placements for placed/complete clients
    const placementRows = allRows.filter(r => {
      const stage = STAGES[(r.idx * 3) % 8]
      return stage === 'placement' || stage === 'complete'
    })
    for (let start = 0; start < placementRows.length; start += CHUNK) {
      const chunk = placementRows.slice(start, start + CHUNK)
      const pVals = chunk.map((_, j) =>
        `($${j * 7 + 1},$${j * 7 + 2},$${j * 7 + 3},$${j * 7 + 4},$${j * 7 + 5},$${j * 7 + 6},$${j * 7 + 7})`
      ).join(",")
      const pParams = chunk.flatMap(r => [
        randomUUID(),
        r.clientId,
        EMPLOYERS[r.idx % EMPLOYERS.length],
        ROLES[(r.idx * 3) % ROLES.length],
        SECTORS[(r.idx * 5) % SECTORS.length],
        WAGES_HOURLY[(r.idx * 7) % WAGES_HOURLY.length],
        30 + (r.idx % 12) * 15,
      ])
      await conn.query(
        `INSERT INTO placements (id,client_id,employer,role_title,sector,wage_hourly,duration_days) VALUES ${pVals}`,
        pParams
      )
    }

    // Seed surveys for clients where idx % 3 === 0 (~6380 records)
    const surveyRows = allRows.filter(r => r.idx % 3 === 0)
    for (let start = 0; start < surveyRows.length; start += CHUNK) {
      const chunk = surveyRows.slice(start, start + CHUNK)
      const sVals = chunk.map((_, j) =>
        `($${j * 6 + 1},$${j * 6 + 2},$${j * 6 + 3},$${j * 6 + 4},$${j * 6 + 5},$${j * 6 + 6})`
      ).join(",")
      const sParams = chunk.flatMap(r => [
        r.clientId,
        r.enrolId,
        (r.idx % 5) + 1,
        r.idx % 4 !== 0,
        BARRIERS_LIST[r.idx % 5],
        null,
      ])
      await conn.query(
        `INSERT INTO surveys (client_id,enrolment_id,satisfaction,would_recommend,barriers,success_story) VALUES ${sVals}`,
        sParams
      )
    }

    // Seed case_notes: stop after 500 total notes
    let noteCount = 0
    const noteChunkRows: Array<{ clientId: string; idx: number }> = []
    for (const r of allRows) {
      if (noteCount >= 500) break
      noteChunkRows.push({ clientId: r.clientId, idx: r.idx })
      noteCount++
    }
    for (let start = 0; start < noteChunkRows.length; start += CHUNK) {
      const chunk = noteChunkRows.slice(start, start + CHUNK)
      const nVals = chunk.map((_, j) =>
        `($${j * 4 + 1},$${j * 4 + 2},$${j * 4 + 3},$${j * 4 + 4})`
      ).join(",")
      const nParams = chunk.flatMap(r => [
        r.clientId,
        NOTE_AUTHORS[r.idx % 5],
        NOTE_CONTENTS[r.idx % 5],
        NOTE_TYPES[r.idx % 5],
      ])
      await conn.query(
        `INSERT INTO case_notes (client_id,author,content,note_type) VALUES ${nVals}`,
        nParams
      )
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
  full_name: string
  primary_language: string
  immigration_stream: string
  program: string
  funder: string
  consent_cross_program?: boolean
  stage?: string
  source?: string
  country_of_origin?: string
  age_group?: string
  gender?: string
}) {
  const clientResult = await sql`
    INSERT INTO clients (full_name, primary_language, immigration_stream, stage, source, country_of_origin, age_group, gender)
    VALUES (${data.full_name}, ${data.primary_language}, ${data.immigration_stream},
      ${data.stage ?? 'intake'}, ${data.source ?? 'direct'}, ${data.country_of_origin ?? 'CA'},
      ${data.age_group ?? '25-34'}, ${data.gender ?? 'prefer_not_to_say'})
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

export async function getAuditLog(limit = 50, offset = 0) {
  const result = await sql`
    SELECT id, action, entity, detail, user_role, source_ip, at
    FROM audit_log
    ORDER BY at DESC
    LIMIT ${limit} OFFSET ${offset}`
  return result.rows
}

export async function getAuditLogCount() {
  const result = await sql`SELECT COUNT(*) as c FROM audit_log`
  return parseInt(result.rows[0].c)
}

export async function searchClients(query: string, limit = 20) {
  const like = `%${query}%`
  const result = await sql`
    SELECT c.id, c.full_name, c.primary_language, c.immigration_stream, c.created_at,
      COUNT(e.id) as enrolment_count,
      array_agg(DISTINCT e.program) FILTER (WHERE e.program IS NOT NULL) as programs
    FROM clients c
    LEFT JOIN enrolments e ON e.client_id = c.id
    WHERE c.full_name ILIKE ${like}
    GROUP BY c.id
    ORDER BY c.full_name
    LIMIT ${limit}`
  return result.rows
}

export async function getClientJourney(clientId: string) {
  const clientRes = await sql`SELECT * FROM clients WHERE id = ${clientId}`
  if (!clientRes.rows[0]) return null
  const enrolRes = await sql`
    SELECT e.id, e.program, e.funder, e.consent_cross_program, e.enrolled_at,
      json_agg(
        json_build_object('id', o.id, 'tier', o.tier, 'label', o.label, 'achieved', o.achieved, 'recorded_at', o.recorded_at)
        ORDER BY CASE o.tier WHEN 'immediate' THEN 1 WHEN 'intermediate' THEN 2 ELSE 3 END
      ) as outcomes
    FROM enrolments e
    LEFT JOIN outcomes o ON o.enrolment_id = e.id
    WHERE e.client_id = ${clientId}
    GROUP BY e.id
    ORDER BY e.enrolled_at ASC`
  return { client: clientRes.rows[0], enrolments: enrolRes.rows }
}

export async function getAnalyticsData() {
  const [stageRes, countryRes, programRes, surveyRes, sourceRes, ageRes, genderRes, totalRes] = await Promise.all([
    sql`SELECT stage, COUNT(*) as count FROM clients GROUP BY stage ORDER BY count DESC`,
    sql`SELECT country_of_origin, COUNT(*) as count FROM clients GROUP BY country_of_origin ORDER BY count DESC LIMIT 20`,
    sql`SELECT e.program,
      COUNT(DISTINCT e.client_id) as clients,
      ROUND(AVG(CASE WHEN o.achieved THEN 100.0 ELSE 0 END), 1) as outcome_rate
      FROM enrolments e LEFT JOIN outcomes o ON o.enrolment_id = e.id
      GROUP BY e.program ORDER BY clients DESC`,
    sql`SELECT
      ROUND(AVG(satisfaction), 1) as avg_sat,
      COUNT(*) as total,
      ROUND(SUM(CASE WHEN would_recommend THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as recommend_pct
      FROM surveys`,
    sql`SELECT source, COUNT(*) as count FROM clients GROUP BY source ORDER BY count DESC`,
    sql`SELECT age_group, COUNT(*) as count FROM clients GROUP BY age_group ORDER BY count DESC`,
    sql`SELECT gender, COUNT(*) as count FROM clients GROUP BY gender ORDER BY count DESC`,
    sql`SELECT COUNT(*) as c FROM clients`,
  ])
  return {
    total: parseInt(totalRes.rows[0].c),
    byStage: stageRes.rows,
    byCountry: countryRes.rows,
    programPerformance: programRes.rows,
    surveyStats: surveyRes.rows[0],
    bySource: sourceRes.rows,
    byAgeGroup: ageRes.rows,
    byGender: genderRes.rows,
  }
}

export async function getPipelineClients(limit = 200) {
  const result = await sql`
    SELECT c.id, c.full_name, c.country_of_origin, c.stage, c.source,
      c.primary_language, c.immigration_stream, c.created_at,
      e.program, e.funder, e.enrolled_at,
      COUNT(o.id) FILTER (WHERE o.achieved = true) as outcomes_achieved,
      COUNT(o.id) as outcomes_total
    FROM clients c
    JOIN enrolments e ON e.client_id = c.id
    LEFT JOIN outcomes o ON o.enrolment_id = e.id
    GROUP BY c.id, e.id
    ORDER BY c.created_at DESC
    LIMIT ${limit}`
  return result.rows
}

export async function getClientNotes(clientId: string) {
  const result = await sql`
    SELECT * FROM case_notes WHERE client_id = ${clientId} ORDER BY created_at DESC`
  return result.rows
}

export async function addClientNote(clientId: string, author: string, content: string, noteType = 'general') {
  const result = await sql`
    INSERT INTO case_notes (client_id, author, content, note_type)
    VALUES (${clientId}, ${author}, ${content}, ${noteType})
    RETURNING *`
  return result.rows[0]
}

export async function getClientSurvey(clientId: string) {
  const result = await sql`
    SELECT s.*, e.program FROM surveys s
    JOIN enrolments e ON e.id = s.enrolment_id
    WHERE s.client_id = ${clientId}
    ORDER BY s.completed_at DESC LIMIT 1`
  return result.rows[0] ?? null
}

export async function getClientsForExport(programs: string[]) {
  const programList = programs.join("','")
  const result = await sql.query(
    `SELECT c.id, c.full_name, c.primary_language, c.immigration_stream, c.created_at,
      e.id as enrolment_id, e.program, e.funder, e.consent_cross_program, e.enrolled_at,
      json_agg(json_build_object('tier', o.tier, 'label', o.label, 'achieved', o.achieved)) FILTER (WHERE o.id IS NOT NULL) as outcomes
     FROM clients c
     JOIN enrolments e ON e.client_id = c.id
     LEFT JOIN outcomes o ON o.enrolment_id = e.id
     WHERE e.program = ANY($1::text[])
     GROUP BY c.id, e.id
     ORDER BY e.enrolled_at DESC`,
    [programs]
  )
  return result.rows
}

export async function getRecentClients(limit = 20) {
  const result = await sql.query(
    `SELECT c.id, c.full_name, c.primary_language, c.immigration_stream, c.stage,
      c.country_of_origin, c.created_at,
      e.program, e.funder, e.enrolled_at,
      COUNT(o.id) FILTER (WHERE o.achieved = true) as outcomes_achieved,
      COUNT(o.id) as outcomes_total
     FROM clients c
     JOIN enrolments e ON e.client_id = c.id
     LEFT JOIN outcomes o ON o.enrolment_id = e.id
     GROUP BY c.id, e.id
     ORDER BY c.created_at DESC
     LIMIT $1`,
    [limit]
  )
  return result.rows
}

export async function getMonthlyIntakeTrend() {
  const result = await sql`
    SELECT
      TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YY') as month,
      DATE_TRUNC('month', created_at) as month_date,
      COUNT(*) as count
    FROM clients
    WHERE created_at >= NOW() - INTERVAL '12 months'
    GROUP BY month_date
    ORDER BY month_date ASC`
  return result.rows
}

export async function getSurveyStats() {
  const [aggRes, totalClientsRes] = await Promise.all([
    sql`
      SELECT
        ROUND(AVG(satisfaction), 1) as avg_sat,
        COUNT(*) as total,
        ROUND(SUM(CASE WHEN would_recommend THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 1) as recommend_pct
      FROM surveys
      WHERE satisfaction IS NOT NULL`,
    sql`SELECT COUNT(*) as total FROM clients`,
  ])

  const agg = aggRes.rows[0]
  const totalSurveys = parseInt(agg.total) || 0
  const totalClients = parseInt(totalClientsRes.rows[0].total) || 0

  return {
    avgSatisfaction: agg.avg_sat,
    totalSurveys,
    recommendPct: agg.recommend_pct,
    completionRate: totalClients > 0 ? Math.round((totalSurveys / totalClients) * 100) : 0,
  }
}
