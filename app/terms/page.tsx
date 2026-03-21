import Link from "next/link"

export default function TermsPage() {
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
        <h1 className="text-2xl font-bold tracking-tight mb-2">Terms of Service</h1>
        <p className="text-[13px] text-gray-400 mb-10">Last updated: March 2026</p>

        <div className="space-y-8 text-[14px] text-gray-600 dark:text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-[16px] font-semibold text-[#1a1a1a] dark:text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Sevivra platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the platform. Sevivra reserves the right to update these terms at any time, and continued use of the platform constitutes acceptance of any changes.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#1a1a1a] dark:text-white mb-3">2. Description of Service</h2>
            <p>
              Sevivra is an AI-native research collaboration and publishing platform. We provide tools for manuscript creation, peer review management, collaborative editing, and academic publishing. The platform is designed for researchers, academics, and institutions.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#1a1a1a] dark:text-white mb-3">3. User Accounts</h2>
            <p className="mb-2">
              To use certain features, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[13px] pl-2">
              <li>Provide accurate and complete registration information</li>
              <li>Keep your password secure and confidential</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Accept responsibility for all activity on your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#1a1a1a] dark:text-white mb-3">4. Intellectual Property</h2>
            <p>
              You retain ownership of all content you create and upload to Sevivra. By using the platform, you grant Sevivra a limited license to host, display, and distribute your content as necessary to provide the service. Sevivra does not claim ownership over your research, manuscripts, or publications.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#1a1a1a] dark:text-white mb-3">5. Acceptable Use</h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-disc list-inside space-y-1 text-[13px] pl-2">
              <li>Use the platform for any unlawful purpose</li>
              <li>Upload content that infringes on intellectual property rights</li>
              <li>Attempt to gain unauthorized access to any part of the platform</li>
              <li>Use automated tools to scrape or extract data</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Submit fraudulent or plagiarized research</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#1a1a1a] dark:text-white mb-3">6. AI-Generated Content</h2>
            <p>
              Sevivra uses artificial intelligence to assist with manuscript analysis, suggestions, and review. AI-generated content is provided as a tool and should be reviewed by users before publication. Sevivra does not guarantee the accuracy of AI-generated suggestions and users are responsible for verifying all content.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#1a1a1a] dark:text-white mb-3">7. Limitation of Liability</h2>
            <p>
              Sevivra is provided &quot;as is&quot; without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability shall not exceed the amount you have paid for the service in the past twelve months.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#1a1a1a] dark:text-white mb-3">8. Termination</h2>
            <p>
              We may suspend or terminate your account at any time for violations of these terms. You may delete your account at any time. Upon termination, your right to use the platform ceases, but provisions that by their nature should survive will remain in effect.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[#1a1a1a] dark:text-white mb-3">9. Contact</h2>
            <p>
              If you have questions about these Terms of Service, please contact us at{" "}
              <Link href="/contact" className="text-[#1DA619] hover:underline">our contact page</Link> or email us at{" "}
              <span className="text-[#1DA619]">legal@sevivra.com</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
