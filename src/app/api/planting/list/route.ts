import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { plantingHistory } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const plants = await db.select().from(plantingHistory).where(eq(plantingHistory.userId, session.user.id))

    return NextResponse.json(plants)
  } catch (error) {
    console.error("Plants fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch plants" }, { status: 500 })
  }
}
