import { redirect } from "next/navigation"

export default function RecoverRedirect() {
  redirect("/wallet/login")
}
