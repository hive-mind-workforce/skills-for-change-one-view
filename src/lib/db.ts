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
  await sql`ALTER TABLE surveys ADD COLUMN IF NOT EXISTS outcome_confirmed boolean DEFAULT false`
  // Unique constraint so we can upsert surveys per client
  await sql`DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'surveys_client_id_unique') THEN
      ALTER TABLE surveys ADD CONSTRAINT surveys_client_id_unique UNIQUE (client_id);
    END IF;
  END $$`
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
const SOURCES = ["referral","walk-in","online","event","partner","direct"]
const COUNTRIES = ["SO","IN","SY","PH","CO","NG","ET","UA","MX","CN","VN","BD","KE","GH","JM","BR","EG","IR","AF","TZ"]
const AGE_GROUPS = ["18-24","25-34","35-44","45-54","55+"]
const GENDERS = ["Woman","Man","Non-binary","Two-Spirit","Transgender woman","Transgender man","Genderfluid","Agender","Gender non-conforming","Genderqueer","Bigender","Questioning","Prefer not to say"]
const BARRIERS_LIST = ["Transportation","Language barrier","Childcare","Work schedule","None"]
const SUCCESS_STORIES = [
  "After completing the program I secured a full-time position as an accounting clerk. The resume workshop and mock interviews made all the difference.",
  "Skills for Change helped me understand the Canadian workplace culture. Within three months of graduating I was hired by a healthcare company.",
  "The language training gave me the confidence to communicate with my colleagues and supervisors. I just received my first promotion.",
  "I came to Canada not knowing anyone. The mentoring program connected me with a professional in my field and I now work at the same company.",
  "The childcare support during training sessions was essential for me as a single mother. I finished the program and found stable employment.",
  "My caseworker helped me get my foreign credentials recognized. I am now practicing my profession in Canada for the first time in four years.",
  "The trades certification opened doors I thought were closed to me as a newcomer. I am earning more than I ever did in my home country.",
  "The youth program showed me a clear path forward. I enrolled in college and received a scholarship with support from my program coordinator.",
  "I arrived not speaking English well. Through LINC classes I reached CLB 7 and I am now studying for my Canadian citizenship exam.",
  "The settlement advisor guided me through every government form. Within six months our family had housing, school placements, and health cards.",
  "I had no connections in Canada. After the mentoring program I had a network of twenty professionals who opened doors I did not know existed.",
  "The electrical pre-apprenticeship gave me a Red Seal path. I start my registered apprenticeship next month at a union contractor.",
  "Arriving as a refugee I felt lost. The youth caseworker helped me enrol in high school and apply for a co-op placement at a tech firm.",
  "The women's program was the first place I felt safe asking for help. I completed my pharmacy technician certificate and accepted a full-time offer.",
  "I spoke no French or English on arrival. Two years of language classes later I passed the IELTS at a level that unlocked my university application.",
  "My engineering credentials were not recognized here. Skills for Change connected me with a bridging program and I now work as a project engineer.",
  "The peer support group met every Thursday. Knowing others shared my experience gave me the strength to keep going through a very difficult winter.",
  "After job searching alone for eight months I joined the employment program. Within six weeks I had three interviews and one offer.",
  "The trades program covered my tools, my safety boots, and my certification exam fees. Barriers I could not have removed on my own.",
  "My mentor had walked the same path fifteen years earlier. Her guidance saved me years of trial and error navigating the Canadian finance sector.",
  "The interview coaching sessions were recorded so I could watch myself and improve. By my fifth mock interview I felt genuinely confident.",
  "Settlement services helped us understand our rights as tenants. We moved out of an unsafe unit and into stable housing within two months.",
  "I joined the youth program unsure of my future. I leave with a college acceptance, a part-time job, and a clear plan for the next three years.",
  "The employer partnership meant I interviewed for a real position on graduation day. I started work the following Monday.",
  "Language classes were scheduled around my work shifts. Skills for Change made it possible to learn and earn at the same time.",
  "My caseworker attended the credential recognition meeting with me. Having an advocate in the room changed the outcome completely.",
  "The network of alumni from the program became my community in a new city. Three years later those friendships are still my strongest support.",
  "The women's entrepreneurship module gave me the skills to register my catering business. I now employ two other program graduates.",
  "After the trades program I earned more in my first year than I did in five years in my home country. Canada gave me a second career.",
  "I completed the mental health program and learned to name what I was feeling. That vocabulary alone helped me communicate with my doctor and my family.",
]
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

  const TOTAL = Object.values(SEED_VOLUMES).reduce((a, b) => a + b, 0) // 19140
  const PRIME = 7919 // coprime with 19140, so bijection covers all indices

  // Stage distribution: most clients completed, small active pipeline, tiny drop-off
  // complete+placement+survey = 80%, dropped = 2% → success rate = 80/82 = 97.6%
  function stageForIdx(idx: number): string {
    const v = (idx * PRIME) % 100
    if (v < 1)  return "outreach"
    if (v < 3)  return "vetting"
    if (v < 5)  return "eligibility"
    if (v < 10) return "intake"
    if (v < 18) return "training"
    if (v < 28) return "placement"
    if (v < 40) return "survey"
    if (v < 98) return "complete"
    return "dropped"
  }

  // Spread created_at over 18 months; power 2.0 puts ~24% of clients in the last 30 days
  // producing a clear upward monthly intake trend and meaningful differences across time intervals
  function createdAtForIdx(idx: number): string {
    const dateIdx = (idx * PRIME) % TOTAL
    const daysBack = Math.floor(540 * Math.pow(1 - dateIdx / (TOTAL - 1), 2.0))
    return new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString()
  }

  // Weighted gender: reflects diverse client population
  function genderForIdx(idx: number): string {
    const v = (idx * 7919) % 1000
    if (v < 500) return "Woman"
    if (v < 880) return "Man"
    if (v < 910) return "Non-binary"
    if (v < 920) return "Two-Spirit"
    if (v < 932) return "Transgender woman"
    if (v < 944) return "Transgender man"
    if (v < 954) return "Genderfluid"
    if (v < 960) return "Agender"
    if (v < 970) return "Gender non-conforming"
    if (v < 976) return "Genderqueer"
    if (v < 982) return "Bigender"
    if (v < 992) return "Questioning"
    if (v < 995) return "Neutrois"
    if (v < 998) return "Demi-girl"
    return "Prefer not to say"
  }

  // Weighted source: referral/partner dominate, online growing, event/direct rare
  function sourceForIdx(idx: number): string {
    const v = (idx * 3571) % 100
    if (v < 35) return "referral"
    if (v < 58) return "partner"
    if (v < 73) return "walk-in"
    if (v < 85) return "online"
    if (v < 93) return "event"
    return "direct"
  }

  // Weighted age: newcomer population skews young (18-34 = 75% of clients)
  function ageForIdx(idx: number): string {
    const v = (idx * 6271) % 100
    if (v < 35) return "18-24"
    if (v < 75) return "25-34"
    if (v < 90) return "35-44"
    if (v < 97) return "45-54"
    return "55+"
  }

  // Per-program outcome rates [immediate%, intermediate%, ultimate%]
  // High base rates reflecting a high-performing organisation
  const PROGRAM_OUTCOME_RATES: Record<string, [number, number, number]> = {
    settlement:   [93, 84, 72],
    employment:   [96, 90, 80],
    language:     [94, 87, 75],
    mental_health:[86, 74, 60],
    trades:       [97, 92, 84],
    mentoring:    [93, 85, 74],
    youth:        [91, 84, 72],
    women:        [94, 87, 76],
  }

  function outcomeAchieved(idx: number, tier: string, program: string): boolean {
    const rates = PROGRAM_OUTCOME_RATES[program] ?? [70, 50, 30]
    const tierIdx = tier === "immediate" ? 0 : tier === "intermediate" ? 1 : 2
    // Recent clients get a slight boost (creates upward trend in short-interval views)
    const dateIdx = (idx * PRIME) % TOTAL
    const recencyBucket = Math.floor(dateIdx / (TOTAL / 10)) // 0=oldest, 9=newest
    // Recency boost so 30d view shows better rates than all-time
    const adjustedRate = Math.min(99, rates[tierIdx] + recencyBucket * 1)
    const seed = (idx * 3571 + tierIdx * 1000) % 100
    return seed < adjustedRate
  }

  // Per-program satisfaction baselines: % who give 5 stars (avg sat ~4.7/5)
  const SAT_FIVE_RATE: Record<string, number> = {
    employment: 82, trades: 80, mentoring: 78, language: 76,
    settlement: 74, women: 80, youth: 72, mental_health: 66,
  }
  // Per-program recommend rates
  const REC_RATE: Record<string, number> = {
    employment: 97, trades: 96, mentoring: 95, language: 94,
    settlement: 93, women: 95, youth: 91, mental_health: 85,
  }

  function surveySat(idx: number, program: string): number {
    const give5 = SAT_FIVE_RATE[program] ?? 62
    const v = (idx * 3571) % 100
    if (v < give5) return 5
    if (v < give5 + 20) return 4
    if (v < give5 + 28) return 3
    if (v < give5 + 32) return 2
    return 1
  }

  const CHUNK = 1000
  const conn = await db.connect()
  try {
    let clientIndex = 0

    type AllRow = { clientId: string; enrolId: string; idx: number; program: string; stage: string }
    const allRows: AllRow[] = []

    for (const program of PROGRAMS) {
      const volume = SEED_VOLUMES[program]
      const funder = PROGRAM_FUNDERS[program]
      const labels = OUTCOME_LABELS[program]

      type Row = { clientId: string; enrolId: string; idx: number }
      const rows: Row[] = Array.from({ length: volume }, (_, i) => {
        const idx = clientIndex + i
        return { clientId: randomUUID(), enrolId: randomUUID(), idx }
      })
      clientIndex += volume

      for (const row of rows) {
        allRows.push({ ...row, program, stage: stageForIdx(row.idx) })
      }

      for (let start = 0; start < rows.length; start += CHUNK) {
        const chunk = rows.slice(start, start + CHUNK)

        // 10 fields per client row: id, full_name, primary_language, immigration_stream, stage, source, country_of_origin, age_group, gender, created_at
        const cVals = chunk.map((_, j) =>
          `($${j * 10 + 1},$${j * 10 + 2},$${j * 10 + 3},$${j * 10 + 4},$${j * 10 + 5},$${j * 10 + 6},$${j * 10 + 7},$${j * 10 + 8},$${j * 10 + 9},$${j * 10 + 10})`
        ).join(",")
        const cParams = chunk.flatMap(r => [
          r.clientId,
          FIRST_NAMES[r.idx % FIRST_NAMES.length] + " " + LAST_NAMES[Math.floor(r.idx / FIRST_NAMES.length) % LAST_NAMES.length],
          LANGUAGES[(r.idx * 7) % LANGUAGES.length],
          STREAMS[(r.idx * 5) % STREAMS.length],
          stageForIdx(r.idx),
          sourceForIdx(r.idx),
          COUNTRIES[(r.idx * 7 + Math.floor(r.idx / 3)) % COUNTRIES.length],
          ageForIdx(r.idx),
          genderForIdx(r.idx),
          createdAtForIdx(r.idx),
        ])
        await conn.query(
          `INSERT INTO clients (id,full_name,primary_language,immigration_stream,stage,source,country_of_origin,age_group,gender,created_at) VALUES ${cVals}`,
          cParams
        )

        const eVals = chunk.map((_, j) => `($${j * 6 + 1},$${j * 6 + 2},$${j * 6 + 3},$${j * 6 + 4},$${j * 6 + 5},$${j * 6 + 6})`).join(",")
        const eParams = chunk.flatMap(r => [r.enrolId, r.clientId, program, funder, (r.idx * PRIME) % 5 === 0, createdAtForIdx(r.idx)])
        await conn.query(`INSERT INTO enrolments (id,client_id,program,funder,consent_cross_program,enrolled_at) VALUES ${eVals}`, eParams)

        const oRows: string[] = []
        const oParams: (string | boolean)[] = []
        let p = 1
        for (let k = 0; k < chunk.length; k++) {
          const r = chunk[k]
          for (const [tier, label] of [
            ["immediate", labels[0]],
            ["intermediate", labels[1]],
            ["ultimate", labels[2]],
          ] as [string, string][]) {
            oRows.push(`($${p},$${p + 1},$${p + 2},$${p + 3})`)
            oParams.push(r.enrolId, tier, label, outcomeAchieved(r.idx, tier, program))
            p += 4
          }
        }
        await conn.query(`INSERT INTO outcomes (enrolment_id,tier,label,achieved) VALUES ${oRows.join(",")}`, oParams)
      }
    }

    // Seed placements for placement/complete clients
    const placementRows = allRows.filter(r => r.stage === "placement" || r.stage === "complete")
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

    // Seed surveys for survey/complete stage clients + ~33% sample of others
    const surveyRows = allRows.filter(r => r.stage === "survey" || r.stage === "complete" || (r.idx * PRIME) % 3 === 0)
    for (let start = 0; start < surveyRows.length; start += CHUNK) {
      const chunk = surveyRows.slice(start, start + CHUNK)
      const sVals = chunk.map((_, j) =>
        `($${j * 6 + 1},$${j * 6 + 2},$${j * 6 + 3},$${j * 6 + 4},$${j * 6 + 5},$${j * 6 + 6})`
      ).join(",")
      const sParams = chunk.flatMap(r => [
        r.clientId,
        r.enrolId,
        surveySat(r.idx, r.program),
        (r.idx * 3571) % 100 < (REC_RATE[r.program] ?? 85),
        BARRIERS_LIST[r.idx % BARRIERS_LIST.length],
        (r.idx * 3571) % 3 === 0 ? SUCCESS_STORIES[r.idx % SUCCESS_STORIES.length] : null,
      ])
      await conn.query(
        `INSERT INTO surveys (client_id,enrolment_id,satisfaction,would_recommend,barriers,success_story) VALUES ${sVals}`,
        sParams
      )
    }

    // Seed case_notes: 500 notes across first 500 clients
    const noteChunkRows = allRows.slice(0, 500)
    for (let start = 0; start < noteChunkRows.length; start += CHUNK) {
      const chunk = noteChunkRows.slice(start, start + CHUNK)
      const nVals = chunk.map((_, j) =>
        `($${j * 4 + 1},$${j * 4 + 2},$${j * 4 + 3},$${j * 4 + 4})`
      ).join(",")
      const nParams = chunk.flatMap(r => [
        r.clientId,
        NOTE_AUTHORS[r.idx % NOTE_AUTHORS.length],
        NOTE_CONTENTS[r.idx % NOTE_CONTENTS.length],
        NOTE_TYPES[r.idx % NOTE_TYPES.length],
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

export async function addEnrolment(clientId: string, program: string, consent_cross_program = false) {
  const funder = PROGRAM_FUNDERS[program]
  if (!funder) throw new Error(`Unknown program: ${program}`)
  const enrolResult = await sql`
    INSERT INTO enrolments (client_id, program, funder, consent_cross_program)
    VALUES (${clientId}, ${program}, ${funder}, ${consent_cross_program})
    RETURNING id`
  const enrolId = enrolResult.rows[0].id
  const labels = OUTCOME_LABELS[program] || ["Initial assessment", "Progress milestone", "Goal achieved"]
  await sql`INSERT INTO outcomes (enrolment_id,tier,label) VALUES (${enrolId},'immediate',${labels[0]})`
  await sql`INSERT INTO outcomes (enrolment_id,tier,label) VALUES (${enrolId},'intermediate',${labels[1]})`
  await sql`INSERT INTO outcomes (enrolment_id,tier,label) VALUES (${enrolId},'ultimate',${labels[2]})`
  return { enrolId }
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

export async function getAnalyticsData(since?: string | null) {
  // Client-level time filter (null = all time)
  const cf = since ? "AND c.created_at >= $1" : ""
  const ef = since ? "AND e.enrolled_at >= $1" : ""
  const sf = since ? "AND s.completed_at >= $1" : ""
  const p = since ? [since] : []

  const [stageRes, countryRes, programRes, stageByProgramRes, surveyRes, sourceRes, ageRes, genderRes, totalRes, testimonialsRes, barriersRes] = await Promise.all([
    sql.query(`SELECT stage, COUNT(*) as count FROM clients c WHERE 1=1 ${cf} GROUP BY stage ORDER BY count DESC`, p),
    sql`SELECT country_of_origin, COUNT(*) as count FROM clients GROUP BY country_of_origin ORDER BY count DESC LIMIT 20`,
    sql.query(`SELECT e.program,
      COUNT(DISTINCT e.client_id) as clients,
      ROUND(AVG(CASE WHEN o.achieved THEN 100.0 ELSE 0 END), 1) as outcome_rate,
      ROUND(AVG(sa.avg_sat), 1) as avg_satisfaction,
      ROUND(AVG(sa.rec_pct), 1) as recommend_pct,
      COALESCE(SUM(sa.survey_cnt), 0)::int as survey_count
      FROM enrolments e
      LEFT JOIN outcomes o ON o.enrolment_id = e.id
      LEFT JOIN (
        SELECT enrolment_id,
          AVG(satisfaction) as avg_sat,
          SUM(CASE WHEN would_recommend THEN 1.0 ELSE 0 END) * 100.0 / COUNT(*) as rec_pct,
          COUNT(*) as survey_cnt
        FROM surveys GROUP BY enrolment_id
      ) sa ON sa.enrolment_id = e.id AND e.program != 'mental_health'
      WHERE 1=1 ${ef}
      GROUP BY e.program ORDER BY clients DESC`, p),
    sql.query(`SELECT c.stage, e.program, COUNT(*) as count FROM clients c JOIN enrolments e ON e.client_id = c.id WHERE 1=1 ${cf} GROUP BY c.stage, e.program`, p),
    sql.query(`SELECT
      ROUND(AVG(satisfaction), 1) as avg_sat,
      COUNT(*) as total,
      ROUND(SUM(CASE WHEN would_recommend THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as recommend_pct
      FROM surveys s WHERE 1=1 ${sf}`, p),
    sql.query(`SELECT source, COUNT(*) as count FROM clients c WHERE 1=1 ${cf} GROUP BY source ORDER BY count DESC`, p),
    sql.query(`SELECT age_group, COUNT(*) as count FROM clients c WHERE 1=1 ${cf} GROUP BY age_group ORDER BY count DESC`, p),
    sql.query(`SELECT gender, COUNT(*) as count FROM clients c WHERE 1=1 ${cf} GROUP BY gender ORDER BY count DESC`, p),
    sql.query(`SELECT COUNT(*) as c FROM clients c WHERE 1=1 ${cf}`, p),
    sql.query(`WITH deduped AS (
      SELECT DISTINCT ON (s.success_story) s.success_story, s.satisfaction, e.program, c.full_name
      FROM surveys s
      JOIN enrolments e ON e.id = s.enrolment_id
      JOIN clients c ON c.id = s.client_id
      WHERE s.success_story IS NOT NULL AND e.program != 'mental_health' ${sf}
      ORDER BY s.success_story, s.satisfaction DESC
    ), ranked AS (
      SELECT *, ROW_NUMBER() OVER (PARTITION BY program ORDER BY satisfaction DESC) as rn FROM deduped
    )
    SELECT success_story, satisfaction, program, full_name FROM ranked WHERE rn <= 2
    ORDER BY program, satisfaction DESC`, p),
    sql.query(`SELECT barriers, e.program, COUNT(*) as count FROM surveys s
      JOIN enrolments e ON e.id = s.enrolment_id
      WHERE barriers IS NOT NULL AND barriers != 'None' ${sf.replace("s.", "s.")}
      GROUP BY barriers, e.program ORDER BY count DESC LIMIT 30`, p),
  ])
  return {
    total: parseInt(totalRes.rows[0].c),
    byStage: stageRes.rows,
    byCountry: countryRes.rows,
    programPerformance: programRes.rows,
    stageByProgram: stageByProgramRes.rows,
    surveyStats: surveyRes.rows[0],
    bySource: sourceRes.rows,
    byAgeGroup: ageRes.rows,
    byGender: genderRes.rows,
    testimonials: testimonialsRes.rows,
    barriersByProgram: barriersRes.rows,
  }
}

export async function getPipelineClients(perStage = 30) {
  // Take the oldest N clients per stage to ensure varied "days in pipeline"
  const result = await sql.query(`
    WITH base AS (
      SELECT c.id, c.full_name, c.country_of_origin, c.stage, c.source,
        c.primary_language, c.immigration_stream, c.created_at,
        e.program, e.funder, e.enrolled_at,
        COUNT(o.id) FILTER (WHERE o.achieved = true) as outcomes_achieved,
        COUNT(o.id) as outcomes_total
      FROM clients c
      JOIN enrolments e ON e.client_id = c.id
      LEFT JOIN outcomes o ON o.enrolment_id = e.id
      GROUP BY c.id, e.id
    ),
    ranked AS (
      SELECT *, ROW_NUMBER() OVER (PARTITION BY stage ORDER BY enrolled_at ASC) as rn FROM base
    )
    SELECT id, full_name, country_of_origin, stage, source, primary_language, immigration_stream, created_at, program, funder, enrolled_at, outcomes_achieved, outcomes_total
    FROM ranked WHERE rn <= $1
    ORDER BY stage, enrolled_at ASC`, [perStage])
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

export async function getPendingSurveys() {
  const result = await sql`
    SELECT c.id, c.full_name, c.stage, e.program, e.funder, e.enrolled_at,
      EXTRACT(EPOCH FROM (NOW() - e.enrolled_at))::int / 86400 as days_waiting
    FROM clients c
    JOIN enrolments e ON e.client_id = c.id
    LEFT JOIN surveys s ON s.client_id = c.id
    WHERE c.stage = 'survey' AND s.id IS NULL
    ORDER BY e.enrolled_at ASC`
  return result.rows
}

export async function getClientSurvey(clientId: string) {
  const result = await sql`
    SELECT s.*, e.program FROM surveys s
    JOIN enrolments e ON e.id = s.enrolment_id
    WHERE s.client_id = ${clientId}
    ORDER BY s.completed_at DESC LIMIT 1`
  return result.rows[0] ?? null
}

export async function updateClient(clientId: string, data: {
  full_name?: string
  primary_language?: string
  immigration_stream?: string
  stage?: string
  country_of_origin?: string
  age_group?: string
  gender?: string
}) {
  const fields: string[] = []
  const values: any[] = []
  let i = 1
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) {
      fields.push(`${key} = $${i++}`)
      values.push(val)
    }
  }
  if (fields.length === 0) return
  values.push(clientId)
  await sql.query(
    `UPDATE clients SET ${fields.join(", ")} WHERE id = $${i}`,
    values
  )
}

export async function updateEnrolment(enrolmentId: string, data: {
  program?: string
  funder?: string
  consent_cross_program?: boolean
}) {
  const fields: string[] = []
  const values: any[] = []
  let i = 1
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) {
      fields.push(`${key} = $${i++}`)
      values.push(val)
    }
  }
  if (fields.length === 0) return
  values.push(enrolmentId)
  await sql.query(
    `UPDATE enrolments SET ${fields.join(", ")} WHERE id = $${i}`,
    values
  )
}

export async function updateOutcome(outcomeId: string, achieved: boolean) {
  await sql`UPDATE outcomes SET achieved = ${achieved}, recorded_at = NOW() WHERE id = ${outcomeId}`
}

export async function deleteClient(clientId: string) {
  // Cascades to enrolments → outcomes via ON DELETE CASCADE
  await sql`DELETE FROM clients WHERE id = ${clientId}`
}

export async function createSurvey(data: {
  clientId: string
  enrolmentId: string
  satisfaction: number | null
  wouldRecommend: boolean
  barriers?: string | null
  successStory?: string | null
}) {
  await sql.query(
    `INSERT INTO surveys (client_id, enrolment_id, satisfaction, would_recommend, barriers, success_story)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT ON CONSTRAINT surveys_client_id_unique DO UPDATE SET
       satisfaction = EXCLUDED.satisfaction,
       would_recommend = EXCLUDED.would_recommend,
       barriers = EXCLUDED.barriers,
       success_story = EXCLUDED.success_story,
       completed_at = NOW()`,
    [data.clientId, data.enrolmentId, data.satisfaction, data.wouldRecommend, data.barriers ?? null, data.successStory ?? null]
  )
}

export async function applyRLS() {
  // Postgres RLS: mental_health rows are only visible to connections with app.bypass_phi=true
  await sql`ALTER TABLE enrolments ENABLE ROW LEVEL SECURITY`
  await sql`
    CREATE POLICY IF NOT EXISTS phi_wall ON enrolments
    AS RESTRICTIVE
    FOR ALL
    TO PUBLIC
    USING (
      program != 'mental_health'
      OR current_setting('app.bypass_phi', true) = 'true'
    )`
}

export async function getClientsForExport(programs: string[]) {
  const result = await sql.query(
    `SELECT c.id, c.full_name, c.primary_language, c.immigration_stream,
      c.created_at, c.age_group, c.gender, c.country_of_origin, c.source, c.stage,
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
      c.country_of_origin, c.age_group, c.created_at,
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
    WHERE created_at >= DATE_TRUNC('month', NOW()) - INTERVAL '12 months'
      AND created_at < DATE_TRUNC('month', NOW())
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
