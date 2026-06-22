"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Gamepad2, Menu, X, User, LogOut, Lock, Shield, Home } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { hasWallet, isLocked, clearWallet, setLocked } from "@/lib/wallet/storage"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const walletExists = mounted && hasWallet()
  const locked = mounted && isLocked()
  const dashboardPath = locked ? "/wallet/unlock" : "/dashboard"

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    ...(walletExists ? [{ href: dashboardPath, label: "Dashboard", icon: User }] : []),
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
            {walletExists ? (
              <div className="flex items-center gap-2">
                <Link
                  href={dashboardPath}
                  className="btn-secondary text-sm flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setLocked(true)
                    window.location.href = "/wallet/unlock"
                  }}
                  className="btn-ghost text-sm"
                >
                  <Lock className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/wallet/create" className="btn-primary text-sm !px-4 !py-2">
                  Create Wallet
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
