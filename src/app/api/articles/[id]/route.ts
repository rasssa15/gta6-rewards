import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const article = await prisma.article.findUnique({
      where: { id: params.id },
      include: { category: true },
    })
    if (!article) {
      const articleBySlug = await prisma.article.findUnique({
        where: { slug: params.id },
        include: { category: true },
      })
      if (!articleBySlug) {
        return NextResponse.json({ error: "Article not found" }, { status: 404 })
      }
      return NextResponse.json(articleBySlug)
    }
    return NextResponse.json(article)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch article" }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json()
    const article = await prisma.article.update({
      where: { id: params.id },
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        categoryId: data.categoryId,
        featuredImage: data.featuredImage,
        author: data.author,
        status: data.status,
        tags: data.tags,
        source: data.source,
        sourceUrl: data.sourceUrl,
        seoTitle: data.seoTitle,
        seoDesc: data.seoDesc,
        readingTime: data.readingTime,
      },
    })
    return NextResponse.json(article)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update article" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.article.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete article" }, { status: 500 })
  }
}
