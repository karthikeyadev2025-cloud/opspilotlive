import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, AlertCircle, Briefcase, Users, Phone, HeartHandshake, MapPin, Clock, Activity } from 'lucide-react';

export default function UnifiedLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const [now, setNow] = useState(new Date());
  const [location, setLocation] = useState('Detecting location…');

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const data = await res.json();
          const addr = data.address;
          const parts = [addr?.suburb || addr?.neighbourhood, addr?.city || addr?.town || addr?.village].filter(Boolean);
          setLocation(parts.join(', ') || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        } catch {
          setLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
      },
      () => setLocation('Location unavailable'),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) setError(error);
    setLoading(false);
  }

  const ROLES = [
    { label: 'Admin',      icon: Lock },
    { label: 'Manager',    icon: Briefcase },
    { label: 'HR',         icon: HeartHandshake },
    { label: 'Executive',  icon: Users },
    { label: 'Telecaller', icon: Phone },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #0a0f1e 0%, #0d1530 100%)' }}>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(37,99,235,0.18), transparent)' }} />
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full blur-3xl" style={{ background: 'rgba(37,99,235,0.08)' }} />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full blur-3xl" style={{ background: 'rgba(255,255,255,0.03)' }} />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl mb-5" style={{ boxShadow: '0 4px 20px rgba(37,99,235,0.40)' }}>
            <Activity className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-black text-white mb-1 tracking-tight">OpsPilot</h1>
          <p className="text-white/50 text-sm">Staff Portal — Sign in to continue</p>
        </div>

        {/* Location/time bar */}
        <div className="rounded-xl px-4 py-2.5 mb-5 flex items-center justify-between gap-3" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-primary-400 shrink-0" />
            <span className="text-xs text-white/50 truncate">{location}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Clock className="w-3.5 h-3.5 text-primary-400" />
            <span className="text-xs font-mono font-semibold tabular-nums text-white/70">
              {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-modal p-7">
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="field-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="field-input pl-10"
                  required autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="field-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="field-input pl-10"
                  required autoComplete="current-password"
                />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all text-[15px]"
              style={{ boxShadow: '0 4px 20px rgba(37,99,235,0.35)' }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-3">Portal access available for:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {ROLES.map(({ label, icon: Icon }) => (
                <span key={label} className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 font-medium">
                  <Icon className="w-3 h-3" />{label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <a href="/" className="text-sm text-white/30 hover:text-white/60 transition-colors">
            ← Back to website
          </a>
        </div>
      </div>
    </div>
  );
}
