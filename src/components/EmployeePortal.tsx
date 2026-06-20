import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import CameraCapture from './CameraCapture';
import ProfileAvatar from './ProfileAvatar';
import {
  Clock, DollarSign, Calendar, LogOut,
  Camera, CheckCircle, AlertCircle,
  X, ChevronRight, Wallet,
  LayoutDashboard, Send, Plus, User,
  Bell, TrendingUp, Trash2, RefreshCw, Info
} from 'lucide-react';

interface AttendanceRecord {
  id: string;
  attendance_date: string;
  check_in_time?: string;
  check_in_selfie_url?: string;
  check_in_lat?: number | null;
  check_in_lng?: number | null;
  check_in_address?: string;
  check_out_time?: string;
  check_out_selfie_url?: string;
  check_out_lat?: number | null;
  check_out_lng?: number | null;
  check_out_address?: string;
  status: string;
  work_hours?: number;
}

interface PayrollRecord {
  id: string;
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
  payment_status: string;
  remarks?: string;
}

interface SalaryAdvance {
  id: string;
  amount_requested: number;
  amount_approved: number;
  reason: string;
  purpose: string;
  status: string;
  disbursal_date?: string;
  repayment_month?: number;
  repayment_year?: number;
  remarks?: string;
  created_at: string;
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
}

interface LeaveBalance {
  id: string;
  casual_total: number;
  casual_used: number;
  sick_total: number;
  sick_used: number;
  earned_total: number;
  earned_used: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

type Tab = 'home' | 'attendance' | 'payslip' | 'advance' | 'leave' | 'profile';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin', manager: 'Manager', hr: 'HR',
  marketing_executive: 'Marketing Exec.', telecaller: 'Telecaller', employee: 'Employee',
};

const ADVANCE_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  approved: 'bg-green-500/20 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  disbursed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  repaid: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const NOTIF_TYPE_COLORS: Record<string, string> = {
  success: 'bg-green-400',
  error: 'bg-red-400',
  warning: 'bg-amber-400',
  info: 'bg-blue-400',
};

