import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
  Users, DollarSign, Calendar, BookOpen, Plus, X, Search, RefreshCw,
  Pencil, CheckCircle, AlertCircle, Phone, Mail, MapPin, Building2,
  CreditCard, FileText, Clock, LayoutDashboard, UserCheck, Save,
  ChevronDown, Camera, Wallet, Navigation
} from 'lucide-react';

interface StaffRecord {
  id: string;
  user_id?: string;
  employee_code?: string;
  full_name: string;
  email?: string;
  phone?: string;
  department: string;
  designation: string;
  date_of_joining?: string;
  date_of_birth?: string;
  salary_basic: number;
  salary_hra: number;
  salary_allowances: number;
  salary_deductions: number;
  bank_account?: string;
  bank_ifsc?: string;
  pan_number?: string;
  aadhar_number?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  address?: string;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  notes?: string;
  created_at: string;
}

interface PayrollRecord {
  id: string;
  staff_id: string;
  month: number;
  year: number;
  basic_pay: number;
  hra: number;
  allowances: number;
  gross_pay: number;
  pf_deduction: number;
  tds_deduction: number;
  other_deductions: number;
  total_deductions: number;
  net_pay: number;
  payment_date?: string;
  payment_mode: string;
  payment_status: 'pending' | 'paid' | 'hold';
  remarks?: string;
  created_at: string;
}

interface LeaveRequest {
  id: string;
  staff_id: string;
  leave_type: 'casual' | 'sick' | 'earned' | 'unpaid';
  from_date: string;
  to_date: string;
  days_count: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  remarks?: string;
  created_at: string;
  staff?: { full_name: string; department: string };
}

interface CRMContact {
  id: string;
  contact_type: 'vendor' | 'client' | 'partner' | 'other';
  company_name: string;
  contact_person: string;
  phone: string;
  alternate_phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  category?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
}

type HRTab = 'overview' | 'staff' | 'attendance' | 'payroll' | 'leave' | 'advances' | 'crm';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DEPTS = ['Sales', 'Marketing', 'Operations', 'Technical', 'Admin', 'HR', 'Finance', 'IT', 'Other'];

