import { ArrowLeft, Shield, Activity } from 'lucide-react';

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0" style={{ boxShadow: '0 2px 10px rgba(37,99,235,0.4)' }}>
        <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
      </div>
      <div className="font-black text-base">
        <span className="text-white">Ops</span>
        <span className="text-blue-400">Pilot</span>
      </div>
    </div>
  );
}

function goHome() {
  window.location.hash = '';
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Logo />
          <button onClick={goHome} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Legal</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-3">Privacy Policy</h1>
        <p className="text-slate-400 mb-10">Last updated: May 25, 2026 · Effective immediately</p>

        <div className="prose prose-invert prose-slate max-w-none space-y-10 text-slate-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Who We Are</h2>
            <p>
              OpsPilot ("the Platform", "we", "our", "us") is a Software-as-a-Service field operations management platform developed and operated by <strong className="text-white">K² Adexos Global Technologies</strong>, a technology company registered in India. Our platform helps businesses manage field executives, telecallers, leads, attendance, HR, and operations from a single dashboard.
            </p>
            <p className="mt-3">
              If you have questions about this policy, contact us at: <a href="mailto:privacy@opspilot.in" className="text-cyan-400 hover:underline">privacy@opspilot.in</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-white mb-2">2.1 Account & Business Information</h3>
                <p>When you register a business account (tenant), we collect: company name, owner name, owner email address, phone number, industry type, and billing information. This information is necessary to create and manage your account.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-2">2.2 Employee & Operational Data</h3>
                <p>Through your use of the platform, you and your team members may input: employee profiles, attendance records (including selfie photos for verification), GPS location data during check-ins, lead information, call logs, HR records (leave requests, salary advances), and performance metrics.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-2">2.3 Technical Data</h3>
                <p>We automatically collect: IP addresses, browser type and version, device identifiers, usage patterns, log data, session information, and cookies necessary for platform functionality.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-2">2.4 Payment Information</h3>
                <p>Payments are processed by <strong className="text-white">Razorpay</strong>. We do not store full card numbers or CVV codes. We retain transaction records including Razorpay order IDs and payment IDs for accounting and compliance purposes.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. How We Use Your Information</h2>
            <ul className="space-y-2 list-none pl-0">
              {[
                'To provide, operate, and improve the OpsPilot platform',
                'To process your subscription payments and send invoices',
                'To authenticate users and secure your account',
                'To provide customer support and respond to your queries',
                'To send service-related communications (downtime notices, security alerts)',
                'To enforce our Terms of Service and prevent abuse',
                'To comply with legal obligations under Indian law',
                'To generate aggregate, anonymised analytics about platform usage',
              ].map(item => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4">We do <strong className="text-white">not</strong> sell your personal data to third parties. We do <strong className="text-white">not</strong> use your data for targeted advertising.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Data Storage & Security</h2>
            <p>Your data is stored on <strong className="text-white">Supabase</strong> infrastructure, hosted on AWS servers. All data is encrypted at rest (AES-256) and in transit (TLS 1.2+). We implement Row Level Security (RLS) ensuring each tenant can only access their own data.</p>
            <p className="mt-3">We maintain security audit logs of all platform actions. Access to production systems is restricted to authorised personnel only. We conduct periodic security reviews.</p>
            <p className="mt-3">Despite our best efforts, no system is 100% secure. In the event of a data breach that affects your personal information, we will notify you within 72 hours of becoming aware of it.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Data Retention</h2>
            <p>We retain your account data for the duration of your subscription and for 90 days after account termination, after which it is permanently deleted. You may request immediate deletion by contacting us. Payment records are retained for 7 years as required by Indian accounting law.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Your Rights</h2>
            <p>As a user, you have the right to:</p>
            <ul className="space-y-2 list-none pl-0 mt-3">
              {[
                'Access the personal data we hold about you',
                'Correct inaccurate personal data',
                'Request deletion of your personal data (subject to legal retention requirements)',
                'Export your data in a portable format',
                'Withdraw consent for processing (where consent is the legal basis)',
                'Lodge a complaint with the appropriate data protection authority',
              ].map(item => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4">To exercise any of these rights, email us at <a href="mailto:privacy@opspilot.in" className="text-cyan-400 hover:underline">privacy@opspilot.in</a>. We will respond within 30 days.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Third-Party Services</h2>
            <p>We use the following third-party services to operate the platform:</p>
            <div className="mt-4 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-800/50">
                    <th className="text-left px-4 py-3 text-slate-400 font-semibold text-xs uppercase">Service</th>
                    <th className="text-left px-4 py-3 text-slate-400 font-semibold text-xs uppercase">Purpose</th>
                    <th className="text-left px-4 py-3 text-slate-400 font-semibold text-xs uppercase">Privacy Policy</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Supabase', purpose: 'Database & Authentication', link: 'supabase.com/privacy' },
                    { name: 'Razorpay', purpose: 'Payment Processing', link: 'razorpay.com/privacy' },
                    { name: 'AWS', purpose: 'Cloud Infrastructure', link: 'aws.amazon.com/privacy' },
                  ].map((row, i) => (
                    <tr key={row.name} className={i < 2 ? 'border-b border-slate-800/50' : ''}>
                      <td className="px-4 py-3 text-white font-medium">{row.name}</td>
                      <td className="px-4 py-3 text-slate-400">{row.purpose}</td>
                      <td className="px-4 py-3 text-cyan-400 text-xs">{row.link}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Cookies</h2>
            <p>We use essential cookies only — those required for authentication, session management, and security. We do not use tracking or advertising cookies. You may disable cookies in your browser but this will impair platform functionality.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Children's Privacy</h2>
            <p>OpsPilot is a business platform intended for use by persons aged 18 and above. We do not knowingly collect information from persons under 18 years of age.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by email and by posting a notice on the platform at least 7 days before changes take effect. Continued use after that date constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Contact</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <p className="font-semibold text-white mb-3">K² Adexos Global Technologies</p>
              <p className="text-slate-400 text-sm">Privacy Enquiries: <a href="mailto:privacy@opspilot.in" className="text-cyan-400 hover:underline">privacy@opspilot.in</a></p>
              <p className="text-slate-400 text-sm mt-1">General Support: <a href="mailto:support@opspilot.in" className="text-cyan-400 hover:underline">support@opspilot.in</a></p>
              <p className="text-slate-500 text-xs mt-3">Jurisdiction: Republic of India. This policy is governed by the Information Technology Act, 2000 and the IT (Amendment) Act, 2008.</p>
            </div>
          </section>
        </div>
      </div>

      <footer className="border-t border-slate-800 py-6 mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-slate-600 text-xs">© {new Date().getFullYear()} OpsPilot · K² Adexos Global Technologies</p>
          <div className="flex gap-5 text-xs text-slate-600">
            <button onClick={() => { window.location.hash = '#terms'; window.dispatchEvent(new HashChangeEvent('hashchange')); }} className="hover:text-slate-400 transition-colors">Terms & Conditions</button>
            <button onClick={() => { window.location.hash = '#about'; window.dispatchEvent(new HashChangeEvent('hashchange')); }} className="hover:text-slate-400 transition-colors">About Us</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
