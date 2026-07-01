type RateLimitStore = Map<string, { count: number; resetAt: number }>

const store: RateLimitStore = new Map()
const CLEANUP_INTERVAL = 60_000

setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key)
  }
}, CLEANUP_INTERVAL)

type RateLimitConfig = {
  max: number
  windowMs: number
}

const DEFAULTS: Record<string, RateLimitConfig> = {
  default: { max: 20, windowMs: 60_000 },
  "POST:/api/ads/watch": { max: 30, windowMs: 60_000 },
  "POST:/api/scratch-card": { max: 3, windowMs: 60_000 },
  "POST:/api/daily-login": { max: 2, windowMs: 60_000 },
  "POST:/api/points": { max: 10, windowMs: 60_000 },
  "POST:/api/comments": { max: 5, windowMs: 60_000 },
  "POST:/api/referral/claim": { max: 3, windowMs: 60_000 },
  "POST:/api/challenges/complete": { max: 5, windowMs: 60_000 },
  "PATCH:/api/users": { max: 5, windowMs: 60_000 },
  "GET:/api/points": { max: 30, windowMs: 60_000 },
  "GET:/api/challenges": { max: 20, windowMs: 60_000 },
}

export function getRateLimitConfig(method: string, pathname: string): RateLimitConfig {
  const key = `${method}:${pathname}`
  return DEFAULTS[key] || DEFAULTS.default
}

export function checkRateLimit(
  ip: string,
  method: string,
  pathname: string,
  walletId?: string
): { allowed: boolean; remaining: number; resetAt: number } {
  const config = getRateLimitConfig(method, pathname)
  const identifier = walletId || ip || "anonymous"
  const storeKey = `${method}:${pathname}:${identifier}`
  const now = Date.now()

  const existing = store.get(storeKey)
  if (!existing || existing.resetAt <= now) {
    store.set(storeKey, { count: 1, resetAt: now + config.windowMs })
    return { allowed: true, remaining: config.max - 1, resetAt: now + config.windowMs }
  }

  if (existing.count >= config.max) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt }
  }

  existing.count++
  return { allowed: true, remaining: config.max - existing.count, resetAt: existing.resetAt }
}
