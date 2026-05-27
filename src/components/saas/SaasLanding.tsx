import { useState, useEffect, useRef } from 'react';
import {
  Users, MapPin, Phone, BarChart3, Calendar, Shield, CheckCircle,
  ArrowRight, Menu, X, Star, Zap, TrendingUp, Building2, Target,
  Award, Headphones, Activity, Lock, Play, Sparkles, Globe, Cpu,
} from 'lucide-react';

/* ─── Data ──────────────────────────────────────────────────────────────────── */

const NAV = [
  { label: 'Features',     id: 'features' },
  { label: 'How It Works', id: 'how-it-works' },
  { label: 'Pricing',      id: 'pricing' },
  { label: 'Testimonials', id: 'testimonials' },
];

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const FEATURES = [
  { icon: Target,    title: 'Smart Lead CRM',       tag: 'Sales',    desc: 'Intelligent pipeline with auto-assignment, follow-up reminders, and full conversion analytics.' },
  { icon: MapPin,    title: 'GPS Field Tracking',   tag: 'Field',    desc: 'Real-time location, selfie check-in, site visit logging — all from any mobile device.' },
  { icon: Phone,     title: 'Telecaller Portal',    tag: 'Calling',  desc: 'Purpose-built calling interface with logs, callback scheduler, and daily performance dashboards.' },
  { icon: Calendar,  title: 'Attendance & Payroll', tag: 'HR',       desc: 'GPS-tagged selfie attendance, auto work-hour calculation, payslip generation and advance management.' },
  { icon: Users,     title: 'HR Management',        tag: 'HR',       desc: 'Leave requests, advance approvals, staff records — complete HR workflows without paperwork.' },
  { icon: BarChart3, title: 'Analytics Suite',      tag: 'Reports',  desc: 'Live conversion rates, team leaderboards, lead source breakdowns and executive-level reports.' },
  { icon: Shield,    title: 'Security & Audit',     tag: 'Security', desc: 'Immutable log of every login and data change. Zero blind spots, full accountability.' },
  { icon: Activity,  title: 'Role Permissions',     tag: 'Admin',    desc: 'Granular access per role — Admin, Manager, HR, Executive, Telecaller. Each sees only what they need.' },
];

const PLANS = [
  {
    name: 'Starter', price: '999', tagline: 'For growing teams',
    highlight: false,
    features: ['Up to 10 staff accounts', 'Lead CRM & Telecaller Portal', 'Field Executive with GPS', 'Basic Attendance Tracking', 'Manager Dashboard', 'Email Support'],
  },
  {
    name: 'Business', price: '2,499', tagline: 'For serious operations',
    highlight: true, badge: 'MOST POPULAR',
    features: ['Unlimited staff accounts', 'Everything in Starter', 'Full HR Portal (Leave & Advances)', 'Advanced Analytics & Reports', 'Security Audit Logs', 'Custom Roles & Permissions', 'Priority 24hr Support', 'Dedicated Account Manager'],
  },
];

const STEPS = [
  { num: '01', icon: Sparkles,   title: 'Create Account',  desc: 'Sign up in 60 seconds. No credit card required.' },
  { num: '02', icon: Cpu,        title: '3-Day Trial',     desc: 'Full access to every module. Set up your team and go live.' },
  { num: '03', icon: Globe,      title: 'Choose a Plan',   desc: 'Starter or Business. Monthly or annual. Cancel anytime.' },
  { num: '04', icon: TrendingUp, title: 'Scale Your Ops',  desc: 'Add staff, assign roles, and transform how your team works.' },
];

const TESTIMONIALS = [
  { name: 'Rajesh Kumar', role: 'Operations Head', company: 'SkyTech Solutions', initials: 'RK',
    text: 'OpsPilot completely transformed how we manage our field team. Lead conversion jumped 40% in the first month alone.' },
  { name: 'Priya Sharma', role: 'Managing Director', company: 'Orbit Services', initials: 'PS',
    text: 'The telecaller portal is outstanding. Our team now closes 3× more leads with proper follow-up reminders and call tracking.' },
  { name: 'Amit Patel', role: 'CEO', company: 'NovaTech India', initials: 'AP',
    text: 'HR used to take hours every week. Now leave requests, advances, and attendance are handled automatically.' },
];

