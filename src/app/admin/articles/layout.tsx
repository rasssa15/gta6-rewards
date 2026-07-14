import { Metadata } from "next"

export const metadata: Metadata = { title: "Manage Articles" }

export default function AdminArticlesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
