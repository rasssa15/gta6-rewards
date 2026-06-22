import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth/auth"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get("limit") || "50")

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })

    const transactions = await prisma.pointTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    const stats = {
      totalEarned: transactions
        .filter((t) => t.type === "earned")
        .reduce((sum, t) => sum + t.points, 0),
      totalSpent: Math.abs(
        transactions
          .filter((t) => t.type === "spent")
          .reduce((sum, t) => sum + t.points, 0)
      ),
      balance: user.points,
      bySource: transactions.reduce((acc: Record<string, number>, t) => {
        if (t.type === "earned") {
          acc[t.source] = (acc[t.source] || 0) + t.points
        }
        return acc
      }, {}),
    }

    return NextResponse.json({
      success: true,
      data: { transactions, stats },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 })
  }
}
