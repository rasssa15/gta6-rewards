"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Clock, Eye, Share2, Bookmark, ChevronLeft, User, Calendar, ArrowRight } from "lucide-react"
import toast from "react-hot-toast"

export default function ArticlePage() {
  const params = useParams()
  const slug = params.slug as string
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [readingProgress, setReadingProgress] = useState(0)
  const [bookmarked, setBookmarked] = useState(false)

  useEffect(() => {
    if (!slug) return
    fetch(`/api/articles/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setArticle(data.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setReadingProgress(Math.min(scrollPercent, 100))
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleBookmark = async () => {
    if (!article) return
    try {
      const res = await fetch("/api/articles/bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: article.id }),
      })
      const data = await res.json()
      if (data.success) {
        setBookmarked(data.data.bookmarked)
        toast.success(data.data.bookmarked ? "Bookmarked!" : "Removed bookmark")
      }
    } catch {}
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: article.title, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied!")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-12">
        <div className="page-container">
          <div className="skeleton h-8 w-32 mb-4" />
          <div className="skeleton h-12 w-3/4 mb-4" />
          <div className="skeleton h-64 w-full mb-6 rounded-2xl" />
          <div className="space-y-3">
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-5/6" />
            <div className="skeleton h-4 w-4/6" />
          </div>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen pt-20 pb-12">
        <div className="page-container text-center">
          <h1 className="text-2xl font-heading font-bold text-white mb-4">Article Not Found</h1>
          <Link href="/news" className="btn-primary">Back to News</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      {/* Reading Progress Bar */}
      <div className="fixed top-20 left-0 right-0 z-40 h-1 bg-white/5">
        <div className="h-full bg-gradient-to-r from-neon-pink to-neon-purple transition-all duration-150" style={{ width: `${readingProgress}%` }} />
      </div>

      <div className="page-container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/news" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to News
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className="badge-neon">{article.category}</span>
            {article.featured && <span className="badge-gold">Featured</span>}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white mb-6 leading-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-8">
            {article.author && (
              <span className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-xs font-bold text-white">
                  {article.author.name?.[0] || "A"}
                </div>
                <span>{article.author.name}</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : "Recently"}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> {article.readTime || "N/A"}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" /> {(article.viewCount + 1).toLocaleString()} views
            </span>
          </div>

          <div className="flex items-center gap-2 mb-8">
            <button onClick={handleBookmark} className={`btn-secondary text-sm flex items-center gap-2 ${bookmarked ? "text-neon-yellow" : ""}`}>
              <Bookmark className="w-4 h-4" />
              {bookmarked ? "Bookmarked" : "Bookmark"}
            </button>
            <button onClick={handleShare} className="btn-secondary text-sm flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>

          {article.imageUrl && (
            <div className="rounded-2xl overflow-hidden mb-8">
              <img src={article.imageUrl} alt={article.title} className="w-full h-auto max-h-[500px] object-cover" />
            </div>
          )}

          {article.excerpt && (
            <div className="glass-card p-6 mb-8 border-l-4 border-neon-blue">
              <p className="text-gray-300 italic leading-relaxed">{article.excerpt}</p>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="lg:col-span-2"
          >
            <div
              className="prose prose-invert max-w-none text-gray-300 leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: article.content || "" }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* Related Articles */}
            {article.related && article.related.length > 0 && (
              <div className="glass-card p-6 sticky top-28">
                <h3 className="text-lg font-heading font-bold text-white mb-4">Related Articles</h3>
                <div className="space-y-4">
                  {article.related.map((related: any) => (
                    <Link key={related.id} href={`/news/${related.slug}`} className="block group">
                      <div className="flex gap-3">
                        <div className="w-20 h-16 rounded-lg bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${related.imageUrl})` }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white line-clamp-2 group-hover:text-neon-blue transition-colors">
                            {related.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{related.readTime}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Comments Section */}
        {article.comments && (
          <div className="mt-12">
            <h3 className="text-xl font-heading font-bold text-white mb-6">
              Comments ({article.comments.length})
            </h3>
            {article.comments.length > 0 ? (
              <div className="space-y-4">
                {article.comments.map((comment: any) => (
                  <div key={comment.id} className={`glass-card p-5 ${comment.pinned ? "border-neon-yellow/30" : ""}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-sm font-bold text-white shrink-0">
                        {comment.user?.name?.[0] || "U"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-white">{comment.user?.name}</span>
                          <span className="badge-blue text-xs">{comment.user?.rank}</span>
                          {comment.pinned && <span className="badge-gold text-xs">Pinned</span>}
                        </div>
                        <p className="text-sm text-gray-300">{comment.content}</p>
                        <p className="text-xs text-gray-500 mt-2">{new Date(comment.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card p-8 text-center">
                <p className="text-gray-400">No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
