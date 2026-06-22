"use client"
import Link from "next/link"
import { Gamepad2, Mail, Twitter, MessageCircle, Youtube } from "lucide-react"

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-[#0a0a0f]">
      <div className="page-container py-12 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-heading font-bold gradient-text">GTA6 Rewards</span>
            </Link>
            <p className="text-gray-400 text-sm max-w-md leading-relaxed">
              Your ultimate gaming rewards platform. Earn points, unlock achievements, 
              and redeem exclusive rewards while staying up to date with the latest 
              GTA 6 and gaming news.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[
                { icon: Twitter, href: "#" },
                { icon: MessageCircle, href: "#" },
                { icon: Youtube, href: "#" },
                { icon: Mail, href: "#" },
              ].map((social) => (
                <Link
                  key={social.href}
                  href={social.href}
                  className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-all duration-200"
                >
                  <social.icon className="w-4 h-4 text-gray-400 hover:text-white" />
                </Link>
              ))}
            </div>
          </div>

          {[
            {
              title: "Platform",
              links: [
                { label: "News", href: "/news" },
                { label: "Rewards", href: "/rewards" },
                { label: "Leaderboard", href: "/leaderboard" },
                { label: "Challenges", href: "/challenges" },
                { label: "Achievements", href: "/achievements" },
              ],
            },
            {
              title: "Support",
              links: [
                { label: "FAQ", href: "/faq" },
                { label: "Contact", href: "/contact" },
                { label: "Terms", href: "/terms" },
                { label: "Privacy", href: "/privacy" },
                { label: "Guidelines", href: "/guidelines" },
              ],
            },
            {
              title: "Community",
              links: [
                { label: "Discord", href: "#" },
                { label: "Twitter", href: "#" },
                { label: "YouTube", href: "#" },
                { label: "Reddit", href: "#" },
                { label: "Blog", href: "/blog" },
              ],
            },
          ].map((section) => (
            <div key={section.title}>
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} GTA 6 Rewards. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm">
            Not affiliated with Rockstar Games or Take-Two Interactive.
          </p>
        </div>
      </div>
    </footer>
  )
}
