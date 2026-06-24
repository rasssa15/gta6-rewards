import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await req.json()
    const articleId = params.id

    await prisma.articleView.create({
      data: { articleId, userId: userId || null },
    })
    await prisma.article.update({
      where: { id: articleId },
      data: { viewCount: { increment: 1 } },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to record view" }, { status: 500 })
  }
}
