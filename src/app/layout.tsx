import type { Metadata } from "next"
import { Inter, Orbitron } from "next/font/google"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { ParticleBackground } from "@/components/ui/ParticleBackground"
import { Toaster } from "react-hot-toast"
import { WalletProvider } from "@/components/providers/WalletProvider"
import { AdScripts } from "@/components/ads/AdScripts"
import AnimationWrapper from "@/components/AnimationWrapper"
import { ThemeProvider } from "@/components/ThemeProvider"
import "./globals.css"
import "./themes/gta-neon.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-body" })
const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-heading" })

export const metadata: Metadata = {
  title: {
    default: "GTA 6 Rewards - Gaming News & Rewards Platform",
    template: "%s | GTA 6 Rewards",
  },
  description:
    "Your ultimate GTA 6 gaming platform. Earn points, unlock achievements, read the latest news, and redeem exclusive rewards.",
  robots: "index, follow",
  verification: { google: "KzUihwliNECqZjshnI47VKVhGYgXmu6Ak859BMFJjEI" },
  openGraph: {
    title: "GTA 6 Rewards",
    description: "Gaming news, rewards, and community platform for GTA 6 fans.",
    siteName: "GTA 6 Rewards",
    type: "website",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="referrer" content="no-referrer-when-downgrade" />
      </head>
      <body className={`${inter.variable} ${orbitron.variable} font-body antialiased`}>
        <WalletProvider>
          <ThemeProvider>
          <AnimationWrapper>
          <ParticleBackground />
          <Header />
          <main className="relative z-10 min-h-screen pt-16">{children}</main>
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
          <AdScripts />
          </AnimationWrapper>
          </ThemeProvider>
        </WalletProvider>
      </body>
    </html>
  )
}
