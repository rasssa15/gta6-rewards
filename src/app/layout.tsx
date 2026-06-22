import type { Metadata } from "next"
import { Inter, Orbitron } from "next/font/google"
import { Providers } from "./providers"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { ParticleBackground } from "@/components/ui/ParticleBackground"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-body" })
const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-heading" })

export const metadata: Metadata = {
  title: "GTA 6 Rewards - Earn Points & Redeem Exclusive Gaming Rewards",
  description:
    "Join the ultimate GTA 6 rewards platform. Earn points, unlock achievements, complete challenges, and redeem exclusive gaming rewards while staying up to date with the latest GTA 6 news.",
  keywords: "GTA 6, gaming rewards, earn points, scratch cards, gaming news, Rockstar Games, redeem rewards",
  openGraph: {
    title: "GTA 6 Rewards - Gaming Rewards Platform",
    description: "Earn points and redeem exclusive gaming rewards",
    type: "website",
    siteName: "GTA 6 Rewards",
  },
  twitter: {
    card: "summary_large_image",
    title: "GTA 6 Rewards",
    description: "Earn points and redeem exclusive gaming rewards",
  },
  robots: "index, follow",
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || "http://localhost:3000"),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${orbitron.variable} font-body antialiased`}>
        <Providers>
          <ParticleBackground />
          <Header />
          <main className="relative z-10 min-h-screen">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
