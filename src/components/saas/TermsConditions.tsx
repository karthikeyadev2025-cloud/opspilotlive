import { ArrowLeft, FileText, Activity } from 'lucide-react';

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

export default function TermsConditions() {
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
          <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Legal</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-3">Terms & Conditions</h1>
        <p className="text-slate-400 mb-10">Last updated: May 25, 2026 · By using OpsPilot you accept these terms.</p>

        <div className="space-y-10 text-slate-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Agreement to Terms</h2>
            <p>These Terms and Conditions ("Terms") constitute a legally binding agreement between you ("Customer", "you") and <strong className="text-white">K² Adexos Global Technologies</strong> ("Company", "we"), governing your access to and use of the OpsPilot platform ("Service").</p>
            <p className="mt-3">By creating an account, clicking "Start Free Trial", or otherwise using the Service, you confirm that you have read, understood, and agree to be bound by these Terms. If you do not agree, you must not use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. The Service</h2>
            <p>OpsPilot is a cloud-based field operations management platform that provides tools for managing leads, field executives, telecallers, attendance, payroll, HR, and business analytics. The Service is provided on a Software-as-a-Service (SaaS) basis.</p>
            <p className="mt-3">We reserve the right to modify, update, or discontinue any feature of the Service at any time with reasonable notice. We do not guarantee that any specific feature will be available indefinitely.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Accounts & Registration</h2>
            <div className="space-y-3">
              <p><strong className="text-white">3.1 Eligibility.</strong> You must be at least 18 years old and have the legal capacity to enter into contracts to use the Service. By registering, you warrant that you meet these requirements.</p>
              <p><strong className="text-white">3.2 Account Security.</strong> You are responsible for maintaining the confidentiality of your login credentials. You must immediately notify us of any unauthorised access to your account. We are not liable for losses resulting from unauthorised access due to your failure to maintain credential security.</p>
              <p><strong className="text-white">3.3 Accurate Information.</strong> You agree to provide accurate, current, and complete information during registration and to keep this information updated.</p>
              <p><strong className="text-white">3.4 One Account Per Business.</strong> Each business entity may register one primary account. Creating multiple accounts to circumvent limits or trials is prohibited.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Free Trial</h2>
            <p>New accounts receive a <strong className="text-white">3-day free trial</strong> with full access to the platform features of the selected plan. No credit card is required to start a trial. At the end of the trial period:</p>
            <ul className="space-y-2 list-none pl-0 mt-3">
              {[
                'Your account will be moved to "Expired" status',
                'Your data will be retained for 30 days in expired state',
                'You may subscribe at any time to reactivate your account',
                'After 30 days in expired state without subscription, your data may be deleted',
              ].map(item => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Subscription & Payment</h2>
            <div className="space-y-3">
              <p><strong className="text-white">5.1 Plans.</strong> We offer Starter (₹999/month) and Business (₹2,499/month) plans. Plan features are described on the pricing page and are subject to change with 30 days notice.</p>
              <p><strong className="text-white">5.2 Billing.</strong> Subscriptions are billed in advance for the chosen period (monthly, 6 months, or 12 months). All prices are in Indian Rupees and are exclusive of applicable taxes including GST.</p>
              <p><strong className="text-white">5.3 Payment Processing.</strong> Payments are processed by Razorpay. By making a payment, you agree to Razorpay's terms of service. We do not store your payment card details.</p>
              <p><strong className="text-white">5.4 Refunds.</strong> Subscription fees are non-refundable except where required by applicable law. If you experience a technical issue that prevents you from using the Service, contact us within 7 days for a case-by-case review.</p>
              <p><strong className="text-white">5.5 Taxes.</strong> You are responsible for all taxes applicable to your purchase. We will charge GST as applicable under Indian law.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Acceptable Use</h2>
            <p>You agree not to use the Service to:</p>
            <ul className="space-y-2 list-none pl-0 mt-3">
              {[
                'Violate any applicable Indian or international law or regulation',
                'Collect or store personal data of individuals without their consent',
                'Transmit spam, malware, or malicious code',
                'Attempt to gain unauthorised access to any part of the Service or its infrastructure',
                'Reverse engineer, decompile, or disassemble any component of the Service',
                'Use the Service to provide competing services without written permission',
                'Use automated tools to scrape, crawl, or extract data from the Service',
                'Upload content that infringes third-party intellectual property rights',
              ].map(item => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4">Violation of these restrictions may result in immediate termination of your account without refund.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Your Data & Content</h2>
            <p><strong className="text-white">7.1 Ownership.</strong> You retain full ownership of all data, content, and information you upload to the Service ("Your Content"). We claim no ownership rights over Your Content.</p>
            <p className="mt-3"><strong className="text-white">7.2 Licence to Operate.</strong> By using the Service, you grant us a limited, non-exclusive licence to process Your Content solely as necessary to provide and improve the Service.</p>
            <p className="mt-3"><strong className="text-white">7.3 Responsibility.</strong> You are solely responsible for the accuracy, legality, and appropriateness of Your Content. You warrant that you have all necessary rights and permissions for any employee or customer data you input into the platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Service Availability & SLA</h2>
            <p>We target 99.9% monthly uptime. Scheduled maintenance will be communicated in advance. Unplanned outages will be communicated via platform status page. Downtime does not entitle you to refunds except where it exceeds 3 consecutive days, in which case a pro-rated credit will be applied.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Intellectual Property</h2>
            <p>The OpsPilot platform, including its software, design, trademarks, logos, and documentation, is the exclusive intellectual property of K² Adexos Global Technologies. Nothing in these Terms transfers any intellectual property rights to you. You may not use our name, logo, or trademarks without prior written consent.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Limitation of Liability</h2>
            <p>To the maximum extent permitted by applicable law, K² Adexos Global Technologies shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or goodwill arising from your use of or inability to use the Service.</p>
            <p className="mt-3">Our total liability to you for any claim arising under these Terms shall not exceed the amount you paid to us in the 3 months preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Termination</h2>
            <p>Either party may terminate the subscription at any time. Upon termination:</p>
            <ul className="space-y-2 list-none pl-0 mt-3">
              {[
                'Your access to the Service will cease at the end of the current billing period',
                'Your data will be retained for 90 days and then permanently deleted',
                'You may export your data at any time before the 90-day window expires',
                'No refund will be issued for unused subscription time',
              ].map(item => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4">We may terminate your account immediately, without notice or refund, if you breach these Terms, engage in fraudulent activity, or your continued use poses a security risk.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">12. Governing Law & Disputes</h2>
            <p>These Terms are governed by the laws of India. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of India. We encourage you to contact us first to resolve any disputes amicably before initiating legal proceedings.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">13. Changes to Terms</h2>
            <p>We reserve the right to update these Terms at any time. We will notify you by email and platform notification at least 14 days before material changes take effect. Continued use of the Service after the effective date constitutes acceptance of the updated Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">14. Contact</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <p className="font-semibold text-white mb-3">K² Adexos Global Technologies</p>
              <p className="text-slate-400 text-sm">Legal enquiries: <a href="mailto:legal@opspilot.in" className="text-cyan-400 hover:underline">legal@opspilot.in</a></p>
              <p className="text-slate-400 text-sm mt-1">General support: <a href="mailto:support@opspilot.in" className="text-cyan-400 hover:underline">support@opspilot.in</a></p>
            </div>
          </section>
        </div>
      </div>

      <footer className="border-t border-slate-800 py-6 mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-slate-600 text-xs">© {new Date().getFullYear()} OpsPilot · K² Adexos Global Technologies</p>
          <div className="flex gap-5 text-xs text-slate-600">
            <button onClick={() => { window.location.hash = '#privacy'; window.dispatchEvent(new HashChangeEvent('hashchange')); }} className="hover:text-slate-400 transition-colors">Privacy Policy</button>
            <button onClick={() => { window.location.hash = '#about'; window.dispatchEvent(new HashChangeEvent('hashchange')); }} className="hover:text-slate-400 transition-colors">About Us</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
