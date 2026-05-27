import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Activity, LogOut, Users, Building2, CreditCard, TrendingUp, Clock, CheckCircle, AlertTriangle, Search, RefreshCw, Crown, XCircle, Ban, X, Loader2, Download, BarChart3, Shield, Settings, ChevronRight, IndianRupee, Package, TicketCheck, Pencil, Save, FileText, Inbox, Palette } from 'lucide-react';
import ThemeManager from './ThemeManager';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Tenant {
  id: string;
  company_name: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  industry: string;
  status: string;
  trial_ends_at: string;
  subscription_starts_at: string | null;
  subscription_ends_at: string | null;
  notes: string;
  created_at: string;
  saas_plans: { name: string; price_monthly: number } | null;
}

interface Payment {
  id: string;
  tenant_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  amount: number;
  currency: string;
  months: number;
  status: string;
  created_at: string;
  tenants: { company_name: string; owner_email: string } | null;
  saas_plans: { name: string } | null;
}

interface SupportTicket {
  id: string;
  tenant_id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  admin_notes: string;
  created_at: string;
  updated_at: string;
  tenants: { company_name: string; owner_email: string } | null;
}

interface Plan {
  id: string;
  name: string;
  slug: string;
  price_monthly: number;
  features: string[];
  is_active: boolean;
}

interface Stats {
  total: number;
  trial: number;
  active: number;
  expired: number;
  suspended: number;
  mrr: number;
  totalRevenue: number;
  openTickets: number;
}

// ─── Small shared components ──────────────────────────────────────────────────

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0" style={{ boxShadow: '0 2px 10px rgba(37,99,235,0.4)' }}>
        <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
      </div>
      <div>
        <span className="text-base font-black">
          <span className="text-white">Ops</span>
          <span className="text-blue-400">Pilot</span>
        </span>
        <div className="text-[9px] text-slate-500 tracking-widest uppercase leading-none">Super Admin</div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    trial: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    expired: 'bg-red-500/10 text-red-400 border-red-500/20',
    suspended: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    open: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    in_progress: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    closed: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    captured: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    failed: 'bg-red-500/10 text-red-400 border-red-500/20',
    refunded: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-semibold capitalize ${map[status] || map.expired}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

