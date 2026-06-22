"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Clock, Eye, Search, ChevronLeft, ChevronRight } from "lucide-react"

const categories = [
  "All", "GTA 6", "Rockstar Games", "PlayStation", "Xbox", "PC Gaming", "Nintendo", "Esports", "Gaming Deals", "Reviews", "Guides"
]

export default function NewsPage() {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState("All")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (category !== "All") params.set("category", category)
    if (search) params.set("search", search)
    params.set("page", page.toString())
    params.set("limit", "12")

    fetch(`/api/articles?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.data) {
          setArticles(data.data)
          setTotalPages(data.totalPages || 1)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [category, search, page])

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="page-container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-2">
            Gaming News
          </h1>
          <p className="text-gray-400">Stay updated with the latest gaming stories</p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="input-field pl-10"
              placeholder="Search articles..."
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setPage(1) }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                category === cat
                  ? "bg-gradient-to-r from-neon-pink to-neon-purple text-white"
                  : "glass text-gray-300 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-72 rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article, i) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={`/news/${article.slug}`} className="block h-full">
                    <div className="glass-card h-full overflow-hidden group">
                      <div className="relative h-48 overflow-hidden">
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                          style={{ backgroundImage: `url(${article.imageUrl})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
                        <span className="absolute top-3 left-3 badge-neon text-xs">{article.category}</span>
                      </div>
                      <div className="p-5">
                        <h2 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-neon-blue transition-colors">
                          {article.title}
                        </h2>
                        <p className="text-gray-400 text-sm line-clamp-2 mb-4">{article.excerpt}</p>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {article.readTime || "N/A"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {article.viewCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-secondary"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
