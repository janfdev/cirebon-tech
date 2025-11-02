import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { achievements } from "@/db/schema"
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

    const userAchievements = await db.select().from(achievements).where(eq(achievements.userId, session.user.id))

    return NextResponse.json(userAchievements)
  } catch (error) {
    console.error("Achievements fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const achievementId = `achievement-${Date.now()}`

    await db.insert(achievements).values({
      id: achievementId,
      userId: session.user.id,
      ...body,
    })

    const created = await db.select().from(achievements).where(eq(achievements.id, achievementId))

    return NextResponse.json(created[0])
  } catch (error) {
    console.error("Achievement creation error:", error)
    return NextResponse.json({ error: "Failed to create achievement" }, { status: 500 })
  }
}
