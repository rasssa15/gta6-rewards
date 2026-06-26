import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

function checkAdminAuth(): boolean {
  const cookieStore = cookies()
  const adminAuth = cookieStore.get("admin_auth_cookie")?.value
  const adminPassword = process.env.ADMIN_PASSWORD || "gta6admin2026"
  return adminAuth === adminPassword
}

export async function GET() {
  if (!checkAdminAuth()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const settings = await prisma.setting.findMany()
    const map: Record<string, string> = {}
    settings.forEach((s) => {
      if (s.key === "gemini_api_key" && s.value) {
        map[s.key] = "••••••••••••••••"
      } else {
        map[s.key] = s.value
      }
    })
    return NextResponse.json(map)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  if (!checkAdminAuth()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await req.json()
    const entries = Object.entries(data) as [string, string][]

    for (const [key, value] of entries) {
      // If the Gemini API Key is submitted as dots, don't overwrite the existing database key.
      if (key === "gemini_api_key" && value === "••••••••••••••••") {
        continue
      }

      await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value, type: "string" },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}

