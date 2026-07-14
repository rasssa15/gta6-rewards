import { Metadata } from "next"

export const metadata: Metadata = { title: "Admin Settings" }

export default function AdminSettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