const STATUS_COLORS: Record<StaffRecord['status'], string> = {
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  inactive: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  on_leave: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  terminated: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const LEAVE_STATUS_COLORS: Record<LeaveRequest['status'], string> = {
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  approved: 'bg-green-500/20 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const PAY_STATUS_COLORS: Record<PayrollRecord['payment_status'], string> = {
  pending: 'bg-amber-500/20 text-amber-400',
  paid: 'bg-green-500/20 text-green-400',
  hold: 'bg-red-500/20 text-red-400',
};

const CONTACT_TYPE_COLORS: Record<CRMContact['contact_type'], string> = {
  vendor: 'bg-blue-500/20 text-blue-400',
  client: 'bg-green-500/20 text-green-400',
  partner: 'bg-amber-500/20 text-amber-400',
  other: 'bg-slate-500/20 text-slate-400',
};

const emptyStaff: Omit<StaffRecord, 'id' | 'created_at'> = {
  full_name: '', email: '', phone: '', department: 'Sales', designation: '',
  date_of_joining: '', date_of_birth: '', salary_basic: 0, salary_hra: 0,
  salary_allowances: 0, salary_deductions: 0, bank_account: '', bank_ifsc: '',
  pan_number: '', aadhar_number: '', emergency_contact_name: '', emergency_contact_phone: '',
  address: '', status: 'active', notes: '', employee_code: '',
};

const emptyCRM: Omit<CRMContact, 'id' | 'created_at'> = {
  contact_type: 'vendor', company_name: '', contact_person: '', phone: '',
  alternate_phone: '', email: '', address: '', city: '', state: '',
  category: '', notes: '', is_active: true,
};

export default function HRManager() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<HRTab>('overview');
  const [staff, setStaff] = useState<StaffRecord[]>([]);
  const [appUsers, setAppUsers] = useState<any[]>([]);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [crm, setCRM] = useState<CRMContact[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [advances, setAdvances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [sRes, auRes, pRes, lRes, cRes, attRes, advRes] = await Promise.all([
      supabase.from('staff_records').select('*').order('full_name'),
      supabase.from('app_users').select('id, full_name, role, email, phone, is_active, created_at, custom_role_id').order('full_name'),
      supabase.from('payroll_records').select('*').order('year', { ascending: false }).order('month', { ascending: false }),
      supabase.from('leave_requests').select('*, staff:staff_records(full_name, department)').order('created_at', { ascending: false }),
      supabase.from('office_crm_contacts').select('*').order('company_name'),
      supabase.from('attendance_records').select('*, user:app_users(full_name, role)').order('attendance_date', { ascending: false }).limit(100),
      supabase.from('salary_advance_requests').select('*, employee:app_users(full_name, role)').order('created_at', { ascending: false }),
    ]);
    setStaff(sRes.data || []);
    setAppUsers(auRes.data || []);
    setPayroll(pRes.data || []);
    setLeaves((lRes.data as LeaveRequest[]) || []);
    setCRM(cRes.data || []);
    setAttendance(attRes.data || []);
    setAdvances(advRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const activeCount = staff.filter(s => s.status === 'active').length;
  const onLeaveCount = staff.filter(s => s.status === 'on_leave').length;
  const pendingLeaves = leaves.filter(l => l.status === 'pending').length;
  const pendingAdvances = advances.filter((a: any) => a.status === 'pending').length;
  const thisMonth = new Date().getMonth() + 1;
  const thisYear = new Date().getFullYear();
  const pendingPayroll = staff.filter(s => s.status === 'active' && !payroll.find(p => p.staff_id === s.id && p.month === thisMonth && p.year === thisYear)).length;
  const totalPayroll = payroll.filter(p => p.month === thisMonth && p.year === thisYear && p.payment_status === 'paid').reduce((sum, p) => sum + p.net_pay, 0);

  const tabs: { key: HRTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'staff', label: 'Staff', icon: Users },
    { key: 'attendance', label: 'Attendance', icon: Camera },
    { key: 'payroll', label: 'Payroll', icon: DollarSign, badge: pendingPayroll || undefined },
    { key: 'leave', label: 'Leave', icon: Calendar, badge: pendingLeaves || undefined },
    { key: 'advances', label: 'Advances', icon: Wallet, badge: pendingAdvances || undefined },
    { key: 'crm', label: 'CRM', icon: BookOpen },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="bg-slate-900/60 border-b border-slate-800 px-4 md:px-6 flex gap-0.5 overflow-x-auto shrink-0">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`relative flex items-center gap-2 px-3 md:px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
              activeTab === t.key
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <t.icon className="w-4 h-4" />
            <span>{t.label}</span>
            {t.badge ? (
              <span className="ml-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                {t.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <HROverview
                staff={staff} payroll={payroll} leaves={leaves} crm={crm}
                activeCount={activeCount} onLeaveCount={onLeaveCount}
                pendingLeaves={pendingLeaves} pendingPayroll={pendingPayroll}
                totalPayroll={totalPayroll}
                onNavigate={setActiveTab}
              />
            )}
            {activeTab === 'staff' && <StaffTab staff={staff} appUsers={appUsers} onRefresh={loadAll} userId={user?.id} />}
            {activeTab === 'attendance' && <AttendanceViewTab attendance={attendance} onRefresh={loadAll} />}
            {activeTab === 'payroll' && <PayrollTab staff={staff} appUsers={appUsers} payroll={payroll} onRefresh={loadAll} userId={user?.id} />}
            {activeTab === 'leave' && <LeaveTab leaves={leaves} staff={staff} onRefresh={loadAll} userId={user?.id} />}
            {activeTab === 'advances' && <AdvancesTab advances={advances} onRefresh={loadAll} userId={user?.id} />}
            {activeTab === 'crm' && <CRMTab contacts={crm} onRefresh={loadAll} userId={user?.id} />}
          </>
        )}
      </div>
    </div>
  );
}

function HROverview({ staff, payroll, leaves, crm, activeCount, onLeaveCount, pendingLeaves, pendingPayroll, totalPayroll, onNavigate }: {
  staff: StaffRecord[]; payroll: PayrollRecord[]; leaves: LeaveRequest[]; crm: CRMContact[];
  activeCount: number; onLeaveCount: number; pendingLeaves: number; pendingPayroll: number; totalPayroll: number;
  onNavigate: (tab: HRTab) => void;
}) {
  const deptBreakdown = staff.reduce<Record<string, number>>((acc, s) => {
    if (s.status === 'active') acc[s.department] = (acc[s.department] || 0) + 1;
    return acc;
  }, {});
  const maxDept = Math.max(...Object.values(deptBreakdown), 1);
  const recentLeaves = leaves.filter(l => l.status === 'pending').slice(0, 5);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">HR Management</h2>
        <p className="text-slate-400 text-sm">Staff & payroll summary for {MONTHS[new Date().getMonth()]} {new Date().getFullYear()}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Staff', value: activeCount, color: 'bg-green-500/20 text-green-400', icon: UserCheck, tab: 'staff' as HRTab },
          { label: 'On Leave', value: onLeaveCount, color: 'bg-amber-500/20 text-amber-400', icon: Calendar, tab: 'leave' as HRTab },
          { label: 'Leave Pending', value: pendingLeaves, color: 'bg-orange-500/20 text-orange-400', icon: Clock, tab: 'leave' as HRTab },
          { label: 'CRM Contacts', value: crm.filter(c => c.is_active).length, color: 'bg-blue-500/20 text-blue-400', icon: BookOpen, tab: 'crm' as HRTab },
        ].map(s => (
          <button key={s.label} onClick={() => onNavigate(s.tab)} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-left hover:border-slate-700 transition-colors">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-slate-400 text-xs mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Payroll — {MONTHS[new Date().getMonth()]} {new Date().getFullYear()}</h3>
            <button onClick={() => onNavigate('payroll')} className="text-xs text-amber-400 hover:text-amber-300 transition-colors">View all</button>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-800 rounded-xl p-4">
              <p className="text-slate-400 text-xs mb-1">Disbursed</p>
              <p className="text-green-400 text-xl font-bold">₹{totalPayroll.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4">
              <p className="text-slate-400 text-xs mb-1">Pending</p>
              <p className="text-amber-400 text-xl font-bold">{pendingPayroll} staff</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Dept. Breakdown</h3>
            <button onClick={() => onNavigate('staff')} className="text-xs text-amber-400 hover:text-amber-300 transition-colors">View all</button>
          </div>
          <div className="space-y-2">
            {Object.entries(deptBreakdown).slice(0, 5).map(([dept, count]) => (
              <div key={dept} className="flex items-center gap-3">
                <span className="text-slate-400 text-xs w-20 shrink-0 truncate">{dept}</span>
                <div className="flex-1 bg-slate-800 rounded-full h-2">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-600 h-2 rounded-full transition-all" style={{ width: `${(count / maxDept) * 100}%` }} />
                </div>
                <span className="text-slate-300 text-xs w-4 shrink-0">{count}</span>
              </div>
            ))}
            {Object.keys(deptBreakdown).length === 0 && (
              <p className="text-slate-600 text-sm text-center py-4">No active staff</p>
            )}
          </div>
        </div>
      </div>

      {recentLeaves.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Pending Leave Requests</h3>
            <button onClick={() => onNavigate('leave')} className="text-xs text-amber-400 hover:text-amber-300 transition-colors">View all</button>
          </div>
          <div className="space-y-3">
            {recentLeaves.map(l => (
              <div key={l.id} className="flex items-center gap-4 py-2.5 border-b border-slate-800 last:border-0">
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{l.staff?.full_name || 'Unknown'}</p>
                  <p className="text-slate-500 text-xs">{l.leave_type} · {l.days_count} day{l.days_count > 1 ? 's' : ''} · {new Date(l.from_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full border ${LEAVE_STATUS_COLORS[l.status]}`}>{l.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const ROLE_BADGE: Record<string, string> = {
  admin: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  manager: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  hr: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  marketing_executive: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  telecaller: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  employee: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
};

function StaffTab({ staff, appUsers, onRefresh, userId }: { staff: StaffRecord[]; appUsers: any[]; onRefresh: () => void; userId?: string }) {
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffRecord | null>(null);
  const [formData, setFormData] = useState<Omit<StaffRecord, 'id' | 'created_at'>>(emptyStaff);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'system' | 'hr_records'>('system');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [linkingUserId, setLinkingUserId] = useState<string | null>(null);
  const [linkStaffId, setLinkStaffId] = useState('');

  // System view: show app_users with linked staff record info
  const filteredUsers = appUsers.filter(u => {
    const q = search.toLowerCase();
    return !q || u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  // HR records view: show staff_records (old/manual entries)
  const filteredStaff = staff.filter(s => {
    const q = search.toLowerCase();
    return !q || s.full_name.toLowerCase().includes(q) || s.designation.toLowerCase().includes(q) || s.department.toLowerCase().includes(q);
  });

  function getLinkedRecord(userId: string) {
    return staff.find(s => s.user_id === userId) || null;
  }

  function openCreate(prefill?: Partial<typeof emptyStaff>) {
    setFormData({ ...emptyStaff, ...prefill });
    setEditingStaff(null);
    setShowForm(true);
  }

  function openEdit(s: StaffRecord) {
    const { id, created_at, ...rest } = s;
    setFormData(rest);
    setEditingStaff(s);
    setShowForm(true);
  }

  async function saveStaff() {
    setSaving(true);
    if (editingStaff) {
      await supabase.from('staff_records').update(formData).eq('id', editingStaff.id);
    } else {
      await supabase.from('staff_records').insert(formData);
    }
    setSaving(false);
    setShowForm(false);
    onRefresh();
  }

  async function linkUserToRecord(appUserId: string, staffRecordId: string) {
    await supabase.from('staff_records').update({ user_id: appUserId }).eq('id', staffRecordId);
    setLinkingUserId(null);
    setLinkStaffId('');
    onRefresh();
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-white">Staff</h2>
          <p className="text-slate-400 text-sm">{appUsers.filter(u => u.is_active).length} active system users · {staff.length} HR records</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onRefresh} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => openCreate()} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl text-sm transition-all">
            <Plus className="w-4 h-4" /> Add HR Record
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        <button onClick={() => setViewMode('system')}
          className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${viewMode === 'system' ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : 'border-slate-700 bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>
          System Users ({appUsers.length})
        </button>
        <button onClick={() => setViewMode('hr_records')}
          className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${viewMode === 'hr_records' ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : 'border-slate-700 bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>
          HR Records ({staff.length})
        </button>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search staff..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm" />
      </div>

      {viewMode === 'system' && (
        <div className="space-y-3">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-16"><Users className="w-12 h-12 text-slate-800 mx-auto mb-3" /><p className="text-slate-400">No users found</p></div>
          ) : filteredUsers.map(u => {
            const linked = getLinkedRecord(u.id);
            const roleColor = ROLE_BADGE[u.role] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
            return (
              <div key={u.id} className={`bg-slate-900 border rounded-2xl overflow-hidden ${u.is_active ? 'border-slate-800' : 'border-slate-800/40 opacity-60'}`}>
                <div className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-sm">{u.full_name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <h3 className="text-white font-semibold text-sm">{u.full_name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${roleColor}`}>{u.role.replace(/_/g, ' ')}</span>
                      {!u.is_active && <span className="text-xs px-2 py-0.5 rounded-full border bg-red-500/20 text-red-400 border-red-500/30">Inactive</span>}
                      {linked && <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">HR Profile</span>}
                    </div>
                    <p className="text-slate-500 text-xs">{u.email}{u.phone ? ` · ${u.phone}` : ''}</p>
                    {linked && <p className="text-slate-400 text-xs">{linked.designation} · {linked.department}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {linked ? (
                      <button onClick={() => openEdit(linked)} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors" title="Edit HR Profile">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button onClick={() => openCreate({ full_name: u.full_name, email: u.email, phone: u.phone, user_id: u.id })}
                        className="px-3 py-1.5 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 rounded-lg text-xs font-medium transition-colors whitespace-nowrap">
                        + HR Profile
                      </button>
                    )}
                    <button onClick={() => setExpandedId(expandedId === u.id ? null : u.id)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors">
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedId === u.id ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>

                {expandedId === u.id && linked && (
                  <div className="px-4 pb-4 border-t border-slate-800 pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
                      {[
                        { label: 'Basic Salary', value: `₹${linked.salary_basic.toLocaleString('en-IN')}` },
                        { label: 'HRA', value: `₹${linked.salary_hra.toLocaleString('en-IN')}` },
                        { label: 'Allowances', value: `₹${linked.salary_allowances.toLocaleString('en-IN')}` },
                        { label: 'Deductions', value: `₹${linked.salary_deductions.toLocaleString('en-IN')}` },
                      ].map(f => (
                        <div key={f.label} className="bg-slate-800/60 rounded-xl p-3">
                          <p className="text-slate-500 text-xs mb-0.5">{f.label}</p>
                          <p className="text-white font-semibold">{f.value}</p>
                        </div>
                      ))}
                      {linked.date_of_joining && <div className="bg-slate-800/60 rounded-xl p-3"><p className="text-slate-500 text-xs mb-0.5">Joined</p><p className="text-white text-xs">{new Date(linked.date_of_joining).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p></div>}
                      {linked.bank_account && <div className="bg-slate-800/60 rounded-xl p-3"><p className="text-slate-500 text-xs mb-0.5">Bank A/C</p><p className="text-white text-xs">{linked.bank_account}</p></div>}
                      {linked.pan_number && <div className="bg-slate-800/60 rounded-xl p-3"><p className="text-slate-500 text-xs mb-0.5">PAN</p><p className="text-white text-xs">{linked.pan_number}</p></div>}
                      {linked.aadhar_number && <div className="bg-slate-800/60 rounded-xl p-3"><p className="text-slate-500 text-xs mb-0.5">Aadhaar</p><p className="text-white text-xs">{linked.aadhar_number}</p></div>}
                      {linked.emergency_contact_name && <div className="bg-slate-800/60 rounded-xl p-3 col-span-2"><p className="text-slate-500 text-xs mb-0.5">Emergency Contact</p><p className="text-white text-xs">{linked.emergency_contact_name} · {linked.emergency_contact_phone}</p></div>}
                      {linked.address && <div className="bg-slate-800/60 rounded-xl p-3 col-span-2 md:col-span-3"><p className="text-slate-500 text-xs mb-0.5">Address</p><p className="text-white text-xs">{linked.address}</p></div>}
                      {linked.notes && <div className="bg-slate-800/60 rounded-xl p-3 col-span-2 md:col-span-3"><p className="text-slate-500 text-xs mb-0.5">Notes</p><p className="text-slate-300 text-xs">{linked.notes}</p></div>}
                    </div>
                  </div>
                )}
                {expandedId === u.id && !linked && (
                  <div className="px-4 pb-4 border-t border-slate-800 pt-4">
                    <div className="bg-slate-800/40 rounded-xl p-4 text-center">
                      <p className="text-slate-500 text-sm mb-2">No HR profile linked to this user.</p>
                      {/* Link to existing staff record */}
                      {staff.filter(s => !s.user_id).length > 0 && (
                        linkingUserId === u.id ? (
                          <div className="flex gap-2 mt-2">
                            <select value={linkStaffId} onChange={e => setLinkStaffId(e.target.value)}
                              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500">
                              <option value="">Select existing HR record...</option>
                              {staff.filter(s => !s.user_id).map(s => <option key={s.id} value={s.id}>{s.full_name} — {s.department}</option>)}
                            </select>
                            <button onClick={() => linkStaffId && linkUserToRecord(u.id, linkStaffId)}
                              disabled={!linkStaffId}
                              className="px-3 py-2 bg-green-500/20 text-green-400 rounded-xl text-xs font-medium disabled:opacity-40">Link</button>
                            <button onClick={() => setLinkingUserId(null)} className="px-3 py-2 bg-slate-700 text-slate-400 rounded-xl text-xs">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setLinkingUserId(u.id)} className="text-xs text-amber-400 hover:text-amber-300 underline">
                            Link to existing HR record
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {viewMode === 'hr_records' && (
        <div className="space-y-3">
          {filteredStaff.length === 0 ? (
            <div className="text-center py-16"><Users className="w-12 h-12 text-slate-800 mx-auto mb-3" /><p className="text-slate-400">No HR records found</p></div>
          ) : filteredStaff.map(s => {
            const linkedUser = appUsers.find(u => u.id === s.user_id);
            return (
              <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-sm">{s.full_name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <h3 className="text-white font-semibold text-sm">{s.full_name}</h3>
                      {s.employee_code && <span className="text-slate-500 text-xs">#{s.employee_code}</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[s.status]}`}>{s.status.replace('_', ' ')}</span>
                      {linkedUser && <span className={`text-xs px-2 py-0.5 rounded-full border ${ROLE_BADGE[linkedUser.role] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>{linkedUser.role.replace(/_/g, ' ')}</span>}
                      {!s.user_id && <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">Not linked</span>}
                    </div>
                    <p className="text-slate-400 text-xs">{s.designation} · {s.department}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => openEdit(s)} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors">
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedId === s.id ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>

                {expandedId === s.id && (
                  <div className="px-4 pb-4 border-t border-slate-800 pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
                      {[
                        { label: 'Basic Salary', value: `₹${s.salary_basic.toLocaleString('en-IN')}` },
                        { label: 'HRA', value: `₹${s.salary_hra.toLocaleString('en-IN')}` },
                        { label: 'Allowances', value: `₹${s.salary_allowances.toLocaleString('en-IN')}` },
                        { label: 'Deductions', value: `₹${s.salary_deductions.toLocaleString('en-IN')}` },
                      ].map(f => (
                        <div key={f.label} className="bg-slate-800/60 rounded-xl p-3">
                          <p className="text-slate-500 text-xs mb-0.5">{f.label}</p>
                          <p className="text-white font-semibold">{f.value}</p>
                        </div>
                      ))}
                      {s.phone && <div className="bg-slate-800/60 rounded-xl p-3"><p className="text-slate-500 text-xs mb-0.5">Phone</p><p className="text-white text-xs">{s.phone}</p></div>}
                      {s.email && <div className="bg-slate-800/60 rounded-xl p-3"><p className="text-slate-500 text-xs mb-0.5">Email</p><p className="text-white text-xs truncate">{s.email}</p></div>}
                      {s.date_of_joining && <div className="bg-slate-800/60 rounded-xl p-3"><p className="text-slate-500 text-xs mb-0.5">Joined</p><p className="text-white text-xs">{new Date(s.date_of_joining).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p></div>}
                      {s.bank_account && <div className="bg-slate-800/60 rounded-xl p-3"><p className="text-slate-500 text-xs mb-0.5">Bank A/C</p><p className="text-white text-xs">{s.bank_account}</p></div>}
                      {s.pan_number && <div className="bg-slate-800/60 rounded-xl p-3"><p className="text-slate-500 text-xs mb-0.5">PAN</p><p className="text-white text-xs">{s.pan_number}</p></div>}
                      {s.aadhar_number && <div className="bg-slate-800/60 rounded-xl p-3"><p className="text-slate-500 text-xs mb-0.5">Aadhaar</p><p className="text-white text-xs">{s.aadhar_number}</p></div>}
                      {s.emergency_contact_name && <div className="bg-slate-800/60 rounded-xl p-3 col-span-2"><p className="text-slate-500 text-xs mb-0.5">Emergency Contact</p><p className="text-white text-xs">{s.emergency_contact_name} · {s.emergency_contact_phone}</p></div>}
                      {s.address && <div className="bg-slate-800/60 rounded-xl p-3 col-span-2 md:col-span-3"><p className="text-slate-500 text-xs mb-0.5">Address</p><p className="text-white text-xs">{s.address}</p></div>}
                      {s.notes && <div className="bg-slate-800/60 rounded-xl p-3 col-span-2 md:col-span-3"><p className="text-slate-500 text-xs mb-0.5">Notes</p><p className="text-slate-300 text-xs">{s.notes}</p></div>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-2xl border border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 flex items-center justify-between px-6 py-4 border-b border-slate-700 z-10">
              <h3 className="text-lg font-bold text-white">{editingStaff ? 'Edit Staff' : 'Add Staff Record'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-700 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs text-slate-400 mb-1.5">Full Name *</label>
                  <input value={formData.full_name} onChange={e => setFormData(p => ({ ...p, full_name: e.target.value }))} placeholder="Full name"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Employee Code</label>
                  <input value={formData.employee_code || ''} onChange={e => setFormData(p => ({ ...p, employee_code: e.target.value }))} placeholder="EMP001"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Status</label>
                  <select value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value as any }))}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on_leave">On Leave</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Department</label>
                  <select value={formData.department} onChange={e => setFormData(p => ({ ...p, department: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm">
                    {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Designation</label>
                  <input value={formData.designation} onChange={e => setFormData(p => ({ ...p, designation: e.target.value }))} placeholder="Job title"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Email</label>
                  <input value={formData.email || ''} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="email@company.com" type="email"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Phone</label>
                  <input value={formData.phone || ''} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} placeholder="9876543210"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Date of Joining</label>
                  <input type="date" value={formData.date_of_joining || ''} onChange={e => setFormData(p => ({ ...p, date_of_joining: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Date of Birth</label>
                  <input type="date" value={formData.date_of_birth || ''} onChange={e => setFormData(p => ({ ...p, date_of_birth: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm" />
                </div>
              </div>

              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider pt-2">Salary Details</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'salary_basic', label: 'Basic Salary (₹)' },
                  { key: 'salary_hra', label: 'HRA (₹)' },
                  { key: 'salary_allowances', label: 'Allowances (₹)' },
                  { key: 'salary_deductions', label: 'Deductions (₹)' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs text-slate-400 mb-1.5">{f.label}</label>
                    <input type="number" value={(formData as any)[f.key]} onChange={e => setFormData(p => ({ ...p, [f.key]: Number(e.target.value) }))}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm" />
                  </div>
                ))}
              </div>

              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider pt-2">Bank & Identity</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'bank_account', label: 'Bank Account No.' },
                  { key: 'bank_ifsc', label: 'IFSC Code' },
                  { key: 'pan_number', label: 'PAN Number' },
                  { key: 'aadhar_number', label: 'Aadhaar Number' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs text-slate-400 mb-1.5">{f.label}</label>
                    <input value={(formData as any)[f.key] || ''} onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm" />
                  </div>
                ))}
              </div>

              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider pt-2">Emergency Contact</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Name</label>
                  <input value={formData.emergency_contact_name || ''} onChange={e => setFormData(p => ({ ...p, emergency_contact_name: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Phone</label>
                  <input value={formData.emergency_contact_phone || ''} onChange={e => setFormData(p => ({ ...p, emergency_contact_phone: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-slate-400 mb-1.5">Address</label>
                  <textarea value={formData.address || ''} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} rows={2}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm resize-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-slate-400 mb-1.5">Notes</label>
                  <textarea value={formData.notes || ''} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} rows={2}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm resize-none" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm">Cancel</button>
                <button onClick={saveStaff} disabled={saving || !formData.full_name}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl text-sm disabled:opacity-60">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AttendanceViewTab({ attendance, onRefresh }: { attendance: any[]; onRefresh: () => void }) {
  const [search, setSearch] = useState('');
  const filtered = attendance.filter(a => {
    const q = search.toLowerCase();
    return !q || a.user?.full_name?.toLowerCase().includes(q);
  });

  const ATT_COLORS: Record<string, string> = {
    present: 'bg-green-500/20 text-green-400 border-green-500/30',
    half_day: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    absent: 'bg-red-500/20 text-red-400 border-red-500/30',
    leave: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Attendance Records</h2>
        <button onClick={onRefresh} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm" />
      </div>
      <div className="space-y-2">
        {filtered.slice(0, 100).map((a: any) => (
          <div key={a.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-medium text-sm">{a.user?.full_name || 'Unknown'}</span>
                  <span className="text-slate-500 text-xs">{a.user?.role?.replace(/_/g, ' ')}</span>
                </div>
                <p className="text-slate-500 text-xs">{new Date(a.attendance_date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</p>
                {(a.check_in_time || a.check_out_time) && (
                  <p className="text-slate-400 text-xs mt-1">
                    {a.check_in_time && `In: ${new Date(a.check_in_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`}
                    {a.check_out_time && ` · Out: ${new Date(a.check_out_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`}
                  </p>
                )}
                {a.location_address && <p className="text-slate-600 text-xs mt-0.5 flex items-center gap-1"><Navigation className="w-3 h-3" />{a.location_address}</p>}
                {a.notes && <p className="text-slate-500 text-xs mt-1 italic">{a.notes}</p>}
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full border ${ATT_COLORS[a.status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'} shrink-0`}>
                {a.status?.replace('_', ' ')}
              </span>
            </div>
            {a.selfie_url && (
              <img src={a.selfie_url} alt="selfie" className="mt-3 w-16 h-16 rounded-xl object-cover border border-slate-700" />
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Camera className="w-12 h-12 text-slate-800 mx-auto mb-3" />
            <p className="text-slate-400">No attendance records found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PayrollTab({ staff, appUsers, payroll, onRefresh, userId }: {
  staff: StaffRecord[]; appUsers: any[]; payroll: PayrollRecord[]; onRefresh: () => void; userId?: string;
}) {
  const thisMonth = new Date().getMonth() + 1;
  const thisYear = new Date().getFullYear();
  const [selMonth, setSelMonth] = useState(thisMonth);
  const [selYear, setSelYear] = useState(thisYear);
  const [processing, setProcessing] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<PayrollRecord>>({});
  const [saving, setSaving] = useState(false);
  const [remarkText, setRemarkText] = useState('');

  const monthPayroll = payroll.filter(p => p.month === selMonth && p.year === selYear);

  // Build a unified list: staff_records first, then app_users without a staff_record
  const staffRecordUserIds = new Set(staff.map(s => s.user_id).filter(Boolean));
  const EXCLUDED_ROLES = ['admin'];
  const appUsersWithoutRecord = appUsers.filter(
    u => u.is_active && !EXCLUDED_ROLES.includes(u.role) && !staffRecordUserIds.has(u.id)
  );

  interface PayrollPerson {
    id: string; // staff_id to use in payroll_records
    name: string;
    subLabel: string;
    source: 'staff_record' | 'app_user';
    salary_basic: number;
    salary_hra: number;
    salary_allowances: number;
    salary_deductions: number;
  }

  const activeStaff = staff.filter(s => s.status === 'active');
  const allPersons: PayrollPerson[] = [
    ...activeStaff.map(s => ({
      id: s.id,
      name: s.full_name,
      subLabel: `${s.designation} · ${s.department}`,
      source: 'staff_record' as const,
      salary_basic: s.salary_basic,
      salary_hra: s.salary_hra,
      salary_allowances: s.salary_allowances,
      salary_deductions: s.salary_deductions,
    })),
    ...appUsersWithoutRecord.map(u => ({
      id: u.id,
      name: u.full_name,
      subLabel: u.role?.replace(/_/g, ' '),
      source: 'app_user' as const,
      salary_basic: 0,
      salary_hra: 0,
      salary_allowances: 0,
      salary_deductions: 0,
    })),
  ];

  async function processPayroll(person: PayrollPerson) {
    setProcessing(person.id);
    const gross = person.salary_basic + person.salary_hra + person.salary_allowances;
    const pf = Math.round(person.salary_basic * 0.12);
    const total_ded = person.salary_deductions + pf;
    await supabase.from('payroll_records').upsert({
      staff_id: person.id,
      month: selMonth,
      year: selYear,
      basic_pay: person.salary_basic,
      hra: person.salary_hra,
      allowances: person.salary_allowances,
      gross_pay: gross,
      pf_deduction: pf,
      tds_deduction: 0,
      other_deductions: person.salary_deductions,
      total_deductions: total_ded,
      net_pay: gross - total_ded,
      payment_mode: 'bank_transfer',
      payment_status: 'pending',
      created_by: userId,
    }, { onConflict: 'staff_id,month,year' });
    setProcessing(null);
    onRefresh();
  }

  async function markPaid(pr: PayrollRecord) {
    await supabase.from('payroll_records').update({
      payment_status: 'paid',
      payment_date: new Date().toISOString().slice(0, 10),
    }).eq('id', pr.id);
    onRefresh();
  }

  function openEdit(pr: PayrollRecord) {
    setEditingId(pr.id);
    setEditForm({ ...pr });
    setRemarkText(pr.remarks || '');
  }

  async function saveEdit() {
    if (!editingId) return;
    setSaving(true);
    const gross = Number(editForm.basic_pay || 0) + Number(editForm.hra || 0) + Number(editForm.allowances || 0);
    const totalDed = Number(editForm.pf_deduction || 0) + Number(editForm.tds_deduction || 0) + Number(editForm.other_deductions || 0);
    await supabase.from('payroll_records').update({
      basic_pay: editForm.basic_pay,
      hra: editForm.hra,
      allowances: editForm.allowances,
      gross_pay: gross,
      pf_deduction: editForm.pf_deduction,
      tds_deduction: editForm.tds_deduction,
      other_deductions: editForm.other_deductions,
      total_deductions: totalDed,
      net_pay: gross - totalDed,
      payment_mode: editForm.payment_mode,
      payment_status: editForm.payment_status,
      payment_date: editForm.payment_date || null,
      remarks: remarkText || null,
    }).eq('id', editingId);
    setSaving(false);
    setEditingId(null);
    onRefresh();
  }

  const totalNet = monthPayroll.reduce((s, p) => s + Number(p.net_pay), 0);
  const paidCount = monthPayroll.filter(p => p.payment_status === 'paid').length;
  const notProcessed = allPersons.filter(p => !monthPayroll.find(pr => pr.staff_id === p.id)).length;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Payroll</h2>
        <div className="flex items-center gap-2">
          <select value={selMonth} onChange={e => setSelMonth(Number(e.target.value))}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500">
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={selYear} onChange={e => setSelYear(Number(e.target.value))}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500">
            {[thisYear - 1, thisYear, thisYear + 1].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={onRefresh} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Net Pay', value: `₹${totalNet.toLocaleString('en-IN')}`, color: 'text-white' },
          { label: 'Paid', value: paidCount, color: 'text-green-400' },
          { label: 'Not Processed', value: notProcessed, color: 'text-amber-400' },
          { label: 'Total Staff', value: allPersons.length, color: 'text-blue-400' },
        ].map(s => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-slate-400 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {allPersons.map(person => {
          const pr = monthPayroll.find(p => p.staff_id === person.id);
          return (
            <div key={person.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium text-sm">{person.name}</p>
                    {person.source === 'app_user' && (
                      <span className="text-xs px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded">App User</span>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs capitalize">{person.subLabel}</p>
                  {pr && (
                    <p className="text-slate-400 text-xs mt-1">
                      Gross: ₹{Number(pr.gross_pay).toLocaleString('en-IN')} · Net: <span className="text-white font-semibold">₹{Number(pr.net_pay).toLocaleString('en-IN')}</span>
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {pr ? (
                    <>
                      <span className={`text-xs px-2.5 py-1 rounded-full ${PAY_STATUS_COLORS[pr.payment_status]}`}>{pr.payment_status}</span>
                      <button onClick={() => openEdit(pr)} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs font-medium transition-colors">
                        Edit
                      </button>
                      {pr.payment_status !== 'paid' && (
                        <button onClick={() => markPaid(pr)} className="px-3 py-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg text-xs font-medium transition-colors">
                          Mark Paid
                        </button>
                      )}
                    </>
                  ) : (
                    <button onClick={() => processPayroll(person)} disabled={processing === person.id}
                      className="px-3 py-1.5 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5">
                      {processing === person.id ? (
                        <><div className="w-3 h-3 border border-amber-400/30 border-t-amber-400 rounded-full animate-spin" /> Processing...</>
                      ) : (
                        <>Process</>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {editingId === pr?.id && (
                <div className="border-t border-slate-800 p-4 space-y-3 bg-slate-800/40">
                  <p className="text-slate-300 text-sm font-semibold">Edit Payroll — {person.name}</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { label: 'Basic Pay', key: 'basic_pay' },
                      { label: 'HRA', key: 'hra' },
                      { label: 'Allowances', key: 'allowances' },
                      { label: 'PF Deduction', key: 'pf_deduction' },
                      { label: 'TDS Deduction', key: 'tds_deduction' },
                      { label: 'Other Deductions', key: 'other_deductions' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-xs text-slate-500 mb-1">{f.label}</label>
                        <input type="number" value={(editForm as any)[f.key] || 0}
                          onChange={e => setEditForm(prev => ({ ...prev, [f.key]: Number(e.target.value) }))}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Payment Mode</label>
                      <select value={editForm.payment_mode || 'bank_transfer'}
                        onChange={e => setEditForm(prev => ({ ...prev, payment_mode: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500">
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="cash">Cash</option>
                        <option value="cheque">Cheque</option>
                        <option value="upi">UPI</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Status</label>
                      <select value={editForm.payment_status || 'pending'}
                        onChange={e => setEditForm(prev => ({ ...prev, payment_status: e.target.value as any }))}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500">
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="hold">Hold</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Payment Date</label>
                    <input type="date" value={editForm.payment_date || ''}
                      onChange={e => setEditForm(prev => ({ ...prev, payment_date: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Remarks / Notes</label>
                    <input type="text" value={remarkText}
                      onChange={e => setRemarkText(e.target.value)}
                      placeholder="Optional note visible to employee"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => setEditingId(null)} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors">Cancel</button>
                    <button onClick={saveEdit} disabled={saving}
                      className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-lg text-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
                      {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Changes
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {allPersons.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No active staff found</p>
            <p className="text-xs mt-1">Add staff records or create app users to process payroll</p>
          </div>
        )}
      </div>
    </div>
  );
}

function LeaveTab({ leaves, staff, onRefresh, userId }: { leaves: LeaveRequest[]; staff: StaffRecord[]; onRefresh: () => void; userId?: string }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ staff_id: '', leave_type: 'casual' as LeaveRequest['leave_type'], from_date: '', to_date: '', reason: '' });
  const [saving, setSaving] = useState(false);

  function calcDays(from: string, to: string) {
    if (!from || !to) return 0;
    const diff = new Date(to).getTime() - new Date(from).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  }

  async function saveLeave() {
    if (!formData.staff_id || !formData.from_date || !formData.to_date || !formData.reason) return;
    setSaving(true);
    await supabase.from('leave_requests').insert({
      ...formData,
      days_count: calcDays(formData.from_date, formData.to_date),
      status: 'pending',
      created_by: userId,
    });
    setSaving(false);
    setShowForm(false);
    setFormData({ staff_id: '', leave_type: 'casual', from_date: '', to_date: '', reason: '' });
    onRefresh();
  }

  async function updateStatus(id: string, status: LeaveRequest['status']) {
    await supabase.from('leave_requests').update({ status, approved_by: userId }).eq('id', id);
    onRefresh();
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Leave Requests</h2>
          <p className="text-slate-400 text-sm">{leaves.filter(l => l.status === 'pending').length} pending approval</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onRefresh} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl text-sm">
            <Plus className="w-4 h-4" /> Add Leave
          </button>
        </div>
      </div>

      {leaves.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="w-12 h-12 text-slate-800 mx-auto mb-3" />
          <p className="text-slate-400">No leave requests yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaves.map(l => (
            <div key={l.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-white font-semibold text-sm">{l.staff?.full_name || 'Unknown'}</span>
                    <span className="text-slate-500 text-xs">{l.staff?.department}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${LEAVE_STATUS_COLORS[l.status]}`}>{l.status}</span>
                  </div>
                  <p className="text-slate-400 text-xs">
                    {l.leave_type} · {l.days_count} day{l.days_count > 1 ? 's' : ''} ·&nbsp;
                    {new Date(l.from_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} to {new Date(l.to_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                  <p className="text-slate-500 text-xs mt-1 italic">{l.reason}</p>
                </div>
                {l.status === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => updateStatus(l.id, 'approved')} className="px-3 py-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg text-xs font-medium transition-colors">
                      Approve
                    </button>
                    <button onClick={() => updateStatus(l.id, 'rejected')} className="px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-xs font-medium transition-colors">
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <h3 className="text-lg font-bold text-white">Add Leave Request</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-700 rounded-lg"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Staff Member *</label>
                <select value={formData.staff_id} onChange={e => setFormData(p => ({ ...p, staff_id: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm">
                  <option value="">Select staff...</option>
                  {staff.filter(s => s.status === 'active').map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Leave Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['casual', 'sick', 'earned', 'unpaid'] as const).map(t => (
                    <button key={t} onClick={() => setFormData(p => ({ ...p, leave_type: t }))}
                      className={`py-2.5 rounded-xl border text-xs font-medium transition-all ${formData.leave_type === t ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : 'border-slate-600 bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">From Date *</label>
                  <input type="date" value={formData.from_date} onChange={e => setFormData(p => ({ ...p, from_date: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">To Date *</label>
                  <input type="date" value={formData.to_date} onChange={e => setFormData(p => ({ ...p, to_date: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm" />
                </div>
              </div>
              {formData.from_date && formData.to_date && (
                <p className="text-amber-400 text-xs">{calcDays(formData.from_date, formData.to_date)} day(s) requested</p>
              )}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Reason *</label>
                <textarea value={formData.reason} onChange={e => setFormData(p => ({ ...p, reason: e.target.value }))} rows={3}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm">Cancel</button>
                <button onClick={saveLeave} disabled={saving || !formData.staff_id || !formData.reason}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl text-sm disabled:opacity-60">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdvancesTab({ advances, onRefresh, userId }: { advances: any[]; onRefresh: () => void; userId?: string }) {
  async function updateStatus(id: string, status: string) {
    await supabase.from('salary_advance_requests').update({ status, approved_by: userId, updated_at: new Date().toISOString() }).eq('id', id);
    onRefresh();
  }

  const ADV_COLORS: Record<string, string> = {
    pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    approved: 'bg-green-500/20 text-green-400 border-green-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
    disbursed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Salary Advances</h2>
          <p className="text-slate-400 text-sm">{advances.filter(a => a.status === 'pending').length} pending</p>
        </div>
        <button onClick={onRefresh} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {advances.length === 0 ? (
        <div className="text-center py-16">
          <Wallet className="w-12 h-12 text-slate-800 mx-auto mb-3" />
          <p className="text-slate-400">No advance requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {advances.map((a: any) => (
            <div key={a.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-white font-semibold text-sm">{a.employee?.full_name || 'Unknown'}</span>
                    <span className="text-slate-500 text-xs">{a.employee?.role?.replace(/_/g, ' ')}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${ADV_COLORS[a.status] || ADV_COLORS.pending}`}>{a.status}</span>
                  </div>
                  <p className="text-amber-400 font-semibold text-sm">₹{Number(a.amount).toLocaleString('en-IN')}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{a.reason}</p>
                  <p className="text-slate-600 text-xs mt-0.5">{new Date(a.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </div>
                {a.status === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => updateStatus(a.id, 'approved')} className="px-3 py-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg text-xs font-medium transition-colors">Approve</button>
                    <button onClick={() => updateStatus(a.id, 'rejected')} className="px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-xs font-medium transition-colors">Reject</button>
                  </div>
                )}
                {a.status === 'approved' && (
                  <button onClick={() => updateStatus(a.id, 'disbursed')} className="px-3 py-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg text-xs font-medium transition-colors shrink-0">Mark Disbursed</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CRMTab({ contacts, onRefresh, userId }: { contacts: CRMContact[]; onRefresh: () => void; userId?: string }) {
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<CRMContact | null>(null);
  const [formData, setFormData] = useState<Omit<CRMContact, 'id' | 'created_at'>>(emptyCRM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.company_name.toLowerCase().includes(q) || c.contact_person.toLowerCase().includes(q) || c.phone.includes(q);
    const matchType = typeFilter === 'all' || c.contact_type === typeFilter;
    return matchSearch && matchType;
  });

  function openCreate() { setFormData({ ...emptyCRM }); setEditingContact(null); setShowForm(true); }
  function openEdit(c: CRMContact) { const { id, created_at, ...rest } = c; setFormData(rest); setEditingContact(c); setShowForm(true); }

  async function saveContact() {
    if (!formData.company_name || !formData.contact_person || !formData.phone) return;
    setSaving(true);
    if (editingContact) {
      await supabase.from('office_crm_contacts').update(formData).eq('id', editingContact.id);
    } else {
      await supabase.from('office_crm_contacts').insert(formData);
    }
    setSaving(false);
    setShowForm(false);
    onRefresh();
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from('office_crm_contacts').update({ is_active: !current }).eq('id', id);
    onRefresh();
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">CRM Contacts</h2>
          <p className="text-slate-400 text-sm">{contacts.filter(c => c.is_active).length} active contacts</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onRefresh} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl text-sm">
            <Plus className="w-4 h-4" /> Add Contact
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500">
          <option value="all">All Types</option>
          <option value="vendor">Vendor</option>
          <option value="client">Client</option>
          <option value="partner">Partner</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map(c => (
          <div key={c.id} className={`bg-slate-900 border rounded-xl p-4 ${c.is_active ? 'border-slate-800' : 'border-slate-800/50 opacity-60'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-white font-semibold text-sm">{c.company_name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${CONTACT_TYPE_COLORS[c.contact_type]}`}>{c.contact_type}</span>
                </div>
                <p className="text-slate-400 text-xs">{c.contact_person} · {c.phone}</p>
                {c.email && <p className="text-slate-500 text-xs">{c.email}</p>}
                {(c.city || c.state) && <p className="text-slate-600 text-xs">{[c.city, c.state].filter(Boolean).join(', ')}</p>}
                {c.notes && <p className="text-slate-500 text-xs mt-1 italic">{c.notes}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => openEdit(c)} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => toggleActive(c.id, c.is_active)}
                  className={`p-2 rounded-lg transition-colors ${c.is_active ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}>
                  <CheckCircle className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-slate-800 mx-auto mb-3" />
            <p className="text-slate-400">No contacts found</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-lg border border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 flex items-center justify-between px-6 py-4 border-b border-slate-700 z-10">
              <h3 className="text-lg font-bold text-white">{editingContact ? 'Edit Contact' : 'Add CRM Contact'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-700 rounded-lg"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Contact Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['vendor', 'client', 'partner', 'other'] as const).map(t => (
                    <button key={t} onClick={() => setFormData(p => ({ ...p, contact_type: t }))}
                      className={`py-2 rounded-xl border text-xs font-medium transition-all ${formData.contact_type === t ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : 'border-slate-600 bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              {[
                { key: 'company_name', label: 'Company Name *', placeholder: 'Company / Organization' },
                { key: 'contact_person', label: 'Contact Person *', placeholder: 'Full name' },
                { key: 'phone', label: 'Phone *', placeholder: '9876543210' },
                { key: 'alternate_phone', label: 'Alternate Phone', placeholder: 'Optional' },
                { key: 'email', label: 'Email', placeholder: 'email@company.com' },
                { key: 'category', label: 'Category', placeholder: 'e.g. Solar panels, CCTV' },
                { key: 'city', label: 'City', placeholder: '' },
                { key: 'state', label: 'State', placeholder: '' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-slate-400 mb-1.5">{f.label}</label>
                  <input value={(formData as any)[f.key] || ''} onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm" />
                </div>
              ))}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Address</label>
                <textarea value={formData.address || ''} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} rows={2}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm resize-none" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Notes</label>
                <textarea value={formData.notes || ''} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} rows={2}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm">Cancel</button>
                <button onClick={saveContact} disabled={saving || !formData.company_name || !formData.contact_person || !formData.phone}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl text-sm disabled:opacity-60">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
