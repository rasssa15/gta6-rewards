const PBKDF2_ITERATIONS = 100000
const SALT = "gta6-rewards-wallet-v1"

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("")
}

function hexToBuf(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  return bytes.buffer
}

export async function deriveKey(pin: string): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    "raw", enc.encode(pin), "PBKDF2", false, ["deriveKey"]
  )
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: enc.encode(SALT), iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  )
}

export async function encrypt(plaintext: string, pin: string): Promise<string> {
  const key = await deriveKey(pin)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(plaintext)
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded)
  return bufToHex(iv.buffer) + ":" + bufToHex(encrypted)
}

export async function decrypt(ciphertext: string, pin: string): Promise<string> {
  const [ivHex, dataHex] = ciphertext.split(":")
  const key = await deriveKey(pin)
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: hexToBuf(ivHex) }, key, hexToBuf(dataHex)
  )
  return new TextDecoder().decode(decrypted)
}

export function generateEntropy(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16))
}
