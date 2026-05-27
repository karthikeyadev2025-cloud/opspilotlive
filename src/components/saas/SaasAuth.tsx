import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Activity, Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle, Loader2, ArrowRight, Zap } from 'lucide-react';

function Logo() {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-blue flex-shrink-0">
        <Activity className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
      </div>
      <span className="text-xl font-black tracking-tight">
        <span className="text-gray-900">Ops</span>
        <span className="text-primary-600">Pilot</span>
      </span>
    </div>
  );
}

function generateSlug(companyName: string): string {
  return companyName.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-').slice(0, 40) + '-' + Math.random().toString(36).slice(2, 6);
}

interface SignupForm {
  companyName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  industry: string;
  password: string;
  confirmPassword: string;
  plan: 'starter' | 'business';
}

const INDUSTRIES = ['Security & Surveillance', 'Solar Energy', 'Field Services', 'IT & Technology', 'Real Estate', 'Insurance', 'Healthcare', 'Manufacturing', 'Retail & FMCG', 'Other'];

export default function SaasAuth({ mode: initialMode }: { mode: 'login' | 'signup' }) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [form, setForm] = useState<SignupForm>({
    companyName: '', ownerName: '', ownerEmail: '', ownerPhone: '',
    industry: '', password: '', confirmPassword: '', plan: 'starter',
  });

  const goHome = () => {
    window.location.hash = '';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
      if (authError) throw new Error(authError.message);
      const { data: sa } = await supabase.from('super_admins').select('id, is_active').eq('id', data.user!.id).maybeSingle();
      if (sa?.is_active) { window.location.hash = '#super-admin'; window.dispatchEvent(new HashChangeEvent('hashchange')); return; }
      const { data: tenant } = await supabase.from('tenants').select('id').eq('auth_user_id', data.user!.id).maybeSingle();
      if (tenant) { window.location.hash = '#tenant-dashboard'; window.dispatchEvent(new HashChangeEvent('hashchange')); }
      else { setError('No account found. Please sign up first.'); await supabase.auth.signOut(); }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (!form.industry) { setError('Please select your industry.'); return; }
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email: form.ownerEmail, password: form.password });
      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error('Signup failed. Please try again.');
      if (!authData.session) {
        setSuccess('Check your email to confirm your account, then sign in.');
        setLoading(false);
        return;
      }
      const { data: plans } = await supabase.from('saas_plans').select('id, slug').eq('slug', form.plan).maybeSingle();
      const slug = generateSlug(form.companyName);
      const { error: tenantError } = await supabase.from('tenants').insert({
        company_name: form.companyName, company_email: form.ownerEmail, company_phone: form.ownerPhone,
        industry: form.industry, owner_name: form.ownerName, owner_email: form.ownerEmail,
        owner_phone: form.ownerPhone, slug, status: 'trial', plan_id: plans?.id || null,
        auth_user_id: authData.user.id,
        trial_ends_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      });
      if (tenantError) throw new Error(tenantError.message);
      setSuccess('Account created! Your 3-day free trial has started. Redirecting...');
      setTimeout(() => { window.location.hash = '#tenant-dashboard'; window.dispatchEvent(new HashChangeEvent('hashchange')); }, 1500);
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-10 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #0a0f1e 0%, #0d1530 100%)' }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 0% 100%, rgba(37,99,235,0.2), transparent)' }} />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative">
          <div className="flex items-center gap-2.5 mb-16">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-blue flex-shrink-0">
              <Activity className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-black tracking-tight">
              <span className="text-white">Ops</span>
              <span className="text-primary-400">Pilot</span>
            </span>
          </div>

          <h2 className="text-3xl font-black text-white leading-tight mb-4">
            Manage your field<br />operations smarter
          </h2>
          <p className="text-white/60 text-sm leading-relaxed mb-10">
            Leads, attendance, telecalling, HR and analytics — all in one platform built for Indian businesses.
          </p>

          <div className="space-y-4">
            {[
              { icon: '🎯', label: 'Smart Lead CRM with auto follow-up' },
              { icon: '📍', label: 'GPS field tracking & selfie check-in' },
              { icon: '📊', label: 'Real-time analytics and reports' },
              { icon: '👥', label: 'Full HR — leaves, advances, payroll' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {item.icon}
                </div>
                <span className="text-white/75 text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white text-xs font-bold">3-Day Free Trial</p>
                <p className="text-white/50 text-[11px]">No credit card required</p>
              </div>
            </div>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex-1 h-1 bg-primary-500 rounded-full" style={{ opacity: 1 - i * 0.15 }} />
              ))}
            </div>
          </div>
          <p className="text-white/25 text-[11px] text-center mt-6">
            Powered by K² Adexos Global Technologies
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-[440px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-between mb-8">
            <Logo />
            <button onClick={goHome} className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" />Back
            </button>
          </div>

          {/* Desktop back link */}
          <div className="hidden lg:flex justify-end mb-8">
            <button onClick={goHome} className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" />Back to home
            </button>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-white border border-gray-200 rounded-xl p-1 mb-8 shadow-card">
            {(['login', 'signup'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setMode(t); setError(''); setSuccess(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  mode === t ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {t === 'login' ? 'Sign In' : 'Start Free Trial'}
              </button>
            ))}
          </div>

          {/* Header */}
          <div className="mb-7">
            <h1 className="text-2xl font-black text-gray-900 mb-1">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-gray-500 text-sm">
              {mode === 'login' ? 'Sign in to your OpsPilot workspace' : '3-day free trial · No credit card needed'}
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-emerald-700 text-sm">{success}</p>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="field-label">Email address</label>
                <input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="you@company.com" className="field-input" />
              </div>
              <div>
                <label className="field-label">Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Enter your password" className="field-input pr-10" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 text-[15px]"
                style={{ boxShadow: '0 4px 20px rgba(37,99,235,0.30)' }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
              <p className="text-center text-gray-500 text-sm">
                No account?{' '}
                <button type="button" onClick={() => setMode('signup')} className="text-primary-600 hover:text-primary-700 font-semibold">Start free trial</button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="field-label">Choose Your Plan</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['starter', 'business'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, plan: p }))}
                      className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all text-left ${
                        form.plan === p
                          ? 'bg-primary-50 border-primary-400 text-primary-700'
                          : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <span className="block text-xs text-gray-400 font-normal mb-0.5">{p === 'starter' ? 'Starter' : 'Business'}</span>
                      <span className="font-black text-gray-900">{p === 'starter' ? '₹999' : '₹2,499'}<span className="text-xs font-normal text-gray-400">/mo</span></span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">3-day free trial, then billed monthly</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="field-label">Company Name</label>
                  <input required value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} placeholder="Acme Corp" className="field-input" />
                </div>
                <div>
                  <label className="field-label">Your Full Name</label>
                  <input required value={form.ownerName} onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))} placeholder="Full name" className="field-input" />
                </div>
                <div>
                  <label className="field-label">Work Email</label>
                  <input type="email" required value={form.ownerEmail} onChange={e => setForm(f => ({ ...f, ownerEmail: e.target.value }))} placeholder="you@company.com" className="field-input" />
                </div>
                <div>
                  <label className="field-label">Phone Number</label>
                  <input type="tel" required value={form.ownerPhone} onChange={e => setForm(f => ({ ...f, ownerPhone: e.target.value }))} placeholder="+91 99999 99999" className="field-input" />
                </div>
                <div>
                  <label className="field-label">Industry</label>
                  <select value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} className="field-input appearance-none bg-white">
                    <option value="">Select your industry</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">Password</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min. 8 characters" className="field-input pr-10" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="field-label">Confirm Password</label>
                  <input type="password" required value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} placeholder="Repeat password" className="field-input" />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 text-[15px] mt-2"
                style={{ boxShadow: '0 4px 20px rgba(37,99,235,0.30)' }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {loading ? 'Creating account…' : 'Start 3-Day Free Trial'}
              </button>

              <p className="text-center text-gray-400 text-xs">
                By signing up, you agree to our{' '}
                <button type="button" onClick={() => { window.location.hash = '#terms'; window.dispatchEvent(new HashChangeEvent('hashchange')); }} className="text-primary-600 hover:underline">Terms of Service</button>
                {' '}and{' '}
                <button type="button" onClick={() => { window.location.hash = '#privacy'; window.dispatchEvent(new HashChangeEvent('hashchange')); }} className="text-primary-600 hover:underline">Privacy Policy</button>.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
