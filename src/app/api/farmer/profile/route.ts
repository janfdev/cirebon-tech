import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { farmerProfile, user, plantingHistory } from "@/db/schema"
import { eq, and, count } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const activePlantsResult = await db
      .select({ value: count() })
      .from(plantingHistory)
      .where(and(eq(plantingHistory.userId, session.user.id), eq(plantingHistory.isCompleted, false)))

    const completedHarvestsResult = await db
      .select({ value: count() })
      .from(plantingHistory)
      .where(and(eq(plantingHistory.userId, session.user.id), eq(plantingHistory.isCompleted, true)))

    console.log(" Active plants result:", activePlantsResult)
    console.log(" Completed harvests result:", completedHarvestsResult)

    // Get farmer profile
    const profile = await db
      .select()
      .from(farmerProfile)
      .where(eq(farmerProfile.userId, session.user.id))
      .leftJoin(user, eq(farmerProfile.userId, user.id))

    if (profile.length === 0) {
      // Create default profile if not exists
      const profileId = `profile-${Date.now()}`
      await db.insert(farmerProfile).values({
        id: profileId,
        userId: session.user.id,
      })

      const newProfile = await db
        .select()
        .from(farmerProfile)
        .where(eq(farmerProfile.userId, session.user.id))
        .leftJoin(user, eq(farmerProfile.userId, user.id))

      return NextResponse.json({
        ...newProfile[0]?.farmer_profile,
        user: newProfile[0]?.user,
        totalPlantsPlanted: 0,
        totalHarvestsCompleted: 0,
        activePlants: 0,
      })
    }

    const activePlantsNumber = activePlantsResult[0]?.value || 0
    const completedHarvestsNumber = completedHarvestsResult[0]?.value || 0
    const totalPlantsNumber = activePlantsNumber + completedHarvestsNumber

    console.log(" Active plants number:", activePlantsNumber)
    console.log(" Completed harvests number:", completedHarvestsNumber)
    console.log(" Total plants number:", totalPlantsNumber)

    return NextResponse.json({
      ...profile[0]?.farmer_profile,
      user: profile[0]?.user,
      totalPlantsPlanted: totalPlantsNumber,
      totalHarvestsCompleted: completedHarvestsNumber,
      activePlants: activePlantsNumber,
    })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    await db
      .update(farmerProfile)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(farmerProfile.userId, session.user.id))

    const updated = await db.select().from(farmerProfile).where(eq(farmerProfile.userId, session.user.id))

    return NextResponse.json(updated[0])
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
