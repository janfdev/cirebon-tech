import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { dailyActivity } from "@/db/schema"
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

    // Get activities for the past 30 days
    // const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const userActivities = await db.select().from(dailyActivity).where(eq(dailyActivity.userId, session.user.id))

    return NextResponse.json(userActivities)
  } catch (error) {
    console.error("Activities fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 })
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
    const activityId = `activity-${Date.now()}`

    await db.insert(dailyActivity).values({
      id: activityId,
      userId: session.user.id,
      ...body,
    })

    const created = await db.select().from(dailyActivity).where(eq(dailyActivity.id, activityId))

    return NextResponse.json(created[0])
  } catch (error) {
    console.error("Activity creation error:", error)
    return NextResponse.json({ error: "Failed to create activity" }, { status: 500 })
  }
}
