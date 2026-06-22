import { WORDLIST } from "./wordlist"
import { generateEntropy } from "./crypto"

const ENTROPY_BITS = 128
const WORDS = 12
const WORDCOUNT = WORDLIST.length

export function generatePhrase(): string[] {
  const entropy = generateEntropy()
  const words: string[] = []
  let value = 0
  let bits = 0

  for (const byte of entropy) {
    value = (value << 8) | byte
    bits += 8
    if (bits >= 11) {
      bits -= 11
      const idx = (value >> bits) % WORDCOUNT
      words.push(WORDLIST[idx])
      value &= (1 << bits) - 1
    }
  }

  if (bits > 0) {
    const idx = (value << (11 - bits)) % WORDCOUNT
    words.push(WORDLIST[idx])
  }

  while (words.length < WORDS) {
    words.push(WORDLIST[crypto.getRandomValues(new Uint8Array(1))[0] % WORDCOUNT])
  }

  return words.slice(0, WORDS)
}

export function validatePhrase(phrase: string[]): boolean {
  if (phrase.length !== WORDS) return false
  return phrase.every(w => WORDLIST.includes(w.toLowerCase().trim()))
}

export function phraseToString(phrase: string[]): string {
  return phrase.join(" ")
}

export function stringToPhrase(str: string): string[] {
  return str.toLowerCase().trim().split(/\s+/).filter(Boolean)
}