export default function EmployeePortal() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [advances, setAdvances] = useState<SalaryAdvance[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [todayLogs, setTodayLogs] = useState<any[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
    const today = new Date().toISOString().slice(0, 10);
    const thisYear = new Date().getFullYear();

    const [attRes, advRes, payRes, leaveRes, balRes, notifRes, attLogRes] = await Promise.all([
      supabase.from('attendance_records').select('*').eq('staff_user_id', user.id).order('attendance_date', { ascending: false }).limit(30),
      supabase.from('salary_advance_requests').select('*').eq('app_user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('payroll_records').select('*').eq('app_user_id', user.id).order('year', { ascending: false }).order('month', { ascending: false }),
      supabase.from('leave_requests').select('*').eq('app_user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('leave_balances').select('*').eq('app_user_id', user.id).eq('year', thisYear).maybeSingle(),
      supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      supabase.from('attendance_logs').select('*').eq('staff_user_id', user.id).order('punch_time', { ascending: true }).limit(100),
    ]);

    const att = (attRes.data || []) as AttendanceRecord[];
    const logs = attLogRes.data || [];
    setAttendance(att);
    setTodayRecord(att.find(a => a.attendance_date === today) || null);
    setAttendanceLogs(logs);
    setTodayLogs(logs.filter((l: any) => l.attendance_date === today));
    setAdvances((advRes.data || []) as SalaryAdvance[]);
    setLeaveBalance(balRes.data as LeaveBalance | null);
    setNotifications((notifRes.data || []) as Notification[]);
    setPayroll((payRes.data || []) as PayrollRecord[]);
    setLeaves((leaveRes.data || []) as LeaveRequest[]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  async function markAllNotificationsRead() {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }

  function openNotifications() {
    setShowNotifications(true);
    markAllNotificationsRead();
  }

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'home', label: 'Home', icon: LayoutDashboard },
    { key: 'attendance', label: 'Attendance', icon: Clock },
    { key: 'payslip', label: 'Payslip', icon: DollarSign },
    { key: 'advance', label: 'Advance', icon: Wallet },
    { key: 'leave', label: 'Leave', icon: Calendar },
    { key: 'profile', label: 'Profile', icon: User },
  ];

  if (!user || user.role !== 'employee') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">Access Denied</h2>
          <p className="text-slate-400 text-sm mb-6">You do not have permission to access this portal.</p>
          <button onClick={signOut} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl text-sm hover:bg-red-500/30 transition-colors">Sign Out</button>
        </div>
      </div>
    );
  }

  const presentDays = attendance.filter(a => a.status === 'present').length;
  const leaveDays = leaves.filter(a => a.status === 'approved').length;
  const lastPayslip = payroll[0];
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col max-w-lg mx-auto">
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <ProfileAvatar size="md" />
          <div>
            <p className="text-white font-semibold text-sm leading-none">{user?.full_name}</p>
            <p className="text-slate-500 text-xs">{ROLE_LABELS[user?.role || ''] || 'Employee'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={openNotifications} className="relative p-2 text-slate-400 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <button onClick={loadData} className="p-2 text-slate-400 hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={signOut} className="p-2 text-slate-400 hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {showNotifications && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center pt-16">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg mx-4 max-h-[70vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <h3 className="text-white font-bold flex items-center gap-2"><Bell className="w-4 h-4 text-amber-400" /> Notifications</h3>
              <button onClick={() => setShowNotifications(false)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : notifications.map(n => (
                <div key={n.id} className="px-5 py-4 border-b border-slate-800/60 flex gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${NOTIF_TYPE_COLORS[n.type] || 'bg-slate-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{n.title}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{n.message}</p>
                    <p className="text-slate-600 text-xs mt-1">{new Date(n.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto pb-20">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-10 h-10 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'home' && <HomeTab user={user} todayRecord={todayRecord} presentDays={presentDays} leaveDays={leaveDays} lastPayslip={lastPayslip} advances={advances} leaves={leaves} attendance={attendance} onRefresh={loadData} setActiveTab={setActiveTab} />}
            {activeTab === 'attendance' && <AttendanceTab user={user} attendance={attendance} attendanceLogs={attendanceLogs} todayRecord={todayRecord} todayLogs={todayLogs} onRefresh={loadData} />}
            {activeTab === 'payslip' && <PayslipTab payroll={payroll} />}
            {activeTab === 'advance' && <AdvanceTab user={user} advances={advances} onRefresh={loadData} />}
            {activeTab === 'leave' && <LeaveTab leaves={leaves} leaveBalance={leaveBalance} onRefresh={loadData} />}
            {activeTab === 'profile' && <ProfileTab />}
          </>
        )}
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-slate-900 border-t border-slate-800 flex">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all ${activeTab === t.key ? 'text-teal-400' : 'text-slate-500 hover:text-slate-300'}`}>
            <t.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function HomeTab({ user, todayRecord, leaveDays, lastPayslip, advances, leaves, attendance, setActiveTab }: {
  user: any; todayRecord: AttendanceRecord | null; presentDays?: number; leaveDays: number;
  lastPayslip: PayrollRecord | undefined; advances: SalaryAdvance[]; leaves: LeaveRequest[];
  attendance: AttendanceRecord[]; onRefresh?: () => void; setActiveTab: (t: Tab) => void;
}) {
  const now = new Date();
  const pendingAdvances = advances.filter(a => a.status === 'pending').length;
  const pendingLeaves = leaves.filter(l => l.status === 'pending').length;

  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const monthAttendance = attendance.filter(a => {
    const d = new Date(a.attendance_date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });
  const monthPresent = monthAttendance.filter(a => a.status === 'present').length;
  const totalHours = monthAttendance.reduce((sum, a) => sum + (a.work_hours || 0), 0);
  const avgHours = monthPresent > 0 ? (totalHours / monthPresent).toFixed(1) : '0';

  return (
    <div className="p-4 space-y-4">
      <div className="bg-gradient-to-br from-teal-600 to-cyan-700 rounded-2xl p-5 text-white">
        <p className="text-teal-200 text-xs font-medium mb-1">{now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <h2 className="text-xl font-bold mb-4">Good {now.getHours() < 12 ? 'Morning' : now.getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.full_name?.split(' ')[0]}!</h2>
        {todayRecord ? (
          <div className="bg-white/10 rounded-xl p-3 space-y-2">
            {todayRecord.check_in_time && (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-300" />
                <span className="text-sm">Checked in at {new Date(todayRecord.check_in_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )}
            {todayRecord.check_out_time ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-300" />
                <span className="text-sm">Checked out · {todayRecord.work_hours}h worked</span>
              </div>
            ) : (
              <p className="text-teal-200 text-xs">Don't forget to check out!</p>
            )}
          </div>
        ) : (
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-sm text-teal-200">You haven't checked in today.</p>
            <button onClick={() => setActiveTab('attendance')} className="mt-2 text-sm font-semibold text-white underline underline-offset-2">Go to Attendance</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'This Month', value: monthPresent, sub: 'days present', color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Avg Hours', value: avgHours + 'h', sub: 'per day', color: 'text-teal-400', bg: 'bg-teal-500/10' },
          { label: 'Pending', value: pendingAdvances + pendingLeaves, sub: 'approvals', color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-slate-400 text-xs mt-0.5 leading-tight">{s.label}</p>
            <p className="text-slate-600 text-[10px]">{s.sub}</p>
          </div>
        ))}
      </div>

      {(pendingAdvances > 0 || pendingLeaves > 0) && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-amber-300 text-sm">
            You have {pendingLeaves > 0 ? `${pendingLeaves} leave` : ''}{pendingLeaves > 0 && pendingAdvances > 0 ? ' and ' : ''}{pendingAdvances > 0 ? `${pendingAdvances} advance` : ''} request{(pendingLeaves + pendingAdvances) > 1 ? 's' : ''} pending approval.
          </p>
        </div>
      )}

      {lastPayslip && (
        <button onClick={() => setActiveTab('payslip')} className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between hover:border-slate-700 transition-all text-left">
          <div>
            <p className="text-slate-400 text-xs mb-0.5">Last Payslip · {MONTHS[lastPayslip.month - 1]} {lastPayslip.year}</p>
            <p className="text-white text-xl font-bold">₹{lastPayslip.net_pay.toLocaleString('en-IN')}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${lastPayslip.payment_status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
              {lastPayslip.payment_status}
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500" />
        </button>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setActiveTab('advance')} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2 hover:border-slate-700 transition-all text-left">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Salary Advance</p>
            <p className="text-slate-500 text-xs">Request advance</p>
          </div>
        </button>
        <button onClick={() => setActiveTab('leave')} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2 hover:border-slate-700 transition-all text-left">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-teal-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Leave Request</p>
            <p className="text-slate-500 text-xs">{pendingLeaves > 0 ? `${pendingLeaves} pending` : `${leaveDays} approved`}</p>
          </div>
        </button>
      </div>
    </div>
  );
}

function AttendanceTab({ user, attendance, attendanceLogs, todayRecord, todayLogs, onRefresh }: {
  user: any; attendance: AttendanceRecord[]; attendanceLogs: any[]; todayRecord: AttendanceRecord | null; todayLogs: any[]; onRefresh: () => void;
}) {
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState<'check_in' | 'check_out'>('check_in');
  const [capturing, setCapturing] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const monthAttendance = attendance.filter(a => {
    const d = new Date(a.attendance_date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });
  const monthPresent = monthAttendance.filter(a => a.status === 'present').length;
  const totalHours = monthAttendance.reduce((sum, a) => sum + (a.work_hours || 0), 0);
  const avgHours = monthPresent > 0 ? (totalHours / monthPresent).toFixed(1) : '0';

  async function getGPS(): Promise<{ lat: number; lng: number; address: string } | null> {
    return new Promise(resolve => {
      navigator.geolocation.getCurrentPosition(
        async pos => {
          const { latitude: lat, longitude: lng } = pos.coords;
          let address = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
            const data = await res.json();
            if (data.display_name) address = data.display_name;
          } catch { }
          resolve({ lat, lng, address });
        },
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  }

  async function uploadSelfie(blob: Blob, uid: string): Promise<string | null> {
    const filename = `${uid}/${Date.now()}.jpg`;
    const { data, error } = await supabase.storage.from('attendance-selfies').upload(filename, blob, { contentType: 'image/jpeg', upsert: false });
    if (error || !data) return null;
    const { data: urlData } = supabase.storage.from('attendance-selfies').getPublicUrl(data.path);
    return urlData.publicUrl;
  }

  async function handleSelfieCapture(_: string, blob: Blob) {
    setShowCamera(false);
    setCapturing(true);
    setError('');
    setGettingLocation(true);
    const [selfieUrl, geo] = await Promise.all([
      uploadSelfie(blob, user.id),
      getGPS(),
    ]);
    setGettingLocation(false);

    const today = new Date().toISOString().slice(0, 10);
    const nowIso = new Date().toISOString();

    const { data: dayRecord, error: upsertErr } = await supabase.from('attendance_records').upsert({
      staff_user_id: user.id,
      attendance_date: today,
      check_in_time: todayRecord?.check_in_time || nowIso,
      check_in_selfie_url: todayRecord?.check_in_selfie_url || selfieUrl || '',
      check_in_lat: todayRecord?.check_in_lat || geo?.lat || null,
      check_in_lng: todayRecord?.check_in_lng || geo?.lng || null,
      check_in_address: todayRecord?.check_in_address || geo?.address || '',
      status: 'present',
    }, { onConflict: 'staff_user_id,attendance_date' }).select().maybeSingle();

    if (upsertErr) { setError(upsertErr.message); setCapturing(false); return; }

    const recordId = dayRecord?.id || todayRecord?.id;
    if (recordId) {
      await supabase.from('attendance_logs').insert({
        attendance_record_id: recordId,
        staff_user_id: user.id,
        attendance_date: today,
        punch_type: cameraMode,
        punch_time: nowIso,
        selfie_url: selfieUrl || '',
        lat: geo?.lat || null,
        lng: geo?.lng || null,
        address: geo?.address || '',
      });
    }

    if (cameraMode === 'check_out') {
      const { data: logs } = await supabase.from('attendance_logs').select('*').eq('staff_user_id', user.id).eq('attendance_date', today).order('punch_time', { ascending: true });
      const allLogs = logs || [];
      let totalHours = 0;
      let openIn: Date | null = null;
      for (const log of allLogs) {
        if (log.punch_type === 'check_in') openIn = new Date(log.punch_time);
        else if (log.punch_type === 'check_out' && openIn) {
          totalHours += (new Date(log.punch_time).getTime() - openIn.getTime()) / 3600000;
          openIn = null;
        }
      }
      const hours = Math.round(totalHours * 100) / 100;
      if (recordId) {
        await supabase.from('attendance_records').update({
          check_out_time: nowIso,
          check_out_selfie_url: selfieUrl || '',
          check_out_lat: geo?.lat || null,
          check_out_lng: geo?.lng || null,
          check_out_address: geo?.address || '',
          work_hours: hours,
        }).eq('id', recordId);
      }
    }

    setCapturing(false);
    onRefresh();
  }

  function openCamera(mode: 'check_in' | 'check_out') {
    setCameraMode(mode);
    setShowCamera(true);
    setError('');
  }

  const lastLog = todayLogs.length > 0 ? todayLogs[todayLogs.length - 1] : null;
  const isCurrentlyIn = lastLog?.punch_type === 'check_in';
  const canCheckIn = !isCurrentlyIn;
  const canCheckOut = isCurrentlyIn;

  const STATUS_COLORS: Record<string, string> = {
    present: 'bg-green-500/20 text-green-400', half_day: 'bg-amber-500/20 text-amber-400',
    absent: 'bg-red-500/20 text-red-400', leave: 'bg-blue-500/20 text-blue-400', holiday: 'bg-slate-500/20 text-slate-400',
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-white font-bold text-lg">Attendance</h2>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Present', value: monthPresent, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Total Hours', value: totalHours.toFixed(0) + 'h', color: 'text-teal-400', bg: 'bg-teal-500/10' },
          { label: 'Avg/Day', value: avgHours + 'h', color: 'text-blue-400', bg: 'bg-blue-500/10' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-3 text-center`}>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex gap-2"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />{error}</div>}

      {(capturing || gettingLocation) && (
        <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-xl flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
          <p className="text-teal-300 text-sm">{gettingLocation ? 'Getting GPS location...' : 'Saving attendance...'}</p>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <p className="text-slate-400 text-xs font-medium mb-3">Today — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>

        {todayLogs.length > 0 && (
          <div className="mb-4 space-y-2">
            {todayLogs.map((log: any, idx: number) => (
              <div key={log.id} className={`flex items-center gap-3 p-2.5 rounded-xl ${log.punch_type === 'check_in' ? 'bg-green-500/10 border border-green-500/20' : 'bg-blue-500/10 border border-blue-500/20'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${log.punch_type === 'check_in' ? 'bg-green-500/30 text-green-400' : 'bg-blue-500/30 text-blue-400'}`}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold ${log.punch_type === 'check_in' ? 'text-green-400' : 'text-blue-400'}`}>
                    {log.punch_type === 'check_in' ? 'Checked In' : 'Checked Out'}
                  </p>
                  {log.address && <p className="text-slate-600 text-xs truncate">{log.address}</p>}
                </div>
                <p className="text-white text-sm font-bold shrink-0">{new Date(log.punch_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                {log.selfie_url && <img src={log.selfie_url} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />}
              </div>
            ))}
            {(todayRecord?.work_hours ?? 0) > 0 && (
              <div className="text-center py-1">
                <span className="text-teal-400 text-xs font-medium">{Number(todayRecord!.work_hours).toFixed(1)}h worked today</span>
              </div>
            )}
          </div>
        )}

        {!todayRecord && todayLogs.length === 0 && (
          <p className="text-slate-500 text-sm mb-4">You haven't checked in today yet.</p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => openCamera('check_in')}
            disabled={!canCheckIn || capturing}
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 bg-gradient-to-r from-teal-500 to-cyan-600 text-white"
          >
            <Camera className="w-4 h-4" />
            Check In
          </button>
          <button
            onClick={() => openCamera('check_out')}
            disabled={!canCheckOut || capturing}
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 bg-gradient-to-r from-blue-600 to-sky-600 text-white"
          >
            <Camera className="w-4 h-4" />
            Check Out
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-white font-semibold mb-3">Recent Attendance</h3>
        <div className="space-y-2">
          {attendance.slice(0, 15).map(a => {
            const dayLogs = attendanceLogs.filter((l: any) => l.attendance_date === a.attendance_date);
            return (
            <div key={a.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <button
                className="w-full p-3 flex items-center gap-3 text-left"
                onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
              >
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-bold shrink-0">
                  {new Date(a.attendance_date).toLocaleDateString('en-IN', { day: '2-digit' })}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">
                    {new Date(a.attendance_date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    {a.check_in_time && <span>In: {new Date(a.check_in_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>}
                    {a.check_out_time && <span>Out: {new Date(a.check_out_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>}
                    {(a.work_hours ?? 0) > 0 && <span className="text-teal-500">{Number(a.work_hours).toFixed(1)}h</span>}
                    {dayLogs.length > 0 && <span className="text-amber-500">{dayLogs.length} punches</span>}
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[a.status] || 'bg-slate-700 text-slate-400'}`}>{a.status.replace('_', ' ')}</span>
              </button>
              {expandedId === a.id && (
                <div className="px-3 pb-3 border-t border-slate-800 pt-3">
                  {dayLogs.length > 0 ? (
                    <div className="space-y-2">
                      {dayLogs.map((log: any, idx: number) => (
                        <div key={log.id} className="flex items-center gap-2">
                          <span className={`text-xs font-semibold w-20 shrink-0 ${log.punch_type === 'check_in' ? 'text-green-400' : 'text-blue-400'}`}>
                            {log.punch_type === 'check_in' ? 'In' : 'Out'} #{Math.ceil((idx + 1) / 2)}
                          </span>
                          <span className="text-white text-xs">{new Date(log.punch_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                          {log.selfie_url && <img src={log.selfie_url} alt="" className="w-8 h-8 rounded-lg object-cover ml-auto" />}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {a.check_in_selfie_url && (
                        <div>
                          <p className="text-slate-500 text-xs mb-1">Check-in selfie</p>
                          <img src={a.check_in_selfie_url} alt="" className="w-full h-24 rounded-lg object-cover" />
                          {a.check_in_address && <p className="text-slate-600 text-xs mt-1 line-clamp-2">{a.check_in_address}</p>}
                        </div>
                      )}
                      {a.check_out_selfie_url && (
                        <div>
                          <p className="text-slate-500 text-xs mb-1">Check-out selfie</p>
                          <img src={a.check_out_selfie_url} alt="" className="w-full h-24 rounded-lg object-cover" />
                          {a.check_out_address && <p className="text-slate-600 text-xs mt-1 line-clamp-2">{a.check_out_address}</p>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            );
          })}
          {attendance.length === 0 && (
            <div className="text-center py-10 text-slate-500">
              <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No attendance records yet</p>
            </div>
          )}
        </div>
      </div>

      {showCamera && (
        <CameraCapture
          onCapture={handleSelfieCapture}
          onClose={() => setShowCamera(false)}
          title={cameraMode === 'check_in' ? 'Check-In Selfie' : 'Check-Out Selfie'}
          hint="Take a clear selfie — make sure your face is visible"
          stampLabel={cameraMode === 'check_in' ? `CHECK IN · ${user?.full_name || ''}` : `CHECK OUT · ${user?.full_name || ''}`}
        />
      )}
    </div>
  );
}

function PayslipTab({ payroll }: { payroll: PayrollRecord[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(payroll[0]?.id || null);
  const selected = payroll.find(p => p.id === selectedId);

  const PAY_STATUS_COLORS: Record<string, string> = {
    paid: 'bg-green-500/20 text-green-400', pending: 'bg-amber-500/20 text-amber-400', hold: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-white font-bold text-lg">Payslips</h2>

      {payroll.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No payslips found</p>
          <p className="text-xs mt-1">Your HR will add your payroll records</p>
        </div>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {payroll.map(p => (
              <button key={p.id} onClick={() => setSelectedId(p.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${selectedId === p.id ? 'bg-teal-500 border-teal-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}>
                {MONTHS[p.month - 1]} {p.year}
              </button>
            ))}
          </div>

          {selected && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-teal-600 to-cyan-700 p-5">
                <p className="text-teal-200 text-xs font-medium">{MONTHS[selected.month - 1]} {selected.year}</p>
                <p className="text-3xl font-bold text-white mt-1">₹{selected.net_pay.toLocaleString('en-IN')}</p>
                <p className="text-teal-200 text-xs mt-1">Net Take Home</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${PAY_STATUS_COLORS[selected.payment_status] || 'bg-slate-700 text-slate-300'}`}>
                    {selected.payment_status.toUpperCase()}
                  </span>
                  {selected.payment_date && <span className="text-teal-300 text-xs">Paid on {new Date(selected.payment_date).toLocaleDateString('en-IN')}</span>}
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div className="space-y-2">
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Earnings</p>
                  {[
                    { label: 'Basic Pay', value: selected.basic_pay },
                    { label: 'HRA', value: selected.hra },
                    { label: 'Allowances', value: selected.allowances },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between text-sm">
                      <span className="text-slate-400">{r.label}</span>
                      <span className="text-white">₹{r.value.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm border-t border-slate-800 pt-2">
                    <span className="text-slate-300 font-medium">Gross Pay</span>
                    <span className="text-white font-bold">₹{selected.gross_pay.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-800 pt-3">
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Deductions</p>
                  {[
                    { label: 'PF', value: selected.pf_deduction },
                    { label: 'TDS', value: selected.tds_deduction },
                    { label: 'Other', value: selected.other_deductions },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between text-sm">
                      <span className="text-slate-400">{r.label}</span>
                      <span className="text-red-400">-₹{r.value.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm border-t border-slate-800 pt-2">
                    <span className="text-slate-300 font-medium">Total Deductions</span>
                    <span className="text-red-400 font-bold">-₹{selected.total_deductions.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-teal-500/10 border border-teal-500/20 rounded-xl px-4 py-3">
                  <span className="text-white font-bold">Net Pay</span>
                  <span className="text-teal-400 text-xl font-bold">₹{selected.net_pay.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between text-xs text-slate-500">
                  <span>Mode: {selected.payment_mode.replace('_', ' ')}</span>
                </div>

                {selected.remarks && (
                  <div className="flex items-start gap-2 p-3 bg-slate-800/60 rounded-xl">
                    <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <p className="text-slate-400 text-xs">{selected.remarks}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const LEAVE_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  approved: 'bg-green-500/20 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
};

function LeaveTab({ leaves, leaveBalance, onRefresh }: {
  leaves: LeaveRequest[]; leaveBalance: LeaveBalance | null; onRefresh: () => void;
}) {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [form, setForm] = useState({ leave_type: 'casual', from_date: '', to_date: '', reason: '' });
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const daysCount = form.from_date && form.to_date
    ? Math.max(1, Math.ceil((new Date(form.to_date).getTime() - new Date(form.from_date).getTime()) / 86400000) + 1)
    : 0;

  const filteredLeaves = filter === 'all' ? leaves : leaves.filter(l => l.status === filter);

  async function submit() {
    if (!form.from_date || !form.to_date || !form.reason) { setError('All fields are required.'); return; }
    if (daysCount <= 0) { setError('Invalid date range.'); return; }
    setSaving(true); setError('');
    const { error: e } = await supabase.from('leave_requests').insert({
      app_user_id: user?.id,
      requester_name: user?.full_name,
      leave_type: form.leave_type,
      from_date: form.from_date,
      to_date: form.to_date,
      days_count: daysCount,
      reason: form.reason,
    });
    setSaving(false);
    if (e) { setError(e.message); return; }
    setSuccess('Leave request submitted!');
    setForm({ leave_type: 'casual', from_date: '', to_date: '', reason: '' });
    await onRefresh();
    setTimeout(() => { setShowForm(false); setSuccess(''); }, 2000);
  }

  async function cancelLeave(id: string) {
    if (!user?.id) return;
    setCancelling(id);
    await supabase.from('leave_requests').delete().eq('id', id).eq('app_user_id', user.id).eq('status', 'pending');
    setCancelling(null);
    onRefresh();
  }

  const balanceItems = leaveBalance ? [
    { label: 'Casual', used: leaveBalance.casual_used, total: leaveBalance.casual_total, color: 'bg-blue-500' },
    { label: 'Sick', used: leaveBalance.sick_used, total: leaveBalance.sick_total, color: 'bg-green-500' },
    { label: 'Earned', used: leaveBalance.earned_used, total: leaveBalance.earned_total, color: 'bg-amber-500' },
  ] : [];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-lg">Leave Requests</h2>
        <button onClick={() => { setShowForm(true); setError(''); setSuccess(''); }} className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-sm font-semibold rounded-xl">
          <Plus className="w-3.5 h-3.5" /> Apply
        </button>
      </div>

      {leaveBalance && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-teal-400" /> Leave Balance {new Date().getFullYear()}
          </p>
          {balanceItems.map(b => (
            <div key={b.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-400 text-xs">{b.label}</span>
                <span className="text-white text-xs font-medium">{b.used}/{b.total} used</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${b.color} rounded-full transition-all`} style={{ width: `${Math.min(100, b.total > 0 ? (b.used / b.total) * 100 : 0)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all capitalize ${filter === f ? 'bg-teal-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
            {f} {f !== 'all' && leaves.filter(l => l.status === f).length > 0 ? `(${leaves.filter(l => l.status === f).length})` : ''}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredLeaves.map(l => (
          <div key={l.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-white font-semibold text-sm capitalize">{l.leave_type} Leave</p>
                <p className="text-slate-400 text-xs mt-0.5">
                  {new Date(l.from_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} – {new Date(l.to_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  <span className="ml-1 text-slate-500">({l.days_count} day{l.days_count !== 1 ? 's' : ''})</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${LEAVE_STATUS_COLORS[l.status] || 'bg-slate-700 text-slate-400'}`}>
                  {l.status.charAt(0).toUpperCase() + l.status.slice(1)}
                </span>
                {l.status === 'pending' && (
                  <button onClick={() => cancelLeave(l.id)} disabled={cancelling === l.id}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50">
                    {cancelling === l.id ? <div className="w-3.5 h-3.5 border border-red-400/30 border-t-red-400 rounded-full animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
            <p className="text-slate-400 text-sm">{l.reason}</p>
            {l.remarks && (
              <div className="flex items-start gap-1.5 mt-2">
                <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <p className="text-slate-500 text-xs italic">HR: {l.remarks}</p>
              </div>
            )}
            <p className="text-slate-600 text-xs mt-2">{new Date(l.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>
        ))}
        {filteredLeaves.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{filter === 'all' ? 'No leave requests yet' : `No ${filter} leaves`}</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center">
          <div className="bg-slate-900 border border-slate-700 rounded-t-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-5 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold">Apply for Leave</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}
              {success && <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm flex gap-2"><CheckCircle className="w-4 h-4 mt-0.5" />{success}</div>}
              <div>
                <label className="block text-xs text-slate-400 mb-2">Leave Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'casual', label: 'Casual' },
                    { value: 'sick', label: 'Sick' },
                    { value: 'earned', label: 'Earned' },
                    { value: 'unpaid', label: 'Unpaid' },
                  ].map(lt => (
                    <button key={lt.value} onClick={() => setForm(f => ({ ...f, leave_type: lt.value }))}
                      className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${form.leave_type === lt.value ? 'bg-teal-500 border-teal-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}>
                      {lt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">From Date *</label>
                  <input type="date" value={form.from_date} onChange={e => setForm(f => ({ ...f, from_date: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">To Date *</label>
                  <input type="date" value={form.to_date} onChange={e => setForm(f => ({ ...f, to_date: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500 text-sm" />
                </div>
              </div>
              {daysCount > 0 && (
                <div className="px-4 py-2.5 bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-400 text-sm text-center font-medium">
                  {daysCount} day{daysCount !== 1 ? 's' : ''} selected
                </div>
              )}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Reason *</label>
                <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} rows={3}
                  placeholder="Reason for leave..." className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-sm resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm">Cancel</button>
                <button onClick={submit} disabled={saving} className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdvanceTab({ user, advances, onRefresh }: { user: any; advances: SalaryAdvance[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'disbursed' | 'rejected'>('all');
  const [form, setForm] = useState({ amount_requested: '', reason: '', purpose: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const filteredAdvances = filter === 'all' ? advances : advances.filter(a => a.status === filter);
  const totalDisbursed = advances.filter(a => a.status === 'disbursed').reduce((sum, a) => sum + (a.amount_approved || a.amount_requested), 0);

  async function submit() {
    if (!form.amount_requested || !form.reason) { setError('Amount and reason are required.'); return; }
    if (Number(form.amount_requested) <= 0) { setError('Enter a valid amount.'); return; }
    setSaving(true); setError('');
    const { error: e } = await supabase.from('salary_advance_requests').insert({
      app_user_id: user.id,
      amount_requested: Number(form.amount_requested),
      reason: form.reason,
      purpose: form.purpose,
    });
    setSaving(false);
    if (e) { setError(e.message); return; }
    setSuccess('Request submitted successfully!');
    setForm({ amount_requested: '', reason: '', purpose: '' });
    await onRefresh();
    setTimeout(() => { setShowForm(false); setSuccess(''); }, 2000);
  }

  const pendingRequest = advances.find(a => a.status === 'pending');

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-lg">Salary Advance</h2>
        {!pendingRequest && (
          <button onClick={() => { setShowForm(true); setError(''); setSuccess(''); }} className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-sm font-semibold rounded-xl">
            <Send className="w-3.5 h-3.5" /> Request
          </button>
        )}
      </div>

      {totalDisbursed > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs">Total Disbursed</p>
            <p className="text-blue-400 font-bold text-xl">₹{totalDisbursed.toLocaleString('en-IN')}</p>
          </div>
          <Wallet className="w-8 h-8 text-blue-400/40" />
        </div>
      )}

      {pendingRequest && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-300 font-medium text-sm">Pending Request</p>
            <p className="text-amber-400/70 text-xs mt-0.5">You have a pending advance of ₹{pendingRequest.amount_requested.toLocaleString('en-IN')}. Wait for approval before submitting another.</p>
          </div>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['all', 'pending', 'approved', 'disbursed', 'rejected'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all capitalize ${filter === f ? 'bg-teal-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
            {f} {f !== 'all' && advances.filter(a => a.status === f).length > 0 ? `(${advances.filter(a => a.status === f).length})` : ''}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredAdvances.map(a => (
          <div key={a.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-white font-bold text-lg">₹{a.amount_requested.toLocaleString('en-IN')}</p>
                {(a.status === 'approved' || a.status === 'disbursed') && a.amount_approved > 0 && (
                  <p className="text-green-400 text-xs">Approved: ₹{a.amount_approved.toLocaleString('en-IN')}</p>
                )}
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${ADVANCE_STATUS_COLORS[a.status] || 'bg-slate-700 text-slate-400'}`}>
                {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
              </span>
            </div>
            <p className="text-slate-400 text-sm">{a.reason}</p>
            {a.purpose && <p className="text-slate-500 text-xs mt-1">{a.purpose}</p>}
            {a.remarks && (
              <div className="flex items-start gap-1.5 mt-2">
                <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <p className="text-slate-500 text-xs italic">HR: {a.remarks}</p>
              </div>
            )}
            {a.disbursal_date && <p className="text-teal-500 text-xs mt-1">Disbursed: {new Date(a.disbursal_date).toLocaleDateString('en-IN')}</p>}
            {a.repayment_month && <p className="text-red-400 text-xs mt-0.5">Repayment: {MONTHS[a.repayment_month - 1]} {a.repayment_year}</p>}
            <p className="text-slate-600 text-xs mt-2">{new Date(a.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>
        ))}
        {filteredAdvances.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Wallet className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{filter === 'all' ? 'No advance requests yet' : `No ${filter} requests`}</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center">
          <div className="bg-slate-900 border border-slate-700 rounded-t-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-5 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold">Request Salary Advance</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}
              {success && <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm flex gap-2"><CheckCircle className="w-4 h-4 mt-0.5" />{success}</div>}

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Amount Requested (₹) *</label>
                <input type="number" value={form.amount_requested} onChange={e => setForm(f => ({ ...f, amount_requested: e.target.value }))} placeholder="e.g. 5000" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-lg font-bold" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Reason *</label>
                <input type="text" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="e.g. Medical emergency, Rent payment" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Additional Details</label>
                <textarea value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} rows={3} placeholder="Any additional information..." className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-sm resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm">Cancel</button>
                <button onClick={submit} disabled={saving} className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileTab() {
  const { user } = useAuth();

  return (
    <div className="p-4 space-y-5">
      <h2 className="text-white font-bold text-lg">My Profile</h2>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col items-center gap-4">
        <ProfileAvatar size="lg" />
        <div className="text-center">
          <p className="text-white font-bold text-xl">{user?.full_name}</p>
          <p className="text-slate-400 text-sm mt-0.5">{user?.email}</p>
          {user?.phone && <p className="text-slate-500 text-sm mt-0.5">{user.phone}</p>}
          <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-400 border border-teal-500/30 capitalize">
            {user?.role?.replace(/_/g, ' ') || 'Employee'}
          </span>
        </div>
        <p className="text-slate-500 text-xs text-center">Tap your avatar above to update your photo, name, or phone number.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800">
        {[
          { label: 'Full Name', value: user?.full_name },
          { label: 'Email', value: user?.email },
          { label: 'Phone', value: user?.phone || '—' },
          { label: 'Role', value: user?.role?.replace(/_/g, ' ') || 'Employee' },
        ].map(row => (
          <div key={row.label} className="flex items-center justify-between px-4 py-3.5">
            <span className="text-slate-500 text-sm">{row.label}</span>
            <span className="text-white text-sm font-medium capitalize">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
