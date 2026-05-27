import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Shield, LogIn, LogOut, AlertTriangle, RefreshCw, Search,
  Monitor, Smartphone, Tablet, Clock, User, Filter, Eye,
  X, Download, ChevronDown, CheckCircle, XCircle, Ban
} from 'lucide-react';

interface LoginLog {
  id: string;
  user_id: string | null;
  email: string;
  full_name: string;
  role: string;
  event_type: 'login_success' | 'login_failed' | 'logout' | 'session_expired' | 'account_disabled';
  user_agent: string;
  device_info: string;
  location_hint: string;
  failure_reason: string;
  session_id: string;
  created_at: string;
}

interface DataAccessLog {
  id: string;
  user_id: string | null;
  user_email: string;
  user_role: string;
  action: string;
  table_name: string;
  record_count: number;
  filters_applied: string;
  notes: string;
  created_at: string;
}

interface Stats {
  totalLogins: number;
  failedLogins: number;
  uniqueUsers: number;
  todayLogins: number;
  suspiciousCount: number;
}

const EVENT_CONFIG = {
  login_success: { label: 'Login', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  login_failed: { label: 'Failed Login', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  logout: { label: 'Logout', icon: LogOut, color: 'text-slate-400', bg: 'bg-slate-700/30 border-slate-600/30' },
  session_expired: { label: 'Session Expired', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  account_disabled: { label: 'Account Blocked', icon: Ban, color: 'text-red-500', bg: 'bg-red-600/10 border-red-600/20' },
};

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-amber-500/20 text-amber-400',
  marketing_executive: 'bg-blue-500/20 text-blue-400',
  telecaller: 'bg-green-500/20 text-green-400',
  manager: 'bg-orange-500/20 text-orange-400',
  hr: 'bg-rose-500/20 text-rose-400',
};

function DeviceIcon({ device }: { device: string }) {
  if (/Mobile/.test(device)) return <Smartphone className="w-3.5 h-3.5 text-slate-400" />;
  if (/Tablet/.test(device)) return <Tablet className="w-3.5 h-3.5 text-slate-400" />;
  return <Monitor className="w-3.5 h-3.5 text-slate-400" />;
}

export default function SecurityLogs() {
  const [activeTab, setActiveTab] = useState<'logins' | 'data_access'>('logins');
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [dataLogs, setDataLogs] = useState<DataAccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<LoginLog | null>(null);
  const [stats, setStats] = useState<Stats>({ totalLogins: 0, failedLogins: 0, uniqueUsers: 0, todayLogins: 0, suspiciousCount: 0 });

  const loadLogs = useCallback(async () => {
    setLoading(true);
    const today = new Date().toISOString().slice(0, 10);
    const [loginRes, dataRes] = await Promise.all([
      supabase.from('login_logs').select('*').order('created_at', { ascending: false }).limit(500),
      supabase.from('data_access_logs').select('*').order('created_at', { ascending: false }).limit(200),
    ]);
    const logs = (loginRes.data || []) as LoginLog[];
    setLoginLogs(logs);
    setDataLogs((dataRes.data || []) as DataAccessLog[]);

    const todayLogs = logs.filter(l => l.created_at.startsWith(today));
    const failedLogs = logs.filter(l => l.event_type === 'login_failed');
    const uniqueEmails = new Set(logs.filter(l => l.event_type === 'login_success').map(l => l.email));

    const suspicious: string[] = [];
    const failsByEmail: Record<string, number> = {};
    failedLogs.forEach(l => { failsByEmail[l.email] = (failsByEmail[l.email] || 0) + 1; });
    Object.entries(failsByEmail).forEach(([email, count]) => { if (count >= 3) suspicious.push(email); });

    setStats({
      totalLogins: logs.filter(l => l.event_type === 'login_success').length,
      failedLogins: failedLogs.length,
      uniqueUsers: uniqueEmails.size,
      todayLogins: todayLogs.filter(l => l.event_type === 'login_success').length,
      suspiciousCount: suspicious.length,
    });
    setLoading(false);
  }, []);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const filteredLogins = loginLogs.filter(l => {
    const matchSearch = !search || l.email.toLowerCase().includes(search.toLowerCase()) || l.full_name.toLowerCase().includes(search.toLowerCase());
    const matchEvent = eventFilter === 'all' || l.event_type === eventFilter;
    return matchSearch && matchEvent;
  });

  const filteredData = dataLogs.filter(l =>
    !search || l.user_email.toLowerCase().includes(search.toLowerCase()) || l.action.toLowerCase().includes(search.toLowerCase())
  );

  function formatTime(iso: string) {
    return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
  }

  function timeAgo(iso: string) {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return `${Math.round(diff)}s ago`;
    if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
    return `${Math.round(diff / 86400)}d ago`;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-xl">Security Logs</h2>
            <p className="text-slate-500 text-xs">Monitor all logins, logouts, and data access</p>
          </div>
        </div>
        <button onClick={loadLogs} className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Logins', value: stats.totalLogins, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Today Logins', value: stats.todayLogins, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Failed Attempts', value: stats.failedLogins, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'Active Users', value: stats.uniqueUsers, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Suspicious IPs', value: stats.suspiciousCount, color: 'text-rose-400', bg: stats.suspiciousCount > 0 ? 'bg-rose-600/20 border border-rose-500/30' : 'bg-slate-800' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-slate-400 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex bg-slate-800 rounded-xl p-1 gap-1">
          <button onClick={() => setActiveTab('logins')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'logins' ? 'bg-slate-950 text-white' : 'text-slate-400 hover:text-white'}`}>
            Login Logs
          </button>
          <button onClick={() => setActiveTab('data_access')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'data_access' ? 'bg-slate-950 text-white' : 'text-slate-400 hover:text-white'}`}>
            Data Access
          </button>
        </div>

        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by email or name..." className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500" />
        </div>

        {activeTab === 'logins' && (
          <div className="relative">
            <select value={eventFilter} onChange={e => setEventFilter(e.target.value)} className="pl-3 pr-8 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white appearance-none focus:outline-none focus:border-red-500">
              <option value="all">All Events</option>
              <option value="login_success">Successful Logins</option>
              <option value="login_failed">Failed Attempts</option>
              <option value="logout">Logouts</option>
              <option value="account_disabled">Blocked</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {activeTab === 'logins' && (
            <div className="space-y-2">
              <p className="text-slate-500 text-xs">{filteredLogins.length} records</p>
              {filteredLogins.map(log => {
                const cfg = EVENT_CONFIG[log.event_type] || EVENT_CONFIG.login_success;
                return (
                  <div key={log.id} className={`border rounded-xl p-4 hover:border-slate-600 transition-all cursor-pointer ${cfg.bg}`} onClick={() => setSelectedLog(log)}>
                    <div className="flex items-start gap-3">
                      <cfg.icon className={`w-5 h-5 mt-0.5 shrink-0 ${cfg.color}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="text-white font-semibold text-sm">{log.full_name || log.email}</p>
                          {log.email && log.full_name && <p className="text-slate-500 text-xs">{log.email}</p>}
                          {log.role && <span className={`text-xs px-2 py-0.5 rounded-full ${ROLE_COLORS[log.role] || 'bg-slate-700 text-slate-400'}`}>{log.role.replace('_', ' ')}</span>}
                          <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><DeviceIcon device={log.device_info} />{log.device_info || 'Unknown'}</span>
                          {log.location_hint && <span>{log.location_hint}</span>}
                          {log.failure_reason && <span className="text-red-400">{log.failure_reason}</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-slate-400 text-xs">{timeAgo(log.created_at)}</p>
                        <p className="text-slate-600 text-xs mt-0.5">{formatTime(log.created_at)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredLogins.length === 0 && (
                <div className="text-center py-16 text-slate-500">
                  <Shield className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p>No login logs found</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'data_access' && (
            <div className="space-y-2">
              <p className="text-slate-500 text-xs">{filteredData.length} records</p>
              {filteredData.map(log => (
                <div key={log.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all">
                  <div className="flex items-start gap-3">
                    <Eye className="w-5 h-5 mt-0.5 text-amber-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="text-white font-semibold text-sm">{log.user_email}</p>
                        {log.user_role && <span className={`text-xs px-2 py-0.5 rounded-full ${ROLE_COLORS[log.user_role] || 'bg-slate-700 text-slate-400'}`}>{log.user_role.replace('_', ' ')}</span>}
                      </div>
                      <p className="text-amber-400 text-sm font-medium">{log.action}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                        {log.table_name && <span>Table: {log.table_name}</span>}
                        {log.record_count > 0 && <span className="text-red-400 font-medium">{log.record_count} records accessed</span>}
                        {log.filters_applied && <span>Filter: {log.filters_applied}</span>}
                        {log.notes && <span className="text-slate-400">{log.notes}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-slate-400 text-xs">{timeAgo(log.created_at)}</p>
                      <p className="text-slate-600 text-xs mt-0.5">{formatTime(log.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
              {filteredData.length === 0 && (
                <div className="text-center py-16 text-slate-500">
                  <Eye className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p>No data access logs yet</p>
                  <p className="text-xs mt-1">Sensitive data views will appear here</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {selectedLog && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-5 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold">Log Detail</h3>
              <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              {(() => {
                const cfg = EVENT_CONFIG[selectedLog.event_type];
                return (
                  <div className={`flex items-center gap-3 p-3 rounded-xl border ${cfg.bg}`}>
                    <cfg.icon className={`w-6 h-6 ${cfg.color}`} />
                    <p className={`font-bold ${cfg.color}`}>{cfg.label}</p>
                  </div>
                );
              })()}

              {[
                { label: 'Name', value: selectedLog.full_name || '—' },
                { label: 'Email', value: selectedLog.email },
                { label: 'Role', value: selectedLog.role.replace('_', ' ') || '—' },
                { label: 'Date & Time', value: formatTime(selectedLog.created_at) },
                { label: 'Device', value: selectedLog.device_info || '—' },
                { label: 'Timezone / Language', value: selectedLog.location_hint || '—' },
                { label: 'Session ID (partial)', value: selectedLog.session_id || '—' },
              ].map(r => (
                <div key={r.label} className="flex items-start gap-3 py-2 border-b border-slate-800">
                  <p className="text-slate-500 text-xs w-36 shrink-0 mt-0.5">{r.label}</p>
                  <p className="text-white text-sm">{r.value}</p>
                </div>
              ))}

              {selectedLog.failure_reason && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-red-400 text-xs font-semibold mb-1">Failure Reason</p>
                  <p className="text-red-300 text-sm">{selectedLog.failure_reason}</p>
                </div>
              )}

              <div>
                <p className="text-slate-500 text-xs mb-1">User Agent (Browser/Device)</p>
                <p className="text-slate-400 text-xs bg-slate-800 p-3 rounded-xl break-all">{selectedLog.user_agent || '—'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
