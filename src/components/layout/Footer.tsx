"use client"
import Link from "next/link"
import { Gamepad2, Twitter, MessageCircle, Youtube, ExternalLink, ArrowUpRight } from "lucide-react"

const navSections = [
  {
    title: "Platform",
    links: [
      { label: "GTA 6 News", href: "/news" },
      { label: "Rewards Center", href: "/rewards" },
      { label: "Leaderboard", href: "/leaderboard" },
      { label: "Challenges", href: "/challenges" },
      { label: "Watch Ads", href: "/ads" },
      { label: "Earn Points", href: "/earn" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Create Wallet", href: "/wallet/create" },
      { label: "Login", href: "/wallet/login" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Referral Program", href: "/referral" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
]

const socials = [
  { icon: Twitter,        label: "Twitter",  href: "#", color: "hover:text-[#1da1f2]" },
  { icon: MessageCircle, label: "Discord",  href: "#", color: "hover:text-[#7289da]" },
  { icon: Youtube,       label: "YouTube",  href: "#", color: "hover:text-[#ff0000]" },
]

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5" style={{ background: "rgba(7,7,16,0.97)" }}>
      {/* Subtle top neon line */}
      <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, var(--neon-pink) 30%, var(--neon-purple) 50%, var(--neon-blue) 70%, transparent)" }} />

      <div className="page-container py-14 sm:py-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group" id="footer-brand">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center group-hover:shadow-lg group-hover:shadow-neon-pink/30 transition-all duration-300">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-heading font-bold gradient-text">GTA6 Rewards</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs mb-6">
              The ultimate GTA 6 fan platform. Read news, earn points through ads & challenges,
              and redeem real gaming gift cards.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              {socials.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className={`w-10 h-10 rounded-xl glass flex items-center justify-center text-gray-500 ${social.color} transition-all duration-200 hover:scale-110 hover:bg-white/10`}
                  id={`footer-social-${social.label.toLowerCase()}`}
                >
                  <social.icon className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Nav sections */}
          {navSections.map((section) => (
            <div key={section.title} className="col-span-1">
              <h3 className="text-white font-heading font-bold mb-4 text-xs uppercase tracking-widest">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-gray-500 hover:text-white text-sm transition-colors duration-200 flex items-center gap-1 group"
                    >
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-xs font-mono">
            © {new Date().getFullYear()} GTA 6 Rewards. All rights reserved.
          </p>
          <p className="text-gray-700 text-xs text-center">
            Fan platform — not affiliated with Rockstar Games or Take-Two Interactive.
          </p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-neon-green font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
              Live Platform
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
