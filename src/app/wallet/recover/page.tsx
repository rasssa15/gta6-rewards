import { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = { title: "Recover Wallet" }

export default function RecoverRedirect() {
  redirect("/wallet/login")
}
