"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { hasWallet, isLocked } from "@/lib/wallet/storage"

export function WalletGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!hasWallet()) {
      router.replace("/")
    } else if (isLocked()) {
      router.replace("/wallet/unlock")
    } else {
      setReady(true)
    }
  }, [router])

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    )
  }

  return <>{children}</>
}
