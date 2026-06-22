"use client"
import { SessionProvider } from "next-auth/react"
import { Toaster } from "react-hot-toast"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "rgba(10, 10, 15, 0.95)",
            color: "#e2e8f0",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(12px)",
            borderRadius: "12px",
          },
          success: { iconTheme: { primary: "#00ff88", secondary: "#0a0a0f" } },
          error: { iconTheme: { primary: "#ff0044", secondary: "#0a0a0f" } },
        }}
      />
    </SessionProvider>
  )
}
