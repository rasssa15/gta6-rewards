import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()
    const adminPassword = process.env.ADMIN_PASSWORD || "gta6admin2026"
    if (password === adminPassword) {
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ success: false, error: "Invalid password" }, { status: 401 })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
