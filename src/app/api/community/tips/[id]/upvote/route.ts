import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { communityTips, tipUpvotes } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const existingUpvote = await db
      .select()
      .from(tipUpvotes)
      .where(and(eq(tipUpvotes.tipId, id), eq(tipUpvotes.userId, session.user.id)))

    if (existingUpvote.length > 0) {
      return NextResponse.json({ error: "You have already upvoted this tip" }, { status: 400 })
    }

    const upvoteId = `upvote-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    await db.insert(tipUpvotes).values({
      id: upvoteId,
      tipId: id,
      userId: session.user.id,
    })

    await db
      .update(communityTips)
      .set({
        upvotes: tip[0]?.upvotes ? tip[0]?.upvotes + 1 : 1,
      })
      .where(eq(communityTips.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Upvote error:", error)
    return NextResponse.json({ error: "Failed to upvote tip" }, { status: 500 })
  }
}
