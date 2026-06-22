import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })

    const referrals = await prisma.referral.findMany({
      where: { referrerId: user.id },
      include: {
        referred: { select: { name: true, username: true, image: true, createdAt: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    const stats = {
      total: referrals.length,
      completed: referrals.filter((r) => r.status === "completed").length,
      pending: referrals.filter((r) => r.status === "pending").length,
      totalEarned: referrals.reduce((sum, r) => sum + r.pointsAwarded, 0),
    }

    return NextResponse.json({
      success: true,
      data: {
        referralCode: user.referralCode,
        referralLink: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/auth/register?ref=${user.referralCode}`,
        stats,
        referrals,
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 })
  }
}
