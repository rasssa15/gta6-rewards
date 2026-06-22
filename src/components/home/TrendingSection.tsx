"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { TrendingUp, Clock, Eye, Flame } from "lucide-react"

const categories = ["All", "GTA 6", "Rockstar Games", "PlayStation", "Xbox", "PC Gaming", "Nintendo", "Esports"]

export function TrendingSection() {
  const [articles, setArticles] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState("All")

  useEffect(() => {
    const params = new URLSearchParams()
    if (activeCategory !== "All") params.set("category", activeCategory)
    params.set("limit", "6")

    fetch(`/api/articles?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.data) setArticles(data.data)
      })
      .catch(() => {})
  }, [activeCategory])

  return (
    <section className="py-16 sm:py-20">
      <div className="page-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-neon-pink" />
            <h2 className="section-title mb-0">Trending Now</h2>
          </div>
          <p className="section-subtitle mb-8">Most popular gaming stories</p>
        </motion.div>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-gradient-to-r from-neon-pink to-neon-purple text-white"
                  : "glass text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
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
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="badge-neon text-xs">{article.category}</span>
                      {article.featured && (
                        <span className="badge-gold text-xs flex items-center gap-1">
                          <Flame className="w-3 h-3" /> Hot
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-semibold text-white mb-2 line-clamp-2 group-hover:text-neon-blue transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {article.readTime}
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
      </div>
    </section>
  )
}
