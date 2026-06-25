"use client"
import { useState } from "react"
import { Share2, Bookmark, MessageSquare } from "lucide-react"
import { useWallet } from "@/components/providers/WalletProvider"
import toast from "react-hot-toast"
import { formatDate } from "@/lib/utils"

interface Article {
  id: string
  title: string
  content: string
}

interface Comment {
  id: string
  content: string
  userName: string
  createdAt: string
}

export default function ArticleClient({
  article,
  comments: initialComments,
}: {
  article: Article
  comments: Comment[]
}) {
  const { walletId } = useWallet()
  const [bookmarked, setBookmarked] = useState(false)
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [commentText, setCommentText] = useState("")

  const handleBookmark = async () => {
    if (!walletId || !article) return toast.error("Connect wallet to bookmark")
    try {
      const res = await fetch(`/api/articles/${article.id}/bookmark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: walletId }),
      })
      const d = await res.json()
      setBookmarked(d.bookmarked)
      toast.success(d.bookmarked ? "Bookmarked!" : "Removed bookmark")
    } catch {}
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success("Link copied!")
  }

  const handleComment = async () => {
    if (!walletId || !commentText.trim()) return
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText, articleId: article.id, userId: walletId }),
      })
      if (res.ok) {
        const newComment = await res.json()
        setComments((prev) => [newComment, ...prev])
        setCommentText("")
        toast.success("Comment posted!")
      }
    } catch {}
  }

  return (
    <>
      <div className="flex items-center gap-2 mb-8">
        <button onClick={handleBookmark} className={`p-2 rounded-lg glass hover:bg-white/10 transition-all ${bookmarked ? "text-neon-blue" : "text-gray-400"}`}>
          <Bookmark className="w-4 h-4" />
        </button>
        <button onClick={handleShare} className="p-2 rounded-lg glass hover:bg-white/10 transition-all text-gray-400 hover:text-white">
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      <div
        className="prose prose-invert max-w-none text-gray-300 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      <div className="mt-12 glass-card p-6">
        <h3 className="text-lg font-heading font-bold text-white mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-neon-blue" /> Comments ({comments.length})
        </h3>
        {walletId ? (
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleComment()}
              placeholder="Write a comment..."
              className="input-field flex-1"
            />
            <button onClick={handleComment} className="btn-primary !px-4 !py-2 text-sm">Post</button>
          </div>
        ) : (
          <p className="text-gray-500 text-sm mb-6">Connect your wallet to comment.</p>
        )}
        <div className="space-y-4">
          {comments.map((comment: any) => (
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
          {comments.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">No comments yet.</p>
          )}
        </div>
      </div>
    </>
  )
}
