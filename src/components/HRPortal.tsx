import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Users, DollarSign, Calendar, BookOpen, LogOut, Plus, X, Search, RefreshCw, Pencil, CheckCircle, AlertCircle, Briefcase, Phone, Mail, MapPin, Building2, CreditCard, FileText, Clock, LayoutDashboard, TrendingUp, UserCheck, ToggleLeft, ToggleRight, Save, ChevronDown, ClipboardList, Camera, Wallet, Navigation } from 'lucide-react';
import ProfileAvatar from './ProfileAvatar';

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

type Tab = 'dashboard' | 'staff' | 'payroll' | 'leave' | 'crm' | 'attendance' | 'advances';

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

interface AppUserRecord {
  id: string;
  email: string;
  full_name: string;
  role: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

const ROLE_LABELS: Record<string, string> = {
  telecaller: 'Telecaller',
  marketing_executive: 'Marketing Executive',
  employee: 'Employee',
  manager: 'Manager',
  hr: 'HR',
  admin: 'Admin',
};

const ROLE_DEPT: Record<string, string> = {
  telecaller: 'Sales',
  marketing_executive: 'Marketing',
  employee: 'Operations',
  manager: 'Management',
  hr: 'HR',
  admin: 'Admin',
};

export default function HRPortal() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [staff, setStaff] = useState<StaffRecord[]>([]);
  const [appUsers, setAppUsers] = useState<AppUserRecord[]>([]);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [crm, setCRM] = useState<CRMContact[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [advances, setAdvances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
    const [sRes, pRes, lRes, cRes, attRes, advRes, auRes] = await Promise.all([
      supabase.from('staff_records').select('*').order('full_name').limit(200),
      supabase.from('payroll_records').select('*').order('year', { ascending: false }).order('month', { ascending: false }).limit(300),
      supabase.from('leave_requests').select('*, staff:staff_records(full_name, department), app_user:app_users(full_name, role)').order('created_at', { ascending: false }).limit(200),
      supabase.from('office_crm_contacts').select('*').order('company_name').limit(200),
      supabase.from('attendance_records').select('*, user:app_users(full_name, role)').order('attendance_date', { ascending: false }).limit(100),
      supabase.from('salary_advance_requests').select('*, employee:app_users(full_name, role)').order('created_at', { ascending: false }).limit(200),
      supabase.from('app_users').select('id, email, full_name, role, phone, is_active, created_at').order('full_name').limit(200),
    ]);
    setStaff(sRes.data || []);
    setAppUsers(auRes.data || []);
    setPayroll(pRes.data || []);
    setLeaves((lRes.data as LeaveRequest[]) || []);
    setCRM(cRes.data || []);
    setAttendance(attRes.data || []);
    setAdvances(advRes.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'staff', label: 'Staff', icon: Users },
    { key: 'attendance', label: 'Attendance', icon: Camera },
    { key: 'payroll', label: 'Payroll', icon: DollarSign },
    { key: 'leave', label: 'Leave', icon: Calendar },
    { key: 'advances', label: 'Advances', icon: Wallet },
    { key: 'crm', label: 'CRM', icon: BookOpen },
  ];

  const activeCount = staff.filter(s => s.status === 'active').length + appUsers.filter(u => u.is_active).length;
  const onLeaveCount = staff.filter(s => s.status === 'on_leave').length;
  const pendingLeaves = leaves.filter(l => l.status === 'pending').length;
  const pendingAdvances = advances.filter((a: any) => a.status === 'pending').length;
  const thisMonth = new Date().getMonth() + 1;
  const thisYear = new Date().getFullYear();
  const pendingPayroll = staff.filter(s => s.status === 'active' && !payroll.find(p => p.staff_id === s.id && p.month === thisMonth && p.year === thisYear)).length;
  const totalPayroll = payroll.filter(p => p.month === thisMonth && p.year === thisYear && p.payment_status === 'paid').reduce((sum, p) => sum + p.net_pay, 0);

  if (!user || user.role !== 'hr') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">Access Denied</h2>
          <p className="text-slate-400 text-sm mb-6">You do not have permission to access the HR portal.</p>
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
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-none">HR Portal</h1>
            <p className="text-slate-500 text-xs mt-0.5">{user?.full_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pendingLeaves > 0 && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full border border-amber-500/30">
              <Clock className="w-3 h-3" /> {pendingLeaves} pending
            </span>
          )}
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/20 text-rose-400 text-xs font-medium rounded-full border border-rose-500/30">
            <Users className="w-3 h-3" /> HR
          </span>
          <ProfileAvatar size="sm" />
          <button onClick={signOut} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <nav className="bg-slate-900/80 border-b border-slate-800 px-2 md:px-6 flex gap-0.5 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-3 md:px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
              activeTab === t.key
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <t.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </nav>

      <main className="flex-1 p-4 md:p-6">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-10 h-10 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && <HRDashboard staff={staff} appUsers={appUsers} payroll={payroll} leaves={leaves} crm={crm} activeCount={activeCount} onLeaveCount={onLeaveCount} pendingLeaves={pendingLeaves} pendingPayroll={pendingPayroll} totalPayroll={totalPayroll} />}
            {activeTab === 'staff' && <StaffTab staff={staff} appUsers={appUsers} onRefresh={loadAll} userId={user?.id} />}
            {activeTab === 'attendance' && <AttendanceViewTab attendance={attendance} onRefresh={loadAll} />}
            {activeTab === 'payroll' && <PayrollTab staff={staff} payroll={payroll} onRefresh={loadAll} userId={user?.id} />}
            {activeTab === 'leave' && <LeaveTab leaves={leaves} staff={staff} onRefresh={loadAll} userId={user?.id} />}
            {activeTab === 'advances' && <AdvancesTab advances={advances} onRefresh={loadAll} userId={user?.id} />}
            {activeTab === 'crm' && <CRMTab contacts={crm} onRefresh={loadAll} userId={user?.id} />}
          </>
        )}
      </main>
    </div>
  );
}

