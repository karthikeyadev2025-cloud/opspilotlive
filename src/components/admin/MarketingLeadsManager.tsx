import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Trash2, X, Download, Phone, MapPin, Search, MessageSquare, Calendar, RefreshCw, UserCheck, ChevronDown, Send, ChevronUp, Clock, FileText, AlertCircle, Tag, PhoneCall, Star, Pencil, Save, BarChart2 } from 'lucide-react';

interface MarketingLead {
  id: string;
  full_name: string;
  contact_number: string;
  alternate_number: string;
  email: string;
  location: string;
  address: string;
  requirement: string;
  requirement_details: string;
  collected_by: string;
  status: string;
  remarks: string;
  callback_date: string | null;
  priority: string;
  assigned_to: string | null;
  assigned_at: string | null;
  follow_up_count: number;
  last_called_at: string | null;
  invoice_number: string | null;
  invoice_amount: number | null;
  created_at: string;
  updated_at: string;
}

interface Telecaller {
  id: string;
  full_name: string;
  email: string;
}

interface LeadRemark {
  id: string;
  user_name: string;
  user_role: string;
  remark: string;
  call_type: string | null;
  created_at: string;
}

const STATUS_OPTIONS = ['new', 'called', 'interested', 'not_interested', 'not_answered', 'converted', 'callback'];
const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  called: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  interested: 'bg-green-500/20 text-green-400 border-green-500/30',
  not_interested: 'bg-red-500/20 text-red-400 border-red-500/30',
  not_answered: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  converted: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  callback: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};
