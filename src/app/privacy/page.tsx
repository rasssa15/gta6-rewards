import { Lock } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container max-w-3xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-gray-400">Last updated: June 2026</p>
        </div>

        <div className="glass-card p-8 space-y-6 text-gray-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-3">1. Information We Collect</h2>
            <p>We collect minimal information to operate this entertainment platform:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Wallet ID:</strong> A cryptographically generated identifier used solely for session management and progress tracking within the platform.</li>
              <li><strong>Browser Data:</strong> Basic analytics data such as page views and feature usage to improve the platform.</li>
              <li><strong>Ad Data:</strong> Ad networks (HillTopAds) may collect anonymized data for ad targeting and reporting.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-3">2. How We Use Your Data</h2>
            <p>Your data is used only for:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Tracking your in-platform progress (points, level, challenges)</li>
              <li>Improving the user experience</li>
              <li>Displaying relevant advertisements</li>
            </ul>
            <p className="mt-2">We do not sell, rent, or share your personal data with third parties except as required by law.</p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-3">3. Wallet &amp; Session Data</h2>
            <p>Your wallet ID is stored locally in your browser using AES-256-GCM encryption. The wallet seed phrase never leaves your device. We only store the wallet ID on our servers to track your game progress. This is a fictional platform — no real cryptocurrency or valuable assets are involved.</p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-3">4. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>HillTopAds</strong> — for displaying advertisements</li>
              <li><strong>Neon.tech (PostgreSQL)</strong> — for database hosting</li>
              <li><strong>Vercel</strong> — for application hosting</li>
            </ul>
            <p className="mt-2">Each service has its own privacy policy governing how they handle data.</p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-3">5. Cookies &amp; Tracking</h2>
            <p>This platform uses local storage for wallet data and may use cookies for analytics. Ad networks may use cookies for ad personalization. You can disable cookies in your browser settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-3">6. Data Retention</h2>
            <p>We retain your wallet ID and associated progress data until you choose to reset your wallet. Ad-related data is retained per the ad network&apos;s policy. You can request data deletion by clearing your wallet and contacting us.</p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-3">7. Children&apos;s Privacy</h2>
            <p>This platform is not directed at children under 13. We do not knowingly collect data from children.</p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-3">8. Changes to This Policy</h2>
            <p>We may update this privacy policy. Changes will be posted on this page with an updated date.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
