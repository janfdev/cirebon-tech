import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { farmerProfile } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { trackDailyActivity, checkPlantAchievements } from "@/lib/reward-system"

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { activityType, points = 0, description } = body

    // Track activity
    await trackDailyActivity(session.user.id, activityType, description)

    // Update profile with reward points
    const profile = await db.select().from(farmerProfile).where(eq(farmerProfile.userId, session.user.id))

    if (profile.length === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    const newPoints = profile[0].totalRewardPoints + points
    const newLevel = Math.floor(newPoints / 200) + 1

    await db
      .update(farmerProfile)
      .set({
        totalRewardPoints: newPoints,
        level: newLevel,
        updatedAt: new Date(),
      })
      .where(eq(farmerProfile.userId, session.user.id))

    // Check for new achievements
    if (activityType === "plant_added") {
      await checkPlantAchievements(session.user.id)
    }

    const updated = await db.select().from(farmerProfile).where(eq(farmerProfile.userId, session.user.id))

    return NextResponse.json(updated[0])
  } catch (error) {
    console.error("Reward tracking error:", error)
    return NextResponse.json({ error: "Failed to track reward" }, { status: 500 })
  }
}
