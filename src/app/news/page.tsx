"use client"
import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Newspaper, Search, ChevronRight, Clock, Eye } from "lucide-react"
import { motion } from "framer-motion"
import { formatDate } from "@/lib/utils"

function NewsContent() {
  const searchParams = useSearchParams()
  const category = searchParams.get("category")
  const [articles, setArticles] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (category) params.set("category", category)
    if (search) params.set("search", search)
    params.set("limit", "20")

    fetch(`/api/articles?${params}`)
      .then(r => r.json())
      .then(d => setArticles(d.articles || []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false))
  }, [category, search])

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container">
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
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="input-field pl-10"
            />
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
          {categories.map((cat: any) => (
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

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card p-0 overflow-hidden">
                <div className="h-48 skeleton" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-20 skeleton" />
                  <div className="h-5 w-full skeleton" />
                  <div className="h-4 w-3/4 skeleton" />
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <Newspaper className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl text-gray-400 font-semibold">No articles yet</h3>
            <p className="text-gray-600 text-sm mt-2">Articles will appear here once published.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article: any, i: number) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
              >
                <Link href={`/news/${article.slug}`} className="glass-card p-0 overflow-hidden group block h-full">
                  {article.featuredImage ? (
                    <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${article.featuredImage})` }} />
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-neon-blue/10 to-neon-purple/10 flex items-center justify-center">
                      <Newspaper className="w-12 h-12 text-gray-600" />
                    </div>
                  )}
                  <div className="p-5">
                    {article.category && (
                      <span className="text-[10px] uppercase tracking-wider text-neon-blue font-semibold">
                        {article.category.name}
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
          </div>
        )}
      </div>
    </div>
  )
}

export default function NewsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 flex items-center justify-center"><div className="animate-pulse text-gray-400">Loading...</div></div>}>
      <NewsContent />
    </Suspense>
  )
}
