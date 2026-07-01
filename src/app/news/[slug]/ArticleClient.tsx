"use client"
import { useState, useEffect, useRef } from "react"
import { Share2, Bookmark, MessageSquare } from "lucide-react"
import { useWallet } from "@/components/providers/WalletProvider"
import { SmartLinkPopunder } from "@/components/ads/SmartLinkPopunder"
import toast from "react-hot-toast"
import { formatDate } from "@/lib/utils"

interface Article { id: string; title: string; content: string }
interface Comment { id: string; content: string; userName: string; createdAt: string }

export default function ArticleClient({ article, comments: initialComments }: { article: Article; comments: Comment[] }) {
  const { walletId } = useWallet()
  const [bookmarked, setBookmarked] = useState(false)
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [commentText, setCommentText] = useState("")
  const adInjected = useRef(false)

  const autoPopup = useRef(false)

  useEffect(() => {
    if (autoPopup.current) return
    autoPopup.current = true
    const timer = setTimeout(() => {
      try {
        window.open("https://www.effectivecpmnetwork.com/ferya5qq?key=0fdf4c14f0056af80dff7d2b13c4d1ee", "_blank")
      } catch {}
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (adInjected.current) return
    adInjected.current = true

    const injectAd = (containerId: string, type: "skyscraper" | "small-skyscraper") => {
      const container = document.getElementById(containerId)
      if (!container) return

      if (type === "skyscraper") {
        const inline = document.createElement("script")
        inline.text = `atOptions={'key':'14c436bda0b1d02724d0618980143ce5','format':'iframe','height':600,'width':160,'params':{}};`
        container.appendChild(inline)
        const invoke = document.createElement("script")
        invoke.src = "https://evidentbummerhike.com/14c436bda0b1d02724d0618980143ce5/invoke.js"
        container.appendChild(invoke)
      }

      if (type === "small-skyscraper") {
        const inline = document.createElement("script")
        inline.text = `atOptions={'key':'0eda691a40adbc5636d43af20fdda82d','format':'iframe','height':300,'width':160,'params':{}};`
        container.appendChild(inline)
        const invoke = document.createElement("script")
        invoke.src = "https://evidentbummerhike.com/0eda691a40adbc5636d43af20fdda82d/invoke.js"
        container.appendChild(invoke)
      }
    }

    injectAd("ht-skyscraper-placeholder", "skyscraper")
    injectAd("ht-small-skyscraper-placeholder", "small-skyscraper")

    const incontent = document.getElementById("adsterra-incontent")
    if (incontent) {
      const s = document.createElement("script")
      s.async = true
      s.setAttribute("data-cfasync", "false")
      s.src = "https://evidentbummerhike.com/f301214e059ca70b56b447bf6850594e/invoke.js"
      incontent.appendChild(s)
      const d = document.createElement("div")
      d.id = "container-f301214e059ca70b56b447bf6850594e"
      incontent.appendChild(d)
    }
  }, [])

  const handleBookmark = async () => {
    if (!walletId || !article) return toast.error("Connect wallet to bookmark")
    try {
      const res = await fetch(`/api/articles/${article.id}/bookmark`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: walletId }) })
      const d = await res.json()
      setBookmarked(d.bookmarked)
      toast.success(d.bookmarked ? "Bookmarked!" : "Removed bookmark")
    } catch {}
  }

  const handleShare = () => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!") }

  const handleComment = async () => {
    if (!walletId || !commentText.trim()) return
    try {
      const res = await fetch("/api/comments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: commentText, articleId: article.id, walletId }) })
      if (res.ok) {
        const newComment = await res.json()
        setComments(prev => [newComment, ...prev])
        setCommentText("")
        toast.success("Comment posted!")
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to post comment")
      }
    } catch {
      toast.error("Network error. Try again.")
    }
  }

  return (
    <>
      <SmartLinkPopunder />

      <div className="flex items-center gap-2 mb-8">
        <button onClick={handleBookmark} className={`p-2 rounded-lg glass hover:bg-white/10 transition-all ${bookmarked ? "text-neon-blue" : "text-gray-400"}`}>
          <Bookmark className="w-4 h-4" />
        </button>
        <button onClick={handleShare} className="p-2 rounded-lg glass hover:bg-white/10 transition-all text-gray-400 hover:text-white">
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: article.content }} />

      <div className="my-6 flex flex-col items-center gap-4">
        <div id="adsterra-incontent" className="flex justify-center w-full" />
      </div>

      <div className="mt-12 glass-card p-6">
        <h3 className="text-lg font-heading font-bold text-white mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-neon-blue" /> Comments ({comments.length})
        </h3>
        {walletId ? (
          <div className="flex gap-3 mb-6">
            <input type="text" value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === "Enter" && handleComment()} placeholder="Write a comment..." className="input-field flex-1" />
            <button onClick={handleComment} className="btn-primary !px-4 !py-2 text-sm">Post</button>
          </div>
        ) : (
          <p className="text-gray-500 text-sm mb-6">Connect your wallet to comment.</p>
        )}
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="p-4 rounded-xl bg-white/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">{(comment.userName || "U").charAt(0)}</span>
                </div>
                <span className="text-sm text-white font-medium">{comment.userName || "Anonymous"}</span>
                <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-300">{comment.content}</p>
            </div>
          ))}
          {comments.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No comments yet.</p>}
        </div>
      </div>
    </>
  )
}
