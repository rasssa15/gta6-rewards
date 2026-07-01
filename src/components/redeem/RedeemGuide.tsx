"use client"
import { useState } from "react"
import { Monitor, Radio, Globe, Gamepad2, ShoppingBag, Star, X, ExternalLink } from "lucide-react"

interface Guide {
  platform: string
  key: string
  icon: typeof Monitor
  color: string
  steps: string[]
  url?: string
}

const GUIDES: Guide[] = [
  {
    platform: "Steam",
    key: "steam",
    icon: Monitor,
    color: "text-blue-400",
    steps: [
      "Open the Steam desktop app or visit store.steampowered.com",
      'Click on your profile name, then select "Redeem a Steam Wallet Code"',
      "Enter or paste your coupon code exactly as shown",
      "Click Continue and Confirm — funds added to your Steam Wallet instantly",
    ],
    url: "https://store.steampowered.com/account/redeemwalletcode",
  },
  {
    platform: "Epic Games",
    key: "epic",
    icon: ShoppingBag,
    color: "text-purple-400",
    steps: [
      "Open the Epic Games Launcher or visit epicgames.com/store",
      'Click your profile icon, then select "Redeem Code"',
      "Type or paste your coupon code into the field",
      "Click Redeem — coupon applied to your account immediately",
    ],
    url: "https://www.epicgames.com/store/redeem",
  },
  {
    platform: "PlayStation",
    key: "playstation",
    icon: Radio,
    color: "text-blue-500",
    steps: [
      "On PS5/PS4: Settings > Users and Accounts > Redeem Codes",
      "Or visit playstation.com/redeem on any browser",
      "Enter your 12-digit voucher code exactly as shown",
      "Confirm to add funds to your PlayStation Network wallet",
    ],
    url: "https://www.playstation.com/en-us/redeem/",
  },
  {
    platform: "Xbox",
    key: "xbox",
    icon: Globe,
    color: "text-green-500",
    steps: [
      "On Xbox: press the Xbox button > Store > Redeem",
      'Or visit redeem.microsoft.com and sign in',
      "Enter your 25-character code (spaces auto-fill)",
      'Balance added to your Microsoft account instantly',
    ],
    url: "https://redeem.microsoft.com/",
  },
  {
    platform: "Nintendo",
    key: "nintendo",
    icon: Gamepad2,
    color: "text-red-400",
    steps: [
      "On Nintendo Switch: eShop from HOME menu > Redeem Code",
      "Enter your 16-digit download code",
      'Confirm — funds added to your eShop balance',
    ],
    url: "https://ec.nintendo.com/redeem",
  },
  {
    platform: "GTA 6",
    key: "gta6",
    icon: Star,
    color: "text-neon-pink",
    steps: [
      "Contact GTA 6 Rewards support with your coupon code",
      "Provide your wallet address for verification",
      "Once verified, the pre-order code is sent to your email",
      "Use the code on your chosen platform to pre-order GTA 6",
    ],
  },
]

export function RedeemGuide() {
  const [open, setOpen] = useState<string | null>(null)
  const activeGuide = GUIDES.find(g => g.platform === open)

  return (
    <div className="mt-16 mb-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-2">How to Redeem</h2>
        <p className="text-gray-400 text-sm">Select your platform for step-by-step instructions</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {GUIDES.map((guide) => {
          const Icon = guide.icon
          const isOpen = open === guide.platform
          return (
            <button
              key={guide.platform}
              onClick={() => setOpen(isOpen ? null : guide.platform)}
              className={`glass-card p-4 text-center ${
                isOpen ? "border-neon-green/40 ring-1 ring-neon-green/20 bg-neon-green/5" : ""
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-2">
                <Icon className={`w-6 h-6 ${guide.color}`} />
              </div>
              <div className="text-xs text-white font-semibold">{guide.platform}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{isOpen ? "Close" : "View steps"}</div>
            </button>
          )
        })}
      </div>

      {activeGuide && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-4 flex items-center justify-center">
            <img
              src={`/images/redeem-guide/${activeGuide.key}-redeem.svg`}
              alt={`${activeGuide.platform} redeem guide`}
              className="w-full max-w-md rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none"
              }}
            />
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <activeGuide.icon className={`w-5 h-5 ${activeGuide.color}`} />
                </div>
                <div>
                  <h3 className="text-white font-bold">{activeGuide.platform} — Redeem Guide</h3>
                  <p className="text-xs text-gray-500">Follow these steps to claim your coupon</p>
                </div>
              </div>
              <button onClick={() => setOpen(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-0">
              {activeGuide.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-4 py-3 border-b border-white/5 last:border-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                    i === 0 ? "bg-neon-green/20 text-neon-green" :
                    i === activeGuide.steps.length - 1 ? "bg-neon-yellow/20 text-neon-yellow" :
                    "bg-white/10 text-gray-300"
                  }`}>
                    {i + 1}
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>

            {activeGuide.url && (
              <a
                href={activeGuide.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-neon-blue hover:text-neon-blue/80 mt-4"
              >
                <ExternalLink className="w-3 h-3" />
                Open {activeGuide.platform} redeem page
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
