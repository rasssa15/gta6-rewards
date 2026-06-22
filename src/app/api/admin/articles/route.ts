import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth/auth"
import { generateSlug } from "@/lib/utils/codes"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || (session.user as any).role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const articles = await prisma.article.findMany({
      orderBy: { createdAt: "desc" },
      include: { author: { select: { name: true } } },
    })

    return NextResponse.json({ success: true, data: articles })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || (session.user as any).role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await req.json()
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })

    const slug = generateSlug(data.title) + "-" + Math.random().toString(36).slice(2, 6)

    const article = await prisma.article.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt || "",
        content: data.content || "",
        imageUrl: data.imageUrl || "",
        category: data.category || "General",
        tags: data.tags || "",
        authorId: user!.id,
        status: data.status || "draft",
        featured: data.featured || false,
        readTime: data.readTime || "",
        publishedAt: data.status === "published" ? new Date() : null,
      },
    })

    return NextResponse.json({ success: true, data: article })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 })
  }
}
