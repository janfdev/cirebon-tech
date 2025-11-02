import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { communityTips, user, tipUpvotes } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    })

    const tips = await db
      .select()
      .from(communityTips)
      .where(eq(communityTips.isPublished, true))
      .leftJoin(user, eq(communityTips.userId, user.id))

    let userUpvotes: Set<string> = new Set()
    if (session?.user?.id) {
      const upvotes = await db
        .select({ tipId: tipUpvotes.tipId })
        .from(tipUpvotes)
        .where(eq(tipUpvotes.userId, session.user.id))
      userUpvotes = new Set(upvotes.map((r) => r.tipId))
    }

    const formatted = tips.map(({ community_tips, user: u }) => ({
      id: community_tips.id,
      title: community_tips.title,
      content: community_tips.content,
      cropName: community_tips.cropName,
      location: community_tips.location,
      upvotes: community_tips.upvotes,
      createdAt: community_tips.createdAt,
      userId: community_tips.userId,
      hasUpvoted: userUpvotes.has(community_tips.id),
      user: {
        name: u?.name,
        farmName: u?.name,
      },
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error("Tips fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch tips" }, { status: 500 })
  }
}
