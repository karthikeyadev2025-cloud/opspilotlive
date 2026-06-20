import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, TrendingUp, Phone, Target, CheckCircle, AlertCircle, RefreshCw, LogOut, Search, X, Calendar, Briefcase, BarChart2, ArrowUpRight, MapPin, Zap, Star, Activity, UserCheck, PhoneCall, Download, Camera, MessageSquare, Send, Wallet, FileText, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import LeadsDashboard from './LeadsDashboard';
import ProfileAvatar from './ProfileAvatar';

interface Lead {
  id: string;
  full_name: string;
  contact_number: string;
  alternate_number?: string;
  email?: string;
  location: string;
  address?: string;
  requirement: string;
  requirement_details?: string;
  status: 'new' | 'called' | 'interested' | 'not_interested' | 'converted' | 'callback';
  priority: 'high' | 'medium' | 'low';
  assigned_to?: string;
  callback_date?: string;
  remarks?: string;
  follow_up_count: number;
  last_called_at?: string;
  collected_by?: string;
  created_at: string;
  updated_at: string;
  assignee?: { full_name: string };
}

interface StaffUser {
  id: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

interface LeadRemark {
  id: string;
  user_name: string;
  user_role: string;
  remark: string;
  call_type: string;
  created_at: string;
}

const CALL_TYPE_META: Record<string, { label: string; color: string; bg: string }> = {
  telecaller_call: { label: 'Client Call', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
  answered: { label: 'Answered', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  executive_visit: { label: 'Field Visit', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  manager_review: { label: 'Manager Review', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  not_answered: { label: 'Not Answered', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  busy: { label: 'Busy', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  general: { label: 'Note', color: 'text-slate-400', bg: 'bg-slate-700/40 border-slate-600/30' },
};

const MANAGER_CALL_TYPE_OPTIONS = [
  { value: 'manager_review', label: 'Manager Review' },
  { value: 'general', label: 'General Note' },
];

interface SalaryAdvance {
  id: string;
  app_user_id: string;
  amount_requested: number;
  amount_approved: number;
  reason: string;
  purpose: string;
  status: string;
  remarks?: string;
  created_at: string;
  user?: { full_name: string; role: string };
}

interface LeaveRequest {
  id: string;
  app_user_id: string;
  requester_name?: string;
  leave_type: string;
  from_date: string;
  to_date: string;
  days_count: number;
  reason: string;
  status: string;
  remarks?: string;
  created_at: string;
  app_user?: { full_name: string };
}

const STATUS_CONFIG = {
  new: { label: 'New', color: 'bg-sky-500/20 text-sky-400 border-sky-500/30', dot: 'bg-sky-400' },
  called: { label: 'Called', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', dot: 'bg-slate-400' },
  interested: { label: 'Interested', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', dot: 'bg-amber-400' },
  not_interested: { label: 'Not Interested', color: 'bg-red-500/20 text-red-400 border-red-500/30', dot: 'bg-red-400' },
  not_answered: { label: 'Not Answered', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', dot: 'bg-orange-400' },
  converted: { label: 'Converted', color: 'bg-green-500/20 text-green-400 border-green-500/30', dot: 'bg-green-400' },
  callback: { label: 'Callback', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', dot: 'bg-slate-400' },
};

const PRIORITY_CONFIG = {
  high: { label: 'High', color: 'text-red-400', bg: 'bg-red-500/10' },
  medium: { label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  low: { label: 'Low', color: 'text-green-400', bg: 'bg-green-500/10' },
};

type Tab = 'dashboard' | 'analytics' | 'leads' | 'conversations' | 'attendance' | 'advances' | 'leaves';

interface ConvRemark {
  id: string;
  lead_id: string;
  user_name: string;
  user_role: string;
  remark: string;
  call_type: string;
  created_at: string;
  lead?: { full_name: string; contact_number: string };
}

export default function ManagerPortal() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [advances, setAdvances] = useState<SalaryAdvance[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [executiveFilter, setExecutiveFilter] = useState('all');

  const [allConversations, setAllConversations] = useState<ConvRemark[]>([]);
  const [convLoading, setConvLoading] = useState(false);
  const [convSearch, setConvSearch] = useState('');
  const [convNewRemark, setConvNewRemark] = useState('');
  const [convCallType, setConvCallType] = useState('manager_review');
  const [convSelectedLeadId, setConvSelectedLeadId] = useState('');
  const [sendingConv, setSendingConv] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [leadsRes, staffRes, attRes, advRes, leaveRes] = await Promise.all([
        supabase.from('marketing_leads').select('*, assignee:app_users!assigned_to(full_name), executive:app_users!executive_user_id(full_name)').order('created_at', { ascending: false }).limit(500),
        supabase.from('app_users').select('id, full_name, role, is_active').eq('is_active', true).in('role', ['telecaller', 'marketing_executive']),
        supabase.from('attendance_records').select('*, user:app_users(full_name, role)').order('attendance_date', { ascending: false }).limit(200),
        supabase.from('salary_advance_requests').select('*, user:app_users(full_name, role)').order('created_at', { ascending: false }).limit(100),
        supabase.from('leave_requests').select('*, app_user:app_users!app_user_id(full_name)').order('created_at', { ascending: false }).limit(100),
      ]);
      setLeads((leadsRes.data as Lead[]) || []);
      setStaff(staffRes.data || []);
      setAttendance(attRes.data || []);
      setAdvances((advRes.data as SalaryAdvance[]) || []);
      setLeaves((leaveRes.data as LeaveRequest[]) || []);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadConversations = useCallback(async () => {
    setConvLoading(true);
    const { data } = await supabase
      .from('lead_remarks')
      .select('*, lead:marketing_leads(full_name, contact_number)')
      .order('created_at', { ascending: false })
      .limit(300);
    setAllConversations((data || []) as ConvRemark[]);
    setConvLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (activeTab === 'conversations') loadConversations();
  }, [activeTab, loadConversations]);

  const filteredLeads = useMemo(() => leads.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = !q || l.full_name.toLowerCase().includes(q) || l.contact_number.includes(q) || l.location.toLowerCase().includes(q) || l.requirement.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    const matchPriority = priorityFilter === 'all' || l.priority === priorityFilter;
    const matchDateFrom = !dateFrom || l.created_at >= dateFrom;
    const matchDateTo = !dateTo || l.created_at <= dateTo + 'T23:59:59';
    const matchExec = executiveFilter === 'all' || (l as any).executive_user_id === executiveFilter;
    return matchSearch && matchStatus && matchPriority && matchDateFrom && matchDateTo && matchExec;
  }), [leads, search, statusFilter, priorityFilter, dateFrom, dateTo, executiveFilter]);

  const stats = useMemo(() => ({
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    interested: leads.filter(l => l.status === 'interested').length,
    converted: leads.filter(l => l.status === 'converted').length,
    notInterested: leads.filter(l => l.status === 'not_interested').length,
    callbacks: leads.filter(l => l.status === 'callback').length,
    unassigned: leads.filter(l => !l.assigned_to).length,
    highPriority: leads.filter(l => l.priority === 'high').length,
  }), [leads]);

  const conversionRate = stats.total > 0 ? ((stats.converted / stats.total) * 100).toFixed(1) : '0.0';
  const interestRate = stats.total > 0 ? (((stats.interested + stats.converted) / stats.total) * 100).toFixed(1) : '0.0';

  const requirementBreakdown = useMemo(() => leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.requirement] = (acc[l.requirement] || 0) + 1;
    return acc;
  }, {}), [leads]);

  const telecallers = useMemo(() => staff.filter(s => s.role === 'telecaller'), [staff]);
  const executives = useMemo(() => staff.filter(s => s.role === 'marketing_executive'), [staff]);

  const telecallerPerformance = useMemo(() => telecallers.map(tc => ({
    ...tc,
    assigned: leads.filter(l => l.assigned_to === tc.id).length,
    converted: leads.filter(l => l.assigned_to === tc.id && l.status === 'converted').length,
    interested: leads.filter(l => l.assigned_to === tc.id && l.status === 'interested').length,
  })), [telecallers, leads]);

  const executivePerformance = useMemo(() => executives.map(ex => ({
    ...ex,
    submitted: leads.filter(l => (l as any).executive_user_id === ex.id).length,
  })), [executives, leads]);

  async function handleAssign(leadId: string, userId: string) {
    setAssignLoading(true);
    try {
      await supabase.from('marketing_leads').update({ assigned_to: userId || null, assigned_at: userId ? new Date().toISOString() : null }).eq('id', leadId);
      await loadData();
      if (selectedLead?.id === leadId) {
        setLeads(prev => {
          const updated = prev.find(l => l.id === leadId);
          if (updated) setSelectedLead({ ...updated, assigned_to: userId || undefined });
          return prev;
        });
      }
    } finally {
      setAssignLoading(false);
    }
  }

  async function sendConvRemark() {
    if (!convNewRemark.trim() || !convSelectedLeadId || !user) return;
    setSendingConv(true);
    try {
      await supabase.from('lead_remarks').insert({
        lead_id: convSelectedLeadId,
        user_id: user.id,
        user_name: user.full_name,
        user_role: 'manager',
        remark: convNewRemark.trim(),
        call_type: convCallType,
      });
      setConvNewRemark('');
      await loadConversations();
    } finally {
      setSendingConv(false);
    }
  }

  const filteredConversations = useMemo(() => allConversations.filter(r => {
    if (!convSearch) return true;
    const q = convSearch.toLowerCase();
    return (
      r.remark.toLowerCase().includes(q) ||
      r.user_name.toLowerCase().includes(q) ||
      (r.lead as any)?.full_name?.toLowerCase().includes(q) ||
      (r.lead as any)?.contact_number?.includes(q)
    );
  }), [allConversations, convSearch]);

  function exportCSV() {
    const rows = [
      ['Name', 'Phone', 'Location', 'Requirement', 'Status', 'Priority', 'Collected By', 'Date'],
      ...filteredLeads.map(l => [
        l.full_name, l.contact_number, l.location, l.requirement,
        l.status, l.priority, l.collected_by || '', new Date(l.created_at).toLocaleDateString()
      ])
    ];
    const csv = '\uFEFF' + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `leads_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const tabs: { key: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'analytics', label: 'Analytics', icon: TrendingUp },
    { key: 'leads', label: 'Leads', icon: Target },
    { key: 'conversations', label: 'Chats', icon: MessageSquare },
    { key: 'attendance', label: 'Attendance', icon: Camera },
    { key: 'advances', label: 'Advances', icon: Wallet },
    { key: 'leaves', label: 'Leaves', icon: FileText },
  ];

  if (!user || user.role !== 'manager') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">Access Denied</h2>
          <p className="text-slate-400 text-sm mb-6">You do not have permission to access the manager portal.</p>
          <button onClick={signOut} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl text-sm hover:bg-red-500/30 transition-colors">
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-none">Manager Portal</h1>
            <p className="text-slate-500 text-xs mt-0.5">{user?.full_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/20 text-orange-400 text-xs font-medium rounded-full border border-orange-500/30">
            <Briefcase className="w-3 h-3" /> Manager
          </span>
          <ProfileAvatar size="sm" />
          <button onClick={signOut} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors" title="Sign out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <nav className="bg-slate-900/80 border-b border-slate-800 px-4 md:px-6 flex gap-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === t.key
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 p-4 md:p-6">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : activeTab === 'dashboard' ? (
          <DashboardView
            stats={stats}
            conversionRate={conversionRate}
            interestRate={interestRate}
            requirementBreakdown={requirementBreakdown}
            telecallerPerformance={telecallerPerformance}
            executivePerformance={executivePerformance}
            leads={leads}
          />
        ) : activeTab === 'analytics' ? (
          <LeadsDashboard />
        ) : activeTab === 'conversations' ? (
          <div className="p-4 md:p-6 space-y-5 max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">All Conversations</h2>
              <button onClick={loadConversations} className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-amber-400 transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={convSearch} onChange={e => setConvSearch(e.target.value)}
                placeholder="Search by lead name, phone, remark..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <p className="text-xs text-slate-400 font-medium">Add Conversation Entry</p>
              <select
                value={convSelectedLeadId}
                onChange={e => setConvSelectedLeadId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">Select a lead...</option>
                {leads.map(l => (
                  <option key={l.id} value={l.id}>{l.full_name} — {l.contact_number}</option>
                ))}
              </select>
              <div className="flex gap-2">
                {MANAGER_CALL_TYPE_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setConvCallType(opt.value)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      convCallType === opt.value
                        ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                        : 'border-slate-700 bg-slate-800/60 text-slate-500 hover:text-slate-300'
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <textarea
                  value={convNewRemark}
                  onChange={e => setConvNewRemark(e.target.value)}
                  placeholder={convCallType === 'manager_review' ? 'Add manager review or follow-up notes...' : 'Add a general note...'}
                  rows={2}
                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm resize-none"
                />
                <button
                  onClick={sendConvRemark}
                  disabled={!convNewRemark.trim() || !convSelectedLeadId || sendingConv}
                  className="self-end px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl text-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {sendingConv ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Send
                </button>
              </div>
            </div>

            {convLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-16">
                <MessageSquare className="w-12 h-12 text-slate-800 mx-auto mb-3" />
                <p className="text-slate-400">No conversations yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredConversations.map((r, idx) => {
                  const meta = CALL_TYPE_META[r.call_type] || CALL_TYPE_META.general;
                  const dt = new Date(r.created_at);
                  const dateStr = dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                  const timeStr = dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
                  return (
                    <div key={r.id} className="relative pl-8">
                      {idx < filteredConversations.length - 1 && (
                        <div className="absolute left-3 top-6 bottom-0 w-px bg-slate-800" />
                      )}
                      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                        {r.user_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                        {r.lead && (
                          <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-slate-800">
                            <Phone className="w-3 h-3 text-amber-500 shrink-0" />
                            <span className="text-amber-400 text-xs font-medium">{(r.lead as any).full_name}</span>
                            <span className="text-slate-600 text-xs">· {(r.lead as any).contact_number}</span>
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                          <span className="text-white text-xs font-semibold">{r.user_name}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${REMARK_ROLE_COLORS[r.user_role] || 'bg-slate-700 text-slate-400'}`}>
                            {r.user_role.replace(/_/g, ' ')}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium border ${meta.bg} ${meta.color}`}>
                            {meta.label}
                          </span>
                          <span className="text-slate-500 text-xs ml-auto shrink-0">
                            {dateStr} · {timeStr}
                          </span>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed">{r.remark}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : activeTab === 'attendance' ? (
          <AttendanceView attendance={attendance} onRefresh={loadData} />
        ) : activeTab === 'advances' ? (
          <AdvancesView advances={advances} onRefresh={loadData} />
        ) : activeTab === 'leaves' ? (
          <LeavesView leaves={leaves} onRefresh={loadData} />
        ) : (
          <LeadsView
            leads={filteredLeads}
            allLeads={leads}
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            dateFrom={dateFrom}
            setDateFrom={setDateFrom}
            dateTo={dateTo}
            setDateTo={setDateTo}
            executiveFilter={executiveFilter}
            setExecutiveFilter={setExecutiveFilter}
            executives={executives}
            onRefresh={loadData}
            onExport={exportCSV}
            onSelect={setSelectedLead}
            staff={staff}
            onAssign={handleAssign}
            assignLoading={assignLoading}
          />
        )}
      </main>

      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          staff={staff}
          onClose={() => setSelectedLead(null)}
          onAssign={handleAssign}
          assignLoading={assignLoading}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon: Icon, sub }: { label: string; value: string | number; color: string; icon: React.ElementType; sub?: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white mb-0.5">{value}</p>
      <p className="text-slate-400 text-xs">{label}</p>
      {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}

function DashboardView({ stats, conversionRate, interestRate, requirementBreakdown, telecallerPerformance, executivePerformance, leads }: {
  stats: Record<string, number>;
  conversionRate: string;
  interestRate: string;
  requirementBreakdown: Record<string, number>;
  telecallerPerformance: Array<{ id: string; full_name: string; assigned: number; converted: number; interested: number }>;
  executivePerformance: Array<{ id: string; full_name: string; submitted: number }>;
  leads: Lead[];
}) {
  const recentLeads = [...leads].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 8);
  const maxReq = Math.max(...Object.values(requirementBreakdown), 1);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Overview</h2>
        <p className="text-slate-400 text-sm">Live snapshot of your marketing pipeline</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Leads" value={stats.total} color="bg-slate-700 text-slate-300" icon={Target} />
        <StatCard label="New Leads" value={stats.new} color="bg-sky-500/20 text-sky-400" icon={Zap} />
        <StatCard label="Interested" value={stats.interested} color="bg-amber-500/20 text-amber-400" icon={Star} />
        <StatCard label="Converted" value={stats.converted} color="bg-green-500/20 text-green-400" icon={CheckCircle} sub={`${conversionRate}% rate`} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Callbacks Due" value={stats.callbacks} color="bg-purple-500/20 text-purple-400" icon={PhoneCall} />
        <StatCard label="Unassigned" value={stats.unassigned} color="bg-red-500/20 text-red-400" icon={AlertCircle} />
        <StatCard label="High Priority" value={stats.highPriority} color="bg-orange-500/20 text-orange-400" icon={ArrowUpRight} />
        <StatCard label="Interest Rate" value={`${interestRate}%`} color="bg-teal-500/20 text-teal-400" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-5 h-5 text-amber-500" />
            <h3 className="text-white font-semibold">Leads by Requirement</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(requirementBreakdown).sort(([, a], [, b]) => b - a).map(([req, count]) => (
              <div key={req}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">{req}</span>
                  <span className="text-slate-400">{count}</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all"
                    style={{ width: `${(count / maxReq) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {Object.keys(requirementBreakdown).length === 0 && (
              <p className="text-slate-500 text-sm text-center py-4">No data yet</p>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-amber-500" />
            <h3 className="text-white font-semibold">Lead Status Breakdown</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(STATUS_CONFIG).map(([key, conf]) => {
              const count = leads.filter(l => l.status === key).length;
              const pct = leads.length > 0 ? (count / leads.length) * 100 : 0;
              return (
                <div key={key} className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${conf.dot}`} />
                  <span className="text-slate-400 text-xs w-28">{conf.label}</span>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${conf.dot}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-slate-300 text-xs w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Phone className="w-5 h-5 text-amber-500" />
            <h3 className="text-white font-semibold">Telecaller Performance</h3>
          </div>
          {telecallerPerformance.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">No telecallers found</p>
          ) : (
            <div className="space-y-3">
              {telecallerPerformance.sort((a, b) => b.converted - a.converted).map(tc => (
                <div key={tc.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                    {tc.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{tc.full_name}</p>
                    <p className="text-slate-500 text-xs">{tc.assigned} assigned</p>
                  </div>
                  <div className="flex gap-3 text-center">
                    <div>
                      <p className="text-amber-400 text-sm font-bold">{tc.interested}</p>
                      <p className="text-slate-500 text-xs">Int.</p>
                    </div>
                    <div>
                      <p className="text-green-400 text-sm font-bold">{tc.converted}</p>
                      <p className="text-slate-500 text-xs">Conv.</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <UserCheck className="w-5 h-5 text-amber-500" />
            <h3 className="text-white font-semibold">Recent Activity</h3>
          </div>
          <div className="space-y-2">
            {recentLeads.map(lead => {
              const sc = STATUS_CONFIG[lead.status];
              return (
                <div key={lead.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/50 transition-colors">
                  <div className={`w-2 h-2 rounded-full ${sc.dot} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-300 text-sm truncate">{lead.full_name}</p>
                    <p className="text-slate-500 text-xs">{lead.requirement} · {lead.location}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${sc.color}`}>{sc.label}</span>
                </div>
              );
            })}
            {recentLeads.length === 0 && <p className="text-slate-500 text-sm text-center py-6">No leads yet</p>}
          </div>
        </div>
      </div>

      {executivePerformance.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-amber-500" />
            <h3 className="text-white font-semibold">Marketing Executive Performance</h3>
          </div>
          <div className="space-y-3">
            {executivePerformance.sort((a, b) => b.submitted - a.submitted).map(ex => (
              <div key={ex.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                  {ex.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{ex.full_name}</p>
                </div>
                <div className="text-center">
                  <p className="text-amber-400 text-sm font-bold">{ex.submitted}</p>
                  <p className="text-slate-500 text-xs">Leads Submitted</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LeadsView({ leads, allLeads, search, setSearch, statusFilter, setStatusFilter, priorityFilter, setPriorityFilter, dateFrom, setDateFrom, dateTo, setDateTo, executiveFilter, setExecutiveFilter, executives, onRefresh, onExport, onSelect }: {
  leads: Lead[];
  allLeads: Lead[];
  search: string;
  setSearch: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  priorityFilter: string;
  setPriorityFilter: (v: string) => void;
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
  executiveFilter: string;
  setExecutiveFilter: (v: string) => void;
  executives: StaffUser[];
  onRefresh: () => void;
  onExport: () => void;
  onSelect: (l: Lead) => void;
  staff: StaffUser[];
  onAssign: (leadId: string, userId: string) => void;
  assignLoading: boolean;
}) {
  const { user } = useAuth();
  const activeFilters = [search, statusFilter !== 'all', priorityFilter !== 'all', dateFrom, dateTo, executiveFilter !== 'all'].filter(Boolean).length;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [remarksMap, setRemarksMap] = useState<Record<string, LeadRemark[]>>({});
  const [loadingRemarks, setLoadingRemarks] = useState<string | null>(null);
  const [inlineRemark, setInlineRemark] = useState('');
  const [inlineCallType, setInlineCallType] = useState('manager_review');
  const [sendingInline, setSendingInline] = useState(false);

  async function toggleExpand(lead: Lead) {
    if (expandedId === lead.id) { setExpandedId(null); return; }
    setExpandedId(lead.id);
    setInlineRemark('');
    if (!remarksMap[lead.id]) {
      setLoadingRemarks(lead.id);
      try {
        const { data } = await supabase.from('lead_remarks').select('*').eq('lead_id', lead.id).order('created_at', { ascending: true });
        setRemarksMap(prev => ({ ...prev, [lead.id]: (data || []) as LeadRemark[] }));
      } finally {
        setLoadingRemarks(null);
      }
    }
  }

  async function sendInlineRemark(lead: Lead) {
    if (!inlineRemark.trim() || !user) return;
    setSendingInline(true);
    try {
      const now = new Date().toISOString();
      await supabase.from('lead_remarks').insert({
        lead_id: lead.id, user_id: user.id,
        user_name: user.full_name, user_role: 'manager',
        remark: inlineRemark.trim(), call_type: inlineCallType,
      });
      await supabase.from('marketing_leads').update({
        last_called_at: now,
        follow_up_count: (lead.follow_up_count || 0) + 1,
        updated_at: now,
      }).eq('id', lead.id);
      const { data } = await supabase.from('lead_remarks').select('*').eq('lead_id', lead.id).order('created_at', { ascending: true });
      setRemarksMap(prev => ({ ...prev, [lead.id]: (data || []) as LeadRemark[] }));
      setInlineRemark('');
    } finally {
      setSendingInline(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, phone, location..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-amber-500">
          <option value="all">All Status</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-amber-500">
          <option value="all">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={executiveFilter} onChange={e => setExecutiveFilter(e.target.value)} className="px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-amber-500">
          <option value="all">All Executives</option>
          {executives.map(ex => <option key={ex.id} value={ex.id}>{ex.full_name}</option>)}
        </select>
        <div className="flex gap-2 ml-auto">
          {activeFilters > 0 && (
            <button onClick={() => { setSearch(''); setStatusFilter('all'); setPriorityFilter('all'); setDateFrom(''); setDateTo(''); setExecutiveFilter('all'); }}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-amber-500/20 text-amber-400 rounded-xl text-xs font-medium hover:bg-amber-500/30 transition-colors border border-amber-500/30">
              <X className="w-3.5 h-3.5" /> Clear ({activeFilters})
            </button>
          )}
          <button onClick={onRefresh} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors border border-slate-700">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={onExport} className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm transition-colors border border-slate-700">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="text-slate-500 text-xs">From</span>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="bg-transparent text-white text-sm focus:outline-none" />
        </div>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
          <span className="text-slate-500 text-xs">To</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="bg-transparent text-white text-sm focus:outline-none" />
        </div>
        {(dateFrom || dateTo) && (
          <button onClick={() => { setDateFrom(''); setDateTo(''); }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition-colors border border-slate-700" title="Clear dates">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <p className="text-slate-500 text-sm">Showing {leads.length} of {allLeads.length} leads</p>

      <div className="space-y-2">
        {leads.map(lead => {
          const sc = STATUS_CONFIG[lead.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.new;
          const pc = PRIORITY_CONFIG[lead.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.medium;
          const isExpanded = expandedId === lead.id;
          const leadRemarks = remarksMap[lead.id] || [];
          return (
            <div key={lead.id} className={`bg-slate-900 border rounded-xl transition-all ${isExpanded ? 'border-amber-500/40' : 'border-slate-800 hover:border-slate-700'}`}>
              <div className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold">{lead.full_name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${sc.color}`}>{sc.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pc.bg} ${pc.color}`}>{pc.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.contact_number}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{lead.location}</span>
                      <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{lead.requirement}</span>
                      {lead.assignee && <span className="flex items-center gap-1 text-green-400"><UserCheck className="w-3 h-3" />{(lead.assignee as any).full_name}</span>}
                      {lead.follow_up_count > 0 && <span className="flex items-center gap-1"><PhoneCall className="w-3 h-3" />{lead.follow_up_count} calls</span>}
                    </div>
                    {lead.remarks && <p className="text-slate-500 text-xs mt-1.5 truncate">{lead.remarks}</p>}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => toggleExpand(lead)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isExpanded ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      {leadRemarks.length > 0 ? leadRemarks.length : 'Log'}
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    <button onClick={() => onSelect(lead)} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors" title="Full details">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-slate-800 bg-slate-950/40">
                  <div className="max-h-64 overflow-y-auto px-4 py-3 space-y-3">
                    {loadingRemarks === lead.id ? (
                      <div className="flex justify-center py-4">
                        <div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                      </div>
                    ) : leadRemarks.length === 0 ? (
                      <p className="text-slate-600 text-xs text-center py-4">No conversation yet — log your first note below</p>
                    ) : leadRemarks.map((r, idx) => {
                      const meta = CALL_TYPE_META[r.call_type] || CALL_TYPE_META.general;
                      const dt = new Date(r.created_at);
                      const timeStr = dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ' · ' + dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
                      return (
                        <div key={r.id} className="relative pl-7">
                          {idx < leadRemarks.length - 1 && <div className="absolute left-2.5 top-6 bottom-0 w-px bg-slate-800" />}
                          <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
                            {r.user_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-2.5">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              <span className="text-white text-xs font-semibold">{r.user_name}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${REMARK_ROLE_COLORS[r.user_role] || 'bg-slate-700 text-slate-400'}`}>{r.user_role.replace(/_/g, ' ')}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium border ${meta.bg} ${meta.color}`}>{meta.label}</span>
                              <span className="text-slate-500 text-[10px] ml-auto">{timeStr}</span>
                            </div>
                            <p className="text-slate-300 text-xs leading-relaxed">{r.remark}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="px-4 pb-4 pt-2 border-t border-slate-800 space-y-2">
                    <div className="flex gap-1.5">
                      {MANAGER_CALL_TYPE_OPTIONS.map(opt => (
                        <button key={opt.value} onClick={() => setInlineCallType(opt.value)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            inlineCallType === opt.value
                              ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                              : 'border-slate-700 bg-slate-800/60 text-slate-500 hover:text-slate-300'
                          }`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <textarea
                        value={inlineRemark}
                        onChange={e => setInlineRemark(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendInlineRemark(lead); } }}
                        placeholder="Add review note... (Enter to send)"
                        rows={2}
                        className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs resize-none"
                      />
                      <button onClick={() => sendInlineRemark(lead)} disabled={sendingInline || !inlineRemark.trim()}
                        className="self-end p-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl transition-colors disabled:opacity-40">
                        {sendingInline ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {leads.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <Target className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No leads match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

const REMARK_ROLE_COLORS: Record<string, string> = {
  admin: 'bg-rose-500/20 text-rose-400', manager: 'bg-orange-500/20 text-orange-400',
  hr: 'bg-blue-500/20 text-blue-400', telecaller: 'bg-teal-500/20 text-teal-400',
  marketing_executive: 'bg-green-500/20 text-green-400',
};

function LeadDetailModal({ lead, staff, onClose, onAssign, assignLoading }: {
  lead: Lead;
  staff: StaffUser[];
  onClose: () => void;
  onAssign: (leadId: string, userId: string) => void;
  assignLoading: boolean;
}) {
  const { user } = useAuth();
  const sc = STATUS_CONFIG[lead.status];
  const pc = PRIORITY_CONFIG[lead.priority];
  const telecallers = staff.filter(s => s.role === 'telecaller');
  const [activeTab, setActiveTab] = useState<'info' | 'remarks'>('info');
  const [remarks, setRemarks] = useState<LeadRemark[]>([]);
  const [newRemark, setNewRemark] = useState('');
  const [newCallType, setNewCallType] = useState('manager_review');
  const [sendingRemark, setSendingRemark] = useState(false);

  useEffect(() => {
    supabase.from('lead_remarks').select('*').eq('lead_id', lead.id).order('created_at', { ascending: true })
      .then(({ data }) => setRemarks(data || []));
  }, [lead.id]);

  async function sendRemark() {
    if (!newRemark.trim()) return;
    setSendingRemark(true);
    try {
      await supabase.from('lead_remarks').insert({
        lead_id: lead.id,
        user_id: user?.id,
        user_name: user?.full_name || 'Manager',
        user_role: 'manager',
        remark: newRemark.trim(),
        call_type: newCallType,
      });
      const { data } = await supabase.from('lead_remarks').select('*').eq('lead_id', lead.id).order('created_at', { ascending: true });
      setRemarks(data || []);
      setNewRemark('');
    } finally {
      setSendingRemark(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-t-2xl md:rounded-2xl w-full md:max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold">{lead.full_name}</h3>
            <div className="flex gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full border ${sc.color}`}>{sc.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pc.bg} ${pc.color}`}>{pc.label}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-slate-800">
          {[
            { id: 'info', label: 'Details', icon: Target },
            { id: 'remarks', label: `Remarks (${remarks.length})`, icon: MessageSquare },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors ${activeTab === t.id ? 'text-amber-400 border-b-2 border-amber-500' : 'text-slate-400 hover:text-slate-300'}`}>
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'info' ? (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Phone', value: lead.contact_number },
                { label: 'Alt Phone', value: lead.alternate_number || '—' },
                { label: 'Location', value: lead.location },
                { label: 'Requirement', value: lead.requirement },
                { label: 'Follow-ups', value: lead.follow_up_count },
                { label: 'Collected By', value: lead.collected_by || '—' },
              ].map(f => (
                <div key={f.label} className="bg-slate-800/60 rounded-xl p-3">
                  <p className="text-slate-500 text-xs mb-0.5">{f.label}</p>
                  <p className="text-white text-sm">{f.value}</p>
                </div>
              ))}
            </div>

            {lead.requirement_details && (
              <div className="bg-slate-800/60 rounded-xl p-3">
                <p className="text-slate-500 text-xs mb-1">Notes</p>
                <p className="text-slate-300 text-sm">{lead.requirement_details}</p>
              </div>
            )}

            {lead.remarks && (
              <div className="bg-slate-800/60 rounded-xl p-3">
                <p className="text-slate-500 text-xs mb-1">Field Remarks</p>
                <p className="text-slate-300 text-sm">{lead.remarks}</p>
              </div>
            )}

            {lead.callback_date && (
              <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span className="text-amber-300 text-sm">Callback: {new Date(lead.callback_date).toLocaleString()}</span>
              </div>
            )}

            <div>
              <label className="block text-xs text-slate-400 mb-2">Assign to Telecaller</label>
              <select
                defaultValue={lead.assigned_to || ''}
                onChange={e => onAssign(lead.id, e.target.value)}
                disabled={assignLoading}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">Unassigned</option>
                {telecallers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
              </select>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="max-h-72 overflow-y-auto space-y-3">
              {remarks.length === 0 ? (
                <p className="text-slate-500 text-center py-8 text-sm">No conversation entries yet.</p>
              ) : remarks.map((r, idx) => {
                const meta = CALL_TYPE_META[r.call_type] || CALL_TYPE_META.general;
                const dt = new Date(r.created_at);
                const dateStr = dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                const timeStr = dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
                return (
                  <div key={r.id} className="relative pl-8">
                    {idx < remarks.length - 1 && <div className="absolute left-3 top-6 bottom-0 w-px bg-slate-700/60" />}
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                      {r.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        <span className="text-white text-xs font-semibold">{r.user_name}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${REMARK_ROLE_COLORS[r.user_role] || 'bg-slate-700 text-slate-400'}`}>
                          {r.user_role.replace(/_/g, ' ')}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium border ${meta.bg} ${meta.color}`}>
                          {meta.label}
                        </span>
                        <span className="text-slate-500 text-xs ml-auto shrink-0">
                          {dateStr} · {timeStr}
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed">{r.remark}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-slate-800 pt-3 space-y-2">
              <div className="flex gap-2">
                {MANAGER_CALL_TYPE_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setNewCallType(opt.value)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      newCallType === opt.value
                        ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                        : 'border-slate-700 bg-slate-800/60 text-slate-500 hover:text-slate-300'
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <textarea
                  value={newRemark} onChange={e => setNewRemark(e.target.value)}
                  placeholder={newCallType === 'manager_review' ? 'Add your review or follow-up notes...' : 'Add a general note...'}
                  rows={2}
                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm resize-none focus:outline-none focus:border-amber-500"
                />
                <button onClick={sendRemark} disabled={sendingRemark || !newRemark.trim()}
                  className="self-end px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl text-sm disabled:opacity-50 flex items-center gap-1.5">
                  {sendingRemark ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const ADVANCE_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  approved: 'bg-green-500/20 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  disbursed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  repaid: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const LEAVE_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  approved: 'bg-green-500/20 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
};

function AdvancesView({ advances, onRefresh }: { advances: SalaryAdvance[]; onRefresh: () => void }) {
  const [filter, setFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = advances.filter(a => filter === 'all' || a.status === filter);
  const pendingCount = advances.filter(a => a.status === 'pending').length;

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    await supabase.from('salary_advance_requests').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    await onRefresh();
    setUpdatingId(null);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-amber-500" />
          <h2 className="text-white font-bold text-lg">Salary Advances</h2>
        </div>
        {pendingCount > 0 && (
          <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-medium border border-amber-500/30">
            {pendingCount} pending
          </span>
        )}
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 ml-auto">
          {['all', 'pending', 'approved', 'rejected'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === s ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-white'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={onRefresh} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {filtered.map(a => (
          <div key={a.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {(a.user as any)?.full_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-white font-semibold">{(a.user as any)?.full_name || 'Unknown'}</p>
                  <span className="text-slate-500 text-xs capitalize">{(a.user as any)?.role?.replace('_', ' ')}</span>
                  <span className={`ml-auto text-xs px-2.5 py-0.5 rounded-full border font-medium ${ADVANCE_STATUS_COLORS[a.status] || 'bg-slate-700 text-slate-400'}`}>
                    {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                  </span>
                </div>
                <p className="text-white font-bold">₹{a.amount_requested.toLocaleString('en-IN')}</p>
                <p className="text-slate-400 text-sm mt-0.5">{a.reason}</p>
                {a.purpose && <p className="text-slate-500 text-xs mt-0.5">{a.purpose}</p>}
                <p className="text-slate-600 text-xs mt-1">{new Date(a.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
            {a.status === 'pending' && (
              <div className="flex gap-2 mt-3 pl-12">
                <button
                  onClick={() => updateStatus(a.id, 'approved')}
                  disabled={updatingId === a.id}
                  className="flex-1 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50">
                  Approve
                </button>
                <button
                  onClick={() => updateStatus(a.id, 'rejected')}
                  disabled={updatingId === a.id}
                  className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50">
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <Wallet className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No advance requests found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function LeavesView({ leaves, onRefresh }: { leaves: LeaveRequest[]; onRefresh: () => void }) {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = leaves.filter(l => filter === 'all' || l.status === filter);
  const pendingCount = leaves.filter(l => l.status === 'pending').length;

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    setUpdatingId(id);
    await supabase.from('leave_requests').update({ status, approved_by: user?.id, updated_at: new Date().toISOString() }).eq('id', id);
    await onRefresh();
    setUpdatingId(null);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-500" />
          <h2 className="text-white font-bold text-lg">Leave Requests</h2>
        </div>
        {pendingCount > 0 && (
          <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-medium border border-amber-500/30">
            {pendingCount} pending
          </span>
        )}
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 ml-auto">
          {['all', 'pending', 'approved', 'rejected'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === s ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-white'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={onRefresh} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {filtered.map(l => (
          <div key={l.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {(l.app_user?.full_name || l.requester_name || '?').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-white font-semibold">{l.app_user?.full_name || l.requester_name || 'Unknown'}</p>
                  <span className={`ml-auto text-xs px-2.5 py-0.5 rounded-full border font-medium ${LEAVE_STATUS_COLORS[l.status] || 'bg-slate-700 text-slate-400'}`}>
                    {l.status.charAt(0).toUpperCase() + l.status.slice(1)}
                  </span>
                </div>
                <p className="text-white text-sm font-medium capitalize">{l.leave_type} Leave — {l.days_count} day{l.days_count !== 1 ? 's' : ''}</p>
                <p className="text-slate-400 text-xs mt-0.5">
                  {new Date(l.from_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} – {new Date(l.to_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
                <p className="text-slate-500 text-sm mt-1">{l.reason}</p>
              </div>
            </div>
            {l.status === 'pending' && (
              <div className="flex gap-2 mt-3 pl-12">
                <button
                  onClick={() => updateStatus(l.id, 'approved')}
                  disabled={updatingId === l.id}
                  className="flex-1 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50">
                  Approve
                </button>
                <button
                  onClick={() => updateStatus(l.id, 'rejected')}
                  disabled={updatingId === l.id}
                  className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50">
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No leave requests found</p>
          </div>
        )}
      </div>
    </div>
  );
}

const ATT_STATUS_COLORS: Record<string, string> = {
  present: 'bg-green-500/20 text-green-400',
  half_day: 'bg-amber-500/20 text-amber-400',
  absent: 'bg-red-500/20 text-red-400',
  leave: 'bg-blue-500/20 text-blue-400',
  holiday: 'bg-slate-500/20 text-slate-400',
};

function AttendanceView({ attendance, onRefresh }: { attendance: any[]; onRefresh: () => void }) {
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 10));
  const [search, setSearch] = useState('');

  const filtered = attendance.filter(a => {
    const matchDate = !dateFilter || a.attendance_date === dateFilter;
    const matchSearch = !search || (a.user as any)?.full_name?.toLowerCase().includes(search.toLowerCase());
    return matchDate && matchSearch;
  });

  const presentCount = attendance.filter(a => a.attendance_date === dateFilter && a.status === 'present').length;
  const absentCount = attendance.filter(a => a.attendance_date === dateFilter && a.status === 'absent').length;
  const checkedOut = attendance.filter(a => a.attendance_date === dateFilter && a.check_out_time).length;

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex flex-wrap gap-3 items-center">
        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
          className="px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500" />
        <div className="flex-1 min-w-40 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employee..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500" />
        </div>
        <button onClick={onRefresh} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Present', value: presentCount, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
          { label: 'Checked Out', value: checkedOut, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Absent', value: absentCount, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border rounded-xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(a => (
          <div key={a.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {(a.user as any)?.full_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-white font-semibold text-sm">{(a.user as any)?.full_name || 'Unknown'}</span>
                  <span className="text-slate-500 text-xs capitalize">{(a.user as any)?.role}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ATT_STATUS_COLORS[a.status] || 'bg-slate-500/20 text-slate-400'}`}>{a.status?.replace('_', ' ')}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  {a.check_in_time && <span>In: {new Date(a.check_in_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>}
                  {a.check_out_time && <span>Out: {new Date(a.check_out_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>}
                  {a.work_hours > 0 && <span className="text-amber-400">{Number(a.work_hours).toFixed(1)}h worked</span>}
                  {a.check_in_address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{String(a.check_in_address).slice(0, 50)}</span>}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {a.check_in_selfie_url && (
                  <a href={a.check_in_selfie_url} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg overflow-hidden border border-slate-700 hover:border-amber-500 transition-colors">
                    <img src={a.check_in_selfie_url} alt="selfie" className="w-full h-full object-cover" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <Camera className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>{dateFilter ? `No attendance records for ${new Date(dateFilter).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}` : 'No records found'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
