import { Metadata } from "next"

export const metadata: Metadata = { title: "Watch Ads" }

export default function AdsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
