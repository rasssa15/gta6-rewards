"use client"
import { useState, useEffect, useRef } from "react"
import { Share2, Bookmark, MessageSquare, Eye, Loader2, SkipForward, X } from "lucide-react"
import { useWallet } from "@/components/providers/WalletProvider"
import toast from "react-hot-toast"
import { formatDate } from "@/lib/utils"

interface Article { id: string; title: string; content: string }
interface Comment { id: string; content: string; userName: string; createdAt: string }

const AD_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
]

export default function ArticleClient({ article, comments: initialComments }: { article: Article; comments: Comment[] }) {
  const { walletId } = useWallet()
  const [bookmarked, setBookmarked] = useState(false)
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [commentText, setCommentText] = useState("")
  const [showAd, setShowAd] = useState(true)
  const [adPlaying, setAdPlaying] = useState(false)
  const [adProgress, setAdProgress] = useState(0)
  const [adSkippable, setAdSkippable] = useState(false)
  const [adDone, setAdDone] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const adVideo = useRef(AD_VIDEOS[Math.floor(Math.random() * AD_VIDEOS.length)])

  useEffect(() => {
    if (!showAd) return
    const t = setTimeout(() => setShowAd(false), 15000)
    return () => clearTimeout(t)
  }, [showAd])

  useEffect(() => {
    if (!showAd && walletId) {
      fetch(`/api/articles/${article.id}/view`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: walletId }) }).catch(() => {})
    }
  }, [showAd, walletId, article.id])

  useEffect(() => {
    if (videoRef.current && showAd) {
      const t = setTimeout(() => {
        videoRef.current?.play().catch(() => setAdDone(true))
        setAdPlaying(true)
      }, 500)
      return () => clearTimeout(t)
    }
  }, [showAd])

  useEffect(() => {
    if (adSkippable || !adPlaying) return
    const t = setTimeout(() => setAdSkippable(true), 4000)
    return () => clearTimeout(t)
  }, [adPlaying, adSkippable])

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setAdProgress(Math.min((videoRef.current.currentTime / videoRef.current.duration) * 100, 100))
    }
  }

  const handleAdEnd = () => { setAdDone(true); setAdPlaying(false) }
  const closeAd = () => { setShowAd(false) }

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
      {showAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-card p-6 max-w-lg w-full text-center relative">
            <button onClick={closeAd} className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-green/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-3">
              <Eye className="w-6 h-6 text-neon-green" />
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Quick ad before reading</h3>
            <p className="text-gray-400 text-xs mb-4">Close or let it finish to continue</p>
            <div className="relative rounded-xl overflow-hidden bg-black mb-3">
              <video ref={videoRef} src={adVideo.current} onTimeUpdate={handleTimeUpdate} onEnded={handleAdEnd} className="w-full aspect-video object-cover rounded-xl" playsInline controls={false} />
              {!adPlaying && !adDone && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <Loader2 className="w-6 h-6 text-neon-green animate-spin" />
                </div>
              )}
              {adSkippable && !adDone && (
                <button onClick={() => { if (videoRef.current) videoRef.current.currentTime = videoRef.current.duration }} className="absolute bottom-2 right-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white transition-all flex items-center gap-1">
                  <SkipForward className="w-3 h-3" /> Skip
                </button>
              )}
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-neon-green rounded-full transition-all duration-300" style={{ width: `${Math.min(adProgress, 100)}%` }} />
            </div>
            {adDone ? (
              <button onClick={closeAd} className="btn-primary w-full !py-3 font-bold text-base flex items-center justify-center gap-2">
                <X className="w-4 h-4" /> Read Article
              </button>
            ) : (
              <button onClick={closeAd} className="text-xs text-gray-400 hover:text-white underline">Skip ad &rarr;</button>
            )}
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 mb-8">
        <button onClick={handleBookmark} className={`p-2 rounded-lg glass hover:bg-white/10 transition-all ${bookmarked ? "text-neon-blue" : "text-gray-400"}`}>
          <Bookmark className="w-4 h-4" />
        </button>
        <button onClick={handleShare} className="p-2 rounded-lg glass hover:bg-white/10 transition-all text-gray-400 hover:text-white">
          <Share2 className="w-4 h-4" />
        </button>
      </div>
      <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: article.content }} />
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
