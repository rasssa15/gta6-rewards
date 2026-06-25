"use client"
import { useState } from "react"
import Link from "next/link"
import { Newspaper, Clock, Eye, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { formatDate } from "@/lib/utils"

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  featuredImage: string
  categoryName: string
  readingTime: number
  viewCount: number
  createdAt: string
}

interface Category {
  id: string
  name: string
  slug: string
}

export default function NewsGrid({
  initialArticles,
  total,
  category,
  search,
  categories,
}: {
  initialArticles: Article[]
  total: number
  category: string | null
  search: string | null
  categories: Category[]
}) {
  const [articles, setArticles] = useState<Article[]>(initialArticles)
  const [offset, setOffset] = useState(20)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(total > 20)

  const loadMore = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category) params.set("category", category)
      if (search) params.set("search", search)
      params.set("limit", "20")
      params.set("offset", offset.toString())

      const res = await fetch(`/api/articles?${params}`)
      const data = await res.json()
      const newArticles = data.articles || []
      setArticles((prev) => [...prev, ...newArticles])
      setOffset((prev) => prev + 20)
      if (newArticles.length < 20) setHasMore(false)
    } catch {
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white flex items-center gap-3">
            <Newspaper className="w-7 h-7 text-neon-blue" />
            Gaming News
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {category ? `Category: ${category.replace(/-/g, " ")}` : "Latest gaming news and updates"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/news"
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            !category ? "bg-neon-blue/20 text-neon-blue border border-neon-blue/30" : "glass text-gray-400 hover:text-white"
          }`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/news?category=${cat.slug}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              category === cat.slug ? "bg-neon-blue/20 text-neon-blue border border-neon-blue/30" : "glass text-gray-400 hover:text-white"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {articles.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: (i % 20) * 0.03 }}
            >
              <Link
                href={`/news/${article.slug}`}
                className="glass-card p-0 overflow-hidden group block h-full"
              >
                {article.featuredImage ? (
                  <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${article.featuredImage})` }} />
                ) : (
                  <div className="h-48 bg-gradient-to-br from-neon-blue/10 to-neon-purple/10 flex items-center justify-center">
                    <Newspaper className="w-12 h-12 text-gray-600" />
                  </div>
                )}
                <div className="p-5">
                  {article.categoryName && (
                    <span className="text-[10px] uppercase tracking-wider text-neon-blue font-semibold">
                      {article.categoryName}
                    </span>
                  )}
                  <h3 className="text-white font-semibold mt-1 group-hover:text-neon-blue transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-400 text-sm mt-2 line-clamp-2">{article.excerpt}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {article.readingTime} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {article.viewCount}
                    </span>
                    <span>{formatDate(article.createdAt)}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {articles.length === 0 && (
        <div className="text-center py-20">
          <Newspaper className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl text-gray-400 font-semibold">No articles yet</h3>
          <p className="text-gray-600 text-sm mt-2">Articles will appear here once published.</p>
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="btn-secondary flex items-center gap-2"
          >
            {loading ? (
              <span className="animate-pulse">Loading...</span>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" /> Load More Articles
              </>
            )}
          </button>
        </div>
      )}
    </>
  )
}
