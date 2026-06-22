import type { Metadata } from "next"
import { Inter, Orbitron } from "next/font/google"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { ParticleBackground } from "@/components/ui/ParticleBackground"
import { Toaster } from "react-hot-toast"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-body" })
const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-heading" })

export const metadata: Metadata = {
  title: "GTA 6 Rewards - Secure Wallet Platform",
  description:
    "Create a secure wallet for tracking your GTA 6 rewards, achievements, and gaming progress. Powered by AES-256 encryption.",
  robots: "index, follow",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${orbitron.variable} font-body antialiased`}>
        <ParticleBackground />
        <Header />
        <main className="relative z-10 min-h-screen">{children}</main>
        <Footer />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "rgba(10, 10, 15, 0.95)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(20px)",
            },
          }}
        />
      </body>
    </html>
  )
}
