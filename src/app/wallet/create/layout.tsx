import { Metadata } from "next"

export const metadata: Metadata = { title: "Create Wallet" }

export default function CreateWalletLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
