import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Activity, LogOut, Users, Clock, CheckCircle,
  AlertTriangle, Crown, ArrowRight,
  Calendar, TrendingUp, Shield, Loader2,
  IndianRupee, MessageSquare, X, Send, Bell, ChevronRight,
} from 'lucide-react';

declare global {
  interface Window { Razorpay: any; }
}

interface Tenant {
  id: string; company_name: string; owner_name: string; owner_email: string;
  owner_phone: string; industry: string; status: string; trial_ends_at: string;
  subscription_starts_at: string | null; subscription_ends_at: string | null;
  plan_id: string | null; created_at: string;
  saas_plans?: { name: string; price_monthly: number; features: string[] };
}

interface Plan {
  id: string; name: string; slug: string; price_monthly: number;
  features: string[]; is_active: boolean;
}

interface TeamStats {
  totalStaff: number;
  activeStaff: number;
  byRole: Record<string, number>;
  presentToday: number;
  pendingLeads: number;
  pendingLeaves: number;
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-blue flex-shrink-0">
        <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
      </div>
      <span className="text-[17px] font-black tracking-tight">
        <span className="text-gray-900">Ops</span>
        <span className="text-primary-600">Pilot</span>
      </span>
    </div>
  );
}

function StatusBadge({ status, trialEndsAt }: { status: string; trialEndsAt: string }) {
  const daysLeft = Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86400000);
  if (status === 'trial') {
    const urgent = daysLeft <= 1;
    return (
      <span className={`badge ${urgent ? 'badge-red' : 'badge-yellow'}`}>
        <Clock className="w-3 h-3" />
        {daysLeft > 0 ? `${daysLeft}d trial left` : 'Trial ended'}
      </span>
    );
  }
  if (status === 'active') return <span className="badge badge-green"><CheckCircle className="w-3 h-3" />Active</span>;
  return <span className="badge badge-red"><AlertTriangle className="w-3 h-3" />{status}</span>;
}

