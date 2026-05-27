import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Users, TrendingUp, Phone, UserCheck, AlertCircle,
  ArrowUp, Clock, CheckCircle, BarChart2, Activity,
  Calendar, RefreshCw, X
} from 'lucide-react';

interface Stats {
  totalLeads: number;
  newLeads: number;
  interestedLeads: number;
  convertedLeads: number;
  unassignedLeads: number;
  dueCallbacks: number;
  totalUsers: number;
  executives: number;
  telecallers: number;
  managers: number;
  hr: number;
  employees: number;
  recentLeads: any[];
  leadsByStatus: Record<string, number>;
  leadsByRequirement: Record<string, number>;
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500',
  called: 'bg-yellow-500',
  interested: 'bg-green-500',
  not_interested: 'bg-red-500',
  converted: 'bg-emerald-500',
  callback: 'bg-orange-500',
};

const STATUS_BADGE_COLORS: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  called: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  interested: 'bg-green-500/20 text-green-400 border border-green-500/30',
  not_interested: 'bg-red-500/20 text-red-400 border border-red-500/30',
  converted: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  callback: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
};
const STATUS_LABELS: Record<string, string> = {
  new: 'New', called: 'Called', interested: 'Interested',
  not_interested: 'Not Interested', converted: 'Converted', callback: 'Callback',
};

