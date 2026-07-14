import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createHmac } from "crypto"

const HMAC_SECRET = process.env.ADMIN_PASSWORD || "fallback-secret"

function verifyToken(token: string): boolean {
  const [payload, sig] = token.split(".")
  if (!payload || !sig) return false
  const expected = createHmac("sha256", HMAC_SECRET).update(payload).digest("hex")
  return sig === expected
}

export async function GET() {
  const cookieStore = cookies()
  const adminAuth = cookieStore.get("admin_auth_cookie")?.value
  if (!adminAuth || !verifyToken(adminAuth)) return NextResponse.json({ authed: false })
  return NextResponse.json({ authed: true })
}