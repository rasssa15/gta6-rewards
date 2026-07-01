import { NextRequest, NextResponse } from "next/server"
import { getUsers } from "@/lib/data"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
  try {
    const { walletId, name } = await req.json()
    if (!walletId) {
      return NextResponse.json({ error: "walletId required" }, { status: 400 })
    }
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    const { allowed, resetAt } = checkRateLimit(ip, req.method, req.nextUrl.pathname, walletId)
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Please slow down." }, {
        status: 429, headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)), "X-RateLimit-Remaining": "0" },
      })
    }
    const { prisma } = await import("@/lib/prisma")
    const user = await prisma.user.upsert({
      where: { walletId },
      update: { lastLogin: new Date() },
      create: { walletId, name: name || "Player", lastLogin: new Date() },
    })
    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
  const offset = parseInt(searchParams.get("offset") || "0")

  try {
    const result = getUsers({ limit, offset })
    return NextResponse.json(result.users)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
