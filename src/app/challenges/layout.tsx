import { Metadata } from "next"

export const metadata: Metadata = { title: "Challenges" }

export default function ChallengesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
