"use client"
import { useState } from "react"
import { HelpCircle, ChevronDown, Search } from "lucide-react"
import { motion } from "framer-motion"

const faqs = [
  {
    q: "What is GTA 6 Rewards?",
    a: "GTA 6 Rewards is a fictional entertainment platform where you earn points by reading GTA 6 news, watching ads, and referring friends. Points can be redeemed for digital reward coupons — but this is all for fun, no real rewards or gift cards are provided.",
  },
  {
    q: "How do I create a wallet?",
    a: "Click 'Create Wallet' on the homepage. A 12-word recovery phrase will be generated — write it down and keep it safe. Then set a 6-digit PIN for quick access. Your wallet is stored only on your device, encrypted with your PIN.",
  },
  {
    q: "How do I earn points?",
    a: "You earn points by completing scratch cards. Get scratch cards by: reading articles, watching ads on the Watch Ads page (/ads), and completing ad milestone challenges. Every action awards a random scratch card with 1–10 points depending on the tier.",
  },
  {
    q: "How do scratch cards work?",
    a: "There are 3 tiers: 🥉 Bronze (1–2 pts, very common 10x weight), 🥈 Silver (2–5 pts, uncommon 1.5x), 🥇 Gold (5–10 pts, rare 0.5x). Early on you get full points, but the more you earn the harder it gets — points decay toward a ~250–300 lifetime ceiling. No hard cap, just diminishing returns.",
  },
  {
    q: "How do I watch ads to earn cards?",
    a: "Go to the /ads page. Each video ad plays for a few seconds, then you earn a random scratch card. You can chain-watch as many as you like. Your total ads watched also unlocks milestone challenges for bigger rewards.",
  },
  {
    q: "What are ad milestone challenges?",
    a: "Watch certain numbers of ads to unlock bonus rewards: 5/10/15/25/30/50 ads → Gold scratch card, 20/40/75/100 ads → Mystery Chest with 5 random cards. Check the /challenges page to track your progress.",
  },
  {
    q: "How do I refer friends?",
    a: "Go to your Dashboard → Referral tab. You'll find your unique referral link and code (e.g., ABC123). Share it with friends. When they sign up using your code and make their first redemption, you get 10 points + 20% of their reward cost as a bonus!",
  },
  {
    q: "How do I claim a friend's referral?",
    a: "Click your friend's referral link (e.g., https://gta6-rewards.vercel.app/referral?ref=ABC123) or enter their code on the referral page. Make sure you've created a wallet first. You can only claim one referral, so choose wisely!",
  },
  {
    q: "How do I redeem rewards?",
    a: "Go to the /redeem page, choose a reward with enough points, and click Redeem. Your points are deducted and you get a coupon code displayed on screen. Remember — this is a fictional platform, coupons are for fun only.",
  },
  {
    q: "What rewards are available?",
    a: "We have game coupons (various popular titles at 170 pts each, GTA 6 at 250 pts), tier coupon packs (Bronze 70 pts, Silver 160 pts, Gold 200 pts), and gift cards (sold out). New rewards are added regularly.",
  },
  {
    q: "How does the leaderboard work?",
    a: "The all-time leaderboard shows the top players capped at 12,546 points. It rotates daily (by day-of-year offset) so positions shuffle for fun. There's also a daily tab with random 50–300 bonus points added per player. Compete for bragging rights!",
  },
  {
    q: "What is a recovery phrase?",
    a: "Your 12-word recovery phrase is the master key to your wallet. It's stored only on your device, encrypted with AES-256-GCM using a key derived from your PIN via PBKDF2 (100,000 rounds). Never share it with anyone. If you lose it, your wallet is gone forever.",
  },
  {
    q: "How do I recover my wallet?",
    a: "If you lose access, click 'Recover Wallet' on the homepage. Enter your 12-word recovery phrase (in the correct order), then set a new PIN. Your points and progress are saved on the server linked to your wallet ID.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. Your wallet is encrypted on-device with AES-256-GCM. Your recovery phrase never leaves your device. We use HTTPS and never sell your data. The server stores only your wallet ID (a hash), points, and game progress — no personal info.",
  },
  {
    q: "What articles are on the site?",
    a: "We feature GTA 6 news, rumors, leaks, and analysis. Articles are auto-generated using AI and updated every 2 hours. Each article you read gives you a scratch card. You can also bookmark your favorite articles.",
  },
  {
    q: "Why do I see a video ad before articles?",
    a: "To keep the platform free, articles show a short video ad before reading. You can skip after 4 seconds or close it anytime. The ad helps us keep the lights on — and you still get a scratch card for reading!",
  },
  {
    q: "Can I use the same wallet on multiple devices?",
    a: "Yes! Use your 12-word recovery phrase to restore your wallet on any device. Your points, progress, and everything else is tied to your wallet ID on the server.",
  },
  {
    q: "Is this a real rewards platform?",
    a: "No — this is a fictional fan project for entertainment. All points, coupons, and rewards are simulated. No real gift cards, money, or prizes are distributed. It's just for fun! See the /terms page for full details.",
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
