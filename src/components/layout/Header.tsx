"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Gamepad2, Menu, X, User, Shield, Trophy, Sparkles, Gift, HelpCircle, Newspaper, Wallet, LogOut, ChevronDown, Coins } from "lucide-react"
import { cn } from "@/lib/utils"
import { useWallet } from "@/components/providers/WalletProvider"
import { clearWallet, setLocked } from "@/lib/wallet/storage"
import toast from "react-hot-toast"

const navLinks = [
  { label: "News", href: "/news", icon: Newspaper },
  { label: "Earn", href: "/earn", icon: Coins },
  { label: "Rewards", href: "/rewards", icon: Gift },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { label: "Challenges", href: "/challenges", icon: Sparkles },
  { label: "FAQ", href: "/faq", icon: HelpCircle },
]

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { isConnected, isLocked_, walletId, name, points, level, refresh } = useWallet()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showWalletMenu, setShowWalletMenu] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const handleLock = () => {
    setLocked(true)
    router.push("/wallet/unlock")
  }

  const handleDisconnect = () => {
    clearWallet()
    toast.success("Wallet disconnected")
    refresh()
    router.push("/")
  }

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
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center group-hover:shadow-lg group-hover:shadow-neon-pink/25 transition-all duration-300">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-heading font-bold gradient-text hidden sm:block">
              GTA6 Rewards
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/")
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-2 text-sm rounded-lg transition-all duration-200 flex items-center gap-2",
                    isActive
                      ? "text-white bg-white/10"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-3">
            {isConnected && !isLocked_ && walletId ? (
              <div className="relative">
                <button
                  onClick={() => setShowWalletMenu(!showWalletMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl glass hover:bg-white/10 transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs text-white font-semibold truncate max-w-[100px]">
                      {name || "Player"}
                    </div>
                    <div className="text-[10px] text-neon-green font-mono">
                      {points} pts · Lvl {level}
                    </div>
                  </div>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>

                {showWalletMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowWalletMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 z-50 glass rounded-xl p-2 border border-white/10">
                      <Link
                        href="/dashboard"
                        onClick={() => setShowWalletMenu(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <User className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <Link
                        href="/rewards"
                        onClick={() => setShowWalletMenu(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <Gift className="w-4 h-4" />
                        Rewards
                      </Link>
                      <hr className="my-1 border-white/5" />
                      <button
                        onClick={() => { handleLock(); setShowWalletMenu(false) }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all w-full text-left"
                      >
                        <Shield className="w-4 h-4" />
                        Lock Wallet
                      </button>
                      <button
                        onClick={() => { handleDisconnect(); setShowWalletMenu(false) }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-all w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Disconnect
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : isConnected && isLocked_ ? (
              <Link href="/wallet/unlock" className="btn-primary text-sm !px-4 !py-2 flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Unlock
              </Link>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/wallet/create" className="btn-primary text-sm !px-4 !py-2">
                  Create Wallet
                </Link>
                <Link href="/wallet/recover" className="btn-secondary text-sm !px-4 !py-2">
                  Recover
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-all"
            >
              {isOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="lg:hidden border-t border-white/5 py-4 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all",
                      isActive ? "text-white bg-white/10" : "text-gray-300 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                )
              })}
              <hr className="my-2 border-white/5" />
              {!isConnected ? (
                <>
                  <Link href="/wallet/create" className="btn-primary text-center py-3">
                    Create Wallet
                  </Link>
                  <Link href="/wallet/recover" className="btn-secondary text-center py-3">
                    Recover Wallet
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5">
                    <User className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <button onClick={handleLock} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5 w-full text-left">
                    <Shield className="w-4 h-4" />
                    Lock Wallet
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
