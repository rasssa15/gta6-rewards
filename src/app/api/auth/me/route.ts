import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      achievements: { include: { achievement: true } },
      notifications: { where: { read: false }, take: 10 },
      scratchCards: { where: { status: "unused" } },
      _count: {
        select: {
          referrals: { where: { status: "completed" } },
          redemptions: true,
          challengeCompletions: true,
        },
      },
    },
  })

  if (!user) {
    return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
  }

  const { password, ...userWithoutPassword } = user
  return NextResponse.json({ success: true, data: userWithoutPassword })
}
