import type { Metadata } from "next"
import { Inter, Orbitron } from "next/font/google"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { ParticleBackground } from "@/components/ui/ParticleBackground"
import { Toaster } from "react-hot-toast"
import { WalletProvider } from "@/components/providers/WalletProvider"
import { AdScripts } from "@/components/ads/AdScripts"
import { BottomBannerAd } from "@/components/ads/BottomBannerAd"
import { LazyAd } from "@/components/ads/LazyAd"
import { ConsentBanner } from "@/components/ads/ConsentBanner"
import { StickyFooterAd } from "@/components/ads/StickyFooterAd"
import { HeaderAd } from "@/components/ads/HeaderAd"
import { AutoPopupAd } from "@/components/ads/AutoPopupAd"
import { AutoPopupAd2 } from "@/components/ads/AutoPopupAd2"
import { SmartLinkPopunder } from "@/components/ads/SmartLinkPopunder"
import AnimationWrapper from "@/components/AnimationWrapper"
import { ThemeProvider } from "@/components/ThemeProvider"
import "./globals.css"
import "./themes/gta-neon.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-body" })
const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-heading" })

export const metadata: Metadata = {
  title: {
    default: "Home | GTA 6 Rewards",
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
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head>
      <body className={`${inter.variable} ${orbitron.variable} font-body antialiased`}>
        <WalletProvider>
          <ThemeProvider>
          <AnimationWrapper>
          <ParticleBackground />
          <Header />
          <HeaderAd />
          <div className="page-container py-2 flex flex-col items-center gap-2 border-b border-white/5 bg-black/30">
            <div className="hidden lg:flex justify-center items-center gap-2 w-full">
              <LazyAd type="leaderboard" minHeight={90} />
              <LazyAd type="responsive" minHeight={90} />
            </div>
            <div className="flex lg:hidden justify-center">
              <LazyAd type="medium-rectangle" minHeight={250} />
            </div>
          </div>
          <main className="relative z-10 min-h-screen pt-16 xl:px-[180px]">{children}</main>
          <BottomBannerAd />
          <Footer />
          <ConsentBanner />
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
          <SmartLinkPopunder />
          <AutoPopupAd />
          <AutoPopupAd2 />
          <StickyFooterAd />
          <div className="hidden xl:block fixed left-0 top-24 bottom-0 z-[60] w-[160px] pointer-events-none">
            <div className="pointer-events-auto p-2 h-full flex items-start justify-center">
              <LazyAd type="skyscraper" minHeight={600} />
            </div>
          </div>
          <div className="hidden xl:block fixed right-0 top-24 bottom-0 z-[60] w-[160px] pointer-events-none">
            <div className="pointer-events-auto p-2 h-full flex items-start justify-center">
              <LazyAd type="skyscraper" minHeight={600} />
            </div>
          </div>
          <AdScripts />
          </AnimationWrapper>
          </ThemeProvider>
        </WalletProvider>
      </body>
    </html>
  )
}
