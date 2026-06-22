import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
  }

  const isAdmin = (session.user as any).role === "admin"

  if (!isAdmin) {
    return NextResponse.json({ success: false, error: "Not authorized" }, { status: 403 })
  }

  return NextResponse.json({ success: true, data: { isAdmin: true } })
}
