import { encrypt, decrypt } from "./crypto"

const WALLET_KEY = "gta6_wallet"
const LOCKED_KEY = "gta6_locked"

export interface WalletData {
  name: string
  createdAt: string
  avatarIndex: number
}

export function hasWallet(): boolean {
  return localStorage.getItem(WALLET_KEY) !== null
}

export async function saveWallet(data: WalletData, pin: string): Promise<void> {
  const encrypted = await encrypt(JSON.stringify(data), pin)
  localStorage.setItem(WALLET_KEY, encrypted)
  localStorage.setItem(LOCKED_KEY, "false")
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

export function isLocked(): boolean {
  return localStorage.getItem(LOCKED_KEY) !== "false"
}

export function setLocked(locked: boolean): void {
  localStorage.setItem(LOCKED_KEY, locked ? "true" : "false")
}

export function clearWallet(): void {
  localStorage.removeItem(WALLET_KEY)
  localStorage.removeItem(LOCKED_KEY)
}

export async function validatePin(pin: string): Promise<boolean> {
  const data = await loadWallet(pin)
  return data !== null
}
