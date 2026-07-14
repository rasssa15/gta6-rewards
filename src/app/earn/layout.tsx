import { Metadata } from "next"

export const metadata: Metadata = { title: "Earn Points" }

export default function EarnLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