export default function DashboardOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => { loadStats(); }, [dateFrom, dateTo]);

  async function loadStats() {
    setLoading(true);

    let leadsQuery = supabase.from('marketing_leads').select('status, requirement, callback_date, assigned_to, created_at');
    if (dateFrom) leadsQuery = leadsQuery.gte('created_at', dateFrom + 'T00:00:00');
    if (dateTo) leadsQuery = leadsQuery.lte('created_at', dateTo + 'T23:59:59');

    let recentQuery = supabase.from('marketing_leads').select('*').order('created_at', { ascending: false }).limit(5);
    if (dateFrom) recentQuery = recentQuery.gte('created_at', dateFrom + 'T00:00:00');
    if (dateTo) recentQuery = recentQuery.lte('created_at', dateTo + 'T23:59:59');

    const [leadsRes, usersRes, recentRes] = await Promise.all([
      leadsQuery,
      supabase.from('app_users').select('role, is_active'),
      recentQuery,
    ]);

    const leads = leadsRes.data || [];
    const users = usersRes.data || [];
    const now = new Date();

    const leadsByStatus: Record<string, number> = {};
    const leadsByRequirement: Record<string, number> = {};

    leads.forEach(l => {
      leadsByStatus[l.status] = (leadsByStatus[l.status] || 0) + 1;
      if (l.requirement) {
        const short = l.requirement.split(' ').slice(0, 2).join(' ');
        leadsByRequirement[short] = (leadsByRequirement[short] || 0) + 1;
      }
    });

    setStats({
      totalLeads: leads.length,
      newLeads: leads.filter(l => l.status === 'new').length,
      interestedLeads: leads.filter(l => l.status === 'interested').length,
      convertedLeads: leads.filter(l => l.status === 'converted').length,
      unassignedLeads: leads.filter(l => !l.assigned_to).length,
      dueCallbacks: leads.filter(l => l.callback_date && new Date(l.callback_date) <= now).length,
      totalUsers: users.length,
      executives: users.filter(u => u.role === 'marketing_executive').length,
      telecallers: users.filter(u => u.role === 'telecaller').length,
      managers: users.filter(u => u.role === 'manager').length,
      hr: users.filter(u => u.role === 'hr').length,
      employees: users.filter(u => u.role === 'employee').length,
      recentLeads: recentRes.data || [],
      leadsByStatus,
      leadsByRequirement,
    });
    setLastRefresh(new Date());
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  const maxStatusCount = Math.max(...Object.values(stats.leadsByStatus), 1);
  const maxReqCount = Math.max(...Object.values(stats.leadsByRequirement), 1);
  const conversionRate = stats.totalLeads > 0 ? Math.round((stats.convertedLeads / stats.totalLeads) * 100) : 0;

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Dashboard</h2>
          <p className="text-slate-400 text-sm mt-1">Real-time overview of your operations</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="text-slate-500 text-xs">From</span>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="bg-transparent text-white text-sm focus:outline-none" />
          </div>
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
            <span className="text-slate-500 text-xs">To</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="bg-transparent text-white text-sm focus:outline-none" />
          </div>
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(''); setDateTo(''); }}
              className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-400 rounded-xl transition-colors" title="Clear date filter">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={loadStats}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors text-sm border border-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>
      {(dateFrom || dateTo) && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-sm">
          <Calendar className="w-4 h-4" />
          Filtered: {dateFrom ? new Date(dateFrom).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'All time'} — {dateTo ? new Date(dateTo).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today'}
        </div>
      )}

      {stats.dueCallbacks > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
          <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-red-400 font-semibold">{stats.dueCallbacks} Callback{stats.dueCallbacks > 1 ? 's' : ''} Due</p>
            <p className="text-red-400/70 text-sm">Assign these leads to telecallers for immediate follow-up</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: stats.totalLeads, icon: BarChart2, color: 'text-white', bg: 'bg-slate-700/60', iconColor: 'text-amber-400' },
          { label: 'New Leads', value: stats.newLeads, icon: ArrowUp, color: 'text-blue-400', bg: 'bg-blue-500/10', iconColor: 'text-blue-400' },
          { label: 'Interested', value: stats.interestedLeads, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10', iconColor: 'text-green-400' },
          { label: 'Converted', value: stats.convertedLeads, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', iconColor: 'text-emerald-400' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`${s.bg} border border-slate-700 rounded-2xl p-5`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-slate-400 text-sm">{s.label}</p>
                <Icon className={`w-5 h-5 ${s.iconColor}`} />
              </div>
              <p className={`text-4xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-orange-400" />
            <p className="text-slate-300 font-medium">Unassigned</p>
          </div>
          <p className="text-4xl font-bold text-orange-400">{stats.unassignedLeads}</p>
          <p className="text-slate-500 text-xs mt-1">Leads without telecaller</p>
        </div>
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-red-400" />
            <p className="text-slate-300 font-medium">Due Callbacks</p>
          </div>
          <p className="text-4xl font-bold text-red-400">{stats.dueCallbacks}</p>
          <p className="text-slate-500 text-xs mt-1">Need immediate attention</p>
        </div>
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <p className="text-slate-300 font-medium">Conversion Rate</p>
          </div>
          <p className="text-4xl font-bold text-amber-400">{conversionRate}%</p>
          <p className="text-slate-500 text-xs mt-1">Leads converted</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-amber-400" />
            <p className="text-slate-300 font-medium">Total Staff</p>
          </div>
          <p className="text-4xl font-bold text-white">{stats.totalUsers}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
            <span className="text-xs text-blue-400">{stats.executives} Exec.</span>
            <span className="text-xs text-green-400">{stats.telecallers} Caller</span>
            <span className="text-xs text-orange-400">{stats.managers} Mgr.</span>
            <span className="text-xs text-rose-400">{stats.hr} HR</span>
            <span className="text-xs text-teal-400">{stats.employees} Emp.</span>
          </div>
        </div>
        <div className="md:col-span-2 bg-slate-800/60 border border-slate-700 rounded-2xl p-5">
          <p className="text-slate-300 font-medium mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            Leads by Status
          </p>
          <div className="space-y-3">
            {Object.entries(stats.leadsByStatus).sort((a, b) => b[1] - a[1]).map(([status, count]) => (
              <div key={status}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400">{STATUS_LABELS[status] || status}</span>
                  <span className="text-xs text-white font-medium">{count}</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${STATUS_COLORS[status] || 'bg-slate-500'}`}
                    style={{ width: `${(count / maxStatusCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5">
          <p className="text-slate-300 font-medium mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-amber-400" />
            Leads by Requirement
          </p>
          <div className="space-y-3">
            {Object.entries(stats.leadsByRequirement).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([req, count]) => (
              <div key={req}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400">{req}</span>
                  <span className="text-xs text-white font-medium">{count}</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all"
                    style={{ width: `${(count / maxReqCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5">
          <p className="text-slate-300 font-medium mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            Recent Leads
          </p>
          <div className="space-y-3">
            {stats.recentLeads.length === 0 ? (
              <p className="text-slate-500 text-sm">No leads yet</p>
            ) : stats.recentLeads.map(lead => (
              <div key={lead.id} className="flex items-start justify-between">
                <div>
                  <p className="text-white text-sm font-medium">{lead.full_name}</p>
                  <p className="text-slate-500 text-xs">{lead.contact_number} · {lead.location}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_BADGE_COLORS[lead.status] || 'bg-slate-700 text-slate-400 border border-slate-600'}`}>
                    {STATUS_LABELS[lead.status] || lead.status}
                  </span>
                  <p className="text-slate-600 text-xs mt-0.5">
                    {new Date(lead.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-600 text-right">Last updated: {lastRefresh.toLocaleTimeString()}</p>
    </div>
  );
}
