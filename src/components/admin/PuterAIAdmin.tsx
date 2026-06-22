"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Sparkles, Image as ImageIcon, FileText, Tags, Loader2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"
import { loadPuterScript, isPuterAvailable, generateArticle, generateArticleImage, generateSEOMetadata, categorizeContent } from "@/lib/ai/puter"
import toast from "react-hot-toast"

export function PuterAIAdmin() {
  const [puterReady, setPuterReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [topic, setTopic] = useState("")
  const [style, setStyle] = useState("gaming news")
  const [length, setLength] = useState("medium")
  const [tone, setTone] = useState("professional yet engaging")
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    loadPuterScript().then((ready) => setPuterReady(ready))
  }, [])

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic")
      return
    }

    setLoading(true)
    try {
      const article = await generateArticle(topic, { style, length, tone })
      if (article) {
        setResult(article)
        toast.success("Article generated successfully!")
      } else {
        toast.error("Generation failed. Check Puter connection.")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateImage = async () => {
    if (!topic.trim()) return
    setLoading(true)
    try {
      const imageUrl = await generateArticleImage(topic)
      if (imageUrl) {
        setResult((prev: any) => ({ ...prev, generatedImage: imageUrl }))
        toast.success("Image generated!")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateSEO = async () => {
    if (!result?.title || !result?.content) {
      toast.error("Generate article content first")
      return
    }
    setLoading(true)
    try {
      const seo = await generateSEOMetadata(result.title, result.content)
      if (seo) {
        setResult((prev: any) => ({ ...prev, ...seo }))
        toast.success("SEO metadata generated!")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCategorize = async () => {
    if (!result?.title || !result?.content) {
      toast.error("Generate article content first")
      return
    }
    setLoading(true)
    try {
      const cat = await categorizeContent(result.title, result.content)
      if (cat) {
        setResult((prev: any) => ({ ...prev, category: cat.category, tags: cat.tags }))
        toast.success(`Category: ${cat.category}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const copyContent = () => {
    if (!result) return
    const text = JSON.stringify(result, null, 2)
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  if (!puterReady) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="animate-pulse">
          <Sparkles className="w-8 h-8 mx-auto mb-3 text-neon-purple" />
          <p className="text-gray-400 text-sm">Loading Puter AI... (requires Puter.com session)</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-neon-purple" />
          <h3 className="text-lg font-heading font-bold text-white">AI Article Generator</h3>
          <span className="badge-green text-xs ml-2">Powered by Puter.ai</span>
        </div>
        <p className="text-gray-400 text-sm mb-6">
          Generate complete gaming articles with AI. You need to be logged into Puter.com.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Topic / Keyword</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="input-field"
              placeholder="e.g., GTA 6 leaked gameplay features"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-300 mb-1 block">Style</label>
              <select value={style} onChange={(e) => setStyle(e.target.value)} className="input-field">
                <option value="gaming news">Gaming News</option>
                <option value="review">Review</option>
                <option value="guide">Guide</option>
                <option value="opinion">Opinion</option>
                <option value="tutorial">Tutorial</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-300 mb-1 block">Length</label>
              <select value={length} onChange={(e) => setLength(e.target.value)} className="input-field">
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-300 mb-1 block">Tone</label>
              <select value={tone} onChange={(e) => setTone(e.target.value)} className="input-field">
                <option value="professional yet engaging">Professional</option>
                <option value="casual and fun">Casual</option>
                <option value="excited and hype">Hype</option>
                <option value="analytical and detailed">Analytical</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={handleGenerate} disabled={loading} className="btn-primary flex items-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? "Generating..." : "Generate Article"}
            </button>
            <button onClick={handleGenerateImage} disabled={loading} className="btn-secondary flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Generate Image
            </button>
            <button onClick={handleGenerateSEO} disabled={loading} className="btn-secondary flex items-center gap-2">
              <Tags className="w-4 h-4" />
              Generate SEO
            </button>
            <button onClick={handleCategorize} disabled={loading} className="btn-secondary flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Categorize
            </button>
          </div>
        </div>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-neon-green" />
              <h3 className="text-lg font-heading font-bold text-white">Generated Content</h3>
            </div>
            <div className="flex gap-2">
              <button onClick={copyContent} className="btn-ghost text-xs">Copy All</button>
              <button onClick={() => setResult(null)} className="btn-ghost text-xs text-red-400">Clear</button>
            </div>
          </div>

          {result.generatedImage && (
            <div className="mb-4 rounded-xl overflow-hidden">
              <img src={result.generatedImage} alt="Generated" className="w-full h-64 object-cover" />
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider">Title</label>
              <p className="text-white font-semibold">{result.title}</p>
            </div>

            {result.excerpt && (
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider">Excerpt</label>
                <p className="text-gray-300 text-sm">{result.excerpt}</p>
              </div>
            )}

            {result.content && (
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider">Content</label>
                <div className="text-gray-300 text-sm prose prose-invert max-w-none mt-1 p-4 glass rounded-xl max-h-96 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: result.content }} />
              </div>
            )}

            {result.tags && (
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider">Tags</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {result.tags.map((tag: string) => (
                    <span key={tag} className="badge-blue text-xs">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {result.category && (
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider">Category</label>
                <p className="text-neon-blue font-medium">{result.category}</p>
              </div>
            )}

            {result.seoTitle && (
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider">SEO Title</label>
                <p className="text-gray-300 text-sm">{result.seoTitle}</p>
              </div>
            )}

            {result.seoDesc && (
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider">Meta Description</label>
                <p className="text-gray-300 text-sm">{result.seoDesc}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
