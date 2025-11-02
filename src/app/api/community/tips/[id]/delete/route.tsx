import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { communityTips } from "@/db/schema"
import { auth } from "@/lib/auth"
import { eq } from "drizzle-orm"

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth.api.getSession({
      headers: req.headers,
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tip = await db.select().from(communityTips).where(eq(communityTips.id, id))

    if (!tip.length) {
      return NextResponse.json({ error: "Tip not found" }, { status: 404 })
    }

    if (tip[0].userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden - you can only delete your own tips" }, { status: 403 })
    }

    await db.delete(communityTips).where(eq(communityTips.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete tip error:", error)
    return NextResponse.json({ error: "Failed to delete tip" }, { status: 500 })
  }
}
