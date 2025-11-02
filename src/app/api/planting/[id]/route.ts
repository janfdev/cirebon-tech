import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { plantingHistory } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const plant = await db.select().from(plantingHistory).where(eq(plantingHistory.id, id))

    if (!plant.length || plant[0].userId !== session.user.id) {
      return NextResponse.json({ error: "Plant not found" }, { status: 404 })
    }

    return NextResponse.json(plant[0])
  } catch (error) {
    console.error("Plant fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch plant" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const body = await req.json()

    // Verify ownership
    const existing = await db.select().from(plantingHistory).where(eq(plantingHistory.id, id))

    if (!existing.length || existing[0].userId !== session.user.id) {
      return NextResponse.json({ error: "Plant not found" }, { status: 404 })
    }

    await db
      .update(plantingHistory)
      .set({
        ...body,
      })
      .where(eq(plantingHistory.id, id))

    const updated = await db.select().from(plantingHistory).where(eq(plantingHistory.id, id))

    return NextResponse.json(updated[0])
  } catch (error) {
    console.error("Plant update error:", error)
    return NextResponse.json({ error: "Failed to update plant" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    const existing = await db.select().from(plantingHistory).where(eq(plantingHistory.id, id))

    if (!existing.length || existing[0].userId !== session.user.id) {
      return NextResponse.json({ error: "Plant not found" }, { status: 404 })
    }

    await db.delete(plantingHistory).where(eq(plantingHistory.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Plant deletion error:", error)
    return NextResponse.json({ error: "Failed to delete plant" }, { status: 500 })
  }
}
