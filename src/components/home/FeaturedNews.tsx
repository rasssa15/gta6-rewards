"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Clock, Eye, ArrowRight } from "lucide-react"

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  imageUrl: string | null
  category: string
  readTime: string | null
  viewCount: number
  publishedAt: string | null
  author: { name: string | null; image: string | null } | null
}

export function FeaturedNews() {
  const [articles, setArticles] = useState<Article[]>([])
  const [featured, setFeatured] = useState<Article | null>(null)

  useEffect(() => {
    fetch("/api/articles?featured=true&limit=5")
      .then((r) => r.json())
      .then((data) => {
        if (data.data) {
          setFeatured(data.data[0] || null)
          setArticles(data.data.slice(1, 4))
        }
      })
      .catch(() => {})
  }, [])

  if (!featured) {
    return (
      <section className="py-16 sm:py-20">
        <div className="page-container">
          <div className="section-title">Featured News</div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="skeleton h-[400px] rounded-2xl" />
            <div className="grid grid-rows-2 gap-6">
              <div className="skeleton h-[188px] rounded-2xl" />
              <div className="skeleton h-[188px] rounded-2xl" />
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 sm:py-20">
      <div className="page-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title mb-0">Featured News</h2>
              <p className="section-subtitle">Latest GTA 6 and gaming updates</p>
            </div>
            <Link href="/news" className="btn-ghost text-sm flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:row-span-2"
          >
            <Link href={`/news/${featured.slug}`} className="block h-full">
              <div className="glass-card h-full overflow-hidden group">
                <div className="relative h-full min-h-[400px]">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${featured.imageUrl})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                    <span className="badge-neon mb-3 inline-block">{featured.category}</span>
                    <h3 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-3 line-clamp-2">
                      {featured.title}
                    </h3>
                    <p className="text-gray-300 text-sm line-clamp-2 mb-4">
                      {featured.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {featured.readTime || "N/A"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {featured.viewCount} views
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          <div className="grid grid-rows-2 gap-6">
            {articles.map((article, i) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/news/${article.slug}`} className="block h-full">
                  <div className="glass-card h-full overflow-hidden group">
                    <div className="flex h-full">
                      <div className="flex-1 p-5">
                        <span className="badge-blue text-xs mb-2 inline-block">{article.category}</span>
                        <h3 className="text-base font-semibold text-white mb-2 line-clamp-2 group-hover:text-neon-blue transition-colors">
                          {article.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-auto">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {article.readTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {article.viewCount}
                          </span>
                        </div>
                      </div>
                      <div
                        className="w-32 sm:w-40 bg-cover bg-center shrink-0"
                        style={{ backgroundImage: `url(${article.imageUrl})` }}
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
