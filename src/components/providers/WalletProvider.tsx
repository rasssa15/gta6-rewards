"use client"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getSession, hasWallet, isLocked } from "@/lib/wallet/storage"

interface WalletContextType {
  isConnected: boolean
  isLocked_: boolean
  walletId: string | null
  name: string
  points: number
  level: number
  theme: string
  refresh: () => void
  isLoading: boolean
}

const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  isLocked_: true,
  walletId: null,
  name: "Player",
  points: 0,
  level: 1,
  theme: "default",
  refresh: () => {},
  isLoading: false,
})

export function useWallet() {
  return useContext(WalletContext)
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState({
    isConnected: false,
    isLocked_: true,
    walletId: null as string | null,
    name: "Player",
    points: 0,
    level: 1,
    theme: "default",
    isLoading: true,
  })

  const refresh = async () => {
    try {
      const session = getSession()
      if (session?.walletId) {
        setState((s) => ({
          ...s,
          isConnected: true,
          isLocked_: false,
          walletId: session.walletId,
          name: session.name || "Player",
        }))
        try {
          const res = await fetch(`/api/users/${session.walletId}`)
          if (res.ok) {
            const data = await res.json()
            setState((s) => ({
              ...s,
              points: data.points ?? 0,
              level: data.level ?? 1,
              name: data.name || session.name || "Player",
              theme: data.theme || "default",
            }))
          }
        } catch {}
      } else if (hasWallet()) {
        setState((s) => ({
          ...s,
          isConnected: true,
          isLocked_: isLocked(),
        }))
      }
    } catch {}
    setState((s) => ({ ...s, isLoading: false }))
  }

  useEffect(() => {
    refresh()
  }, [])

  return (
    <WalletContext.Provider value={{ ...state, refresh }}>
      {children}
    </WalletContext.Provider>
  )
}
