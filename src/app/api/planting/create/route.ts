import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { plantingHistory, farmerProfile } from "@/db/schema"
import { eq, sql } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const plantingId = `planting-${Date.now()}`

    const plantingData = {
      id: plantingId,
      userId: session.user.id,
      cropName: body.cropName,
      cropImage: body.cropImage,
      plantedDate: new Date(body.plantedDate),
      expectedHarvestDate: body.expectedHarvestDate ? new Date(body.expectedHarvestDate) : null,
      notes: body.notes || null,
    }

    // Create planting record
    await db.insert(plantingHistory).values(plantingData)

    // Update farmer profile - increment total plants planted
    await db
      .update(farmerProfile)
      .set({
        totalPlantsPlanted: sql`${farmerProfile.totalPlantsPlanted} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(farmerProfile.userId, session.user.id))

    const created = await db.select().from(plantingHistory).where(eq(plantingHistory.id, plantingId))

    return NextResponse.json(created[0])
  } catch (error) {
    console.error("Planting creation error:", error)
    return NextResponse.json({ error: "Failed to create planting record" }, { status: 500 })
  }
}
