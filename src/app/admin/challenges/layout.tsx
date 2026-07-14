import { Metadata } from "next"

export const metadata: Metadata = { title: "Manage Challenges" }

export default function AdminChallengesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