const STATUS_LABELS: Record<string, string> = {
  new: 'New', called: 'Called', interested: 'Interested',
  not_interested: 'Not Interested', not_answered: 'Not Answered',
  converted: 'Converted', callback: 'Callback',
};
const CALL_TYPE_META: Record<string, { label: string; color: string; bg: string }> = {
  telecaller_call: { label: 'Client Call', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
  answered: { label: 'Answered', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  executive_visit: { label: 'Field Visit', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  manager_review: { label: 'Manager Review', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  not_answered: { label: 'Not Answered', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  busy: { label: 'Busy', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  general: { label: 'Note', color: 'text-slate-400', bg: 'bg-slate-700/40 border-slate-600/30' },
};
const PRIORITY_COLORS: Record<string, string> = {
  high: 'text-red-400 bg-red-500/10 border-red-500/30',
  medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  low: 'text-green-400 bg-green-500/10 border-green-500/30',
};
const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-rose-500/20 text-rose-400',
  manager: 'bg-orange-500/20 text-orange-400',
  hr: 'bg-blue-500/20 text-blue-400',
  telecaller: 'bg-teal-500/20 text-teal-400',
  marketing_executive: 'bg-green-500/20 text-green-400',
};

function formatDateTime(val: string | null | undefined): string {
  if (!val) return '—';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}



function timeAgo(val: string | null | undefined): string {
  if (!val) return '';
  const diff = Date.now() - new Date(val).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function escapeCsv(val: string | null | undefined): string {
  if (val === null || val === undefined) return '';
  return `"${String(val).replace(/"/g, '""')}"`;
}

export default function MarketingLeadsManager() {
  const [leads, setLeads] = useState<MarketingLead[]>([]);
  const [filtered, setFiltered] = useState<MarketingLead[]>([]);
  const [telecallers, setTelecallers] = useState<Telecaller[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [requirementFilter, setRequirementFilter] = useState('all');
  const [assignedFilter, setAssignedFilter] = useState('all');

  // Per-lead inline state
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [remarksMap, setRemarksMap] = useState<Record<string, LeadRemark[]>>({});
  const [loadingRemarks, setLoadingRemarks] = useState<string | null>(null);
  const [newRemark, setNewRemark] = useState('');
  const [remarkCallType, setRemarkCallType] = useState('answered');
  const [sendingRemark, setSendingRemark] = useState(false);

  // Team performance panel
  const [showTeamPanel, setShowTeamPanel] = useState(false);

  // Quick edit inline
  const [editingLead, setEditingLead] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<MarketingLead>>({});
  const [saving, setSaving] = useState(false);

  // Detail modal
  const [selectedLead, setSelectedLead] = useState<MarketingLead | null>(null);

  const remarkEndRef = useRef<HTMLDivElement>(null);

  const requirementOptions = Array.from(new Set(leads.map(l => l.requirement).filter(Boolean))).sort();

  useEffect(() => { loadLeads(); loadTelecallers(); }, []);

  useEffect(() => {
    let result = leads;
    if (statusFilter !== 'all') result = result.filter(l => l.status === statusFilter);
    if (priorityFilter !== 'all') result = result.filter(l => l.priority === priorityFilter);
    if (requirementFilter !== 'all') result = result.filter(l => l.requirement === requirementFilter);
    if (assignedFilter === 'unassigned') result = result.filter(l => !l.assigned_to);
    else if (assignedFilter === 'assigned') result = result.filter(l => !!l.assigned_to);
    if (dateFrom) result = result.filter(l => l.created_at >= dateFrom);
    if (dateTo) result = result.filter(l => l.created_at <= dateTo + 'T23:59:59');
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        l.full_name.toLowerCase().includes(q) ||
        l.contact_number.includes(q) ||
        (l.alternate_number || '').includes(q) ||
        (l.location || '').toLowerCase().includes(q) ||
        (l.requirement || '').toLowerCase().includes(q) ||
        (l.collected_by || '').toLowerCase().includes(q) ||
        (l.remarks || '').toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [leads, search, statusFilter, priorityFilter, requirementFilter, assignedFilter, dateFrom, dateTo]);

  async function loadLeads() {
    setLoading(true);
    const { data } = await supabase
      .from('marketing_leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);
    if (data) setLeads(data as MarketingLead[]);
    setLoading(false);
  }

  async function loadTelecallers() {
    const { data } = await supabase
      .from('app_users')
      .select('id, full_name, email')
      .in('role', ['telecaller', 'marketing_executive', 'manager'])
      .eq('is_active', true);
    setTelecallers(data || []);
  }

  async function toggleExpand(lead: MarketingLead) {
    if (expandedId === lead.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(lead.id);
    setNewRemark('');
    if (!remarksMap[lead.id]) {
      setLoadingRemarks(lead.id);
      const { data } = await supabase
        .from('lead_remarks')
        .select('*')
        .eq('lead_id', lead.id)
        .order('created_at', { ascending: true });
      setRemarksMap(prev => ({ ...prev, [lead.id]: data || [] }));
      setLoadingRemarks(null);
    }
    setTimeout(() => remarkEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  async function sendRemark(lead: MarketingLead) {
    if (!newRemark.trim()) return;
    setSendingRemark(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSendingRemark(false); return; }
    const { data: appUser } = await supabase.from('app_users').select('full_name, role').eq('id', user.id).maybeSingle();
    await supabase.from('lead_remarks').insert({
      lead_id: lead.id,
      user_id: user.id,
      user_name: appUser?.full_name || 'Admin',
      user_role: appUser?.role || 'admin',
      remark: newRemark.trim(),
      call_type: remarkCallType,
    });
    // Refresh remarks for this lead
    const { data: fresh } = await supabase.from('lead_remarks').select('*').eq('lead_id', lead.id).order('created_at', { ascending: true });
    setRemarksMap(prev => ({ ...prev, [lead.id]: fresh || [] }));
    // Update last_called_at and follow_up_count
    await supabase.from('marketing_leads').update({
      last_called_at: new Date().toISOString(),
      follow_up_count: (lead.follow_up_count || 0) + 1,
      updated_at: new Date().toISOString(),
    }).eq('id', lead.id);
    setLeads(prev => prev.map(l => l.id === lead.id
      ? { ...l, last_called_at: new Date().toISOString(), follow_up_count: (l.follow_up_count || 0) + 1 }
      : l
    ));
    setNewRemark('');
    setSendingRemark(false);
    setTimeout(() => remarkEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('marketing_leads').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    if (selectedLead?.id === id) setSelectedLead(prev => prev ? { ...prev, status } : prev);
  }

  async function updatePriority(id: string, priority: string) {
    await supabase.from('marketing_leads').update({ priority, updated_at: new Date().toISOString() }).eq('id', id);
    setLeads(prev => prev.map(l => l.id === id ? { ...l, priority } : l));
  }

  async function assignTelecaller(id: string, telecallerId: string) {
    const now = new Date().toISOString();
    await supabase.from('marketing_leads').update({ assigned_to: telecallerId || null, assigned_at: telecallerId ? now : null, updated_at: now }).eq('id', id);
    setLeads(prev => prev.map(l => l.id === id ? { ...l, assigned_to: telecallerId || null } : l));
  }

  function openEdit(lead: MarketingLead) {
    setEditingLead(lead.id);
    setEditForm({
      remarks: lead.remarks || '',
      callback_date: lead.callback_date ? new Date(lead.callback_date).toISOString().slice(0, 16) : '',
      invoice_number: lead.invoice_number || '',
      invoice_amount: lead.invoice_amount || undefined,
    });
  }

  async function saveEdit(lead: MarketingLead) {
    setSaving(true);
    await supabase.from('marketing_leads').update({
      remarks: editForm.remarks || null,
      callback_date: editForm.callback_date || null,
      invoice_number: editForm.invoice_number || null,
      invoice_amount: editForm.invoice_amount || null,
      updated_at: new Date().toISOString(),
    }).eq('id', lead.id);
    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, ...editForm } : l));
    setSaving(false);
    setEditingLead(null);
  }

  async function deleteLead(id: string) {
    if (!confirm('Delete this lead permanently?')) return;
    await supabase.from('marketing_leads').delete().eq('id', id);
    setLeads(prev => prev.filter(l => l.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  function exportToCSV() {
    const headers = ['Name','Contact','Alt. Contact','Email','Location','Requirement','Collected By','Status','Priority','Assigned To','Follow-ups','Last Called','Callback','Invoice No','Invoice Amt','Created','Updated'];
    const rows = filtered.map(l => [
      escapeCsv(l.full_name), escapeCsv(l.contact_number), escapeCsv(l.alternate_number),
      escapeCsv(l.email), escapeCsv(l.location), escapeCsv(l.requirement), escapeCsv(l.collected_by),
      escapeCsv(STATUS_LABELS[l.status] || l.status), escapeCsv(l.priority),
      escapeCsv(getTelecallerName(l.assigned_to)),
      escapeCsv(String(l.follow_up_count || 0)),
      escapeCsv(l.last_called_at ? formatDateTime(l.last_called_at) : ''),
      escapeCsv(l.callback_date ? formatDateTime(l.callback_date) : ''),
      escapeCsv(l.invoice_number || ''),
      escapeCsv(l.invoice_amount ? String(l.invoice_amount) : ''),
      escapeCsv(formatDateTime(l.created_at)),
      escapeCsv(formatDateTime(l.updated_at)),
    ].join(','));
    const csv = [headers.map(h => `"${h}"`).join(','), ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `leads_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const getTelecallerName = (id: string | null | undefined) => {
    if (!id) return null;
    return telecallers.find(t => t.id === id)?.full_name || null;
  };

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    interested: leads.filter(l => l.status === 'interested').length,
    unassigned: leads.filter(l => !l.assigned_to).length,
    converted: leads.filter(l => l.status === 'converted').length,
    callbacks: leads.filter(l => l.callback_date && new Date(l.callback_date) <= new Date()).length,
  };

  const hasFilters = statusFilter !== 'all' || priorityFilter !== 'all' || requirementFilter !== 'all' || assignedFilter !== 'all' || dateFrom || dateTo || search;

  // Per-telecaller performance stats
  const teamStats = telecallers.map(tc => {
    const tcLeads = leads.filter(l => l.assigned_to === tc.id);
    const converted = tcLeads.filter(l => l.status === 'converted').length;
    const interested = tcLeads.filter(l => l.status === 'interested').length;
    const totalCalls = tcLeads.reduce((s, l) => s + (l.follow_up_count || 0), 0);
    const overdue = tcLeads.filter(l => l.callback_date && new Date(l.callback_date) < new Date() && l.status !== 'converted').length;
    const lastActivity = tcLeads.reduce<string | null>((latest, l) => {
      if (!l.last_called_at) return latest;
      if (!latest || l.last_called_at > latest) return l.last_called_at;
      return latest;
    }, null);
    const convRate = tcLeads.length > 0 ? Math.round((converted / tcLeads.length) * 100) : 0;
    return {
      id: tc.id,
      name: tc.full_name,
      total: tcLeads.length,
      converted,
      interested,
      totalCalls,
      overdue,
      convRate,
      lastActivity,
      statusBreakdown: STATUS_OPTIONS.reduce((acc, s) => {
        acc[s] = tcLeads.filter(l => l.status === s).length;
        return acc;
      }, {} as Record<string, number>),
    };
  }).sort((a, b) => b.total - a.total);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Marketing Leads</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            {filtered.length} of {leads.length} leads · Updated {timeAgo(leads[0]?.updated_at)}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadLeads} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition-colors" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl text-sm font-medium">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-white', bg: 'bg-slate-800/60', filter: 'all' },
          { label: 'New', value: stats.new, color: 'text-blue-400', bg: 'bg-blue-500/10', filter: 'new' },
          { label: 'Interested', value: stats.interested, color: 'text-green-400', bg: 'bg-green-500/10', filter: 'interested' },
          { label: 'Unassigned', value: stats.unassigned, color: 'text-orange-400', bg: 'bg-orange-500/10', filter: null },
          { label: 'Converted', value: stats.converted, color: 'text-emerald-400', bg: 'bg-emerald-500/10', filter: 'converted' },
          { label: 'Due Callbacks', value: stats.callbacks, color: 'text-red-400', bg: 'bg-red-500/10', filter: 'callback' },
        ].map(s => (
          <button
            key={s.label}
            onClick={() => { if (s.filter) setStatusFilter(s.filter === statusFilter ? 'all' : s.filter); else setAssignedFilter(assignedFilter === 'unassigned' ? 'all' : 'unassigned'); }}
            className={`${s.bg} border border-slate-700 rounded-xl p-3 text-center hover:border-slate-600 transition-all`}
          >
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Team Performance Panel */}
      {telecallers.length > 0 && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowTeamPanel(p => !p)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-amber-400" />
              <span className="text-white font-semibold text-sm">Team Performance</span>
              <span className="text-slate-500 text-xs">({telecallers.length} active members)</span>
            </div>
            {showTeamPanel ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {showTeamPanel && (
            <div className="border-t border-slate-700">
              {/* Summary row */}
              <div className="grid grid-cols-4 gap-px bg-slate-700">
                {[
                  { label: 'Total Assigned', value: leads.filter(l => l.assigned_to).length },
                  { label: 'Total Calls Made', value: leads.reduce((s, l) => s + (l.follow_up_count || 0), 0) },
                  { label: 'Conversions', value: leads.filter(l => l.status === 'converted').length },
                  { label: 'Overdue Callbacks', value: leads.filter(l => l.callback_date && new Date(l.callback_date) < new Date() && l.status !== 'converted').length },
                ].map(s => (
                  <div key={s.label} className="bg-slate-800/80 px-4 py-3 text-center">
                    <p className="text-white font-bold text-lg">{s.value}</p>
                    <p className="text-slate-500 text-xs">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Per-member table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left px-4 py-2.5 text-slate-500 text-xs font-medium">Team Member</th>
                      <th className="text-center px-3 py-2.5 text-slate-500 text-xs font-medium">Assigned</th>
                      <th className="text-center px-3 py-2.5 text-slate-500 text-xs font-medium">Calls</th>
                      <th className="text-center px-3 py-2.5 text-slate-500 text-xs font-medium">Interested</th>
                      <th className="text-center px-3 py-2.5 text-slate-500 text-xs font-medium">Converted</th>
                      <th className="text-center px-3 py-2.5 text-slate-500 text-xs font-medium">Conv. Rate</th>
                      <th className="text-center px-3 py-2.5 text-slate-500 text-xs font-medium">Overdue</th>
                      <th className="text-left px-3 py-2.5 text-slate-500 text-xs font-medium">Last Activity</th>
                      <th className="text-left px-4 py-2.5 text-slate-500 text-xs font-medium">Status Breakdown</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamStats.map(tc => (
                      <tr key={tc.id} className="border-b border-slate-800 hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                              {tc.name.charAt(0).toUpperCase()}
                            </div>
                            <button
                              onClick={() => { setAssignedFilter('all'); setSearch(''); }}
                              className="text-white font-medium text-sm hover:text-amber-400 transition-colors text-left"
                            >
                              {tc.name}
                            </button>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="text-white font-semibold">{tc.total}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="text-slate-300">{tc.totalCalls}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="text-green-400 font-medium">{tc.interested}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="text-emerald-400 font-bold">{tc.converted}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`font-bold text-sm ${tc.convRate >= 20 ? 'text-emerald-400' : tc.convRate >= 10 ? 'text-yellow-400' : 'text-slate-400'}`}>
                              {tc.convRate}%
                            </span>
                            <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all ${tc.convRate >= 20 ? 'bg-emerald-500' : tc.convRate >= 10 ? 'bg-yellow-500' : 'bg-slate-500'}`}
                                style={{ width: `${Math.min(tc.convRate * 2, 100)}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          {tc.overdue > 0 ? (
                            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/30">{tc.overdue}</span>
                          ) : (
                            <span className="text-slate-600 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          {tc.lastActivity ? (
                            <div>
                              <p className="text-slate-300 text-xs">{timeAgo(tc.lastActivity)}</p>
                              <p className="text-slate-600 text-[10px]">{formatDateTime(tc.lastActivity)}</p>
                            </div>
                          ) : (
                            <span className="text-slate-600 text-xs">No activity</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {STATUS_OPTIONS.filter(s => tc.statusBreakdown[s] > 0).map(s => (
                              <span key={s} className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${STATUS_COLORS[s]}`}>
                                {STATUS_LABELS[s].split(' ')[0]}: {tc.statusBreakdown[s]}
                              </span>
                            ))}
                            {STATUS_OPTIONS.every(s => tc.statusBreakdown[s] === 0) && (
                              <span className="text-slate-600 text-xs">No leads</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {teamStats.length === 0 && (
                  <div className="text-center py-6 text-slate-500 text-sm">No active team members found</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text" placeholder="Search name, phone, location, requirement..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm">
            <option value="all">All Status</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm">
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select value={requirementFilter} onChange={e => setRequirementFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm">
            <option value="all">All Categories</option>
            {requirementOptions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={assignedFilter} onChange={e => setAssignedFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm">
            <option value="all">All Leads</option>
            <option value="assigned">Assigned</option>
            <option value="unassigned">Unassigned</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="text-slate-500 text-xs">From</span>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-xs">To</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500" />
          </div>
          {hasFilters && (
            <button onClick={() => { setDateFrom(''); setDateTo(''); setRequirementFilter('all'); setStatusFilter('all'); setPriorityFilter('all'); setAssignedFilter('all'); setSearch(''); }}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-xs transition-colors flex items-center gap-1">
              <X className="w-3 h-3" /> Clear All
            </button>
          )}
        </div>
      </div>

      {/* Leads List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-14 h-14 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">No leads found</p>
          <p className="text-slate-600 text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(lead => {
            const isExpanded = expandedId === lead.id;
            const isEditing = editingLead === lead.id;
            const leadRemarks = remarksMap[lead.id] || [];
            const isOverdue = lead.callback_date && new Date(lead.callback_date) < new Date();
            const telecallerName = getTelecallerName(lead.assigned_to);

            return (
              <div key={lead.id} className={`bg-slate-800/60 border rounded-xl transition-all ${isExpanded ? 'border-amber-500/40' : 'border-slate-700 hover:border-slate-600'}`}>
                {/* Lead Card Header */}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Status dot */}
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                      lead.status === 'new' ? 'bg-blue-400' :
                      lead.status === 'interested' ? 'bg-green-400' :
                      lead.status === 'converted' ? 'bg-emerald-400' :
                      lead.status === 'callback' ? 'bg-orange-400' :
                      lead.status === 'not_interested' ? 'bg-red-400' :
                      'bg-slate-500'
                    }`} />

                    <div className="flex-1 min-w-0">
                      {/* Name & badges */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-white font-bold text-base">{lead.full_name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[lead.status] || STATUS_COLORS.new}`}>
                          {STATUS_LABELS[lead.status] || lead.status}
                        </span>
                        {lead.priority === 'high' && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${PRIORITY_COLORS.high}`}>
                            <Star className="w-2.5 h-2.5 inline mr-0.5" />High
                          </span>
                        )}
                        {lead.invoice_number && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <FileText className="w-2.5 h-2.5 inline mr-0.5" />Invoice
                          </span>
                        )}
                        {isOverdue && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                            <AlertCircle className="w-2.5 h-2.5 inline mr-0.5" />Overdue
                          </span>
                        )}
                      </div>

                      {/* Info grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1.5 text-sm mb-2">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <a href={`tel:${lead.contact_number}`} className="text-white font-medium hover:text-amber-400 transition-colors">{lead.contact_number}</a>
                        </div>
                        {lead.alternate_number && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="text-slate-400 text-xs">{lead.alternate_number}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="text-slate-300 text-sm">{lead.location || '—'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="text-slate-300 text-sm">{lead.requirement || '—'}</span>
                        </div>
                        <div className="col-span-2 md:col-span-1 text-xs text-slate-500">
                          By: <span className="text-slate-400">{lead.collected_by}</span>
                        </div>
                        <div className="text-xs text-slate-500">
                          Assigned: <span className={telecallerName ? 'text-slate-400' : 'text-orange-400'}>{telecallerName || 'Unassigned'}</span>
                        </div>
                        <div className="text-xs text-slate-500">
                          Added: <span className="text-slate-400">{formatDateTime(lead.created_at)}</span>
                        </div>
                        {lead.last_called_at && (
                          <div className="text-xs text-slate-500">
                            Last call: <span className="text-slate-400">{timeAgo(lead.last_called_at)}</span>
                          </div>
                        )}
                        {lead.callback_date && (
                          <div className={`text-xs ${isOverdue ? 'text-red-400' : 'text-orange-400'}`}>
                            <Clock className="w-3 h-3 inline mr-0.5" />
                            Callback: {formatDateTime(lead.callback_date)}
                          </div>
                        )}
                      </div>

                      {/* Assignment row */}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                          <select
                            value={lead.assigned_to || ''}
                            onChange={e => assignTelecaller(lead.id, e.target.value)}
                            className="bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-500"
                          >
                            <option value="">Unassigned</option>
                            {telecallers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                          </select>
                        </div>
                        {lead.follow_up_count > 0 && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <PhoneCall className="w-3 h-3" />{lead.follow_up_count} follow-up{lead.follow_up_count > 1 ? 's' : ''}
                          </span>
                        )}
                        {lead.invoice_number && (
                          <span className="text-xs text-emerald-400 flex items-center gap-1">
                            <FileText className="w-3 h-3" />#{lead.invoice_number}
                            {lead.invoice_amount ? ` · ₹${Number(lead.invoice_amount).toLocaleString('en-IN')}` : ''}
                          </span>
                        )}
                      </div>

                      {/* Quick status buttons */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {STATUS_OPTIONS.map(s => (
                          <button key={s} onClick={() => updateStatus(lead.id, s)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                              lead.status === s
                                ? STATUS_COLORS[s] + ' font-semibold'
                                : 'bg-slate-700/60 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                            }`}>
                            {STATUS_LABELS[s]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        onClick={() => updatePriority(lead.id, lead.priority === 'high' ? 'normal' : 'high')}
                        className={`p-2 rounded-lg transition-colors ${
                          lead.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-400 hover:text-white'
                        }`}
                        title={lead.priority === 'high' ? 'Remove high priority' : 'Mark as high priority'}
                      >
                        <Star className={`w-4 h-4 ${lead.priority === 'high' ? 'fill-red-400' : ''}`} />
                      </button>
                      <button
                        onClick={() => toggleExpand(lead)}
                        className={`p-2 rounded-lg transition-colors text-xs flex items-center gap-1 ${
                          isExpanded ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400 hover:text-white'
                        }`}
                        title="View conversation"
                      >
                        <MessageSquare className="w-4 h-4" />
                        {leadRemarks.length > 0 && <span>{leadRemarks.length}</span>}
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                      <button onClick={() => { if (isEditing) { setEditingLead(null); } else { openEdit(lead); } }}
                        className={`p-2 rounded-lg transition-colors ${isEditing ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
                        title="Edit details">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteLead(lead.id)} className="p-2 bg-slate-700 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Edit Panel */}
                {isEditing && (
                  <div className="border-t border-slate-700 p-4 bg-slate-800/40 space-y-3">
                    <p className="text-slate-300 text-sm font-semibold flex items-center gap-2"><Pencil className="w-3.5 h-3.5 text-amber-400" /> Edit Lead Details</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Admin Remarks / Notes</label>
                        <textarea value={editForm.remarks || ''} onChange={e => setEditForm(f => ({ ...f, remarks: e.target.value }))}
                          rows={2} placeholder="Internal notes..."
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Schedule Callback</label>
                        <input type="datetime-local" value={editForm.callback_date as string || ''}
                          onChange={e => setEditForm(f => ({ ...f, callback_date: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Invoice Number</label>
                        <input type="text" value={editForm.invoice_number || ''} onChange={e => setEditForm(f => ({ ...f, invoice_number: e.target.value }))}
                          placeholder="e.g. INV-001"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Invoice Amount (₹)</label>
                        <input type="number" value={editForm.invoice_amount || ''} onChange={e => setEditForm(f => ({ ...f, invoice_amount: Number(e.target.value) }))}
                          placeholder="0"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500" />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => setEditingLead(null)} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm">Cancel</button>
                      <button onClick={() => saveEdit(lead)} disabled={saving}
                        className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                        {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                        Save
                      </button>
                    </div>
                  </div>
                )}

                {/* Conversation Panel */}
                {isExpanded && (
                  <div className="border-t border-slate-700 bg-slate-900/40">
                    <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-amber-400" />
                      <span className="text-white text-sm font-semibold">Conversation History</span>
                      <span className="text-slate-500 text-xs">({leadRemarks.length} entries)</span>
                    </div>

                    {/* Remarks list */}
                    <div className="max-h-72 overflow-y-auto px-4 py-3 space-y-3">
                      {loadingRemarks === lead.id ? (
                        <div className="flex justify-center py-6">
                          <div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                        </div>
                      ) : leadRemarks.length === 0 ? (
                        <div className="text-center py-6 text-slate-500">
                          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
                          <p className="text-sm">No conversation yet — add the first remark below</p>
                        </div>
                      ) : leadRemarks.map((r, idx) => {
                        const meta = CALL_TYPE_META[r.call_type || 'general'] || CALL_TYPE_META.general;
                        return (
                          <div key={r.id} className="relative pl-7">
                            {idx < leadRemarks.length - 1 && <div className="absolute left-2.5 top-6 bottom-0 w-px bg-slate-700/60" />}
                            <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                              {r.user_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-2.5">
                              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                <span className="text-white text-xs font-semibold">{r.user_name}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${ROLE_COLORS[r.user_role] || 'bg-slate-700 text-slate-400'}`}>
                                  {r.user_role?.replace(/_/g, ' ')}
                                </span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium border ${meta.bg} ${meta.color}`}>{meta.label}</span>
                                <span className="text-slate-600 text-[10px] ml-auto">{formatDateTime(r.created_at)}</span>
                              </div>
                              <p className="text-slate-200 text-sm leading-relaxed">{r.remark}</p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={remarkEndRef} />
                    </div>

                    {/* Add remark */}
                    <div className="px-4 pb-4 pt-2 border-t border-slate-800">
                      <div className="flex gap-1.5 mb-2 flex-wrap">
                        {(['answered', 'not_answered', 'busy', 'general'] as const).map(ct => {
                          const meta = CALL_TYPE_META[ct];
                          return (
                            <button key={ct} onClick={() => setRemarkCallType(ct)}
                              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                                remarkCallType === ct ? `${meta.bg} ${meta.color}` : 'bg-slate-700 text-slate-400 hover:text-white border-transparent'
                              }`}>
                              {meta.label}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex gap-2">
                        <textarea
                          value={newRemark}
                          onChange={e => setNewRemark(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendRemark(lead); }}}
                          placeholder="Add a call note or remark... (Enter to send)"
                          rows={2}
                          className="flex-1 px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm resize-none focus:outline-none focus:border-amber-500"
                        />
                        <button onClick={() => sendRemark(lead)} disabled={sendingRemark || !newRemark.trim()}
                          className="self-end px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl text-sm disabled:opacity-50 flex items-center gap-1.5 font-medium">
                          {sendingRemark ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
