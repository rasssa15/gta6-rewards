"use client"
import { useState } from "react"
import { HelpCircle, ChevronDown, Search } from "lucide-react"
import { motion } from "framer-motion"

const faqs = [
  {
    q: "What is GTA 6 Rewards?",
    a: "GTA 6 Rewards is a gaming rewards platform where you earn points by reading articles, completing daily challenges, and watching ads. Points can be redeemed for gift cards and digital rewards.",
  },
  {
    q: "How do I create a wallet?",
    a: "Click 'Create Wallet' on the homepage. A 12-word recovery phrase will be generated — write it down and keep it safe. Then set a 6-digit PIN for quick access.",
  },
  {
    q: "How do I earn points?",
    a: "You can earn points by reading articles (+2 per article), completing daily challenges, watching rewarded ads, referring friends, and unlocking achievements.",
  },
  {
    q: "What is a recovery phrase?",
    a: "Your 12-word recovery phrase is the master key to your wallet. It's stored only on your device, encrypted with your PIN. Never share it with anyone.",
  },
  {
    q: "How do I recover my wallet?",
    a: "If you lose access, click 'Recover Wallet' and enter your 12-word recovery phrase. Then set a new PIN to regain access to your account.",
  },
  {
    q: "How do scratch cards work?",
    a: "Complete rewarded ads to unlock scratch cards. Each card reveals a random reward from 1 to 50 points. The more ads you watch, the more cards you can play.",
  },
  {
    q: "How do I redeem rewards?",
    a: "Go to the Rewards Center, choose a reward with enough points, and click Redeem. Your request will be processed and you'll receive instructions via your dashboard.",
  },
  {
    q: "How does the leaderboard work?",
    a: "Players are ranked by total points earned. You can view daily, weekly, monthly, and all-time rankings. Higher rank = more bragging rights!",
  },
  {
    q: "What are daily challenges?",
    a: "Daily challenges refresh every 24 hours. Complete them to earn bonus points and XP. Common challenges include reading articles, earning points, and visiting daily.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. Your wallet is encrypted with AES-256-GCM using a key derived from your PIN via PBKDF2 (100,000 rounds). Your recovery phrase never leaves your device.",
  },
]

export default function FAQPage() {
  const [search, setSearch] = useState("")
  const [openId, setOpenId] = useState<number | null>(null)

  const filtered = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container max-w-3xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-white mb-2">FAQ</h1>
          <p className="text-gray-400">Frequently asked questions</p>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="input-field pl-10"
          />
        </div>

        <div className="space-y-2">
          {filtered.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.02 }}
              className="glass-card overflow-hidden"
            >
              <button
                onClick={() => setOpenId(openId === i ? null : i)}
                className="w-full p-5 flex items-center justify-between text-left"
              >
                <span className="text-white font-medium pr-4">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${
                    openId === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openId === i && (
                <div className="px-5 pb-5 text-gray-400 text-sm leading-relaxed">
                  {faq.a}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No results found for "{search}"</p>
          </div>
        )}
      </div>
    </div>
  )
}
