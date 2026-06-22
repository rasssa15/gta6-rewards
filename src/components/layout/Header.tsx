"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Gamepad2, Menu, X, User, LogOut, Award, Trophy, Gift, Sparkles, Newspaper, Users, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils/cn"

export function Header() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { href: "/", label: "Home", icon: Gamepad2 },
    { href: "/news", label: "News", icon: Newspaper },
    { href: "/rewards", label: "Rewards", icon: Gift },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/challenges", label: "Challenges", icon: Award },
    { href: "/achievements", label: "Achievements", icon: Sparkles },
  ]

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5"
          : "bg-transparent"
      )}
    >
      <div className="page-container">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center group-hover:shadow-lg group-hover:shadow-neon-pink/25 transition-all duration-300">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-heading font-bold gradient-text hidden sm:block">
              GTA6 Rewards
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200 flex items-center gap-2"
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {session?.user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl glass hover:bg-white/10 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-xs font-bold text-white">
                    {(session.user as any).name?.[0] || "U"}
                  </div>
                  <span className="text-sm font-medium text-white hidden sm:block">
                    {session.user.name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl glass border border-white/10 overflow-hidden shadow-2xl"
                    >
                      <div className="p-2">
                        <Link
                          href="/dashboard"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white rounded-xl hover:bg-white/5 transition-all"
                        >
                          <User className="w-4 h-4" />
                          Dashboard
                        </Link>
                        <Link
                          href="/rewards"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white rounded-xl hover:bg-white/5 transition-all"
                        >
                          <Gift className="w-4 h-4" />
                          My Rewards
                        </Link>
                        {(session.user as any).role === "admin" && (
                          <Link
                            href="/admin"
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-neon-pink rounded-xl hover:bg-white/5 transition-all"
                          >
                            <Users className="w-4 h-4" />
                            Admin Panel
                          </Link>
                        )}
                        <hr className="my-1 border-white/5" />
                        <button
                          onClick={() => signOut()}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 rounded-xl hover:bg-white/5 transition-all w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="btn-ghost text-sm">
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-primary text-sm !px-4 !py-2"
                >
                  Join Free
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-all"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-white/5 glass"
          >
            <div className="page-container py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white rounded-xl hover:bg-white/5 transition-all"
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
