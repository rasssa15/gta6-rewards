import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { generateReferralCode } from "@/lib/utils/codes"

export async function POST(req: Request) {
  try {
    const { name, email, password, referralCode } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: "Password too short" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ success: false, error: "Email already registered" }, { status: 400 })
    }

    const hashedPassword = await hash(password, 12)
    const username = name.toLowerCase().replace(/\s+/g, "_") + Math.random().toString(36).slice(2, 6)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        username,
        password: hashedPassword,
        referralCode: generateReferralCode(name),
        referredBy: referralCode || null,
      },
    })

    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode },
      })

      if (referrer && referrer.id !== user.id) {
        await prisma.referral.create({
          data: {
            referrerId: referrer.id,
            referredId: user.id,
            status: "completed",
            completedAt: new Date(),
            pointsAwarded: 50,
          },
        })

        await prisma.user.update({
          where: { id: referrer.id },
          data: {
            points: { increment: 50 },
            totalPointsEarned: { increment: 50 },
          },
        })

        await prisma.pointTransaction.create({
          data: {
            userId: referrer.id,
            points: 50,
            type: "earned",
            source: "referral",
            note: `Referral bonus for ${user.name || user.email}`,
          },
        })
      }
    }

    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json({ success: true, data: userWithoutPassword }, { status: 201 })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
