"use client"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    const authedFromStorage = sessionStorage.getItem("admin_auth")
    if (authedFromStorage === "true") {
      setAuthed(true)
    } else if (pathname !== "/admin/login") {
      router.replace("/admin/login")
    }
  }, [pathname, router])

  if (pathname === "/admin/login") return <>{children}</>
  if (!authed) return null
  return <>{children}</>
}
