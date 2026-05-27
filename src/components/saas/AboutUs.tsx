import { ArrowLeft, Activity, Users, Shield, Zap, Target, Award, TrendingUp, Building2, CheckCircle, ArrowRight, Mail, Phone } from 'lucide-react';

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

function goHash(hash: string) {
  window.location.hash = hash;
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}

const VALUES = [
  {
    icon: Target,
    title: 'Built for India',
    desc: 'Every feature is designed around how Indian businesses actually operate — from telecaller workflows to selfie-based attendance.',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
  },
  {
    icon: Shield,
    title: 'Data Privacy First',
    desc: 'Your data belongs to you. We use enterprise-grade encryption, Row Level Security, and never sell your information.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
  },
  {
    icon: Zap,
    title: 'Simplicity Wins',
    desc: 'Powerful software shouldn\'t require a consultant to set up. OpsPilot is live in minutes, not months.',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
  },
  {
    icon: TrendingUp,
    title: 'Customer Success',
    desc: 'We succeed only when you succeed. Our support team is committed to helping you get real results from day one.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
  },
];

const MILESTONES = [
  { year: '2023', event: 'K² Adexos founded with a mission to digitise Indian field operations' },
  { year: '2024', event: 'First version of OpsPilot launched for internal use at pilot businesses' },
  { year: '2025', event: 'Public SaaS launch — 100+ businesses onboarded in first quarter' },
  { year: '2026', event: 'Razorpay integration, enterprise features, and 500+ active businesses' },
];

const STATS = [
  { value: '500+', label: 'Businesses Trust Us' },
  { value: '50,000+', label: 'Leads Managed' },
  { value: '1M+', label: 'Attendance Records' },
  { value: '99.9%', label: 'Platform Uptime' },
];

const TEAM = [
  {
    name: 'Kamal K.',
    role: 'Co-Founder & CEO',
    bio: 'Operations technology leader with 10+ years building field management solutions for mid-market Indian companies.',
    initials: 'KK',
    color: 'bg-blue-500/20 text-blue-400',
  },
  {
    name: 'Kavitha R.',
    role: 'Co-Founder & CTO',
    bio: 'Full-stack engineer and systems architect. Previously built SaaS platforms serving 100K+ users across Southeast Asia.',
    initials: 'KR',
    color: 'bg-cyan-500/20 text-cyan-400',
  },
  {
    name: 'Arjun M.',
    role: 'Head of Customer Success',
    bio: 'Helps businesses onboard and extract maximum value from OpsPilot. Former operations manager in FMCG distribution.',
    initials: 'AM',
    color: 'bg-emerald-500/20 text-emerald-400',
  },
];

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <button onClick={() => goHash('#saas-signup')} className="hidden sm:flex items-center gap-1.5 text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-4 py-2 rounded-lg transition-colors">
              Start Free Trial <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => goHash('')} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" /> Home
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 mb-8">
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs text-cyan-400 font-medium tracking-wide">K² Adexos Global Technologies</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] mb-6">
            We Built the Platform
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              We Wished Existed
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            OpsPilot was born from a simple observation: Indian businesses managing field teams had no purpose-built software that understood their actual workflows. So we built it.
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <div className="border-y border-slate-800 bg-slate-900/30 py-8">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <div className="text-3xl font-black text-white">{s.value}</div>
              <div className="text-slate-400 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-black text-white mb-5">Our Mission</h2>
              <p className="text-slate-400 leading-relaxed mb-5">
                We believe that every Indian SME managing a field team deserves enterprise-grade operations software — without enterprise-grade complexity or price tags.
              </p>
              <p className="text-slate-400 leading-relaxed mb-5">
                Whether you're running a solar installation company in Rajasthan, a security services firm in Mumbai, or a field sales team anywhere in India — your operations deserve to run as smoothly as your ambition.
              </p>
              <p className="text-slate-400 leading-relaxed">
                OpsPilot puts lead management, GPS-verified field tracking, telecaller workflows, attendance, HR, and analytics into one platform your entire team can use from day one.
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
              <h3 className="font-bold text-white mb-5">Why Businesses Choose OpsPilot</h3>
              <ul className="space-y-4">
                {[
                  'No IT team required — set up in under an hour',
                  'Works on mobile — perfect for field teams',
                  'Built specifically for Indian business workflows',
                  'Affordable pricing starting at ₹999/month',
                  'All data hosted securely, never shared',
                  'Dedicated support from real humans',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-3">What We Stand For</h2>
            <p className="text-slate-400">The principles that guide every decision we make.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map(v => (
              <div key={v.title} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className={`w-11 h-11 ${v.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <v.icon className={`w-5 h-5 ${v.color}`} />
                </div>
                <h3 className="font-bold text-white mb-2">{v.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-3">Our Journey</h2>
            <p className="text-slate-400">From idea to 500+ businesses.</p>
          </div>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-800" />
            <div className="space-y-8">
              {MILESTONES.map((m, i) => (
                <div key={m.year} className="flex gap-6 relative">
                  <div className="flex-shrink-0 w-8 h-8 bg-slate-900 border-2 border-cyan-500/50 rounded-full flex items-center justify-center z-10 -ml-0">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="text-cyan-400 font-bold text-sm mb-1">{m.year}</div>
                    <p className="text-slate-300 text-sm leading-relaxed">{m.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-slate-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-3">The Team</h2>
            <p className="text-slate-400">Operators who understand operations.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {TEAM.map(person => (
              <div key={person.name} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
                <div className={`w-16 h-16 rounded-2xl ${person.color} flex items-center justify-center mx-auto mb-4 text-xl font-black`}>
                  {person.initials}
                </div>
                <div className="font-bold text-white mb-0.5">{person.name}</div>
                <div className="text-cyan-400 text-xs font-semibold mb-3">{person.role}</div>
                <p className="text-slate-400 text-xs leading-relaxed">{person.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-black text-white mb-3">Get in Touch</h2>
          <p className="text-slate-400 mb-10">We'd love to hear from you — whether you're a potential customer, a partner, or just curious.</p>
          <div className="grid sm:grid-cols-2 gap-5 mb-10">
            <a href="mailto:support@opspilot.in"
              className="flex items-center gap-4 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all group text-left">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="font-semibold text-white text-sm">Email Us</div>
                <div className="text-slate-400 text-xs mt-0.5">support@opspilot.in</div>
              </div>
            </a>
            <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 text-left">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="font-semibold text-white text-sm">Sales & Partnerships</div>
                <div className="text-slate-400 text-xs mt-0.5">hello@opspilot.in</div>
              </div>
            </div>
          </div>
          <button onClick={() => goHash('#saas-signup')}
            className="group inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-cyan-500/25 hover:-translate-y-0.5">
            Start Your Free Trial
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-slate-600 text-xs">© {new Date().getFullYear()} OpsPilot · K² Adexos Global Technologies</p>
          <div className="flex gap-5 text-xs text-slate-600">
            <button onClick={() => goHash('#privacy')} className="hover:text-slate-400 transition-colors">Privacy Policy</button>
            <button onClick={() => goHash('#terms')} className="hover:text-slate-400 transition-colors">Terms & Conditions</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
