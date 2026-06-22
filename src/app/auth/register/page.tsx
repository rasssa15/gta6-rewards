"use client"
import { Suspense } from "react"
import RegisterForm from "./RegisterForm"

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
