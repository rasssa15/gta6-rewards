"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Newspaper, Plus, Edit, Trash2, Eye, Search, Check, X } from "lucide-react"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import slugify from "slugify"

export default function AdminArticlesPage() {
  const router = useRouter()
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({
    title: "", slug: "", excerpt: "", content: "", categoryId: "",
    featuredImage: "", status: "draft", tags: "", author: "GTA 6 Rewards",
  })
  const [categories, setCategories] = useState<any[]>([])
  const [saving, setSaving] = useState(false)

  const loadArticles = () => {
    setLoading(true)
    fetch("/api/articles?status=all&limit=50")
      .then(r => r.json())
      .then(d => setArticles(d.articles || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadArticles()
    fetch("/api/categories").then(r => r.json()).then(setCategories).catch(() => {})
  }, [])

  const handleTitleChange = (title: string) => {
    setForm((f) => ({ ...f, title, slug: slugify(title, { lower: true, strict: true }) }))
  }

  const handleSave = async () => {
    if (!form.title || !form.slug) return toast.error("Title and slug required")
    setSaving(true)
    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast.success("Article created!")
        setShowNew(false)
        setForm({ title: "", slug: "", excerpt: "", content: "", categoryId: "", featuredImage: "", status: "draft", tags: "", author: "GTA 6 Rewards" })
        loadArticles()
      } else {
        toast.error("Failed to create")
      }
    } catch { toast.error("Failed to create") }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article?")) return
    try {
      await fetch(`/api/articles/${id}`, { method: "DELETE" })
      toast.success("Deleted!")
      loadArticles()
    } catch { toast.error("Failed to delete") }
  }

  const handlePublish = async (id: string) => {
    try {
      await fetch(`/api/articles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "published" }),
      })
      toast.success("Published!")
      loadArticles()
    } catch {}
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Newspaper className="w-6 h-6 text-neon-blue" />
            <h1 className="text-2xl font-heading font-bold text-white">Articles</h1>
          </div>
          <button onClick={() => setShowNew(!showNew)} className="btn-primary text-sm !px-4 !py-2 flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Article
          </button>
        </div>

        {showNew && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 mb-8"
          >
            <h2 className="text-lg font-heading font-bold text-white mb-4">Create Article</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="lg:col-span-2">
                <label className="text-sm text-gray-400 mb-1 block">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="input-field"
                  placeholder="Article title"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Slug</label>
                <input type="text" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Category</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                  className="input-field"
                >
                  <option value="">No category</option>
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="lg:col-span-2">
                <label className="text-sm text-gray-400 mb-1 block">Excerpt</label>
                <input
                  type="text"
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  className="input-field"
                  placeholder="Short description"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="text-sm text-gray-400 mb-1 block">Content (HTML or plain text)</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  className="input-field min-h-[200px]"
                  placeholder="Article content..."
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Featured Image URL</label>
                <input
                  type="text"
                  value={form.featuredImage}
                  onChange={(e) => setForm((f) => ({ ...f, featuredImage: e.target.value }))}
                  className="input-field"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Tags (comma separated)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  className="input-field"
                  placeholder="gta6, gaming, news"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
                {saving ? "Saving..." : "Save Draft"}
              </button>
              <button onClick={() => setShowNew(false)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass-card p-4 space-y-2">
                <div className="h-5 w-3/4 skeleton" />
                <div className="h-4 w-1/4 skeleton" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {articles.map((article, i) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="glass-card p-4 flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      article.status === "published" ? "bg-neon-green/20 text-neon-green" : "bg-yellow-500/20 text-yellow-500"
                    }`}>
                      {article.status}
                    </span>
                    {article.category && (
                      <span className="text-[10px] text-neon-blue">{article.category.name}</span>
                    )}
                  </div>
                  <h3 className="text-white font-semibold truncate">{article.title}</h3>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(article.createdAt).toLocaleDateString()} · {article.viewCount} views · {article.readingTime} min
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {article.status === "draft" && (
                    <button onClick={() => handlePublish(article.id)} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-neon-green transition-all" title="Publish">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <Link href={`/news/${article.slug}`} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all">
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button onClick={() => handleDelete(article.id)} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-red-400 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
            {articles.length === 0 && (
              <p className="text-gray-500 text-center py-8">No articles yet. Create your first one!</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
