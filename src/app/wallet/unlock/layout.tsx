import { Metadata } from "next"

export const metadata: Metadata = { title: "Unlock Wallet" }

export default function UnlockLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
