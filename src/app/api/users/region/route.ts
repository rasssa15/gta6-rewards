import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { walletId, region } = await req.json()
    if (!walletId || !region) {
      return NextResponse.json({ error: "walletId and region required" }, { status: 400 })
    }

    const validRegions = ["", "india", "usa", "uk", "germany", "france", "australia", "brazil", "russia", "japan", "canada", "uae", "south-africa", "mexico", "spain", "italy"]
    if (!validRegions.includes(region)) {
      return NextResponse.json({ error: "Invalid region" }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { walletId },
      data: { region },
    })

    return NextResponse.json({ region: user.region, message: "Region updated" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update region" }, { status: 500 })
  }
}