function SupportModal({ tenant, onClose }: { tenant: Tenant; onClose: () => void }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('normal');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!subject.trim() || !message.trim()) return;
    setSending(true);
    await supabase.from('support_tickets').insert({ tenant_id: tenant.id, subject, message, priority, status: 'open' });
    setSending(false);
    setDone(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(17,24,39,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="font-bold text-gray-900">Contact Support</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        {done ? (
          <div className="p-10 text-center">
            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Ticket Submitted</h3>
            <p className="text-gray-500 text-sm">Our team will respond within 24 hours.</p>
            <button onClick={onClose} className="mt-5 text-primary-600 text-sm hover:text-primary-700 font-semibold">Close</button>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div>
              <label className="field-label">Subject</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Brief description" className="field-input" />
            </div>
            <div>
              <label className="field-label">Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value)} className="field-input appearance-none bg-white">
                {['low','normal','high','urgent'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Message</label>
              <textarea rows={4} value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe your issue..." className="field-input resize-none" />
            </div>
            <button onClick={submit} disabled={sending || !subject.trim() || !message.trim()}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
              style={{ boxShadow: '0 4px 16px rgba(37,99,235,0.25)' }}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {sending ? 'Sending…' : 'Submit Ticket'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function loadRazorpay(): Promise<boolean> {
  return new Promise(resolve => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true); s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function pay(tenant: Tenant, plan: Plan, months: number, onOk: () => void, onErr: (m: string) => void) {
  const loaded = await loadRazorpay();
  if (!loaded) { onErr('Failed to load payment gateway.'); return; }
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/razorpay/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      body: JSON.stringify({ tenant_id: tenant.id, plan_id: plan.id, months }),
    });
    const data = await res.json();
    if (!res.ok || data.error) { onErr(data.error || 'Could not create order.'); return; }
    new window.Razorpay({
      key: data.key_id, amount: data.amount, currency: data.currency,
      name: 'OpsPilot', description: `${plan.name} — ${months} month${months > 1 ? 's' : ''}`,
      order_id: data.order_id,
      prefill: { name: tenant.owner_name, email: tenant.owner_email, contact: tenant.owner_phone },
      theme: { color: '#2563eb' },
      handler: async (r: any) => {
        const v = await fetch(`${SUPABASE_URL}/functions/v1/razorpay/verify-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
          body: JSON.stringify({ razorpay_order_id: r.razorpay_order_id, razorpay_payment_id: r.razorpay_payment_id, razorpay_signature: r.razorpay_signature, tenant_id: tenant.id, plan_id: plan.id, months }),
        });
        const vd = await v.json();
        if (!v.ok || vd.error) { onErr(vd.error || 'Verification failed.'); return; }
        onOk();
      },
    }).open();
  } catch (err) { onErr('Payment error: ' + String(err)); }
}

const PLAN_FEATURES: Record<string, string[]> = {
  starter: ['Lead CRM & Telecaller Portal', 'Field Executive with GPS', 'Basic Attendance', 'Manager Dashboard', 'Up to 10 staff'],
  business: ['Everything in Starter', 'Full HR Portal', 'Leave & Salary Advance', 'Advanced Analytics', 'Security Audit Logs', 'Custom Roles & Permissions', 'Priority Support', 'Unlimited staff'],
};

const QUICK_LINKS = [
  { icon: Users,      label: 'Manage Staff',   desc: 'Add team members and assign roles',     color: 'text-primary-600',  bg: 'bg-primary-50',  border: 'border-primary-100' },
  { icon: TrendingUp, label: 'Lead CRM',        desc: 'View and manage your leads pipeline',   color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  { icon: Calendar,   label: 'Attendance',      desc: 'Track team attendance & payroll',        color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-100' },
  { icon: Shield,     label: 'HR Portal',       desc: 'Leave requests and salary advances',     color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-100' },
];

const TABS = ['overview', 'subscription', 'team'] as const;

export default function TenantDashboard() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'subscription' | 'team'>('overview');
  const [payLoading, setPayLoading] = useState<string | null>(null);
  const [payMsg, setPayMsg] = useState('');
  const [showSupport, setShowSupport] = useState(false);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [tr, pr] = await Promise.all([
        supabase.from('tenants').select('*, saas_plans(name, price_monthly, features)').eq('auth_user_id', user.id).maybeSingle(),
        supabase.from('saas_plans').select('*').eq('is_active', true).order('price_monthly'),
      ]);
      setTenant(tr.data as Tenant | null);
      setPlans((pr.data || []) as Plan[]);

      const tenantId = (tr.data as Tenant | null)?.id;
      if (tenantId) {
        const today = new Date().toISOString().slice(0, 10);
        const [staffRes, attRes, leadsRes, leavesRes] = await Promise.all([
          supabase.from('app_users').select('role, is_active').eq('tenant_id', tenantId),
          supabase.from('attendance_records').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('attendance_date', today).eq('status', 'present'),
          supabase.from('marketing_leads').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('status', 'new'),
          supabase.from('leave_requests').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('status', 'pending'),
        ]);
        const staff = staffRes.data || [];
        const byRole: Record<string, number> = {};
        staff.forEach(s => { byRole[s.role] = (byRole[s.role] || 0) + 1; });
        setTeamStats({
          totalStaff: staff.length,
          activeStaff: staff.filter(s => s.is_active).length,
          byRole,
          presentToday: attRes.count || 0,
          pendingLeads: leadsRes.count || 0,
          pendingLeaves: leavesRes.count || 0,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.hash = '';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  };

  const goToApp = () => { window.location.hash = '#login'; window.dispatchEvent(new HashChangeEvent('hashchange')); };

  const handlePay = async (plan: Plan, months: number) => {
    if (!tenant) return;
    setPayMsg(''); setPayLoading(`${plan.id}-${months}`);
    await pay(tenant, plan, months,
      async () => { setPayLoading(null); setPayMsg('Payment successful! Subscription is now active.'); await loadAll(); setTab('overview'); },
      (m) => { setPayLoading(null); setPayMsg(m); }
    );
    setPayLoading(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center card p-10 max-w-sm w-full">
          <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Account Not Found</h2>
          <p className="text-gray-500 text-sm mb-6">We could not locate your tenant account.</p>
          <button onClick={signOut} className="text-sm text-primary-600 hover:text-primary-700 font-semibold">Sign out and try again</button>
        </div>
      </div>
    );
  }

  const planName = tenant.saas_plans?.name || 'Starter';
  const planFeatures: string[] = Array.isArray(tenant.saas_plans?.features) ? tenant.saas_plans!.features : PLAN_FEATURES[planName.toLowerCase()] || PLAN_FEATURES.starter;
  const isTrial = tenant.status === 'trial';
  const daysLeft = Math.ceil((new Date(tenant.trial_ends_at).getTime() - Date.now()) / 86400000);
  const firstName = tenant.owner_name.split(' ')[0];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-2">
            <StatusBadge status={tenant.status} trialEndsAt={tenant.trial_ends_at} />
            <button onClick={() => setShowSupport(true)} className="hidden sm:flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-sm px-3 py-2 rounded-lg hover:bg-gray-100 transition-all">
              <MessageSquare className="w-4 h-4" />Support
            </button>
            <button onClick={goToApp}
              className="hidden sm:flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-all"
              style={{ boxShadow: '0 2px 8px rgba(37,99,235,0.25)' }}>
              Open App <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button onClick={signOut} className="text-gray-400 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-all" title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Trial warning banner */}
        {isTrial && daysLeft <= 2 && daysLeft > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bell className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-amber-800 text-sm">
                <strong>Trial ends in {daysLeft} day{daysLeft !== 1 ? 's' : ''}.</strong> Upgrade to keep access to all features.
              </p>
            </div>
            <button onClick={() => setTab('subscription')} className="text-xs bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-lg whitespace-nowrap transition-colors">
              Upgrade Now
            </button>
          </div>
        )}

        {payMsg && (
          <div className={`mb-6 px-4 py-3 rounded-xl text-sm flex items-center gap-2 ${payMsg.startsWith('Payment successful') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {payMsg.startsWith('Payment successful') ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
            {payMsg}
          </div>
        )}

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900 mb-0.5">Good day, {firstName}</h1>
          <p className="text-gray-500 text-sm">{tenant.company_name} &middot; {tenant.industry}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-gray-200">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-semibold capitalize transition-all border-b-2 -mb-px ${tab === t ? 'text-primary-600 border-primary-600' : 'text-gray-400 border-transparent hover:text-gray-700 hover:border-gray-300'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Quick Access</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {QUICK_LINKS.map(link => (
                  <button key={link.label} onClick={goToApp}
                    className={`group card card-hover p-5 text-left border ${link.border}`}
                  >
                    <div className={`w-10 h-10 ${link.bg} rounded-xl flex items-center justify-center mb-4`}>
                      <link.icon className={`w-5 h-5 ${link.color}`} />
                    </div>
                    <div className="font-bold text-gray-900 text-sm mb-1">{link.label}</div>
                    <div className="text-gray-400 text-xs leading-snug">{link.desc}</div>
                    <div className="mt-3 flex items-center gap-1 text-gray-400 group-hover:text-primary-600 transition-colors text-xs font-semibold">
                      Open <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Plan summary */}
            <div className="card p-6">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                    <Crown className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{planName} Plan</div>
                    <div className="text-gray-500 text-sm">
                      {isTrial
                        ? `Free trial — ${daysLeft > 0 ? `${daysLeft} days remaining` : 'expired'}`
                        : `Active until ${new Date(tenant.subscription_ends_at!).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                    </div>
                  </div>
                </div>
                <button onClick={() => setTab('subscription')} className="text-xs text-primary-600 hover:text-primary-700 font-semibold">
                  {isTrial ? 'Upgrade →' : 'Manage →'}
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {planFeatures.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                    <CheckCircle className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" /> {f}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA banner */}
            <div className="relative overflow-hidden rounded-2xl p-6 flex items-center justify-between gap-4" style={{ background: 'linear-gradient(135deg, #0a0f1e, #1a2040)' }}>
              <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 100% at 100% 50%, rgba(37,99,235,0.2), transparent)' }} />
              <div className="relative">
                <h3 className="font-bold text-white mb-1">Ready to manage your team?</h3>
                <p className="text-white/60 text-sm">Open the full portal to manage leads, staff, attendance and more.</p>
              </div>
              <button onClick={goToApp}
                className="relative flex-shrink-0 flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-bold px-5 py-3 rounded-xl transition-all text-sm"
                style={{ boxShadow: '0 4px 16px rgba(37,99,235,0.4)' }}>
                Open App <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* SUBSCRIPTION */}
        {tab === 'subscription' && (
          <div className="space-y-6 max-w-3xl">
            <div className="card p-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5">Current Plan</p>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Crown className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg">{planName}</div>
                  {tenant.saas_plans && <div className="text-gray-500 text-sm">₹{tenant.saas_plans.price_monthly.toLocaleString('en-IN')}/month</div>}
                </div>
                <StatusBadge status={tenant.status} trialEndsAt={tenant.trial_ends_at} />
              </div>
              {tenant.status === 'active' && tenant.subscription_ends_at && (
                <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-emerald-700 text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  Active until <strong>{new Date(tenant.subscription_ends_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Upgrade Your Plan</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {plans.map(plan => {
                  const isCurrent = tenant.saas_plans?.name === plan.name && tenant.status === 'active';
                  const features = Array.isArray(plan.features) ? plan.features : PLAN_FEATURES[plan.slug] || [];
                  return (
                    <div key={plan.id} className={`card p-6 flex flex-col ${isCurrent ? 'border-primary-400 ring-2 ring-primary-500/20' : ''}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-gray-900 text-lg">{plan.name}</span>
                        {isCurrent && <span className="badge badge-blue">Current</span>}
                      </div>
                      <div className="flex items-end gap-1 mb-5">
                        <span className="text-gray-400 text-base font-bold leading-none">₹</span>
                        <span className="text-[2.5rem] font-black text-gray-900 leading-none">{plan.price_monthly.toLocaleString('en-IN')}</span>
                        <span className="text-gray-400 text-sm mb-1">/mo</span>
                      </div>
                      <ul className="space-y-2 mb-6 flex-1">
                        {features.map(f => (
                          <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                            <CheckCircle className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" /> {f}
                          </li>
                        ))}
                      </ul>
                      <div className="space-y-2">
                        {[{ months: 1, label: '1 Month', discount: 0 }, { months: 6, label: '6 Months', discount: 5 }, { months: 12, label: '12 Months', discount: 10 }].map(opt => {
                          const total = Math.round(plan.price_monthly * opt.months * (1 - opt.discount / 100));
                          const key = `${plan.id}-${opt.months}`;
                          return (
                            <button key={opt.months} onClick={() => handlePay(plan, opt.months)} disabled={!!payLoading}
                              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all disabled:opacity-50 ${isCurrent ? 'border-primary-200 bg-primary-50 hover:bg-primary-100 text-primary-700' : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'}`}>
                              <div className="flex items-center gap-2">
                                {payLoading === key ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <IndianRupee className="w-3.5 h-3.5" />}
                                <span className="font-semibold">{opt.label}</span>
                                {opt.discount > 0 && <span className="badge badge-green text-[10px] px-1.5 py-0.5">{opt.discount}% off</span>}
                              </div>
                              <span className="font-bold">₹{total.toLocaleString('en-IN')}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-500 flex items-start gap-3">
              <Shield className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
              <p>All payments processed securely via Razorpay. Card details never stored. <button onClick={() => setShowSupport(true)} className="text-primary-600 hover:underline font-semibold">Contact support</button> for help.</p>
            </div>
          </div>
        )}

        {/* TEAM */}
        {tab === 'team' && (
          <div className="max-w-4xl space-y-6">
            {teamStats && teamStats.totalStaff > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Staff', value: teamStats.totalStaff, icon: Users, color: 'text-primary-600 bg-primary-50' },
                    { label: 'Active', value: teamStats.activeStaff, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
                    { label: 'Present Today', value: teamStats.presentToday, icon: Clock, color: 'text-blue-600 bg-blue-50' },
                    { label: 'New Leads', value: teamStats.pendingLeads, icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
                  ].map(s => (
                    <div key={s.label} className="card p-5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                        <s.icon className="w-5 h-5" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {teamStats.pendingLeaves > 0 && (
                  <div className="card p-5 flex items-center gap-3 border-amber-200 bg-amber-50/50">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <p className="text-amber-800 text-sm font-medium">
                      {teamStats.pendingLeaves} leave request{teamStats.pendingLeaves > 1 ? 's' : ''} awaiting your approval
                    </p>
                  </div>
                )}

                <div className="card p-6">
                  <h3 className="font-bold text-gray-900 text-sm mb-4">Team by Role</h3>
                  <div className="space-y-3">
                    {Object.entries(teamStats.byRole).map(([role, count]) => (
                      <div key={role} className="flex items-center gap-3">
                        <span className="text-gray-600 text-sm capitalize w-32 shrink-0">{role.replace(/_/g, ' ')}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${(count / teamStats.totalStaff) * 100}%` }} />
                        </div>
                        <span className="text-gray-900 text-sm font-semibold w-6 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={goToApp}
                  className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-7 py-3.5 rounded-xl transition-all text-sm"
                  style={{ boxShadow: '0 4px 16px rgba(37,99,235,0.30)' }}>
                  Open Admin Panel <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="max-w-xl">
                <div className="card p-8 text-center">
                  <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <Users className="w-7 h-7 text-primary-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Add Your First Team Member</h3>
                  <p className="text-gray-500 text-sm mb-7 leading-relaxed">
                    Add staff, assign roles (Telecaller, Field Executive, Manager, HR, Employee), and manage permissions from the admin panel inside the app.
                  </p>
                  <button onClick={goToApp}
                    className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-7 py-3.5 rounded-xl transition-all text-sm"
                    style={{ boxShadow: '0 4px 16px rgba(37,99,235,0.30)' }}>
                    Open Admin Panel <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showSupport && tenant && <SupportModal tenant={tenant} onClose={() => setShowSupport(false)} />}

      <footer className="border-t border-gray-200 py-6 mt-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400 text-xs">
          Powered by <span className="text-gray-600 font-semibold">K² Adexos Global Technologies</span>
        </div>
      </footer>
    </div>
  );
}
