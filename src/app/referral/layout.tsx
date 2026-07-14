import { Metadata } from "next"

export const metadata: Metadata = { title: "Referral Program" }

export default function ReferralLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
