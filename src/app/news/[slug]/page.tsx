import { getAllArticles, getArticleBySlug, getCommentsForArticle } from "@/lib/data"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft, Clock, Eye, Calendar, Newspaper } from "lucide-react"
import { notFound } from "next/navigation"
import ArticleClient from "./ArticleClient"

export async function generateStaticParams() {
  const articles = getAllArticles()
  return articles.map((article) => ({
    slug: article.slug,
  }))
}

export const dynamicParams = true
export const revalidate = 86400

export default function ArticlePage({
  params,
}: {
  params: { slug: string }
}) {
  const article = getArticleBySlug(params.slug)

  if (!article) {
    notFound()
  }

  const comments = getCommentsForArticle(article.id)

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container max-w-4xl">
        <Link href="/news" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to News
        </Link>

        <article>
          <div className="flex flex-wrap gap-2 mb-4">
            {article.categoryName && (
              <Link
                href={`/news?category=${article.categorySlug}`}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-neon-blue/20 text-neon-blue border border-neon-blue/30"
              >
                {article.categoryName}
              </Link>
            )}
            {article.tags?.split(",").filter(Boolean).map((tag: string) => (
              <span key={tag} className="px-3 py-1 rounded-lg text-xs text-gray-400 glass">
                #{tag.trim()}
              </span>
            ))}
          </div>

          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4">{article.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6">
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(article.createdAt)}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {article.readingTime} min read</span>
            <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {article.viewCount} views</span>
            <span>{article.author}</span>
          </div>

          {article.featuredImage && (
            <div className="rounded-2xl overflow-hidden mb-8">
              <img src={article.featuredImage} alt={article.title} className="w-full h-auto" />
            </div>
          )}

          <ArticleClient article={article} comments={comments} />
        </article>
      </div>
    </div>
  )
}