const STATS = [
  { value: '500+',  label: 'Active Businesses',   icon: Building2 },
  { value: '50K+',  label: 'Leads Managed',        icon: Target },
  { value: '99.9%', label: 'Uptime Guarantee',     icon: Activity },
  { value: '4.9★',  label: 'Customer Rating',      icon: Star },
];

const TRUST = [
  { icon: Lock,       label: '256-bit SSL' },
  { icon: Shield,     label: 'GDPR Ready' },
  { icon: Award,      label: 'ISO 27001' },
  { icon: Headphones, label: '24/7 Support' },
];

/* ─── Logo ───────────────────────────────────────────────────────────────────── */

function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0" style={{ boxShadow: '0 2px 12px rgba(37,99,235,0.35)' }}>
        <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
      </div>
      <span className={`text-[17px] font-black tracking-tight ${dark ? 'text-gray-900' : 'text-white'}`}>
        Ops<span className="text-primary-400">Pilot</span>
      </span>
    </div>
  );
}

export { Logo };

function goHash(h: string) {
  window.location.hash = h;
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}

function useInView(ref: React.RefObject<Element>, threshold = 0.15) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return v;
}

/* ─── Dashboard mockup ───────────────────────────────────────────────────────── */

function Mockup() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(p => (p + 1) % 3), 2600);
    return () => clearInterval(t);
  }, []);

  const leads = [
    { name: 'Suresh Nair',  loc: 'Mumbai · Solar',   status: 'Hot Lead',  statusColor: 'text-orange-600 bg-orange-50 border-orange-200' },
    { name: 'Kavya Reddy',  loc: 'Bengaluru · CCTV', status: 'Converted', statusColor: 'text-green-600 bg-green-50 border-green-200' },
    { name: 'Mohan Singh',  loc: 'Delhi · Solar',    status: 'Callback',  statusColor: 'text-gray-500 bg-gray-100 border-gray-200' },
  ];

  return (
    <div className="relative">
      <div className="absolute -inset-4 bg-primary-600/10 rounded-3xl blur-3xl -z-10" />

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden" style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.16), 0 4px 20px rgba(0,0,0,0.08)' }}>
        {/* Window bar */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 bg-white rounded-md border border-gray-200 px-3 py-1 flex items-center gap-1.5 max-w-[220px] mx-auto">
            <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
            <span className="text-[11px] text-gray-500 truncate">app.opspilot.in</span>
          </div>
        </div>

        <div className="p-5 space-y-4 bg-gray-50/50">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 text-sm font-bold">Operations Overview</p>
              <p className="text-gray-400 text-[11px] mt-0.5">Today · Live</p>
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-green-200 rounded-lg px-2.5 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-600 text-[11px] font-semibold">Live</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Active Leads', value: '847', color: 'text-primary-600', bg: 'bg-primary-50 border-primary-100' },
              { label: 'Converted',    value: '124', color: 'text-green-600',   bg: 'bg-green-50 border-green-100' },
              { label: 'Team Online',  value: '18',  color: 'text-gray-900',    bg: 'bg-white border-gray-200' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} border rounded-xl p-3`}>
                <p className={`text-xl font-black leading-none ${s.color}`}>{s.value}</p>
                <p className="text-gray-500 text-[10px] mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Leads */}
          <div className="space-y-1.5">
            <p className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider">Recent Leads</p>
            {leads.map((l, i) => (
              <div key={l.name} className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-500 ${i === tick ? 'bg-white border-primary-200 shadow-sm' : 'bg-white/70 border-transparent'}`}>
                <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-[11px] font-bold text-gray-600 flex-shrink-0">{l.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 text-[12px] font-semibold truncate">{l.name}</p>
                  <p className="text-gray-400 text-[10px]">{l.loc}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${l.statusColor}`}>{l.status}</span>
              </div>
            ))}
          </div>

          {/* Attendance bar */}
          <div className="bg-white border border-gray-200 rounded-xl p-3">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500 text-[11px]">Today's Attendance</span>
              <span className="text-primary-600 text-[11px] font-bold">18/22 Present</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full" style={{ width: '82%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Floating cards */}
      <div className="absolute -top-4 -right-6 bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3 animate-float" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.10)' }}>
        <div className="w-8 h-8 bg-green-50 border border-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-4 h-4 text-green-600" />
        </div>
        <div>
          <p className="text-gray-900 text-[11px] font-bold leading-none mb-0.5">Conversion Rate</p>
          <p className="text-green-600 text-[11px] font-black">+40% this month</p>
        </div>
      </div>

      <div className="absolute -bottom-4 -left-6 bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.10)', animation: 'float 5s ease-in-out infinite', animationDelay: '1.5s' }}>
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <CheckCircle className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-gray-400 text-[10px]">GPS Check-in Verified</p>
          <p className="text-gray-900 text-[11px] font-semibold">Ravi Kumar · Mumbai</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Section label ─────────────────────────────────────────────────────────── */

function EyeBrow({ children, light = false }: { children: string; light?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-5">
      <div className={`h-px w-8 ${light ? 'bg-white/30' : 'bg-primary-300'}`} />
      <span className={`text-[11px] font-bold tracking-[0.18em] uppercase ${light ? 'text-primary-300' : 'text-primary-600'}`}>{children}</span>
      <div className={`h-px w-8 ${light ? 'bg-white/30' : 'bg-primary-300'}`} />
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────────────────── */

export default function SaasLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeFeat, setActiveFeat] = useState(0);

  const statsRef = useRef<HTMLDivElement>(null!);
  const featRef  = useRef<HTMLElement>(null!);
  const stepsRef = useRef<HTMLElement>(null!);
  const pricingRef = useRef<HTMLElement>(null!);
  const testiRef = useRef<HTMLElement>(null!);

  const statsVis   = useInView(statsRef);
  const featVis    = useInView(featRef);
  const stepsVis   = useInView(stepsRef);
  const pricingVis = useInView(pricingRef);
  const testiVis   = useInView(testiRef);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveFeat(p => (p + 1) % FEATURES.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* ═══ NAVBAR ═══ */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-dark-100/95 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[68px] flex items-center justify-between">
          <Logo />

          <div className="hidden md:flex items-center">
            {NAV.map(l => (
              <button key={l.label} onClick={() => scrollTo(l.id)}
                className="text-[13px] text-white/70 hover:text-white px-4 py-2 rounded-lg hover:bg-white/8 transition-all font-medium">
                {l.label}
              </button>
            ))}
            <button onClick={() => goHash('#about')}
              className="text-[13px] text-white/70 hover:text-white px-4 py-2 rounded-lg hover:bg-white/8 transition-all font-medium">
              About
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => goHash('#saas-login')}
              className="text-[13px] text-white/75 hover:text-white px-4 py-2 rounded-lg hover:bg-white/8 transition-all font-medium">
              Sign In
            </button>
            <button onClick={() => goHash('#saas-signup')}
              className="flex items-center gap-1.5 text-[13px] font-semibold bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-lg transition-all"
              style={{ boxShadow: '0 2px 12px rgba(37,99,235,0.35)' }}>
              Start Free Trial <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button className="md:hidden text-white/80 hover:text-white p-2 rounded-lg" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-dark-100/98 backdrop-blur-xl border-t border-white/6 px-5 py-5 space-y-1">
            {NAV.map(l => (
              <button key={l.label} onClick={() => { setMenuOpen(false); scrollTo(l.id); }}
                className="block w-full text-left text-white/75 hover:text-white text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-white/6 transition-colors">{l.label}</button>
            ))}
            <button onClick={() => { setMenuOpen(false); goHash('#about'); }}
              className="block w-full text-left text-white/75 hover:text-white text-sm py-2.5 px-3 rounded-lg hover:bg-white/6 transition-colors">About</button>
            <div className="pt-4 space-y-2 border-t border-white/8 mt-2">
              <button onClick={() => { setMenuOpen(false); goHash('#saas-login'); }}
                className="block w-full text-left text-white/75 text-sm py-2.5 px-3 font-medium">Sign In</button>
              <button onClick={() => { setMenuOpen(false); goHash('#saas-signup'); }}
                className="w-full bg-primary-600 text-white font-bold text-sm py-3 rounded-xl">Start Free Trial</button>
            </div>
          </div>
        )}
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1530 40%, #0a1628 100%)' }}>
        {/* Background layers */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full" style={{ background: 'radial-gradient(ellipse, rgba(37,99,235,0.18) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 right-0 w-[600px] h-[400px] rounded-full" style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />
          {/* dot grid */}
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '36px 36px', opacity: 0.6 }} />
          {/* horizontal glow line */}
          <div className="absolute top-[68px] inset-x-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(37,99,235,0.3), transparent)' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-28 pb-16 lg:py-36 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border"
                style={{ background: 'rgba(37,99,235,0.12)', borderColor: 'rgba(37,99,235,0.3)' }}>
                <Zap className="w-3.5 h-3.5 text-primary-400" />
                <span className="text-primary-300 text-xs font-semibold">3-Day Free Trial · No Credit Card</span>
              </div>

              <h1 className="text-[2.8rem] sm:text-5xl lg:text-[3.6rem] font-black text-white leading-[1.06] tracking-tight mb-6">
                The Operating System<br />
                for Your Field<br />
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #60a5fa, #818cf8)' }}>
                  Business
                </span>
              </h1>

              <p className="text-[17px] leading-relaxed mb-9 max-w-[500px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                OpsPilot unifies leads, attendance, telecalling, HR, and analytics into one intelligent platform — purpose-built for ambitious Indian businesses.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-12">
                <button onClick={() => goHash('#saas-signup')}
                  className="group flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-bold text-[15px] px-7 py-4 rounded-xl transition-all"
                  style={{ boxShadow: '0 4px 24px rgba(37,99,235,0.40)' }}>
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <a href="#how-it-works"
                  className="flex items-center justify-center gap-2 text-[15px] px-7 py-4 rounded-xl transition-all font-medium"
                  style={{ color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = 'white'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; }}>
                  <Play className="w-4 h-4" />
                  See how it works
                </a>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2.5">
                  {[
                    { i: 'RK', c: '#2563eb' }, { i: 'PS', c: '#16a34a' }, { i: 'AM', c: '#d97706' },
                    { i: 'VD', c: '#dc2626' }, { i: 'SN', c: '#7c3aed' },
                  ].map((a, idx) => (
                    <div key={idx} className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-[10px] font-black text-white flex-shrink-0"
                      style={{ borderColor: '#0a0f1e', background: a.c }}>
                      {a.i}
                    </div>
                  ))}
                </div>
                <div className="h-8 w-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
                <div>
                  <div className="flex items-center gap-0.5 mb-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
                    <span className="text-yellow-400 text-xs font-bold ml-1.5">4.9</span>
                  </div>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Trusted by 500+ businesses</p>
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="hidden lg:block animate-fade-up delay-200">
              <Mockup />
            </div>
          </div>
        </div>

        {/* Bottom gradient fade to white */}
        <div className="absolute bottom-0 inset-x-0 h-32 pointer-events-none" style={{ background: 'linear-gradient(to top, #ffffff, transparent)' }} />
      </section>

      {/* ═══ TRUST BAR ═══ */}
      <div className="bg-white border-y border-gray-200 py-5">
        <div className="max-w-5xl mx-auto px-5 flex flex-wrap items-center justify-center gap-10">
          {TRUST.map(b => (
            <div key={b.label} className="flex items-center gap-2.5">
              <b.icon className="w-4 h-4 text-primary-600" />
              <span className="text-gray-600 text-sm font-medium">{b.label}</span>
            </div>
          ))}
          <div className="hidden sm:block w-px h-4 bg-gray-200" />
          <span className="text-gray-500 text-sm">Trusted by <strong className="text-gray-800">500+</strong> Indian businesses</span>
        </div>
      </div>

      {/* ═══ STATS ═══ */}
      <div ref={statsRef} className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <div key={s.label}
              className={`card p-6 text-center group hover:border-primary-200 transition-all duration-700 ${statsVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ transitionDelay: `${i * 100}ms`, cursor: 'default' }}>
              <div className="w-10 h-10 bg-primary-50 group-hover:bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors duration-200">
                <s.icon className="w-5 h-5 text-primary-600 group-hover:text-white transition-colors duration-200" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-gray-900 mb-1">{s.value}</div>
              <div className="text-gray-500 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ FEATURES ═══ */}
      <section id="features" ref={featRef} className="py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="text-center mb-16">
            <EyeBrow>Platform Capabilities</EyeBrow>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.7rem] font-black text-gray-900 mb-4">
              Everything Your Business<br />
              <span className="text-gray-400">Needs to Operate</span>
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto text-base leading-relaxed">
              Purpose-built modules for every layer — from field to finance, all working together.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {FEATURES.map((f, i) => (
              <div key={f.title}
                onMouseEnter={() => setActiveFeat(i)}
                className={`group bg-white rounded-xl border p-6 cursor-default transition-all duration-300 hover:-translate-y-1 ${
                  featVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                } ${activeFeat === i
                  ? 'border-primary-300 shadow-blue'
                  : 'border-gray-200 hover:border-primary-200 hover:shadow-card-lg'
                }`}
                style={{ transitionDelay: `${i * 55}ms` }}>
                <div className={`text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full mb-4 inline-flex transition-colors duration-200 ${
                  activeFeat === i ? 'bg-primary-50 text-primary-700' : 'bg-gray-100 text-gray-500 group-hover:bg-primary-50 group-hover:text-primary-700'
                }`}>{f.tag}</div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors duration-200 ${
                  activeFeat === i ? 'bg-primary-600' : 'bg-gray-100 group-hover:bg-primary-600'
                }`}>
                  <f.icon className={`w-5 h-5 transition-colors duration-200 ${activeFeat === i ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                </div>
                <h3 className="font-bold text-gray-900 text-[15px] mb-2">{f.title}</h3>
                <p className="text-gray-500 text-[13px] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" ref={stepsRef} className="py-28 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1530 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-48 rounded-full" style={{ background: 'radial-gradient(ellipse, rgba(37,99,235,0.12) 0%, transparent 70%)' }} />
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="text-center mb-16">
            <EyeBrow light>Getting Started</EyeBrow>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.7rem] font-black text-white mb-4">
              Up and Running<br />
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>in Minutes</span>
            </h2>
            <p className="max-w-md mx-auto text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Four simple steps to transform your team operations.
            </p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="hidden md:block absolute top-10 left-[15%] right-[15%] h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(37,99,235,0.4), transparent)' }} />

            {STEPS.map((s, i) => (
              <div key={s.num}
                className={`flex flex-col items-center text-center group transition-all duration-700 ${stepsVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${i * 120}ms` }}>
                <div className="relative w-20 h-20 mb-6 z-10">
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'rgba(37,99,235,0.2)', filter: 'blur(16px)' }} />
                  <div className="relative w-full h-20 border rounded-2xl flex flex-col items-center justify-center group-hover:-translate-y-1 transition-transform duration-300"
                    style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(37,99,235,0.3)' }}>
                    <s.icon className="w-6 h-6 text-primary-400 mb-0.5" />
                    <span className="text-[10px] font-bold text-white/30">{s.num}</span>
                  </div>
                </div>
                <h3 className="font-bold text-white text-[15px] mb-2">{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.42)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" ref={pricingRef} className="py-28 bg-white">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-16">
            <EyeBrow>Simple Pricing</EyeBrow>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.7rem] font-black text-gray-900 mb-4">
              Transparent Plans,<br />
              <span className="text-gray-400">No Hidden Costs</span>
            </h2>
            <p className="text-gray-500 max-w-md mx-auto text-base leading-relaxed">
              Both plans include a full 3-day free trial. Cancel anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {PLANS.map((plan, pi) => (
              <div key={plan.name}
                className={`relative rounded-2xl p-8 transition-all duration-700 hover:-translate-y-1 ${
                  pricingVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                } ${plan.highlight
                  ? 'text-white'
                  : 'bg-white border border-gray-200 hover:border-primary-200 hover:shadow-card-lg'
                }`}
                style={{
                  transitionDelay: `${pi * 120}ms`,
                  ...(plan.highlight ? {
                    background: 'linear-gradient(135deg, #0d1530 0%, #1a2040 100%)',
                    border: '1px solid rgba(37,99,235,0.4)',
                    boxShadow: '0 0 0 1px rgba(37,99,235,0.2), 0 20px 60px rgba(13,21,48,0.3)',
                  } : {}),
                }}>
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-[10px] font-black px-5 py-1.5 rounded-full tracking-[0.1em]"
                    style={{ boxShadow: '0 4px 12px rgba(37,99,235,0.4)' }}>
                    {plan.badge}
                  </div>
                )}

                <div className="mb-8">
                  <h3 className={`text-lg font-black mb-1 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                  <p className={`text-sm mb-6 ${plan.highlight ? 'text-white/50' : 'text-gray-400'}`}>{plan.tagline}</p>
                  <div className="flex items-end gap-1.5">
                    <span className={`text-xl font-bold leading-none ${plan.highlight ? 'text-white/50' : 'text-gray-400'}`}>₹</span>
                    <span className={`text-[3.2rem] font-black leading-none tracking-tight ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                    <span className={`text-sm mb-2 ${plan.highlight ? 'text-white/40' : 'text-gray-400'}`}>/month</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${plan.highlight ? 'bg-primary-500/25' : 'bg-primary-50'}`}>
                        <CheckCircle className={`w-3 h-3 ${plan.highlight ? 'text-primary-300' : 'text-primary-600'}`} />
                      </div>
                      <span className={`text-sm leading-snug ${plan.highlight ? 'text-white/75' : 'text-gray-600'}`}>{f}</span>
                    </li>
                  ))}
                </ul>

                <button onClick={() => goHash('#saas-signup')}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 ${
                    plan.highlight
                      ? 'bg-primary-600 hover:bg-primary-500 text-white'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200 hover:border-gray-300'
                  }`}
                  style={plan.highlight ? { boxShadow: '0 4px 16px rgba(37,99,235,0.35)' } : {}}>
                  Start Free Trial
                </button>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-400 text-xs mt-8">
            All prices in Indian Rupees · GST applicable · Cancel anytime
          </p>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section id="testimonials" ref={testiRef} className="py-28 bg-gray-50">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="text-center mb-16">
            <EyeBrow>Client Stories</EyeBrow>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.7rem] font-black text-gray-900 mb-4">
              Trusted by Operations<br />
              <span className="text-gray-400">Teams Across India</span>
            </h2>
            <p className="text-gray-500">Real results from real businesses.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name}
                className={`card card-hover p-7 flex flex-col transition-all duration-700 ${testiVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="flex gap-0.5 mb-5">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <blockquote className="text-gray-600 text-[14px] leading-[1.7] mb-6 flex-1">
                  &ldquo;{t.text}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3.5 pt-5 border-t border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-xs font-black text-white flex-shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-gray-400 text-xs mt-0.5">{t.role} · {t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-5">
          <div className="relative rounded-3xl overflow-hidden text-white text-center px-8 py-16 sm:px-16"
            style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1530 100%)' }}>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-48 rounded-full"
                style={{ background: 'radial-gradient(ellipse, rgba(37,99,235,0.20) 0%, transparent 70%)' }} />
              <div className="absolute top-0 inset-x-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(37,99,235,0.5), transparent)' }} />
              <div className="absolute inset-0"
                style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
            </div>
            <div className="relative">
              <div className="inline-flex items-center gap-2 mb-7 px-4 py-1.5 rounded-full border"
                style={{ background: 'rgba(37,99,235,0.15)', borderColor: 'rgba(37,99,235,0.35)' }}>
                <Sparkles className="w-3.5 h-3.5 text-primary-400" />
                <span className="text-primary-300 text-xs font-semibold">Start in 60 seconds</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-[2.7rem] font-black text-white mb-4 tracking-tight">
                Ready to Pilot Your<br />Operations?
              </h2>
              <p className="max-w-md mx-auto text-base leading-relaxed mb-10" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Join hundreds of Indian businesses managing their field teams with OpsPilot. Start free — no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button onClick={() => goHash('#saas-signup')}
                  className="group flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-bold text-[15px] px-8 py-4 rounded-xl transition-all"
                  style={{ boxShadow: '0 4px 24px rgba(37,99,235,0.45)' }}>
                  Start Your Free Trial
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  <CheckCircle className="w-4 h-4 text-primary-400" />
                  3 days free · No card needed
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-gray-200 pt-14 pb-8 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-5 select-none">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center" style={{ boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}>
                  <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-[17px] font-black text-gray-900">Ops<span className="text-primary-600">Pilot</span></span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                OpsPilot is a field operations management platform built for Indian businesses. Manage leads, attendance, HR, and field teams from one place.
              </p>
              <p className="text-gray-400 text-xs mt-5 pt-5 border-t border-gray-100">
                Developed by <span className="text-gray-500 font-semibold">K² Adexos Global Technologies</span>
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.16em] mb-5">Product</p>
              <ul className="space-y-3">
                {[['Features', '#features'], ['Pricing', '#pricing'], ['How It Works', '#how-it-works']].map(([l, h]) => (
                  <li key={l}><a href={h} className="text-gray-500 hover:text-gray-900 text-sm transition-colors">{l}</a></li>
                ))}
                <li><button onClick={() => goHash('#saas-signup')} className="text-gray-500 hover:text-gray-900 text-sm transition-colors text-left">Start Free Trial</button></li>
                <li><button onClick={() => goHash('#saas-login')} className="text-gray-500 hover:text-gray-900 text-sm transition-colors text-left">Sign In</button></li>
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.16em] mb-5">Company</p>
              <ul className="space-y-3">
                {[['About Us', '#about'], ['Privacy Policy', '#privacy'], ['Terms & Conditions', '#terms']].map(([l, h]) => (
                  <li key={l}><button onClick={() => goHash(h)} className="text-gray-500 hover:text-gray-900 text-sm transition-colors text-left">{l}</button></li>
                ))}
                <li><a href="mailto:support@opspilot.in" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">support@opspilot.in</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-gray-400 text-xs">© {new Date().getFullYear()} OpsPilot · K² Adexos Global Technologies · All rights reserved</p>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <button onClick={() => goHash('#privacy')} className="hover:text-gray-700 transition-colors">Privacy</button>
              <span className="text-gray-200">·</span>
              <button onClick={() => goHash('#terms')} className="hover:text-gray-700 transition-colors">Terms</button>
              <span className="text-gray-200">·</span>
              <button onClick={() => goHash('#about')} className="hover:text-gray-700 transition-colors">About</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