function PriorityPill({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    low: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    normal: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    high: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    urgent: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-semibold capitalize ${map[priority] || map.normal}`}>
      {priority}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-slate-400 text-xs mt-0.5">{label}</div>
      {sub && <div className="text-slate-500 text-xs mt-1">{sub}</div>}
    </div>
  );
}

// ─── Tenant Detail Modal ───────────────────────────────────────────────────────

function TenantDetailModal({ tenant, onClose, onUpdate }: { tenant: Tenant; onClose: () => void; onUpdate: () => void }) {
  const [notes, setNotes] = useState(tenant.notes || '');
  const [status, setStatus] = useState(tenant.status);
  const [subEnd, setSubEnd] = useState(tenant.subscription_ends_at ? tenant.subscription_ends_at.split('T')[0] : '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const save = async () => {
    setSaving(true); setMsg('');
    const updates: Record<string, unknown> = { notes, status, updated_at: new Date().toISOString() };
    if (status === 'active' && subEnd) {
      updates.subscription_starts_at = new Date().toISOString();
      updates.subscription_ends_at = new Date(subEnd + 'T23:59:59Z').toISOString();
    }
    const { error } = await supabase.from('tenants').update(updates).eq('id', tenant.id);
    setSaving(false);
    if (error) { setMsg('Error: ' + error.message); return; }
    setMsg('Saved successfully.');
    onUpdate();
  };

  const extendTrial = async (days: number) => {
    setSaving(true);
    const newEnd = new Date(Math.max(Date.now(), new Date(tenant.trial_ends_at).getTime()) + days * 86400000);
    const { error } = await supabase.from('tenants').update({
      trial_ends_at: newEnd.toISOString(), status: 'trial', updated_at: new Date().toISOString(),
    }).eq('id', tenant.id);
    setSaving(false);
    if (!error) { setMsg(`Trial extended by ${days} day(s).`); onUpdate(); }
  };

  const exportTenantData = async () => {
    const [tenantsRes, paymentsRes] = await Promise.all([
      supabase.from('tenants').select('*').eq('id', tenant.id).single(),
      supabase.from('razorpay_payments').select('*').eq('tenant_id', tenant.id),
    ]);
    const data = {
      tenant: tenantsRes.data,
      payments: paymentsRes.data || [],
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `${tenant.company_name.replace(/\s+/g, '_')}_data.json`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <div>
            <h2 className="font-bold text-white">{tenant.company_name}</h2>
            <p className="text-slate-400 text-xs mt-0.5">{tenant.owner_email}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportTenantData} title="Export tenant data" className="text-slate-500 hover:text-cyan-400 transition-colors p-1.5 rounded-lg hover:bg-slate-800">
              <Download className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {msg && (
            <div className={`text-sm px-4 py-3 rounded-xl ${msg.startsWith('Error') ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{msg}</div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: 'Owner', value: tenant.owner_name },
              { label: 'Phone', value: tenant.owner_phone || '—' },
              { label: 'Industry', value: tenant.industry || '—' },
              { label: 'Plan', value: tenant.saas_plans?.name || 'No plan' },
              { label: 'Joined', value: new Date(tenant.created_at).toLocaleDateString('en-IN') },
              { label: 'Trial Ends', value: new Date(tenant.trial_ends_at).toLocaleDateString('en-IN') },
            ].map(item => (
              <div key={item.label} className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-slate-500 text-xs mb-0.5">{item.label}</div>
                <div className="text-white font-medium truncate">{item.value}</div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500">
              <option value="trial">Trial</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {status === 'active' && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Subscription End Date</label>
              <input type="date" value={subEnd} onChange={e => setSubEnd(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500" />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Extend Trial</label>
            <div className="flex gap-2">
              {[1, 3, 7, 14, 30].map(d => (
                <button key={d} onClick={() => extendTrial(d)} disabled={saving}
                  className="flex-1 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 py-2 rounded-lg transition-colors">
                  +{d}d
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Internal Notes</label>
            <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
              placeholder="Payment confirmed on..., Followed up..." />
          </div>

          <button onClick={save} disabled={saving}
            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Ticket Detail Modal ───────────────────────────────────────────────────────

function TicketModal({ ticket, onClose, onUpdate }: { ticket: SupportTicket; onClose: () => void; onUpdate: () => void }) {
  const [status, setStatus] = useState(ticket.status);
  const [adminNotes, setAdminNotes] = useState(ticket.admin_notes || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const save = async () => {
    setSaving(true); setMsg('');
    const updates: Record<string, unknown> = { status, admin_notes: adminNotes, updated_at: new Date().toISOString() };
    if (status === 'resolved') updates.resolved_at = new Date().toISOString();
    const { error } = await supabase.from('support_tickets').update(updates).eq('id', ticket.id);
    setSaving(false);
    if (error) { setMsg('Error: ' + error.message); return; }
    setMsg('Updated.'); onUpdate();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-800 sticky top-0 bg-slate-900">
          <div>
            <h2 className="font-bold text-white text-sm">{ticket.subject}</h2>
            <p className="text-slate-400 text-xs mt-0.5">{ticket.tenants?.company_name} · {new Date(ticket.created_at).toLocaleDateString('en-IN')}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          {msg && <div className="text-sm px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-400">{msg}</div>}
          <div className="bg-slate-800/50 rounded-xl p-4 text-sm text-slate-300 whitespace-pre-wrap">{ticket.message}</div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500">
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Priority</label>
              <div className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5">
                <PriorityPill priority={ticket.priority} />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Admin Notes / Reply</label>
            <textarea rows={4} value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
              placeholder="Your response or internal notes..." />
          </div>
          <button onClick={save} disabled={saving}
            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Update Ticket'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Plan Editor Modal ─────────────────────────────────────────────────────────

function PlanModal({ plan, onClose, onUpdate }: { plan: Plan; onClose: () => void; onUpdate: () => void }) {
  const [name, setName] = useState(plan.name);
  const [price, setPrice] = useState(String(plan.price_monthly));
  const [features, setFeatures] = useState((plan.features || []).join('\n'));
  const [isActive, setIsActive] = useState(plan.is_active);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const save = async () => {
    setSaving(true); setMsg('');
    const featureList = features.split('\n').map(f => f.trim()).filter(Boolean);
    const { error } = await supabase.from('saas_plans').update({
      name, price_monthly: parseFloat(price), features: featureList, is_active: isActive,
    }).eq('id', plan.id);
    setSaving(false);
    if (error) { setMsg('Error: ' + error.message); return; }
    setMsg('Plan updated.'); onUpdate();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h2 className="font-bold text-white">Edit Plan</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          {msg && <div className="text-sm px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-400">{msg}</div>}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Plan Name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Monthly Price (₹)</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Features (one per line)</label>
            <textarea rows={6} value={features} onChange={e => setFeatures(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none" />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => setIsActive(!isActive)}
              className={`w-10 h-6 rounded-full transition-colors relative ${isActive ? 'bg-cyan-500' : 'bg-slate-700'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isActive ? 'left-5' : 'left-1'}`} />
            </div>
            <span className="text-sm text-slate-300">Plan Active</span>
          </label>
          <button onClick={save} disabled={saving}
            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Plan'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

type Tab = 'tenants' | 'payments' | 'analytics' | 'plans' | 'tickets' | 'theme' | 'settings';

export default function SuperAdminPanel() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, trial: 0, active: 0, expired: 0, suspended: 0, mrr: 0, totalRevenue: 0, openTickets: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('tenants');

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [tenantsRes, paymentsRes, ticketsRes, plansRes] = await Promise.all([
        supabase.from('tenants').select('*, saas_plans(name, price_monthly)').order('created_at', { ascending: false }),
        supabase.from('razorpay_payments').select('*, tenants(company_name, owner_email), saas_plans(name)').order('created_at', { ascending: false }).limit(200),
        supabase.from('support_tickets').select('*, tenants(company_name, owner_email)').order('created_at', { ascending: false }),
        supabase.from('saas_plans').select('*').order('price_monthly'),
      ]);

      const tList = (tenantsRes.data || []) as Tenant[];
      const pList = (paymentsRes.data || []) as Payment[];
      const tkList = (ticketsRes.data || []) as SupportTicket[];
      const plList = (plansRes.data || []) as Plan[];

      setTenants(tList);
      setPayments(pList);
      setTickets(tkList);
      setPlans(plList);

      const s: Stats = { total: tList.length, trial: 0, active: 0, expired: 0, suspended: 0, mrr: 0, totalRevenue: 0, openTickets: 0 };
      tList.forEach(t => {
        if (t.status === 'trial') s.trial++;
        if (t.status === 'active') { s.active++; s.mrr += t.saas_plans?.price_monthly || 0; }
        if (t.status === 'expired') s.expired++;
        if (t.status === 'suspended') s.suspended++;
      });
      pList.forEach(p => { if (p.status === 'captured') s.totalRevenue += p.amount / 100; });
      s.openTickets = tkList.filter(t => t.status === 'open' || t.status === 'in_progress').length;

      setStats(s);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.hash = '';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  };

  const filteredTenants = tenants.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.company_name.toLowerCase().includes(q) || t.owner_email.toLowerCase().includes(q) || t.owner_name.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const exportAllCSV = () => {
    const rows = [
      ['Company', 'Owner', 'Email', 'Phone', 'Industry', 'Plan', 'Status', 'MRR', 'Joined', 'Trial Ends', 'Sub End'].join(','),
      ...filteredTenants.map(t => [
        `"${t.company_name}"`, `"${t.owner_name}"`, t.owner_email, t.owner_phone || '',
        `"${t.industry}"`, t.saas_plans?.name || '', t.status,
        t.status === 'active' ? (t.saas_plans?.price_monthly || 0) : 0,
        new Date(t.created_at).toLocaleDateString('en-IN'),
        new Date(t.trial_ends_at).toLocaleDateString('en-IN'),
        t.subscription_ends_at ? new Date(t.subscription_ends_at).toLocaleDateString('en-IN') : '',
      ].join(',')),
    ].join('\n');
    const blob = new Blob([rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'fieldpulse-tenants.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const exportPaymentsCSV = () => {
    const rows = [
      ['Date', 'Company', 'Email', 'Plan', 'Amount', 'Months', 'Status', 'Razorpay Order', 'Razorpay Payment'].join(','),
      ...payments.map(p => [
        new Date(p.created_at).toLocaleDateString('en-IN'),
        `"${p.tenants?.company_name || ''}"`,
        p.tenants?.owner_email || '',
        p.saas_plans?.name || '',
        p.amount / 100,
        p.months,
        p.status,
        p.razorpay_order_id,
        p.razorpay_payment_id,
      ].join(',')),
    ].join('\n');
    const blob = new Blob([rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'fieldpulse-payments.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const TABS: { id: Tab; label: string; icon: any; badge?: number }[] = [
    { id: 'tenants', label: 'Tenants', icon: Building2 },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'plans', label: 'Plans', icon: Package },
    { id: 'tickets', label: 'Support', icon: TicketCheck, badge: stats.openTickets },
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <button onClick={loadAll} className="text-slate-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={handleSignOut} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white mb-1">Super Admin Console</h1>
          <p className="text-slate-400 text-sm">Manage all FieldPulse tenants, payments, and platform settings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
          <StatCard icon={Building2} label="Total" value={stats.total} color="bg-blue-400/10 text-blue-400" />
          <StatCard icon={Clock} label="Trial" value={stats.trial} color="bg-amber-400/10 text-amber-400" />
          <StatCard icon={CheckCircle} label="Active" value={stats.active} color="bg-emerald-400/10 text-emerald-400" />
          <StatCard icon={XCircle} label="Expired" value={stats.expired} color="bg-red-400/10 text-red-400" />
          <StatCard icon={Ban} label="Suspended" value={stats.suspended} color="bg-slate-400/10 text-slate-400" />
          <StatCard icon={TrendingUp} label="MRR" value={`₹${stats.mrr.toLocaleString('en-IN')}`} color="bg-cyan-400/10 text-cyan-400" />
          <StatCard icon={IndianRupee} label="Total Rev." value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`} color="bg-green-400/10 text-green-400" />
          <StatCard icon={TicketCheck} label="Open Tickets" value={stats.openTickets} color="bg-rose-400/10 text-rose-400" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-800/50 rounded-xl p-1 mb-6 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all relative ${activeTab === tab.id ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.badge ? (
                <span className="ml-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{tab.badge > 9 ? '9+' : tab.badge}</span>
              ) : null}
            </button>
          ))}
        </div>

        {/* ── TENANTS TAB ─────────────────────────────────────────────────── */}
        {activeTab === 'tenants' && (
          <>
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search company, email, name..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500" />
              </div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 w-full sm:w-40">
                <option value="all">All Status</option>
                <option value="trial">Trial</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="suspended">Suspended</option>
              </select>
              <button onClick={exportAllCSV}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap">
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-cyan-500 animate-spin" /></div>
            ) : filteredTenants.length === 0 ? (
              <div className="text-center py-20">
                <Building2 className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500">No tenants found</p>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-800/30">
                        {['Company', 'Plan', 'Status', 'Trial End', 'Sub End', 'MRR', 'Joined', ''].map(h => (
                          <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTenants.map((t, i) => (
                        <tr key={t.id} className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${i === filteredTenants.length - 1 ? 'border-b-0' : ''}`}>
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-white">{t.company_name}</div>
                            <div className="text-slate-500 text-xs mt-0.5">{t.owner_email}</div>
                          </td>
                          <td className="px-4 py-3.5 text-slate-300">{t.saas_plans?.name || '—'}</td>
                          <td className="px-4 py-3.5"><StatusPill status={t.status} /></td>
                          <td className="px-4 py-3.5 text-slate-400 text-xs">{new Date(t.trial_ends_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                          <td className="px-4 py-3.5 text-slate-400 text-xs">{t.subscription_ends_at ? new Date(t.subscription_ends_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}</td>
                          <td className="px-4 py-3.5 text-slate-300 text-xs font-semibold">
                            {t.status === 'active' ? `₹${(t.saas_plans?.price_monthly || 0).toLocaleString('en-IN')}` : '—'}
                          </td>
                          <td className="px-4 py-3.5 text-slate-400 text-xs">{new Date(t.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</td>
                          <td className="px-4 py-3.5">
                            <button onClick={() => setSelectedTenant(t)}
                              className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                              Manage <ChevronRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 border-t border-slate-800 text-slate-500 text-xs flex items-center justify-between">
                  <span>Showing {filteredTenants.length} of {tenants.length} tenants</span>
                  <span className="text-emerald-400 font-semibold">{stats.active} paying · ₹{stats.mrr.toLocaleString('en-IN')}/mo</span>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── PAYMENTS TAB ────────────────────────────────────────────────── */}
        {activeTab === 'payments' && (
          <>
            <div className="flex justify-between items-center mb-5">
              <div>
                <div className="text-white font-bold">Payment History</div>
                <div className="text-slate-500 text-xs mt-0.5">{payments.length} transactions · ₹{stats.totalRevenue.toLocaleString('en-IN')} total collected</div>
              </div>
              <button onClick={exportPaymentsCSV}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm px-4 py-2.5 rounded-xl transition-colors">
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>

            {payments.length === 0 ? (
              <div className="text-center py-20">
                <CreditCard className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500">No payments yet</p>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-800/30">
                        {['Date', 'Company', 'Plan', 'Amount', 'Months', 'Status', 'Razorpay ID'].map(h => (
                          <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p, i) => (
                        <tr key={p.id} className={`border-b border-slate-800/50 hover:bg-slate-800/20 ${i === payments.length - 1 ? 'border-b-0' : ''}`}>
                          <td className="px-4 py-3.5 text-slate-400 text-xs">{new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</td>
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-white text-xs">{p.tenants?.company_name || '—'}</div>
                            <div className="text-slate-500 text-xs">{p.tenants?.owner_email}</div>
                          </td>
                          <td className="px-4 py-3.5 text-slate-300 text-xs">{p.saas_plans?.name || '—'}</td>
                          <td className="px-4 py-3.5 font-bold text-emerald-400">₹{(p.amount / 100).toLocaleString('en-IN')}</td>
                          <td className="px-4 py-3.5 text-slate-400 text-xs">{p.months}mo</td>
                          <td className="px-4 py-3.5"><StatusPill status={p.status} /></td>
                          <td className="px-4 py-3.5 text-slate-500 font-mono text-xs truncate max-w-[120px]">{p.razorpay_payment_id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── ANALYTICS TAB ───────────────────────────────────────────────── */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="font-bold text-white mb-5">Tenant Status Breakdown</h3>
              <div className="space-y-3">
                {[
                  { label: 'Trial', count: stats.trial, color: 'bg-amber-500', pct: stats.total ? (stats.trial / stats.total) * 100 : 0 },
                  { label: 'Active', count: stats.active, color: 'bg-emerald-500', pct: stats.total ? (stats.active / stats.total) * 100 : 0 },
                  { label: 'Expired', count: stats.expired, color: 'bg-red-500', pct: stats.total ? (stats.expired / stats.total) * 100 : 0 },
                  { label: 'Suspended', count: stats.suspended, color: 'bg-slate-500', pct: stats.total ? (stats.suspended / stats.total) * 100 : 0 },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-400 text-xs">{item.label}</span>
                      <span className="text-white text-xs font-semibold">{item.count} ({item.pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="font-bold text-white mb-5">Revenue Metrics</h3>
              <div className="space-y-3">
                {[
                  { label: 'Monthly Recurring Revenue', value: `₹${stats.mrr.toLocaleString('en-IN')}`, color: 'text-cyan-400' },
                  { label: 'Annual Run Rate (ARR)', value: `₹${(stats.mrr * 12).toLocaleString('en-IN')}`, color: 'text-emerald-400' },
                  { label: 'Total Revenue Collected', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, color: 'text-green-400' },
                  { label: 'Trial → Paid Conversion', value: `${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%`, color: 'text-amber-400' },
                  { label: 'Avg Revenue per Account', value: stats.active > 0 ? `₹${Math.round(stats.mrr / stats.active).toLocaleString('en-IN')}` : '—', color: 'text-blue-400' },
                ].map(m => (
                  <div key={m.label} className="flex items-center justify-between bg-slate-800/50 rounded-xl px-4 py-3">
                    <span className="text-slate-400 text-sm">{m.label}</span>
                    <span className={`font-bold text-lg ${m.color}`}>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="font-bold text-white mb-4">Plan Distribution</h3>
              {plans.map(plan => {
                const count = tenants.filter(t => t.saas_plans?.name === plan.name && t.status === 'active').length;
                return (
                  <div key={plan.id} className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
                    <div>
                      <div className="font-semibold text-white text-sm">{plan.name}</div>
                      <div className="text-slate-500 text-xs">₹{plan.price_monthly.toLocaleString('en-IN')}/mo</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white">{count}</div>
                      <div className="text-emerald-400 text-xs">₹{(count * plan.price_monthly).toLocaleString('en-IN')}/mo</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="font-bold text-white mb-4">Recent Sign-ups</h3>
              {tenants.slice(0, 6).map(t => (
                <div key={t.id} className="flex items-center justify-between py-2.5 border-b border-slate-800 last:border-0">
                  <div>
                    <div className="font-semibold text-white text-sm">{t.company_name}</div>
                    <div className="text-slate-500 text-xs">{t.industry}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill status={t.status} />
                    <span className="text-slate-500 text-xs">{new Date(t.created_at).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PLANS TAB ───────────────────────────────────────────────────── */}
        {activeTab === 'plans' && (
          <>
            <div className="mb-5">
              <div className="text-white font-bold">Subscription Plans</div>
              <div className="text-slate-500 text-xs mt-0.5">Edit plan names, pricing, and features</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {plans.map(plan => (
                <div key={plan.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-bold text-white">{plan.name}</div>
                      <div className="text-2xl font-black text-white mt-1">₹{plan.price_monthly.toLocaleString('en-IN')}<span className="text-sm text-slate-400 font-normal">/mo</span></div>
                    </div>
                    <div className="flex items-center gap-2">
                      {plan.is_active
                        ? <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-semibold">Active</span>
                        : <span className="text-xs bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2 py-0.5 rounded-md font-semibold">Inactive</span>
                      }
                    </div>
                  </div>
                  <ul className="space-y-1.5 mb-4">
                    {(plan.features || []).map(f => (
                      <li key={f} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-500">
                    <span>{tenants.filter(t => t.saas_plans?.name === plan.name && t.status === 'active').length} active tenants</span>
                    <button onClick={() => setSelectedPlan(plan)}
                      className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors font-semibold">
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── SUPPORT TICKETS TAB ─────────────────────────────────────────── */}
        {activeTab === 'tickets' && (
          <>
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="text-white font-bold flex-1">
                Support Tickets
                {stats.openTickets > 0 && (
                  <span className="ml-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold px-2 py-0.5 rounded-md">{stats.openTickets} open</span>
                )}
              </div>
            </div>

            {tickets.length === 0 ? (
              <div className="text-center py-20">
                <Inbox className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500">No support tickets yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map(ticket => (
                  <div key={ticket.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 cursor-pointer transition-all hover:-translate-y-0.5"
                    onClick={() => setSelectedTicket(ticket)}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold text-white text-sm">{ticket.subject}</span>
                          <StatusPill status={ticket.status} />
                          <PriorityPill priority={ticket.priority} />
                        </div>
                        <div className="text-slate-500 text-xs mb-2">{ticket.tenants?.company_name} · {ticket.tenants?.owner_email}</div>
                        <p className="text-slate-400 text-xs line-clamp-2">{ticket.message}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-slate-500 text-xs">{new Date(ticket.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                        <ChevronRight className="w-4 h-4 text-slate-600 mt-2 ml-auto" />
                      </div>
                    </div>
                    {ticket.admin_notes && (
                      <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-500">
                        <span className="text-slate-600 font-semibold">Admin: </span>{ticket.admin_notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── THEME TAB ───────────────────────────────────────────────────── */}
        {activeTab === 'theme' && <ThemeManager />}

        {/* ── SETTINGS TAB ────────────────────────────────────────────────── */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-cyan-400" /> Platform Info</h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Platform', value: 'FieldPulse SaaS' },
                  { label: 'Powered By', value: 'K² Adexos Global Technologies' },
                  { label: 'Total Tenants', value: stats.total },
                  { label: 'Active Subscriptions', value: stats.active },
                  { label: 'MRR', value: `₹${stats.mrr.toLocaleString('en-IN')}` },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between bg-slate-800/50 rounded-xl px-4 py-3">
                    <span className="text-slate-400">{item.label}</span>
                    <span className="text-white font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4 text-cyan-400" /> Razorpay Integration</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-emerald-300 text-sm">Razorpay Edge Function deployed and active</span>
                </div>
                <div className="text-slate-400 text-xs space-y-1">
                  <p>• <span className="text-slate-300 font-mono">POST /razorpay/create-order</span> — Creates payment order</p>
                  <p>• <span className="text-slate-300 font-mono">POST /razorpay/verify-payment</span> — Verifies & activates subscription</p>
                  <p>• <span className="text-slate-300 font-mono">POST /razorpay/webhook</span> — Handles Razorpay webhooks</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-amber-300 text-xs">
                  Set <span className="font-mono font-bold">RAZORPAY_KEY_ID</span>, <span className="font-mono font-bold">RAZORPAY_KEY_SECRET</span>, and <span className="font-mono font-bold">RAZORPAY_WEBHOOK_SECRET</span> in Supabase Edge Function secrets to go live.
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Download className="w-4 h-4 text-cyan-400" /> Data Export</h3>
              <div className="space-y-3">
                <button onClick={exportAllCSV}
                  className="w-full flex items-center justify-between bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl px-4 py-3 transition-colors group">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <div className="text-left">
                      <div className="text-white text-sm font-semibold">All Tenants (CSV)</div>
                      <div className="text-slate-500 text-xs">{tenants.length} records</div>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </button>
                <button onClick={exportPaymentsCSV}
                  className="w-full flex items-center justify-between bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl px-4 py-3 transition-colors group">
                  <div className="flex items-center gap-3">
                    <IndianRupee className="w-4 h-4 text-slate-400" />
                    <div className="text-left">
                      <div className="text-white text-sm font-semibold">All Payments (CSV)</div>
                      <div className="text-slate-500 text-xs">{payments.length} transactions · ₹{stats.totalRevenue.toLocaleString('en-IN')} total</div>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedTenant && (
        <TenantDetailModal
          tenant={selectedTenant}
          onClose={() => setSelectedTenant(null)}
          onUpdate={() => { loadAll(); setSelectedTenant(null); }}
        />
      )}
      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={() => { loadAll(); setSelectedTicket(null); }}
        />
      )}
      {selectedPlan && (
        <PlanModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onUpdate={() => { loadAll(); setSelectedPlan(null); }}
        />
      )}

      <footer className="border-t border-slate-800 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-600 text-xs">
          Powered by <span className="text-slate-500 font-semibold">K<sup>2</sup> Adexos Global Technologies</span>
        </div>
      </footer>
    </div>
  );
}
