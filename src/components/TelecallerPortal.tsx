import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  LogOut, Phone, MapPin, Clock, MessageSquare, CheckCircle,
  Calendar, RefreshCw, Search, X, Bell,
  Shield, Send, ChevronRight, Zap, PhoneCall, PhoneMissed,
  PhoneOff, Star, TrendingUp, FileText, Target, ChevronDown,
  ChevronUp, Info, BarChart2, Activity
} from 'lucide-react';
import ProfileAvatar from './ProfileAvatar';

interface Lead {
  id: string;
  full_name: string;
  contact_number: string;
  alternate_number: string;
  location: string;
  requirement: string;
  requirement_details: string;
  status: string;
  remarks: string;
  callback_date: string | null;
  priority: string;
  follow_up_count: number;
  last_called_at: string | null;
  collected_by: string;
  created_at: string;
  updated_at: string;
  invoice_number?: string | null;
  invoice_amount?: number | null;
}

interface LeadRemark {
  id: string;
  lead_id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  remark: string;
  call_type: string;
  created_at: string;
  lead?: { full_name: string; contact_number: string };
}

const CALL_TYPE_OPTIONS = [
  { value: 'telecaller_call', label: 'Client Call', icon: PhoneCall },
  { value: 'not_answered', label: 'Not Answered', icon: PhoneMissed },
  { value: 'busy', label: 'Busy', icon: PhoneOff },
  { value: 'general', label: 'Note', icon: MessageSquare },
];

