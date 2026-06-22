import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth/auth"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
  }

  try {
    const { articleId } = await req.json()
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })

    const existing = await prisma.articleBookmark.findUnique({
      where: { userId_articleId: { userId: user.id, articleId } },
    })

    if (existing) {
      await prisma.articleBookmark.delete({ where: { id: existing.id } })
      return NextResponse.json({ success: true, data: { bookmarked: false } })
    }

    await prisma.articleBookmark.create({
      data: { userId: user.id, articleId },
    })

    return NextResponse.json({ success: true, data: { bookmarked: true } })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 })
  }
}
