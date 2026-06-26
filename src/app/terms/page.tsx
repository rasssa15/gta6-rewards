import { Shield } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container max-w-3xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-gray-400">Last updated: June 2026</p>
        </div>

        <div className="glass-card p-8 space-y-6 text-gray-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-3">1. Entertainment Purpose Only</h2>
            <p>GTA 6 Rewards is a fan-made entertainment platform created solely for fun and educational purposes. This website is a fictional project and does not provide real rewards, actual coupon codes, or any form of monetary compensation.</p>
            <p className="mt-2">All points, scratch cards, coupon codes, and rewards shown on this platform are purely virtual and have no real-world value. They cannot be exchanged for real money, goods, or services.</p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-3">2. No Real Rewards</h2>
            <p>The coupon codes generated on this platform are randomly generated strings and do not correspond to any actual discounts, products, or services. Any resemblance to real coupon codes is purely coincidental.</p>
            <p className="mt-2">Users should not expect to receive any real-world benefits from points, levels, or rewards earned on this site.</p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-3">3. User Responsibilities</h2>
            <p>Users agree to use this platform responsibly and acknowledge that all content, including articles, news, and game information, is for entertainment purposes only.</p>
            <p className="mt-2">Users must not:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Attempt to exploit the platform for real monetary gain</li>
              <li>Misrepresent the platform as offering real rewards</li>
              <li>Use automated scripts or bots to manipulate the system</li>
              <li>Share misleading information about the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-3">4. No Guarantees</h2>
            <p>This platform is provided "as is" without any warranties. The operators make no guarantees about uptime, data accuracy, or the availability of features. We reserve the right to modify or discontinue the platform at any time without notice.</p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-3">5. Third-Party Content</h2>
            <p>This website displays advertisements from third-party ad networks (HillTopAds). We are not responsible for the content of these ads. Any interaction with advertisements is between the user and the advertiser.</p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-3">6. Changes to Terms</h2>
            <p>We may update these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-3">7. Contact</h2>
            <p>For questions about these terms, please reach out via the platforms GitHub repository.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
