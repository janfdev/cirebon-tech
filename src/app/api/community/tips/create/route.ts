import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { communityTips } from "@/db/schema"
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
    const tipId = `tip-${Date.now()}`

    await db.insert(communityTips).values({
      id: tipId,
      userId: session.user.id,
      ...body,
    })

    const created = await db.select().from(communityTips).where(eq(communityTips.id, tipId))

    return NextResponse.json(created[0])
  } catch (error) {
    console.error("Tip creation error:", error)
    return NextResponse.json({ error: "Failed to create tip" }, { status: 500 })
  }
}
