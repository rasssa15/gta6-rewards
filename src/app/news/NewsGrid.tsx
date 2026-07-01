"use client"
import { useState } from "react"
import Link from "next/link"
import { Newspaper, Clock, Eye, ChevronDown, Search, Coins } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { formatDate } from "@/lib/utils"
import { useRouter, useSearchParams } from "next/navigation"
import { AdBanner } from "@/components/ads/AdBanner"

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
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(search || "")

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (category) params.set("category", category)
    if (searchQuery.trim()) params.set("search", searchQuery.trim())
    router.push(`/news?${params}`)
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-blue/10 border border-neon-blue/20 text-xs text-neon-blue uppercase tracking-widest font-semibold mb-3">
            <Newspaper className="w-3 h-3" />
            GTA 6 Updates
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white">
            {category ? (
              <><span className="gradient-text">{category.replace(/-/g, " ")}</span> News</>
            ) : (
              <>Gaming <span className="gradient-text">News</span></>
            )}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{total} articles · Read & earn Scratch Cards</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="input-field pl-9 text-sm !py-2.5"
            />
          </div>
        </form>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/news"
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            !category
              ? "bg-neon-blue/20 text-neon-blue border border-neon-blue/30 shadow-sm shadow-neon-blue/10"
              : "glass text-gray-400 hover:text-white border border-transparent"
          }`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/news?category=${cat.slug}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              category === cat.slug
                ? "bg-neon-blue/20 text-neon-blue border border-neon-blue/30 shadow-sm shadow-neon-blue/10"
                : "glass text-gray-400 hover:text-white border border-transparent"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* 320×50 AD between filters and articles */}
      <div className="mb-8">
        <AdBanner adKey="a32d05859c7cdc4b19c45ea2746367ad" height={50} width={320} className="flex justify-center" />
      </div>

      {/* Articles grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence>
          {articles.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: (i % 20) * 0.04 }}
            >
              <Link
                href={`/news/${article.slug}`}
                className="glass-card p-0 overflow-hidden group block h-full neon-glow-card"
                id={`article-${article.id}`}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  {article.featuredImage ? (
                    <>
                      <img
                        src={article.featuredImage}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </>
                  ) : (
                    <div className="h-full bg-gradient-to-br from-neon-blue/10 to-neon-purple/10 flex items-center justify-center">
                      <Newspaper className="w-12 h-12 text-gray-600" />
                    </div>
                  )}
                  {/* Earn badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-neon-green/20 border border-neon-green/30 text-[10px] text-neon-green font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    <Coins className="w-2.5 h-2.5" />
                    Earn
                  </div>
                </div>

                <div className="p-5">
                  {article.categoryName && (
                    <span className="text-[10px] uppercase tracking-widest text-neon-blue font-bold">
                      {article.categoryName}
                    </span>
                  )}
                  <h3 className="text-white font-semibold mt-1.5 group-hover:text-neon-blue transition-colors duration-200 line-clamp-2 leading-snug text-sm sm:text-base">
                    {article.title}
                  </h3>
                  <p className="text-gray-400 text-sm mt-2 line-clamp-2 leading-relaxed">{article.excerpt}</p>
                  <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/5 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {article.readingTime} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {article.viewCount}
                    </span>
                    <span className="ml-auto">{formatDate(article.createdAt)}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {articles.length === 0 && (
        <div className="text-center py-24">
          <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Newspaper className="w-10 h-10 text-gray-700" />
          </div>
          <h3 className="text-xl text-gray-400 font-heading font-bold mb-2">No articles found</h3>
          <p className="text-gray-600 text-sm">
            {search ? `No results for "${search}"` : "Articles will appear here once published."}
          </p>
          {search && (
            <Link href="/news" className="btn-secondary text-sm mt-4 inline-flex items-center gap-2">
              Clear search
            </Link>
          )}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center mt-10">
          <button
            onClick={loadMore}
            disabled={loading}
            className="btn-secondary flex items-center gap-2 px-8 py-3"
            id="news-load-more"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Loading...
              </span>
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
