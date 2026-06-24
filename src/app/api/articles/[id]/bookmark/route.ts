import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await req.json()
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    const existing = await prisma.articleBookmark.findUnique({
      where: { userId_articleId: { userId, articleId: params.id } },
    })

    if (existing) {
      await prisma.articleBookmark.delete({ where: { id: existing.id } })
      return NextResponse.json({ bookmarked: false })
    } else {
      await prisma.articleBookmark.create({
        data: { userId, articleId: params.id },
      })
      return NextResponse.json({ bookmarked: true })
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to toggle bookmark" }, { status: 500 })
  }
}
