import { encrypt, decrypt } from "./crypto"

const WALLET_KEY = "gta6_wallet"
const LOCKED_KEY = "gta6_locked"
const SESSION_KEY = "gta6_session"

export interface WalletData {
  walletId: string
  name: string
  createdAt: string
  avatarIndex: number
}

export interface SessionData {
  walletId: string
  name: string
}

export function hasWallet(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(WALLET_KEY) !== null
}

export async function saveWallet(data: WalletData, pin: string): Promise<void> {
  const encrypted = await encrypt(JSON.stringify(data), pin)
  localStorage.setItem(WALLET_KEY, encrypted)
  localStorage.setItem(LOCKED_KEY, "false")
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ walletId: data.walletId, name: data.name }))
}

export async function loadWallet(pin: string): Promise<WalletData | null> {
  const encrypted = localStorage.getItem(WALLET_KEY)
  if (!encrypted) return null
  try {
    const decrypted = await decrypt(encrypted, pin)
    return JSON.parse(decrypted)
  } catch {
    return null
  }
}

export function getSession(): SessionData | null {
  if (typeof window === "undefined") return null
  const data = sessionStorage.getItem(SESSION_KEY)
  if (!data) return null
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

export function setSession(data: SessionData): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data))
}

export function isLocked(): boolean {
  if (typeof window === "undefined") return true
  return localStorage.getItem(LOCKED_KEY) !== "false"
}

export function setLocked(locked: boolean): void {
  localStorage.setItem(LOCKED_KEY, locked ? "true" : "false")
}

export function clearWallet(): void {
  localStorage.removeItem(WALLET_KEY)
  localStorage.removeItem(LOCKED_KEY)
  sessionStorage.removeItem(SESSION_KEY)
}

export async function validatePin(pin: string): Promise<boolean> {
  const data = await loadWallet(pin)
  return data !== null
}
