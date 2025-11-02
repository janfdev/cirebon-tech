import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { reminders } from "@/db/schema"
import { auth } from "@/lib/auth"
import { eq } from "drizzle-orm"

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const reminderId = `reminder-${Date.now()}`

    await db.insert(reminders).values({
      id: reminderId,
      userId: session.user.id,
      ...body,
    })

    const created = await db
      .select()
      .from(reminders)
      .where(eq(reminders.id, reminderId))

    return NextResponse.json(created[0])
  } catch (error) {
    console.error("Reminder creation error:", error)
    return NextResponse.json({ error: "Failed to create reminder" }, { status: 500 })
  }
}