function HRDashboard({ staff, appUsers, payroll, leaves, crm, activeCount, onLeaveCount, pendingLeaves, pendingPayroll, totalPayroll }: {
  staff: StaffRecord[]; appUsers: AppUserRecord[]; payroll: PayrollRecord[]; leaves: LeaveRequest[]; crm: CRMContact[];
  activeCount: number; onLeaveCount: number; pendingLeaves: number; pendingPayroll: number; totalPayroll: number;
}) {
  const deptBreakdown = staff.reduce<Record<string, number>>((acc, s) => {
    if (s.status === 'active') acc[s.department] = (acc[s.department] || 0) + 1;
    return acc;
  }, {});
  appUsers.filter(u => u.is_active).forEach(u => {
    const dept = ROLE_DEPT[u.role] || 'Other';
    deptBreakdown[dept] = (deptBreakdown[dept] || 0) + 1;
  });
  const roleBreakdown = appUsers.reduce<Record<string, number>>((acc, u) => {
    const label = ROLE_LABELS[u.role] || u.role;
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});
  const maxRole = Math.max(...Object.values(roleBreakdown), 1);
  const maxDept = Math.max(...Object.values(deptBreakdown), 1);

  const recentLeaves = [...leaves].filter(l => l.status === 'pending').slice(0, 5);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">HR Overview</h2>
        <p className="text-slate-400 text-sm">Staff & payroll summary for {MONTHS[new Date().getMonth()]} {new Date().getFullYear()}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Staff', value: activeCount, color: 'bg-green-500/20 text-green-400', icon: UserCheck },
          { label: 'On Leave', value: onLeaveCount, color: 'bg-amber-500/20 text-amber-400', icon: Calendar },
          { label: 'Leave Pending', value: pendingLeaves, color: 'bg-orange-500/20 text-orange-400', icon: Clock },
          { label: 'CRM Contacts', value: crm.filter(c => c.is_active).length, color: 'bg-blue-500/20 text-blue-400', icon: BookOpen },
        ].map(s => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-slate-400 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-slate-400 text-xs mb-1">Total Payroll Disbursed (This Month)</p>
          <p className="text-3xl font-bold text-white">₹{totalPayroll.toLocaleString('en-IN')}</p>
          <p className="text-slate-500 text-xs mt-1">{pendingPayroll} staff pending payroll</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-slate-400 text-xs mb-1">Total Headcount</p>
          <p className="text-3xl font-bold text-white">{staff.length + appUsers.length}</p>
          <div className="flex flex-wrap gap-3 mt-2 text-xs">
            <span className="text-green-400">{activeCount} Active</span>
            <span className="text-amber-400">{onLeaveCount} On Leave</span>
            <span className="text-red-400">{staff.filter(s => s.status === 'terminated').length} Terminated</span>
            <span className="text-blue-400">{appUsers.filter(u => !u.is_active).length} Inactive</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap gap-2">
            {Object.entries(roleBreakdown).map(([role, count]) => (
              <span key={role} className="px-2 py-0.5 bg-slate-800 rounded-lg text-xs text-slate-300">{count} {role}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-rose-500" />
            <h3 className="text-white font-semibold">Role Breakdown</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(roleBreakdown).sort(([, a], [, b]) => b - a).map(([role, count]) => (
              <div key={role}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">{role}</span>
                  <span className="text-slate-400">{count}</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full" style={{ width: `${(count / maxRole) * 100}%` }} />
                </div>
              </div>
            ))}
            {Object.keys(roleBreakdown).length === 0 && (
              <div className="space-y-3">
                {Object.entries(deptBreakdown).sort(([, a], [, b]) => b - a).map(([dept, count]) => (
                  <div key={dept}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">{dept}</span>
                      <span className="text-slate-400">{count}</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full" style={{ width: `${(count / maxDept) * 100}%` }} />
                    </div>
                  </div>
                ))}
                <p className="text-slate-500 text-sm text-center py-4">No system users yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-rose-500" />
            <h3 className="text-white font-semibold">Pending Leave Requests</h3>
          </div>
          {recentLeaves.length === 0 ? (
            <div className="flex flex-col items-center py-6 text-slate-500">
              <CheckCircle className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm">No pending leaves</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentLeaves.map(l => (
                <div key={l.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold">
                    {(l.staff as any)?.full_name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{(l.staff as any)?.full_name}</p>
                    <p className="text-slate-500 text-xs">{l.leave_type} · {l.days_count} day(s)</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full border bg-amber-500/20 text-amber-400 border-amber-500/30">Pending</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const BUILTIN_ROLES = ['admin', 'manager', 'hr', 'marketing_executive', 'telecaller', 'employee'];
const ROLE_BADGE_ALL: Record<string, string> = {
  telecaller: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  marketing_executive: 'bg-green-500/20 text-green-400 border-green-500/30',
  employee: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  manager: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  hr: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  admin: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

function StaffTab({ staff, appUsers, onRefresh, userId }: { staff: StaffRecord[]; appUsers: AppUserRecord[]; onRefresh: () => void; userId?: string }) {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffRecord | null>(null);
  const [form, setForm] = useState<typeof emptyStaff>({ ...emptyStaff });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeView, setActiveView] = useState<'records' | 'system'>('system');
  const [editingAppUser, setEditingAppUser] = useState<AppUserRecord | null>(null);
  const [appUserForm, setAppUserForm] = useState({ full_name: '', role: '', phone: '' });
  const [savingAppUser, setSavingAppUser] = useState(false);
  const [appUserError, setAppUserError] = useState('');
  const [appUserSuccess, setAppUserSuccess] = useState('');

  const filtered = staff.filter(s => {
    const q = search.toLowerCase();
    return !q || s.full_name.toLowerCase().includes(q) || s.department.toLowerCase().includes(q) || s.designation.toLowerCase().includes(q);
  });

  const filteredAppUsers = appUsers.filter(u => {
    const q = search.toLowerCase();
    return !q || u.full_name.toLowerCase().includes(q) || u.role.toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
  });

  function openAdd() { setForm({ ...emptyStaff }); setEditingStaff(null); setError(''); setSuccess(''); setShowForm(true); }
  function openEdit(s: StaffRecord) { setForm({ ...s }); setEditingStaff(s); setError(''); setSuccess(''); setShowForm(true); }

  async function save() {
    if (!form.full_name || !form.department || !form.designation) {
      setError('Full name, department and designation are required.'); return;
    }
    setSaving(true); setError('');
    if (editingStaff) {
      const { error: e } = await supabase.from('staff_records').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editingStaff.id);
      if (e) { setError(e.message); setSaving(false); return; }
    } else {
      const { error: e } = await supabase.from('staff_records').insert({ ...form });
      if (e) { setError(e.message); setSaving(false); return; }
    }
    setSuccess(editingStaff ? 'Staff updated!' : 'Staff added!');
    await onRefresh();
    setSaving(false);
    setTimeout(() => { setShowForm(false); setSuccess(''); }, 1500);
  }

  async function toggleStatus(s: StaffRecord) {
    const next = s.status === 'active' ? 'inactive' : 'active';
    await supabase.from('staff_records').update({ status: next }).eq('id', s.id);
    onRefresh();
  }

  function openEditAppUser(u: AppUserRecord) {
    setEditingAppUser(u);
    setAppUserForm({ full_name: u.full_name, role: u.role, phone: u.phone || '' });
    setAppUserError('');
    setAppUserSuccess('');
  }

  async function saveAppUser() {
    if (!editingAppUser || !appUserForm.full_name.trim()) {
      setAppUserError('Full name is required.'); return;
    }
    setSavingAppUser(true); setAppUserError('');
    const { error: e } = await supabase.from('app_users').update({
      full_name: appUserForm.full_name.trim(),
      role: appUserForm.role,
      phone: appUserForm.phone.trim() || null,
      updated_at: new Date().toISOString(),
    }).eq('id', editingAppUser.id);
    if (e) { setAppUserError(e.message); setSavingAppUser(false); return; }
    setAppUserSuccess('Staff updated successfully!');
    await onRefresh();
    setSavingAppUser(false);
    setTimeout(() => { setEditingAppUser(null); setAppUserSuccess(''); }, 1500);
  }

  async function toggleAppUserActive(u: AppUserRecord) {
    await supabase.from('app_users').update({ is_active: !u.is_active }).eq('id', u.id);
    onRefresh();
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search staff..." className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500" />
        </div>
        <button onClick={onRefresh} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors"><RefreshCw className="w-4 h-4" /></button>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold rounded-xl text-sm transition-all">
          <Plus className="w-4 h-4" /> Add Staff Record
        </button>
      </div>

      <div className="flex gap-1 bg-slate-900/60 rounded-xl p-1 border border-slate-800">
        <button onClick={() => setActiveView('system')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeView === 'system' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'}`}>
          System Users ({appUsers.length})
        </button>
        <button onClick={() => setActiveView('records')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeView === 'records' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'}`}>
          HR Records ({staff.length})
        </button>
      </div>

      {activeView === 'system' ? (
        <div className="space-y-2">
          {filteredAppUsers.map(u => (
            <div key={u.id} className={`bg-slate-900 border rounded-xl p-4 transition-all ${u.is_active ? 'border-slate-800 hover:border-slate-700' : 'border-slate-800/50 opacity-60'}`}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-600/20 border border-rose-500/20 flex items-center justify-center text-rose-400 font-bold text-sm shrink-0">
                  {(u.full_name || '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <h3 className="text-white font-semibold">{u.full_name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${ROLE_BADGE_ALL[u.role] || 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                      {ROLE_LABELS[u.role] || u.role.replace(/_/g, ' ')}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${u.is_active ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-slate-500">
                    {u.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{u.phone}</span>}
                    {u.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{u.email}</span>}
                    <span>Added: {new Date(u.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => openEditAppUser(u)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors" title="Edit">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => toggleAppUserActive(u)} className={`p-2 rounded-lg transition-colors ${u.is_active ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`} title={u.is_active ? 'Deactivate' : 'Activate'}>
                    {u.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredAppUsers.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>{search ? 'No staff match your search' : 'No system users found'}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(s => (
            <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white font-bold text-sm">
                  {(s.full_name || '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <h3 className="text-white font-semibold">{s.full_name}</h3>
                    {s.employee_code && <span className="text-slate-500 text-xs">#{s.employee_code}</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[s.status]}`}>{s.status.replace('_', ' ')}</span>
                  </div>
                  <p className="text-slate-400 text-sm">{s.designation} · {s.department}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-slate-500">
                    {s.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{s.phone}</span>}
                    {s.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{s.email}</span>}
                    {s.date_of_joining && <span>Joined: {new Date(s.date_of_joining).toLocaleDateString()}</span>}
                    <span className="text-rose-400">₹{(s.salary_basic + s.salary_hra + s.salary_allowances - s.salary_deductions).toLocaleString('en-IN')} net/mo</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => openEdit(s)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => toggleStatus(s)} className={`p-2 rounded-lg transition-colors ${s.status === 'active' ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
                    {s.status === 'active' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>{search ? 'No staff match your search' : 'No HR records added yet. Use "Add Staff Record" to add payroll details.'}</p>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <StaffFormModal
          form={form}
          setForm={setForm}
          onSave={save}
          onClose={() => setShowForm(false)}
          saving={saving}
          error={error}
          success={success}
          isEdit={!!editingStaff}
        />
      )}

      {editingAppUser && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-t-2xl md:rounded-2xl w-full md:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold">Edit Staff Member</h3>
                <p className="text-slate-400 text-xs mt-0.5">{editingAppUser.email}</p>
              </div>
              <button onClick={() => setEditingAppUser(null)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              {appUserError && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex gap-2"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{appUserError}</div>}
              {appUserSuccess && <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm flex gap-2"><CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />{appUserSuccess}</div>}

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Full Name *</label>
                <input type="text" value={appUserForm.full_name} onChange={e => setAppUserForm(p => ({ ...p, full_name: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500" />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="tel" value={appUserForm.phone} onChange={e => setAppUserForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="Phone number"
                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {BUILTIN_ROLES.map(role => (
                    <button key={role} type="button"
                      onClick={() => setAppUserForm(p => ({ ...p, role }))}
                      className={`py-2.5 px-2 rounded-xl border text-xs font-medium transition-all text-center ${appUserForm.role === role ? ROLE_BADGE_ALL[role] || 'border-slate-500 bg-slate-700 text-white' : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-white hover:border-slate-600'}`}>
                      {ROLE_LABELS[role] || role.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditingAppUser(null)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm transition-colors">Cancel</button>
                <button onClick={saveAppUser} disabled={savingAppUser}
                  className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {savingAppUser ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StaffFormModal({ form, setForm, onSave, onClose, saving, error, success, isEdit }: {
  form: typeof emptyStaff;
  setForm: (f: typeof emptyStaff) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
  error: string;
  success: string;
  isEdit: boolean;
}) {
  const set = (k: string, v: unknown) => setForm({ ...form, [k]: v });

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-t-2xl md:rounded-2xl w-full md:max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-5 py-4 flex items-center justify-between">
          <h3 className="text-white font-bold">{isEdit ? 'Edit Staff' : 'Add Staff Member'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-5">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex gap-2"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}</div>}
          {success && <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm flex gap-2"><CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />{success}</div>}

          <section>
            <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField label="Full Name *" value={form.full_name} onChange={v => set('full_name', v)} placeholder="Employee name" />
              <FormField label="Employee Code" value={form.employee_code || ''} onChange={v => set('employee_code', v)} placeholder="EMP001" />
              <FormField label="Email" value={form.email || ''} onChange={v => set('email', v)} placeholder="email@company.com" type="email" />
              <FormField label="Phone" value={form.phone || ''} onChange={v => set('phone', v)} placeholder="Phone number" />
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Department *</label>
                <select value={form.department} onChange={e => set('department', e.target.value)} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500">
                  {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <FormField label="Designation *" value={form.designation} onChange={v => set('designation', v)} placeholder="e.g. Sales Manager" />
              <FormField label="Date of Joining" value={form.date_of_joining || ''} onChange={v => set('date_of_joining', v)} type="date" />
              <FormField label="Date of Birth" value={form.date_of_birth || ''} onChange={v => set('date_of_birth', v)} type="date" />
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value)} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Salary Details</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <FormField label="Basic Pay (₹)" value={String(form.salary_basic)} onChange={v => set('salary_basic', Number(v))} type="number" placeholder="0" />
              <FormField label="HRA (₹)" value={String(form.salary_hra)} onChange={v => set('salary_hra', Number(v))} type="number" placeholder="0" />
              <FormField label="Allowances (₹)" value={String(form.salary_allowances)} onChange={v => set('salary_allowances', Number(v))} type="number" placeholder="0" />
              <FormField label="Deductions (₹)" value={String(form.salary_deductions)} onChange={v => set('salary_deductions', Number(v))} type="number" placeholder="0" />
            </div>
            <div className="mt-3 p-3 bg-slate-800/50 rounded-xl flex items-center justify-between">
              <span className="text-slate-400 text-sm">Net Monthly Salary</span>
              <span className="text-white font-bold text-lg">₹{(form.salary_basic + form.salary_hra + form.salary_allowances - form.salary_deductions).toLocaleString('en-IN')}</span>
            </div>
          </section>

          <section>
            <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Bank & Identity</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField label="Bank Account" value={form.bank_account || ''} onChange={v => set('bank_account', v)} placeholder="Account number" />
              <FormField label="IFSC Code" value={form.bank_ifsc || ''} onChange={v => set('bank_ifsc', v)} placeholder="IFSC Code" />
              <FormField label="PAN Number" value={form.pan_number || ''} onChange={v => set('pan_number', v)} placeholder="PAN Number" />
              <FormField label="Aadhar Number" value={form.aadhar_number || ''} onChange={v => set('aadhar_number', v)} placeholder="Aadhar Number" />
            </div>
          </section>

          <section>
            <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Emergency Contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField label="Contact Name" value={form.emergency_contact_name || ''} onChange={v => set('emergency_contact_name', v)} placeholder="Emergency contact name" />
              <FormField label="Contact Phone" value={form.emergency_contact_phone || ''} onChange={v => set('emergency_contact_phone', v)} placeholder="Emergency phone" />
            </div>
          </section>

          <section>
            <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Additional</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Address</label>
                <textarea value={form.address || ''} onChange={e => set('address', e.target.value)} rows={2} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none" placeholder="Residential address" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Notes</label>
                <textarea value={form.notes || ''} onChange={e => set('notes', e.target.value)} rows={2} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none" placeholder="Any additional notes" />
              </div>
            </div>
          </section>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm transition-colors">Cancel</button>
            <button onClick={onSave} disabled={saving} className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              {isEdit ? 'Save Changes' : 'Add Staff'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PayrollTab({ staff, payroll, onRefresh, userId }: { staff: StaffRecord[]; payroll: PayrollRecord[]; onRefresh: () => void; userId?: string }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [showForm, setShowForm] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [payForm, setPayForm] = useState({ basic_pay: 0, hra: 0, allowances: 0, pf_deduction: 0, tds_deduction: 0, other_deductions: 0, payment_mode: 'bank_transfer', payment_status: 'pending', payment_date: '', remarks: '' });

  const monthPayroll = payroll.filter(p => p.month === month && p.year === year);
  const paidIds = new Set(monthPayroll.map(p => p.staff_id));
  const activeStaff = staff.filter(s => s.status === 'active');

  function openPayroll(s: StaffRecord) {
    const existing = monthPayroll.find(p => p.staff_id === s.id);
    setSelectedStaff(s);
    if (existing) {
      setPayForm({ basic_pay: existing.basic_pay, hra: existing.hra, allowances: existing.allowances, pf_deduction: existing.pf_deduction, tds_deduction: existing.tds_deduction, other_deductions: existing.other_deductions, payment_mode: existing.payment_mode, payment_status: existing.payment_status, payment_date: existing.payment_date || '', remarks: existing.remarks || '' });
    } else {
      setPayForm({ basic_pay: s.salary_basic, hra: s.salary_hra, allowances: s.salary_allowances, pf_deduction: 0, tds_deduction: 0, other_deductions: s.salary_deductions, payment_mode: 'bank_transfer', payment_status: 'pending', payment_date: '', remarks: '' });
    }
    setError(''); setShowForm(true);
  }

  async function savePayroll() {
    if (!selectedStaff) return;
    setSaving(true); setError('');
    const existing = monthPayroll.find(p => p.staff_id === selectedStaff.id);
    const gross_pay = payForm.basic_pay + payForm.hra + payForm.allowances;
    const total_deductions = payForm.pf_deduction + payForm.tds_deduction + payForm.other_deductions;
    const net_pay = gross_pay - total_deductions;
    const data = { staff_id: selectedStaff.id, month, year, ...payForm, gross_pay, total_deductions, net_pay, created_by: userId };
    if (existing) {
      const { error: e } = await supabase.from('payroll_records').update(data).eq('id', existing.id);
      if (e) { setError(e.message); setSaving(false); return; }
    } else {
      const { error: e } = await supabase.from('payroll_records').insert(data);
      if (e) { setError(e.message); setSaving(false); return; }
    }
    await onRefresh();
    setSaving(false);
    setShowForm(false);
  }

  const totalNet = monthPayroll.reduce((s, p) => s + p.net_pay, 0);
  const paidNet = monthPayroll.filter(p => p.payment_status === 'paid').reduce((s, p) => s + p.net_pay, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <select value={month} onChange={e => setMonth(Number(e.target.value))} className="px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500">
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))} className="px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500">
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <button onClick={onRefresh} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors"><RefreshCw className="w-4 h-4" /></button>
        <div className="ml-auto flex gap-4 text-sm">
          <div className="text-center">
            <p className="text-white font-bold">₹{totalNet.toLocaleString('en-IN')}</p>
            <p className="text-slate-500 text-xs">Total</p>
          </div>
          <div className="text-center">
            <p className="text-green-400 font-bold">₹{paidNet.toLocaleString('en-IN')}</p>
            <p className="text-slate-500 text-xs">Paid</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {activeStaff.map(s => {
          const p = monthPayroll.find(pr => pr.staff_id === s.id);
          return (
            <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4 hover:border-slate-700 transition-all">
              <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-white font-bold text-sm">{(s.full_name || '?').charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium">{s.full_name}</p>
                <p className="text-slate-500 text-xs">{s.designation} · {s.department}</p>
              </div>
              <div className="text-right">
                {p ? (
                  <>
                    <p className="text-white font-bold">₹{p.net_pay.toLocaleString('en-IN')}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PAY_STATUS_COLORS[p.payment_status]}`}>{p.payment_status}</span>
                  </>
                ) : (
                  <span className="text-slate-500 text-xs">Not processed</span>
                )}
              </div>
              <button onClick={() => openPayroll(s)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
                {p ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>
          );
        })}
        {activeStaff.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No active staff found. Add staff first.</p>
          </div>
        )}
      </div>

      {showForm && selectedStaff && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-t-2xl md:rounded-2xl w-full md:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold">Process Payroll</h3>
                <p className="text-slate-400 text-xs mt-0.5">{selectedStaff.full_name} · {MONTHS[month - 1]} {year}</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Basic Pay (₹)" value={String(payForm.basic_pay)} onChange={v => setPayForm(p => ({ ...p, basic_pay: Number(v) }))} type="number" />
                <FormField label="HRA (₹)" value={String(payForm.hra)} onChange={v => setPayForm(p => ({ ...p, hra: Number(v) }))} type="number" />
                <FormField label="Allowances (₹)" value={String(payForm.allowances)} onChange={v => setPayForm(p => ({ ...p, allowances: Number(v) }))} type="number" />
                <FormField label="PF Deduction (₹)" value={String(payForm.pf_deduction)} onChange={v => setPayForm(p => ({ ...p, pf_deduction: Number(v) }))} type="number" />
                <FormField label="TDS (₹)" value={String(payForm.tds_deduction)} onChange={v => setPayForm(p => ({ ...p, tds_deduction: Number(v) }))} type="number" />
                <FormField label="Other Deductions (₹)" value={String(payForm.other_deductions)} onChange={v => setPayForm(p => ({ ...p, other_deductions: Number(v) }))} type="number" />
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Gross Pay</span>
                  <span className="text-white">₹{(payForm.basic_pay + payForm.hra + payForm.allowances).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Total Deductions</span>
                  <span className="text-red-400">-₹{(payForm.pf_deduction + payForm.tds_deduction + payForm.other_deductions).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t border-slate-700 pt-2 mt-1">
                  <span className="text-white">Net Pay</span>
                  <span className="text-green-400">₹{(payForm.basic_pay + payForm.hra + payForm.allowances - payForm.pf_deduction - payForm.tds_deduction - payForm.other_deductions).toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Payment Mode</label>
                  <select value={payForm.payment_mode} onChange={e => setPayForm(p => ({ ...p, payment_mode: e.target.value }))} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500">
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                    <option value="upi">UPI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Payment Status</label>
                  <select value={payForm.payment_status} onChange={e => setPayForm(p => ({ ...p, payment_status: e.target.value }))} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500">
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="hold">Hold</option>
                  </select>
                </div>
              </div>
              <FormField label="Payment Date" value={payForm.payment_date} onChange={v => setPayForm(p => ({ ...p, payment_date: v }))} type="date" />
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Remarks</label>
                <textarea value={payForm.remarks} onChange={e => setPayForm(p => ({ ...p, remarks: e.target.value }))} rows={2} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm">Cancel</button>
                <button onClick={savePayroll} disabled={saving} className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Payroll
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LeaveTab({ leaves, staff, onRefresh, userId }: { leaves: LeaveRequest[]; staff: StaffRecord[]; onRefresh: () => void; userId?: string }) {
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ staff_id: '', leave_type: 'casual', from_date: '', to_date: '', days_count: 1, reason: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [updating, setUpdating] = useState(false);

  const filtered = leaves.filter(l => filter === 'all' || l.status === filter);
  const activeStaff = staff.filter(s => s.status === 'active');

  async function saveLeave() {
    if (!form.staff_id || !form.from_date || !form.to_date || !form.reason) {
      setError('All fields are required.'); return;
    }
    setSaving(true); setError('');
    const { error: e } = await supabase.from('leave_requests').insert({ ...form });
    if (e) { setError(e.message); setSaving(false); return; }
    await onRefresh(); setSaving(false); setShowForm(false);
    setForm({ staff_id: '', leave_type: 'casual', from_date: '', to_date: '', days_count: 1, reason: '' });
  }

  async function updateLeaveStatus(id: string, status: 'approved' | 'rejected') {
    setUpdating(true);
    await supabase.from('leave_requests').update({ status, approved_by: userId, remarks: reviewRemarks, updated_at: new Date().toISOString() }).eq('id', id);
    setUpdating(false);
    setReviewingId(null);
    setReviewRemarks('');
    onRefresh();
  }

  function openReview(id: string) {
    setReviewingId(id);
    setReviewRemarks('');
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
          {['all', 'pending', 'approved', 'rejected'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === s ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={onRefresh} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors"><RefreshCw className="w-4 h-4" /></button>
        <button onClick={() => { setShowForm(true); setError(''); }} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold rounded-xl text-sm ml-auto">
          <Plus className="w-4 h-4" /> Add Leave
        </button>
      </div>

      <div className="space-y-2">
        {filtered.map(l => {
          const displayName = (l.staff as any)?.full_name || (l as any).app_user?.full_name || (l as any).requester_name || '—';
          const roleLabel = (l as any).app_user?.role?.replace(/_/g, ' ') || (l.staff as any)?.department || '';
          const isReviewing = reviewingId === l.id;
          return (
            <div key={l.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-white font-bold text-sm">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="text-white font-semibold">{displayName}</p>
                    {roleLabel && <span className="text-xs text-slate-500">{roleLabel}</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${LEAVE_STATUS_COLORS[l.status]}`}>{l.status}</span>
                    <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{l.leave_type}</span>
                  </div>
                  <p className="text-slate-400 text-sm">{new Date(l.from_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} – {new Date(l.to_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} ({l.days_count} day{l.days_count > 1 ? 's' : ''})</p>
                  <p className="text-slate-500 text-xs mt-1 truncate">{l.reason}</p>
                  {l.remarks && <p className="text-green-400 text-xs mt-1 italic">HR Reply: {l.remarks}</p>}
                </div>
                {l.status === 'pending' && !isReviewing && (
                  <button onClick={() => openReview(l.id)} className="px-3 py-1.5 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 rounded-lg text-xs font-medium transition-colors shrink-0">
                    Review
                  </button>
                )}
              </div>
              {isReviewing && (
                <div className="mt-3 pt-3 border-t border-slate-800 space-y-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Reply to Employee (optional)</label>
                    <textarea
                      value={reviewRemarks}
                      onChange={e => setReviewRemarks(e.target.value)}
                      rows={2}
                      placeholder="e.g. Approved. Enjoy your leave! / Rejected due to critical project deadline."
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setReviewingId(null)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-xs font-medium transition-colors">Cancel</button>
                    <button onClick={() => updateLeaveStatus(l.id, 'approved')} disabled={updating} className="flex-1 px-3 py-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
                      {updating ? 'Saving...' : 'Approve'}
                    </button>
                    <button onClick={() => updateLeaveStatus(l.id, 'rejected')} disabled={updating} className="flex-1 px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
                      {updating ? 'Saving...' : 'Reject'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No leave requests found</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-t-2xl md:rounded-2xl w-full md:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-5 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold">Add Leave Request</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Staff Member *</label>
                <select value={form.staff_id} onChange={e => setForm(f => ({ ...f, staff_id: e.target.value }))} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500">
                  <option value="">Select staff</option>
                  {activeStaff.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Leave Type</label>
                <select value={form.leave_type} onChange={e => setForm(f => ({ ...f, leave_type: e.target.value }))} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500">
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="earned">Earned Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="From Date *" value={form.from_date} onChange={v => setForm(f => ({ ...f, from_date: v }))} type="date" />
                <FormField label="To Date *" value={form.to_date} onChange={v => setForm(f => ({ ...f, to_date: v }))} type="date" />
              </div>
              <FormField label="Days Count" value={String(form.days_count)} onChange={v => setForm(f => ({ ...f, days_count: Number(v) }))} type="number" />
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Reason *</label>
                <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} rows={3} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none" placeholder="Reason for leave" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm">Cancel</button>
                <button onClick={saveLeave} disabled={saving} className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold rounded-xl text-sm disabled:opacity-50">
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

function CRMTab({ contacts, onRefresh, userId }: { contacts: CRMContact[]; onRefresh: () => void; userId?: string }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<CRMContact | null>(null);
  const [form, setForm] = useState<typeof emptyCRM>({ ...emptyCRM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase();
    const matchQ = !q || c.company_name.toLowerCase().includes(q) || c.contact_person.toLowerCase().includes(q) || c.phone.includes(q);
    const matchType = typeFilter === 'all' || c.contact_type === typeFilter;
    return matchQ && matchType;
  });

  function openAdd() { setForm({ ...emptyCRM }); setEditingContact(null); setError(''); setShowForm(true); }
  function openEdit(c: CRMContact) { setForm({ ...c }); setEditingContact(c); setError(''); setShowForm(true); }

  async function save() {
    if (!form.company_name || !form.contact_person || !form.phone) {
      setError('Company name, contact person and phone are required.'); return;
    }
    setSaving(true); setError('');
    if (editingContact) {
      const { error: e } = await supabase.from('office_crm_contacts').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editingContact.id);
      if (e) { setError(e.message); setSaving(false); return; }
    } else {
      const { error: e } = await supabase.from('office_crm_contacts').insert({ ...form, created_by: userId });
      if (e) { setError(e.message); setSaving(false); return; }
    }
    await onRefresh(); setSaving(false); setShowForm(false);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts..." className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-rose-500">
          <option value="all">All Types</option>
          <option value="vendor">Vendor</option>
          <option value="client">Client</option>
          <option value="partner">Partner</option>
          <option value="other">Other</option>
        </select>
        <button onClick={onRefresh} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors"><RefreshCw className="w-4 h-4" /></button>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold rounded-xl text-sm">
          <Plus className="w-4 h-4" /> Add Contact
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map(c => (
          <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {c.company_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <h3 className="text-white font-semibold truncate">{c.company_name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CONTACT_TYPE_COLORS[c.contact_type]}`}>{c.contact_type}</span>
                  {!c.is_active && <span className="text-xs text-slate-500">Inactive</span>}
                </div>
                <p className="text-slate-400 text-sm">{c.contact_person}</p>
                <div className="flex flex-wrap gap-x-3 mt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>
                  {c.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.city}</span>}
                  {c.category && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{c.category}</span>}
                </div>
                {c.notes && <p className="text-slate-600 text-xs mt-1.5 truncate">{c.notes}</p>}
              </div>
              <button onClick={() => openEdit(c)} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors shrink-0"><Pencil className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-16 text-slate-500">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>{search ? 'No contacts match your search' : 'No contacts added yet'}</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-t-2xl md:rounded-2xl w-full md:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-5 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold">{editingContact ? 'Edit Contact' : 'Add CRM Contact'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Contact Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['vendor', 'client', 'partner', 'other'] as const).map(t => (
                    <button key={t} type="button" onClick={() => setForm(f => ({ ...f, contact_type: t }))} className={`py-2 rounded-xl border text-xs font-medium transition-all ${form.contact_type === t ? `${CONTACT_TYPE_COLORS[t]} border-current` : 'border-slate-700 bg-slate-800 text-slate-400'}`}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField label="Company Name *" value={form.company_name} onChange={v => setForm(f => ({ ...f, company_name: v }))} placeholder="Company name" />
                <FormField label="Contact Person *" value={form.contact_person} onChange={v => setForm(f => ({ ...f, contact_person: v }))} placeholder="Contact name" />
                <FormField label="Phone *" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} placeholder="Phone number" />
                <FormField label="Alternate Phone" value={form.alternate_phone || ''} onChange={v => setForm(f => ({ ...f, alternate_phone: v }))} placeholder="Alt phone" />
                <FormField label="Email" value={form.email || ''} onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="Email" type="email" />
                <FormField label="Category" value={form.category || ''} onChange={v => setForm(f => ({ ...f, category: v }))} placeholder="e.g. Electricals" />
                <FormField label="City" value={form.city || ''} onChange={v => setForm(f => ({ ...f, city: v }))} placeholder="City" />
                <FormField label="State" value={form.state || ''} onChange={v => setForm(f => ({ ...f, state: v }))} placeholder="State" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Address</label>
                <textarea value={form.address || ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} rows={2} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none" placeholder="Full address" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Notes</label>
                <textarea value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm">Cancel</button>
                <button onClick={save} disabled={saving} className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingContact ? 'Save Changes' : 'Add Contact'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, value, onChange, placeholder = '', type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
      />
    </div>
  );
}

const ATT_STATUS_COLORS: Record<string, string> = {
  present: 'bg-green-500/20 text-green-400', half_day: 'bg-amber-500/20 text-amber-400',
  absent: 'bg-red-500/20 text-red-400', leave: 'bg-blue-500/20 text-blue-400', holiday: 'bg-slate-500/20 text-slate-400',
};

function AttendanceViewTab({ attendance, onRefresh }: { attendance: any[]; onRefresh: () => void }) {
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 10));
  const [search, setSearch] = useState('');

  const filtered = attendance.filter(a => {
    const matchDate = !dateFilter || a.attendance_date === dateFilter;
    const matchSearch = !search || (a.user as any)?.full_name?.toLowerCase().includes(search.toLowerCase());
    return matchDate && matchSearch;
  });

  const todayPresent = attendance.filter(a => a.attendance_date === dateFilter && a.status === 'present').length;
  const todayAbsent = attendance.filter(a => a.attendance_date === dateFilter && a.status === 'absent').length;
  const todayCheckedOut = attendance.filter(a => a.attendance_date === dateFilter && a.check_out_time).length;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex flex-wrap gap-3 items-center">
        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500" />
        <div className="flex-1 min-w-40 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employee..." className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500" />
        </div>
        <button onClick={onRefresh} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors"><RefreshCw className="w-4 h-4" /></button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Present', value: todayPresent, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Checked Out', value: todayCheckedOut, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Absent', value: todayAbsent, color: 'text-red-400', bg: 'bg-red-500/10' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-slate-400 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(a => (
          <div key={a.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-white font-bold text-sm">
                {(a.user as any)?.full_name?.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="text-white font-semibold">{(a.user as any)?.full_name || '—'}</p>
                  <span className="text-slate-500 text-xs">{(a.user as any)?.role?.replace('_', ' ')}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${ATT_STATUS_COLORS[a.status] || 'bg-slate-700 text-slate-400'}`}>{a.status.replace('_', ' ')}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                  {a.check_in_time && <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-green-500" />In: {new Date(a.check_in_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>}
                  {a.check_out_time && <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-blue-500" />Out: {new Date(a.check_out_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>}
                  {a.work_hours > 0 && <span className="text-teal-500">{a.work_hours}h worked</span>}
                  {a.check_in_address && <span className="flex items-center gap-1 truncate max-w-xs"><Navigation className="w-3 h-3 shrink-0" />{a.check_in_address.slice(0, 60)}</span>}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {a.check_in_selfie_url && <img src={a.check_in_selfie_url} alt="In" className="w-10 h-10 rounded-lg object-cover border border-green-500/30" />}
                {a.check_out_selfie_url && <img src={a.check_out_selfie_url} alt="Out" className="w-10 h-10 rounded-lg object-cover border border-blue-500/30" />}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Camera className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No attendance records for this date</p>
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

const MONTHS_LIST = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function AdvancesTab({ advances, onRefresh, userId }: { advances: any[]; onRefresh: () => void; userId?: string }) {
  const [filter, setFilter] = useState('pending');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ status: '', amount_approved: '', disbursal_date: '', repayment_month: '', repayment_year: '', remarks: '' });
  const [saving, setSaving] = useState(false);

  const filtered = advances.filter(a => filter === 'all' || a.status === filter);

  function openEdit(a: any) {
    setEditingId(a.id);
    setEditForm({
      status: a.status, amount_approved: String(a.amount_approved || a.amount_requested),
      disbursal_date: a.disbursal_date || '', repayment_month: String(a.repayment_month || ''),
      repayment_year: String(a.repayment_year || new Date().getFullYear()), remarks: a.remarks || '',
    });
  }

  async function save() {
    setSaving(true);
    await supabase.from('salary_advance_requests').update({
      status: editForm.status,
      amount_approved: Number(editForm.amount_approved),
      disbursal_date: editForm.disbursal_date || null,
      repayment_month: editForm.repayment_month ? Number(editForm.repayment_month) : null,
      repayment_year: editForm.repayment_year ? Number(editForm.repayment_year) : null,
      remarks: editForm.remarks,
      approved_by: userId,
      updated_at: new Date().toISOString(),
    }).eq('id', editingId!);
    setSaving(false);
    setEditingId(null);
    onRefresh();
  }

  const pendingCount = advances.filter(a => a.status === 'pending').length;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
          {['pending', 'approved', 'disbursed', 'rejected', 'all'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative ${filter === s ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
              {s === 'pending' && pendingCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full text-white text-xs flex items-center justify-center">{pendingCount}</span>}
            </button>
          ))}
        </div>
        <button onClick={onRefresh} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors ml-auto"><RefreshCw className="w-4 h-4" /></button>
      </div>

      <div className="space-y-3">
        {filtered.map(a => (
          <div key={a.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-white font-bold text-sm">
                {(a.employee as any)?.full_name?.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="text-white font-semibold">{(a.employee as any)?.full_name || '—'}</p>
                  <span className="text-slate-500 text-xs">{(a.employee as any)?.role?.replace('_', ' ')}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${ADVANCE_STATUS_COLORS[a.status] || 'bg-slate-700 text-slate-400'}`}>{a.status}</span>
                </div>
                <p className="text-white font-bold text-lg">₹{a.amount_requested.toLocaleString('en-IN')}</p>
                {a.amount_approved > 0 && a.status !== 'pending' && (
                  <p className="text-green-400 text-xs">Approved: ₹{a.amount_approved.toLocaleString('en-IN')}</p>
                )}
                <p className="text-slate-400 text-sm mt-1">{a.reason}</p>
                {a.purpose && <p className="text-slate-500 text-xs">{a.purpose}</p>}
                {a.remarks && <p className="text-slate-500 text-xs italic mt-1">HR Note: {a.remarks}</p>}
                {a.disbursal_date && <p className="text-teal-500 text-xs mt-1">Disbursed: {new Date(a.disbursal_date).toLocaleDateString('en-IN')}</p>}
                {a.repayment_month && <p className="text-red-400 text-xs">Repay: {MONTHS_LIST[a.repayment_month - 1]} {a.repayment_year}</p>}
                <p className="text-slate-600 text-xs mt-1">{new Date(a.created_at).toLocaleDateString('en-IN')}</p>
              </div>
              <button onClick={() => openEdit(a)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors shrink-0">
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Wallet className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No {filter === 'all' ? '' : filter} advance requests</p>
          </div>
        )}
      </div>

      {editingId && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-t-2xl md:rounded-2xl w-full md:max-w-md max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-5 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold">Review Advance Request</h3>
              <button onClick={() => setEditingId(null)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {['approved', 'rejected', 'disbursed'].map(s => (
                    <button key={s} onClick={() => setEditForm(f => ({ ...f, status: s }))} className={`py-2 rounded-xl text-xs font-medium border transition-all ${editForm.status === s ? (s === 'rejected' ? 'border-red-500 bg-red-500/20 text-red-400' : s === 'approved' ? 'border-green-500 bg-green-500/20 text-green-400' : 'border-blue-500 bg-blue-500/20 text-blue-400') : 'border-slate-700 bg-slate-800 text-slate-400'}`}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <FormField label="Amount Approved (₹)" value={editForm.amount_approved} onChange={v => setEditForm(f => ({ ...f, amount_approved: v }))} type="number" />
              <FormField label="Disbursal Date" value={editForm.disbursal_date} onChange={v => setEditForm(f => ({ ...f, disbursal_date: v }))} type="date" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Repayment Month</label>
                  <select value={editForm.repayment_month} onChange={e => setEditForm(f => ({ ...f, repayment_month: e.target.value }))} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500">
                    <option value="">Select</option>
                    {MONTHS_LIST.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <FormField label="Repayment Year" value={editForm.repayment_year} onChange={v => setEditForm(f => ({ ...f, repayment_year: v }))} type="number" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">HR Remarks</label>
                <textarea value={editForm.remarks} onChange={e => setEditForm(f => ({ ...f, remarks: e.target.value }))} rows={3} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none" placeholder="Notes for employee" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditingId(null)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm">Cancel</button>
                <button onClick={save} disabled={saving} className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
