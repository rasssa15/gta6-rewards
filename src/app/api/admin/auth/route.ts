import { NextRequest, NextResponse } from "next/server"
import { randomBytes, createHmac } from "crypto"
import { checkRateLimit } from "@/lib/rate-limit"

const HMAC_SECRET = process.env.ADMIN_PASSWORD || "fallback-secret"

function signToken(payload: string): string {
  const sig = createHmac("sha256", HMAC_SECRET).update(payload).digest("hex")
  return `${payload}.${sig}`
}

function verifyToken(token: string): boolean {
  const [payload, sig] = token.split(".")
  if (!payload || !sig) return false
  const expected = createHmac("sha256", HMAC_SECRET).update(payload).digest("hex")
  return sig === expected
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown"
    const { allowed, remaining, resetAt } = checkRateLimit(ip, req.method, req.nextUrl.pathname)
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Too many login attempts. Try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)), "X-RateLimit-Remaining": "0" } }
      )
    }

    const { password } = await req.json()
    const adminPassword = process.env.ADMIN_PASSWORD
    if (!password || password !== adminPassword) {
      return NextResponse.json({ success: false, error: "Invalid password" }, { status: 401 })
    }
    const token = signToken(Date.now().toString())
    const response = NextResponse.json({ success: true })
    response.cookies.set("admin_auth_cookie", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400,
      path: "/",
    })
    return response
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}