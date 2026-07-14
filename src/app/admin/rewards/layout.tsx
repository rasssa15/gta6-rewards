import { Metadata } from "next"

export const metadata: Metadata = { title: "Manage Rewards" }

export default function AdminRewardsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
