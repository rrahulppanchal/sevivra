import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-[#111] text-[#1a1a1a] dark:text-[#eee]">
      {/* Top bar */}
      <div className="border-b border-[#e8e4dc] dark:border-[#222] bg-white dark:bg-[#161616]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 14H17L18.5 18H5.5L7 14Z" fill="#F26419" />
              <path d="M10 3V8L5 18H19L14 8V3H10Z" stroke="#1DA619" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              <path d="M9 3H15" stroke="#1DA619" strokeLinecap="round" strokeWidth="2" />
            </svg>
            <span className="text-base font-bold text-[#1a1a1a] dark:text-white tracking-tight">Sevivra</span>
          </Link>
          <Link href="/landing" className="text-[13px] text-gray-500 hover:text-[#1DA619] transition-colors">
            Back to home
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-[13px] text-gray-400 mb-10">Last updated: March 2026</p>

        <div className="space-y-8 text-[14px] text-gray-600 dark:text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-[16px] font-semibold text-[#1a1a1a] dark:text-white mb-3">1. Information We Collect</h2>
            <p className="mb-2">We collect the following types of information:</p>
            <ul className="list-disc list-inside space-y-1 text-[13px] pl-2">
              <li><strong>Account information:</strong> Name, email address, institution, and password when you register</li>
              <li><strong>Profile data:</strong> Bio, degrees, research keywords, and external links you choose to add</li>
              <li><strong>Content:</strong> Manuscripts, documents, comments, and other materials you create on the platform</li>
              <li><strong>Usage data:</strong> How you interact with the platform, including pages visited and features used</li>
              <li><strong>Device information:</strong> Browser type, operating system, and IP address for security purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#1a1a1a] dark:text-white mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1 text-[13px] pl-2">
              <li>Provide and improve the Sevivra platform</li>
              <li>Manage your account and provide customer support</li>
              <li>Send essential service notifications (verification emails, password resets)</li>
              <li>Facilitate collaboration between researchers (review invitations, project sharing)</li>
              <li>Generate AI-powered analysis and suggestions for your manuscripts</li>
              <li>Ensure platform security and prevent abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#1a1a1a] dark:text-white mb-3">3. Data Sharing</h2>
            <p className="mb-2">We do not sell your personal data. We may share information only in these circumstances:</p>
            <ul className="list-disc list-inside space-y-1 text-[13px] pl-2">
              <li><strong>With collaborators:</strong> When you invite others to your projects or share manuscripts</li>
              <li><strong>Service providers:</strong> Trusted third parties that help operate our platform (email delivery, hosting)</li>
              <li><strong>Legal compliance:</strong> When required by law or to protect rights and safety</li>
              <li><strong>AI processing:</strong> Manuscript content may be processed by AI models to provide analysis features</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#1a1a1a] dark:text-white mb-3">4. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data. Passwords are encrypted using bcrypt hashing. All data transmission uses HTTPS encryption. Access to user data is restricted to authorized personnel only. However, no system is completely secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#1a1a1a] dark:text-white mb-3">5. Your Rights</h2>
            <p className="mb-2">You have the right to:</p>
            <ul className="list-disc list-inside space-y-1 text-[13px] pl-2">
              <li>Access and download your personal data</li>
              <li>Correct inaccurate information in your profile</li>
              <li>Delete your account and associated data</li>
              <li>Withdraw consent for optional data processing</li>
              <li>Object to certain types of data processing</li>
              <li>Request data portability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#1a1a1a] dark:text-white mb-3">6. Cookies</h2>
            <p>
              We use essential cookies to maintain your login session and remember your preferences. We do not use third-party tracking cookies or advertising cookies. The authentication token stored in cookies is necessary for the platform to function and expires after 7 days.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#1a1a1a] dark:text-white mb-3">7. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active. Upon account deletion, personal data is removed within 30 days. Published manuscripts may be retained if they have been shared publicly. Notifications are automatically deleted after 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#1a1a1a] dark:text-white mb-3">8. Children&apos;s Privacy</h2>
            <p>
              Sevivra is not intended for use by individuals under 16 years of age. We do not knowingly collect personal data from children. If we become aware that we have collected data from a child, we will take steps to delete that information.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#1a1a1a] dark:text-white mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify registered users of significant changes via email. The &quot;Last updated&quot; date at the top of this page indicates when the policy was last revised.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#1a1a1a] dark:text-white mb-3">10. Contact</h2>
            <p>
              For privacy-related questions or to exercise your data rights, contact us at{" "}
              <Link href="/contact" className="text-[#1DA619] hover:underline">our contact page</Link> or email us at{" "}
              <span className="text-[#1DA619]">privacy@sevivra.com</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
