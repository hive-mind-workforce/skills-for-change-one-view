export const runtime = "nodejs"
export const maxDuration = 60
import { initDB, seedDatabase } from "@/lib/db"
import { sql } from "@vercel/postgres"

export async function GET() {
  try {
    await initDB()
    const result = await sql`SELECT COUNT(*) as c FROM clients`
    const count = parseInt(result.rows[0].c)
    if (count === 0) {
      await seedDatabase()
      return Response.json({ initialized: true, seeded: true, message: "Database initialized and seeded" })
    }
    return Response.json({ initialized: true, seeded: false, clientCount: count })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
