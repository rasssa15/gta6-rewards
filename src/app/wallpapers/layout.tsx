import { Metadata } from "next"

export const metadata: Metadata = { title: "Wallpapers" }

export default function WallpapersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
