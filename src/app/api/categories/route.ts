import { NextResponse } from "next/server"

const CATEGORIES = [
  { id: "gta-6", name: "GTA 6", slug: "gta-6" },
  { id: "rockstar", name: "Rockstar", slug: "rockstar" },
  { id: "playstation", name: "PlayStation", slug: "playstation" },
  { id: "xbox", name: "Xbox", slug: "xbox" },
  { id: "pc-gaming", name: "PC Gaming", slug: "pc-gaming" },
  { id: "nintendo", name: "Nintendo", slug: "nintendo" },
  { id: "esports", name: "Esports", slug: "esports" },
]

export async function GET() {
  return NextResponse.json(CATEGORIES)
}
