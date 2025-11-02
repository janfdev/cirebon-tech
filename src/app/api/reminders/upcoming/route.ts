import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { reminders, plantingHistory } from "@/db/schema"
import { eq, and, lte } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get upcoming reminders (next 7 days)
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const upcomingReminders = await db
      .select()
      .from(reminders)
      .where(
        and(
          eq(reminders.userId, session.user.id),
          eq(reminders.isCompleted, false),
          lte(reminders.scheduledDate, sevenDaysFromNow),
        ),
      )

    // Also generate automatic reminders based on planting history
    const activePlants = await db
      .select()
      .from(plantingHistory)
      .where(and(eq(plantingHistory.userId, session.user.id), eq(plantingHistory.isCompleted, false)))

    const autoReminders: Record<string, unknown>[] = []
    activePlants.forEach((plant) => {
      // Check if there's a pending watering reminder OR a completed one within the last 3 days
      const recentReminder = upcomingReminders.find(
        (r) =>
          r.plantingHistoryId === plant.id &&
          r.reminderType === "watering" &&
          (!r.isCompleted || new Date(r.scheduledDate).getTime() > Date.now() - 3 * 24 * 60 * 60 * 1000),
      )

      if (!recentReminder) {
        autoReminders.push({
          id: `auto-reminder-${plant.id}-watering`,
          reminderType: "watering",
          message: `Siram tanaman ${plant.cropName} Anda`,
          scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          cropName: plant.cropName,
          isCompleted: false,
          plantingHistoryId: plant.id,
        })
      }
    })

    return NextResponse.json([...upcomingReminders, ...autoReminders])
  } catch (error) {
    console.error("Reminders fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 })
  }
}
