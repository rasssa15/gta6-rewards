import { NextRequest, NextResponse } from "next/server"
import { getUserByWalletId } from "@/lib/data"

export async function GET(
  req: NextRequest,
  { params }: { params: { walletId: string } }
) {
  try {
    const user = getUserByWalletId(params.walletId)
    if (!user) {
      const { prisma } = await import("@/lib/prisma")
      const dbUser = await prisma.user.findUnique({
        where: { walletId: params.walletId },
        include: {
          _count: { select: { pointTransactions: true, achievements: true, scratchResults: true } },
        },
      })
      if (!dbUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
      return NextResponse.json(dbUser)
    }
    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { walletId: string } }
) {
  try {
    const { prisma } = await import("@/lib/prisma")
    const { checkRateLimit } = await import("@/lib/rate-limit")
    const body = await req.json()
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    const { allowed, resetAt } = checkRateLimit(ip, req.method, "/api/users", params.walletId)
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Please slow down." }, {
        status: 429, headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)), "X-RateLimit-Remaining": "0" },
      })
    }
    const allowedFields = ["name", "region"]
    const data: Record<string, any> = {}
    for (const key of allowedFields) {
      if (body[key] !== undefined) data[key] = body[key]
    }
    const user = await prisma.user.update({
      where: { walletId: params.walletId },
      data,
    })
    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
