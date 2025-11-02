import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { reminders } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await db
      .update(reminders)
      .set({
        isCompleted: true,
      })
      .where(eq(reminders.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Reminder completion error:", error)
    return NextResponse.json({ error: "Failed to complete reminder" }, { status: 500 })
  }
}