const CALL_TYPE_META: Record<string, { label: string; color: string; bg: string }> = {
  telecaller_call: { label: 'Client Call', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
  answered: { label: 'Answered', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  executive_visit: { label: 'Field Visit', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  manager_review: { label: 'Manager Review', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  not_answered: { label: 'Not Answered', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  busy: { label: 'Busy', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  general: { label: 'Note', color: 'text-slate-400', bg: 'bg-slate-700/40 border-slate-600/30' },
};

const STATUS_OPTIONS = ['new', 'called', 'interested', 'not_interested', 'not_answered', 'converted', 'callback', 'closed'];
const STATUS_LABELS: Record<string, string> = {
  new: 'New', called: 'Called', interested: 'Interested',
  not_interested: 'Not Interested', not_answered: 'Not Answered',
  converted: 'Converted', callback: 'Callback', closed: 'Closed',
};
const STATUS_COLORS: Record<string, string> = {
  new: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  called: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  interested: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  not_interested: 'bg-red-500/20 text-red-400 border-red-500/30',
  not_answered: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  converted: 'bg-green-500/20 text-green-400 border-green-500/30',
  callback: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  closed: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
};
const PRIORITY_COLORS: Record<string, string> = {
  high: 'text-red-400 bg-red-500/10 border border-red-500/20',
  medium: 'text-amber-400 bg-amber-500/10 border border-amber-500/20',
  low: 'text-green-400 bg-green-500/10 border border-green-500/20',
};
const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

function formatDT(val: string | null | undefined) {
  if (!val) return '—';
  const d = new Date(val);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function timeAgo(val: string | null | undefined) {
  if (!val) return '';
  const diff = Date.now() - new Date(val).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

type Tab = 'leads' | 'callbacks' | 'conversations' | 'stats';

export default function TelecallerPortal() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('leads');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Lead modal
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [callbackDate, setCallbackDate] = useState('');
  const [newRemark, setNewRemark] = useState('');
  const [newCallType, setNewCallType] = useState('telecaller_call');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [remarks, setRemarks] = useState<LeadRemark[]>([]);
  const [remarkLoading, setRemarkLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendingRemark, setSendingRemark] = useState(false);

  // Inline expand for leads list
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [remarksMap, setRemarksMap] = useState<Record<string, LeadRemark[]>>({});
  const [loadingRemarks, setLoadingRemarks] = useState<string | null>(null);
  const [inlineRemark, setInlineRemark] = useState('');
  const [inlineCallType, setInlineCallType] = useState('telecaller_call');
  const [sendingInline, setSendingInline] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'priority' | 'date' | 'callbacks' | 'last_called'>('priority');

  // Conversations tab
  const [allConversations, setAllConversations] = useState<LeadRemark[]>([]);
  const [convLoading, setConvLoading] = useState(false);
  const [convSearch, setConvSearch] = useState('');

  const remarkEndRef = useRef<HTMLDivElement>(null);

  const dueCallbacks = useMemo(() => leads.filter(l => l.callback_date && new Date(l.callback_date) <= new Date()), [leads]);
  const todayCallbacks = useMemo(() => leads.filter(l => {
    if (!l.callback_date) return false;
    const d = new Date(l.callback_date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }), [leads]);

  const filtered = useMemo(() => leads
    .filter(l => {
      const matchStatus = statusFilter === 'all' || l.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || l.priority === priorityFilter;
      const q = search.toLowerCase();
      const matchSearch = !q || l.full_name.toLowerCase().includes(q) || l.contact_number.includes(q)
        || (l.location || '').toLowerCase().includes(q) || (l.requirement || '').toLowerCase().includes(q);
      return matchStatus && matchPriority && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') return (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1);
      if (sortBy === 'callbacks') return (b.callback_date ? 1 : 0) - (a.callback_date ? 1 : 0);
      if (sortBy === 'last_called') {
        const aT = a.last_called_at ? new Date(a.last_called_at).getTime() : 0;
        const bT = b.last_called_at ? new Date(b.last_called_at).getTime() : 0;
        return aT - bT;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }), [leads, statusFilter, priorityFilter, search, sortBy]);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    try {
      if (!user?.id) return;
      const { data } = await supabase
        .from('marketing_leads')
        .select('*')
        .eq('assigned_to', user.id)
        .order('created_at', { ascending: false });
      setLeads((data || []) as Lead[]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    setConvLoading(true);
    const { data } = await supabase
      .from('lead_remarks')
      .select('*, lead:marketing_leads(full_name, contact_number)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(300);
    setAllConversations((data || []) as LeadRemark[]);
    setConvLoading(false);
  }, [user?.id]);

  useEffect(() => { loadLeads(); const t = setInterval(loadLeads, 60000); return () => clearInterval(t); }, [loadLeads]);
  useEffect(() => { if (activeTab === 'conversations') loadConversations(); }, [activeTab, loadConversations]);

  async function openLead(lead: Lead) {
    setSelectedLead(lead);
    setNewRemark('');
    setNewCallType('telecaller_call');
    setCallbackDate(lead.callback_date ? new Date(lead.callback_date).toISOString().slice(0, 16) : '');
    setNewStatus(lead.status);
    setInvoiceNumber(lead.invoice_number || '');
    setInvoiceAmount(lead.invoice_amount ? String(lead.invoice_amount) : '');
    setRemarkLoading(true);
    const { data } = await supabase.from('lead_remarks').select('*').eq('lead_id', lead.id).order('created_at', { ascending: true });
    setRemarks((data || []) as LeadRemark[]);
    setRemarkLoading(false);
    setTimeout(() => remarkEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 200);
  }

  async function saveLead() {
    if (!selectedLead) return;
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const updates: any = {
        status: newStatus,
        callback_date: callbackDate || null,
        last_called_at: now,
        follow_up_count: (selectedLead.follow_up_count || 0) + 1,
        updated_at: now,
        invoice_number: invoiceNumber.trim() || null,
        invoice_amount: invoiceAmount ? Number(invoiceAmount) : null,
      };
      const { error: updateErr } = await supabase.from('marketing_leads').update(updates).eq('id', selectedLead.id);
      if (updateErr) throw updateErr;
      if (newRemark.trim()) {
        await supabase.from('lead_remarks').insert({
          lead_id: selectedLead.id, user_id: user!.id,
          user_name: user!.full_name, user_role: user!.role,
          remark: newRemark.trim(), call_type: newCallType,
        });
      }
      setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, ...updates } : l));
      setSelectedLead(null);
    } catch {
      // keep modal open so user can retry
    } finally {
      setSaving(false);
    }
  }

  async function quickStatusUpdate(lead: Lead, status: string) {
    const now = new Date().toISOString();
    await supabase.from('marketing_leads').update({ status, updated_at: now }).eq('id', lead.id);
    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status } : l));
  }

  async function sendInlineRemark(lead: Lead) {
    if (!inlineRemark.trim()) return;
    setSendingInline(true);
    try {
      const now = new Date().toISOString();
      await supabase.from('lead_remarks').insert({
        lead_id: lead.id, user_id: user!.id,
        user_name: user!.full_name, user_role: user!.role,
        remark: inlineRemark.trim(), call_type: inlineCallType,
      });
      await supabase.from('marketing_leads').update({
        last_called_at: now,
        follow_up_count: (lead.follow_up_count || 0) + 1,
        updated_at: now,
      }).eq('id', lead.id);
      const { data } = await supabase.from('lead_remarks').select('*').eq('lead_id', lead.id).order('created_at', { ascending: true });
      setRemarksMap(prev => ({ ...prev, [lead.id]: (data || []) as LeadRemark[] }));
      setLeads(prev => prev.map(l => l.id === lead.id
        ? { ...l, last_called_at: now, follow_up_count: (l.follow_up_count || 0) + 1 }
        : l
      ));
      setInlineRemark('');
    } finally {
      setSendingInline(false);
    }
  }

  async function toggleExpand(lead: Lead) {
    if (expandedId === lead.id) { setExpandedId(null); return; }
    setExpandedId(lead.id);
    setInlineRemark('');
    if (!remarksMap[lead.id]) {
      setLoadingRemarks(lead.id);
      const { data } = await supabase.from('lead_remarks').select('*').eq('lead_id', lead.id).order('created_at', { ascending: true });
      setRemarksMap(prev => ({ ...prev, [lead.id]: (data || []) as LeadRemark[] }));
      setLoadingRemarks(null);
    }
  }

  async function addRemarkFromModal() {
    if (!selectedLead || !newRemark.trim()) return;
    setSendingRemark(true);
    try {
      await supabase.from('lead_remarks').insert({
        lead_id: selectedLead.id, user_id: user!.id,
        user_name: user!.full_name, user_role: user!.role,
        remark: newRemark.trim(), call_type: newCallType,
      });
      const { data } = await supabase.from('lead_remarks').select('*').eq('lead_id', selectedLead.id).order('created_at', { ascending: true });
      setRemarks((data || []) as LeadRemark[]);
      setNewRemark('');
      setTimeout(() => remarkEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } finally {
      setSendingRemark(false);
    }
  }

  const stats = useMemo(() => ({
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    interested: leads.filter(l => l.status === 'interested').length,
    converted: leads.filter(l => l.status === 'converted').length,
    notAnswered: leads.filter(l => l.status === 'not_answered').length,
    closed: leads.filter(l => l.status === 'closed').length,
    callbacks: dueCallbacks.length,
    callsMade: leads.reduce((sum, l) => sum + (l.follow_up_count || 0), 0),
    conversionRate: leads.length > 0 ? Math.round((leads.filter(l => l.status === 'converted').length / leads.length) * 100) : 0,
  }), [leads, dueCallbacks.length]);

  const filteredConversations = useMemo(() => allConversations.filter(r => {
    if (!convSearch) return true;
    const q = convSearch.toLowerCase();
    return r.remark.toLowerCase().includes(q) || r.user_name.toLowerCase().includes(q)
      || (r.lead as any)?.full_name?.toLowerCase().includes(q)
      || (r.lead as any)?.contact_number?.includes(q);
  }), [allConversations, convSearch]);

  if (!user || user.role !== 'telecaller') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">Access Denied</h2>
          <p className="text-slate-400 text-sm mb-6">You do not have permission to access the telecaller portal.</p>
          <button onClick={signOut} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl text-sm hover:bg-red-500/30">Sign Out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <Phone className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-none">{user?.full_name}</p>
              <p className="text-slate-500 text-xs">Telecaller · {stats.callsMade} calls logged</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {dueCallbacks.length > 0 && (
              <button onClick={() => setActiveTab('callbacks')} className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full">
                <Bell className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-orange-400 text-xs font-medium">{dueCallbacks.length} due</span>
              </button>
            )}
            <button onClick={loadLeads} className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <ProfileAvatar size="sm" />
            <button onClick={signOut} className="text-slate-400 hover:text-red-400 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Stats strip */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Assigned', value: stats.total, color: 'text-white' },
            { label: 'Interested', value: stats.interested, color: 'text-amber-400' },
            { label: 'Converted', value: stats.converted, color: 'text-green-400' },
            { label: 'Rate', value: stats.conversionRate + '%', color: 'text-teal-400' },
          ].map(s => (
            <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-center">
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Due callbacks alert */}
        {dueCallbacks.length > 0 && activeTab === 'leads' && (
          <div className="p-3.5 bg-orange-500/10 border border-orange-500/30 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-orange-400" />
                <p className="text-orange-400 font-medium text-sm">{dueCallbacks.length} Callback(s) Due Now</p>
              </div>
              <button onClick={() => setActiveTab('callbacks')} className="text-xs text-orange-400 underline">View all</button>
            </div>
            <div className="space-y-1">
              {dueCallbacks.slice(0, 3).map(l => (
                <button key={l.id} onClick={() => openLead(l)}
                  className="w-full text-left text-xs text-slate-300 hover:text-amber-400 transition-colors py-0.5 flex items-center gap-2">
                  <ChevronRight className="w-3 h-3 shrink-0" />
                  <span className="font-medium">{l.full_name}</span>
                  <span className="text-slate-500">{l.contact_number}</span>
                  <span className="ml-auto text-orange-400">{timeAgo(l.callback_date)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Leads Tab */}
        {activeTab === 'leads' && (
          <>
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text" placeholder="Search name, phone, location..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  className="flex-shrink-0 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 text-xs">
                  <option value="all">All Status</option>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
                <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
                  className="flex-shrink-0 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 text-xs">
                  <option value="all">All Priority</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
                  className="flex-shrink-0 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 text-xs">
                  <option value="priority">By Priority</option>
                  <option value="date">By Date</option>
                  <option value="callbacks">Callbacks First</option>
                  <option value="last_called">Least Called</option>
                </select>
                {(statusFilter !== 'all' || priorityFilter !== 'all' || search) && (
                  <button onClick={() => { setStatusFilter('all'); setPriorityFilter('all'); setSearch(''); }}
                    className="flex-shrink-0 p-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-white text-xs">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-600">{filtered.length} of {leads.length} leads</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <Phone className="w-12 h-12 text-slate-800 mx-auto mb-3" />
                <p className="text-slate-400">No leads match your filters</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map(lead => {
                  const isExpanded = expandedId === lead.id;
                  const leadRemarks = remarksMap[lead.id] || [];
                  const isOverdue = lead.callback_date && new Date(lead.callback_date) < new Date();
                  const isDueToday = lead.callback_date && new Date(lead.callback_date).toDateString() === new Date().toDateString();

                  return (
                    <div key={lead.id} className={`bg-slate-900 border rounded-xl transition-all ${
                      isOverdue ? 'border-orange-500/40' : isExpanded ? 'border-sky-500/30' : 'border-slate-800 hover:border-slate-700'
                    }`}>
                      {/* Lead card */}
                      <button className="w-full text-left p-4" onClick={() => openLead(lead)}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-white font-semibold text-sm">{lead.full_name}</h3>
                              {lead.priority === 'high' && <Star className="w-3.5 h-3.5 text-red-400 fill-red-400" />}
                              {lead.invoice_number && <span title="Has invoice"><FileText className="w-3.5 h-3.5 text-teal-400" /></span>}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Phone className="w-3 h-3 text-amber-500" />
                              <span className="text-amber-400 text-sm font-medium">{lead.contact_number}</span>
                              {lead.alternate_number && <span className="text-slate-500 text-xs">/ {lead.alternate_number}</span>}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[lead.status] || STATUS_COLORS.new}`}>
                              {STATUS_LABELS[lead.status] || lead.status}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[lead.priority] || PRIORITY_COLORS.medium}`}>
                              {lead.priority}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-slate-500 mb-2">
                          <span className="flex items-center gap-1 truncate"><MapPin className="w-3 h-3 shrink-0" />{lead.location || '—'}</span>
                          <span className="flex items-center gap-1 truncate"><Zap className="w-3 h-3 shrink-0" />{lead.requirement || '—'}</span>
                          <span className="flex items-center gap-1"><PhoneCall className="w-3 h-3" />{lead.follow_up_count || 0} calls</span>
                          {lead.last_called_at && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Last: {timeAgo(lead.last_called_at)}</span>}
                        </div>

                        {lead.callback_date && (
                          <div className={`flex items-center gap-1 text-xs font-medium mt-1 ${isOverdue ? 'text-orange-400' : isDueToday ? 'text-amber-400' : 'text-slate-500'}`}>
                            <Calendar className="w-3 h-3" />
                            Callback: {new Date(lead.callback_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                            {' · '}
                            {new Date(lead.callback_date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            {isOverdue && ' — OVERDUE'}
                            {!isOverdue && isDueToday && ' — Today'}
                          </div>
                        )}
                      </button>

                      {/* Quick actions bar */}
                      <div className="px-4 pb-3 flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleExpand(lead); }}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            isExpanded ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          {leadRemarks.length > 0 ? leadRemarks.length : 'Log'}
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                        {/* Quick status chips */}
                        <div className="flex gap-1 overflow-x-auto flex-1">
                          {['called', 'interested', 'not_answered', 'callback'].map(s => (
                            <button key={s} onClick={() => quickStatusUpdate(lead, s)}
                              className={`flex-shrink-0 px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                                lead.status === s ? STATUS_COLORS[s] : 'bg-slate-800/80 text-slate-500 hover:text-slate-300'
                              }`}>
                              {STATUS_LABELS[s]}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Inline conversation panel */}
                      {isExpanded && (
                        <div className="border-t border-slate-800 bg-slate-950/40">
                          <div className="max-h-60 overflow-y-auto px-4 py-3 space-y-3">
                            {loadingRemarks === lead.id ? (
                              <div className="flex justify-center py-4">
                                <div className="w-5 h-5 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
                              </div>
                            ) : leadRemarks.length === 0 ? (
                              <p className="text-slate-600 text-xs text-center py-4">No conversation yet — log your first call below</p>
                            ) : leadRemarks.map((r, idx) => {
                              const meta = CALL_TYPE_META[r.call_type] || CALL_TYPE_META.general;
                              return (
                                <div key={r.id} className="relative pl-7">
                                  {idx < leadRemarks.length - 1 && <div className="absolute left-2.5 top-6 bottom-0 w-px bg-slate-800" />}
                                  <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
                                    {r.user_name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-2.5">
                                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                      <span className="text-white text-xs font-semibold">{r.user_name}</span>
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium border ${meta.bg} ${meta.color}`}>{meta.label}</span>
                                      <span className="text-slate-500 text-[10px] ml-auto">{formatDT(r.created_at)}</span>
                                    </div>
                                    <p className="text-slate-300 text-xs leading-relaxed">{r.remark}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Inline add remark */}
                          <div className="px-4 pb-4 pt-2 border-t border-slate-800 space-y-2">
                            <div className="flex gap-1.5 overflow-x-auto">
                              {CALL_TYPE_OPTIONS.map(opt => {
                                const Icon = opt.icon;
                                return (
                                  <button key={opt.value} onClick={() => setInlineCallType(opt.value)}
                                    className={`flex-shrink-0 flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                      inlineCallType === opt.value
                                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                                        : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                                    }`}>
                                    <Icon className="w-3 h-3" />{opt.label}
                                  </button>
                                );
                              })}
                            </div>
                            <div className="flex gap-2">
                              <textarea
                                value={inlineRemark}
                                onChange={e => setInlineRemark(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendInlineRemark(lead); } }}
                                placeholder="Type call notes... (Enter to send)"
                                rows={2}
                                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-xs resize-none"
                              />
                              <button onClick={() => sendInlineRemark(lead)} disabled={sendingInline || !inlineRemark.trim()}
                                className="self-end p-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition-colors disabled:opacity-40">
                                {sendingInline ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
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
          </>
        )}

        {/* Callbacks Tab */}
        {activeTab === 'callbacks' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold">Scheduled Callbacks</h2>
              <span className="text-xs text-slate-500">{dueCallbacks.length} overdue · {todayCallbacks.length} today</span>
            </div>

            {dueCallbacks.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-green-400/40 mx-auto mb-3" />
                <p className="text-slate-400">No overdue callbacks</p>
              </div>
            )}

            {dueCallbacks.length > 0 && (
              <div>
                <p className="text-xs text-red-400 font-semibold mb-2 uppercase tracking-wide">Overdue</p>
                <div className="space-y-2">
                  {dueCallbacks.map(lead => (
                    <button key={lead.id} onClick={() => openLead(lead)} className="w-full text-left bg-red-500/5 border border-red-500/20 rounded-xl p-4 hover:border-red-500/40 transition-all">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-white font-semibold text-sm">{lead.full_name}</p>
                          <p className="text-amber-400 text-sm">{lead.contact_number}</p>
                          <p className="text-slate-500 text-xs mt-1">{lead.requirement} · {lead.location}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[lead.status]}`}>{STATUS_LABELS[lead.status]}</span>
                          <p className="text-red-400 text-xs mt-1 font-medium">{timeAgo(lead.callback_date)} overdue</p>
                          <p className="text-slate-600 text-[10px]">{formatDT(lead.callback_date)}</p>
                        </div>
                      </div>
                      {lead.remarks && <p className="text-slate-500 text-xs mt-2 italic line-clamp-1">{lead.remarks}</p>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming callbacks */}
            {(() => {
              const upcoming = leads.filter(l => l.callback_date && new Date(l.callback_date) > new Date())
                .sort((a, b) => new Date(a.callback_date!).getTime() - new Date(b.callback_date!).getTime())
                .slice(0, 10);
              if (upcoming.length === 0) return null;
              return (
                <div>
                  <p className="text-xs text-amber-400 font-semibold mb-2 uppercase tracking-wide">Upcoming</p>
                  <div className="space-y-2">
                    {upcoming.map(lead => (
                      <button key={lead.id} onClick={() => openLead(lead)} className="w-full text-left bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-amber-500/30 transition-all">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-white font-semibold text-sm">{lead.full_name}</p>
                            <p className="text-amber-400 text-sm">{lead.contact_number}</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-0.5 rounded-full text-xs border ${STATUS_COLORS[lead.status]}`}>{STATUS_LABELS[lead.status]}</span>
                            <p className="text-slate-400 text-xs mt-1">{formatDT(lead.callback_date)}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Conversations Tab */}
        {activeTab === 'conversations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold">All Conversations</h2>
              <button onClick={loadConversations} className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-amber-400 transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input value={convSearch} onChange={e => setConvSearch(e.target.value)} placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm" />
            </div>
            {convLoading ? (
              <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" /></div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-16"><MessageSquare className="w-12 h-12 text-slate-800 mx-auto mb-3" /><p className="text-slate-400">No conversations yet</p></div>
            ) : (
              <div className="space-y-3">
                {filteredConversations.map((r, idx) => {
                  const meta = CALL_TYPE_META[r.call_type] || CALL_TYPE_META.general;
                  return (
                    <div key={r.id} className="relative pl-8">
                      {idx < filteredConversations.length - 1 && <div className="absolute left-3 top-6 bottom-0 w-px bg-slate-800" />}
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
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium border ${meta.bg} ${meta.color}`}>{meta.label}</span>
                          <span className="text-slate-500 text-xs ml-auto">{formatDT(r.created_at)}</span>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed">{r.remark}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            <h2 className="text-white font-bold">My Performance</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total Leads', value: stats.total, color: 'text-white', icon: Target },
                { label: 'Calls Made', value: stats.callsMade, color: 'text-sky-400', icon: PhoneCall },
                { label: 'Interested', value: stats.interested, color: 'text-amber-400', icon: TrendingUp },
                { label: 'Converted', value: stats.converted, color: 'text-green-400', icon: CheckCircle },
                { label: 'Not Answered', value: stats.notAnswered, color: 'text-red-400', icon: PhoneMissed },
                { label: 'Conversion Rate', value: stats.conversionRate + '%', color: 'text-teal-400', icon: BarChart2 },
              ].map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                      <Icon className={`w-5 h-5 ${s.color}`} />
                    </div>
                    <div>
                      <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-slate-500 text-xs">{s.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-3">Status Breakdown</p>
              <div className="space-y-2">
                {STATUS_OPTIONS.map(s => {
                  const count = leads.filter(l => l.status === s).length;
                  const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <div key={s}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-400 text-xs">{STATUS_LABELS[s]}</span>
                        <span className="text-white text-xs font-medium">{count} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-3">Priority Breakdown</p>
              <div className="grid grid-cols-3 gap-2">
                {['high', 'medium', 'low'].map(p => {
                  const count = leads.filter(l => l.priority === p).length;
                  return (
                    <div key={p} className={`rounded-xl p-3 text-center border ${PRIORITY_COLORS[p]}`}>
                      <p className="text-xl font-bold">{count}</p>
                      <p className="text-xs capitalize mt-0.5 opacity-80">{p}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-30">
        <div className="max-w-2xl mx-auto px-4 flex">
          {([
            { key: 'leads' as Tab, icon: PhoneCall, label: 'My Leads' },
            { key: 'callbacks' as Tab, icon: Calendar, label: 'Callbacks', badge: dueCallbacks.length },
            { key: 'conversations' as Tab, icon: MessageSquare, label: 'History' },
            { key: 'stats' as Tab, icon: BarChart2, label: 'Stats' },
          ]).map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors relative ${
                activeTab === t.key ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
              }`}>
              <t.icon className="w-5 h-5" />
              {t.label}
              {t.badge && t.badge > 0 && (
                <span className="absolute top-1.5 right-1/4 min-w-[14px] h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/85 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-5 py-4 flex items-center justify-between z-10">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-bold text-base">{selectedLead.full_name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs border ${STATUS_COLORS[selectedLead.status]}`}>{STATUS_LABELS[selectedLead.status]}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <a href={`tel:${selectedLead.contact_number}`} className="text-amber-400 text-sm font-medium hover:text-amber-300 flex items-center gap-1">
                    <Phone className="w-3 h-3" />{selectedLead.contact_number}
                  </a>
                  {selectedLead.alternate_number && <span className="text-slate-500 text-xs">/ {selectedLead.alternate_number}</span>}
                </div>
              </div>
              <button onClick={() => setSelectedLead(null)} className="p-2 hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Location', value: selectedLead.location || '—' },
                  { label: 'Requirement', value: selectedLead.requirement || '—' },
                  { label: 'Priority', value: selectedLead.priority },
                  { label: 'Follow-ups', value: String(selectedLead.follow_up_count || 0) },
                  { label: 'Collected By', value: selectedLead.collected_by || '—' },
                  { label: 'Added', value: formatDT(selectedLead.created_at) },
                ].map(f => (
                  <div key={f.label} className="bg-slate-800/60 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-0.5">{f.label}</p>
                    <p className="text-white text-sm">{f.value}</p>
                  </div>
                ))}
              </div>

              {selectedLead.requirement_details && (
                <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Info className="w-3 h-3" />Field Notes</p>
                  <p className="text-slate-300 text-sm">{selectedLead.requirement_details}</p>
                </div>
              )}

              {/* Invoice display */}
              {(selectedLead.invoice_number || selectedLead.invoice_amount) && (
                <div className="bg-teal-500/5 border border-teal-500/20 rounded-xl p-3 flex items-center gap-6">
                  <div><p className="text-xs text-slate-500 mb-0.5">Invoice</p><p className="text-teal-400 font-semibold">{selectedLead.invoice_number || '—'}</p></div>
                  {selectedLead.invoice_amount && <div><p className="text-xs text-slate-500 mb-0.5">Amount</p><p className="text-teal-400 font-bold">₹{Number(selectedLead.invoice_amount).toLocaleString('en-IN')}</p></div>}
                </div>
              )}

              {/* Status update */}
              <div>
                <p className="text-xs text-slate-400 font-medium mb-2.5">Update Status</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {STATUS_OPTIONS.map(s => (
                    <button key={s} onClick={() => setNewStatus(s)}
                      className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                        newStatus === s ? STATUS_COLORS[s] : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:bg-slate-700'
                      }`}>
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Callback */}
              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Schedule Callback
                </label>
                <input type="datetime-local" value={callbackDate} onChange={e => setCallbackDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm" />
              </div>

              {/* Invoice input on converted/closed */}
              {(newStatus === 'converted' || newStatus === 'closed') && (
                <div className="bg-teal-500/5 border border-teal-500/20 rounded-xl p-4 space-y-3">
                  <p className="text-xs text-teal-400 font-semibold uppercase tracking-wider">Invoice Details</p>
                  <input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} placeholder="Invoice Number e.g. INV-001"
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-sm" />
                  <input type="number" value={invoiceAmount} onChange={e => setInvoiceAmount(e.target.value)} placeholder="Invoice Amount (₹)"
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-sm" />
                </div>
              )}

              {/* Conversation log */}
              <div className="border border-slate-700/60 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-slate-800/40 border-b border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-500" />
                    <span className="text-white text-sm font-semibold">Conversation Log</span>
                  </div>
                  <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{remarks.length} entries</span>
                </div>
                <div className="p-4 space-y-3 max-h-60 overflow-y-auto">
                  {remarkLoading ? (
                    <div className="flex justify-center py-4"><div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" /></div>
                  ) : remarks.length === 0 ? (
                    <p className="text-slate-600 text-xs text-center py-3">No entries — log your first call</p>
                  ) : remarks.map((r, idx) => {
                    const meta = CALL_TYPE_META[r.call_type] || CALL_TYPE_META.general;
                    return (
                      <div key={r.id} className="relative pl-8">
                        {idx < remarks.length - 1 && <div className="absolute left-3 top-6 bottom-0 w-px bg-slate-700/60" />}
                        <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                          {r.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                            <span className="text-white text-xs font-semibold">{r.user_name}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium border ${meta.bg} ${meta.color}`}>{meta.label}</span>
                            <span className="text-slate-500 text-xs ml-auto">{formatDT(r.created_at)}</span>
                          </div>
                          <p className="text-slate-300 text-sm leading-relaxed">{r.remark}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={remarkEndRef} />
                </div>

                {/* Add remark */}
                <div className="p-3 border-t border-slate-700/60 bg-slate-800/20 space-y-2">
                  <div className="flex gap-1.5 flex-wrap">
                    {CALL_TYPE_OPTIONS.map(opt => {
                      const Icon = opt.icon;
                      return (
                        <button key={opt.value} onClick={() => setNewCallType(opt.value)}
                          className={`flex items-center gap-1 py-1.5 px-2.5 rounded-lg text-xs font-medium border transition-all ${
                            newCallType === opt.value ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : 'border-slate-700 bg-slate-800/60 text-slate-500 hover:text-slate-300'
                          }`}>
                          <Icon className="w-3 h-3" />{opt.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    <textarea value={newRemark} onChange={e => setNewRemark(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addRemarkFromModal(); } }}
                      placeholder="Log call notes... (Enter to send)"
                      rows={2}
                      className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm resize-none" />
                    <button onClick={addRemarkFromModal} disabled={!newRemark.trim() || sendingRemark}
                      className="p-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors disabled:opacity-40 self-end">
                      {sendingRemark ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Save */}
              <div className="flex gap-3 pt-1">
                <button onClick={() => setSelectedLead(null)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium">Cancel</button>
                <button onClick={saveLead} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl text-sm disabled:opacity-60">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
