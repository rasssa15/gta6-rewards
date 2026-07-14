import { Metadata } from "next"

export const metadata: Metadata = { title: "Animation Demo" }

export default function AnimationDemoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
