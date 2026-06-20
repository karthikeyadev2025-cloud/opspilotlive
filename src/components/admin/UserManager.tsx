import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
  Users, Plus, Eye, EyeOff, X, Shield, UserCheck, Phone as PhoneIcon,
  Mail, Pencil, CheckCircle, AlertCircle, RefreshCw,
  ToggleLeft, ToggleRight, Briefcase, HeartHandshake, User, Search, KeyRound
} from 'lucide-react';

interface AppUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  profile_photo_url?: string | null;
  custom_role_id?: string | null;
}

interface CustomRole {
  id: string;
  role_name: string;
  color: string;
  description: string;
  is_active: boolean;
}

const BUILTIN_ROLE_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  admin: { label: 'Admin', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Shield },
  manager: { label: 'Manager', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: Briefcase },
  hr: { label: 'HR', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30', icon: HeartHandshake },
  marketing_executive: { label: 'Marketing Exec', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: UserCheck },
  telecaller: { label: 'Telecaller', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: PhoneIcon },
  employee: { label: 'Employee', color: 'bg-teal-500/20 text-teal-400 border-teal-500/30', icon: User },
};

const emptyForm = {
  email: '',
  password: '',
  full_name: '',
  role: 'employee',
  phone: '',
  custom_role_id: '',
};

export default function UserManager() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [resetPassword, setResetPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');

  useEffect(() => { loadUsers(); loadCustomRoles(); }, []);

  async function loadUsers() {
    setLoading(true);
    const { data } = await supabase
      .from('app_users')
      .select('id, email, full_name, role, phone, is_active, created_at, profile_photo_url, custom_role_id')
      .order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  }

  async function loadCustomRoles() {
    const { data } = await supabase.from('role_permissions').select('id, role_name, color, description, is_active').eq('is_active', true);
    setCustomRoles(data || []);
  }

  async function createUser() {
    setFormError('');
    if (!formData.email || !formData.password || !formData.full_name) {
      setFormError('Email, password, and full name are required.');
      return;
    }
    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    setCreating(true);

    const { data: adminData } = await supabase.auth.getSession();
    const adminToken = adminData.session?.access_token;

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        role: formData.role,
        phone: formData.phone,
        created_by: currentUser?.id,
      }),
    });

    const result = await response.json();
    setCreating(false);

    if (!response.ok || result.error) {
      setFormError(result.error || 'Failed to create user. Please try again.');
      return;
    }

    if (formData.custom_role_id && result.user?.id) {
      await supabase.from('app_users').update({ custom_role_id: formData.custom_role_id }).eq('id', result.user.id);
    }

    setFormSuccess(`User "${formData.full_name}" created successfully!`);
    setFormData(emptyForm);
    loadUsers();
    setTimeout(() => { setFormSuccess(''); setShowForm(false); }, 2500);
  }

  async function toggleActive(userId: string, current: boolean) {
    await supabase.from('app_users').update({ is_active: !current }).eq('id', userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !current } : u));
  }

  async function updateUser() {
    if (!editingUser) return;
    await supabase.from('app_users').update({
      full_name: editingUser.full_name,
      role: editingUser.role,
      phone: editingUser.phone,
      custom_role_id: editingUser.custom_role_id || null,
    }).eq('id', editingUser.id);
    setUsers(prev => prev.map(u => u.id === editingUser.id ? editingUser : u));
    setEditingUser(null);
    setResetPassword('');
    setResetSuccess('');
    setResetError('');
  }

  async function resetUserPassword() {
    if (!editingUser || resetPassword.length < 6) return;
    setResetting(true);
    setResetError('');
    setResetSuccess('');
    const { data: adminData } = await supabase.auth.getSession();
    const adminToken = adminData.session?.access_token;
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ action: 'reset_password', user_id: editingUser.id, new_password: resetPassword }),
    });
    const result = await response.json();
    setResetting(false);
    if (!response.ok || result.error) {
      setResetError(result.error || 'Failed to reset password.');
    } else {
      setResetSuccess('Password reset successfully.');
      setResetPassword('');
      setTimeout(() => setResetSuccess(''), 3000);
    }
  }

  function getRoleLabel(user: AppUser): string {
    if (BUILTIN_ROLE_CONFIG[user.role]) return BUILTIN_ROLE_CONFIG[user.role].label;
    return user.role.replace(/_/g, ' ');
  }

  function getRoleColor(user: AppUser): string {
    if (BUILTIN_ROLE_CONFIG[user.role]) return BUILTIN_ROLE_CONFIG[user.role].color;
    const custom = customRoles.find(r => r.id === user.custom_role_id);
    return custom?.color || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }

  function getRoleIcon(role: string): React.ElementType {
    return BUILTIN_ROLE_CONFIG[role]?.icon || User;
  }

  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roleStats = Object.entries(
    users.reduce<Record<string, number>>((acc, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {})
  ).sort(([, a], [, b]) => b - a);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-amber-500" />
          <div>
            <h2 className="text-3xl font-bold text-white">User Management</h2>
            <p className="text-slate-400 text-sm">Create and manage staff accounts — {users.length} total users</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={loadUsers} className="p-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setShowForm(true); setFormError(''); setFormSuccess(''); setFormData(emptyForm); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {roleStats.map(([role, count]) => {
          const conf = BUILTIN_ROLE_CONFIG[role];
          const customRole = customRoles.find(r => r.role_name === role);
          const color = conf?.color || customRole?.color || 'bg-slate-700 text-slate-400 border-slate-600';
          return (
            <button key={role} onClick={() => setRoleFilter(roleFilter === role ? 'all' : role)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${roleFilter === role ? color : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'}`}>
              {conf ? <conf.icon className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              {conf?.label || role.replace(/_/g, ' ')} ({count})
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email or role..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map(u => {
            const RoleIcon = getRoleIcon(u.role);
            const roleColor = getRoleColor(u);
            const initials = u.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            return (
              <div key={u.id} className={`bg-slate-800/60 border rounded-xl p-5 transition-all ${u.is_active ? 'border-slate-700' : 'border-slate-700/40 opacity-60'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-700 flex items-center justify-center shrink-0">
                      {u.profile_photo_url ? (
                        <img src={u.profile_photo_url} alt={u.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-slate-300">{initials}</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-white font-semibold">{u.full_name}</h3>
                        {u.id === currentUser?.id && (
                          <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">You</span>
                        )}
                        {!u.is_active && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Inactive</span>}
                      </div>
                      <p className="text-slate-400 text-sm">{u.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleColor}`}>
                          <RoleIcon className="w-3 h-3" />
                          {getRoleLabel(u)}
                        </span>
                        {u.phone && <span className="text-slate-500 text-xs flex items-center gap-1"><PhoneIcon className="w-3 h-3" />{u.phone}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => setEditingUser({ ...u })} className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors" title="Edit">
                      <Pencil className="w-4 h-4" />
                    </button>
                    {u.id !== currentUser?.id && (
                      <button onClick={() => toggleActive(u.id, u.is_active)}
                        className={`p-2 rounded-lg transition-colors ${u.is_active ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}
                        title={u.is_active ? 'Deactivate' : 'Activate'}>
                        {u.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No users match your search</p>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white">Create New User</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-700 rounded-lg"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              {formError && <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex gap-3"><AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" /><p className="text-red-400 text-sm">{formError}</p></div>}
              {formSuccess && <div className="p-3.5 bg-green-500/10 border border-green-500/30 rounded-xl flex gap-3"><CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" /><p className="text-green-400 text-sm">{formSuccess}</p></div>}

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Full Name *</label>
                <input type="text" value={formData.full_name} onChange={e => setFormData(p => ({ ...p, full_name: e.target.value }))}
                  placeholder="Employee full name"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500" />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                    placeholder="employee@company.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Password *</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={formData.password}
                    onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                    placeholder="Min 6 characters"
                    className="w-full px-4 pr-10 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500" />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Role *</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(BUILTIN_ROLE_CONFIG).map(([role, conf]) => {
                    const Icon = conf.icon;
                    return (
                      <button key={role} type="button" onClick={() => setFormData(p => ({ ...p, role, custom_role_id: '' }))}
                        className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all ${formData.role === role ? conf.color : 'border-slate-600 bg-slate-900 text-slate-400'}`}>
                        <Icon className="w-4 h-4" />
                        {conf.label.split(' ')[0]}
                      </button>
                    );
                  })}
                </div>
                {customRoles.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-slate-500 mb-1.5">Custom Roles</p>
                    <div className="grid grid-cols-2 gap-2">
                      {customRoles.map(cr => (
                        <button key={cr.id} type="button"
                          onClick={() => setFormData(p => ({ ...p, role: cr.role_name, custom_role_id: cr.id }))}
                          className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${formData.custom_role_id === cr.id ? cr.color : 'border-slate-600 bg-slate-900 text-slate-400'}`}>
                          {cr.role_name.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Phone Number</label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="tel" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                    placeholder="Optional"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500" />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-medium transition-colors">Cancel</button>
                <button onClick={createUser} disabled={creating}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all text-sm disabled:opacity-60">
                  {creating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                  {creating ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white">Edit User</h3>
              <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-slate-700 rounded-lg"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Full Name</label>
                <input type="text" value={editingUser.full_name}
                  onChange={e => setEditingUser(p => p ? { ...p, full_name: e.target.value } : p)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(BUILTIN_ROLE_CONFIG).map(([role, conf]) => {
                    const Icon = conf.icon;
                    return (
                      <button key={role} type="button"
                        onClick={() => setEditingUser(p => p ? { ...p, role, custom_role_id: null } : p)}
                        className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all ${editingUser.role === role && !editingUser.custom_role_id ? conf.color : 'border-slate-600 bg-slate-900 text-slate-400'}`}>
                        <Icon className="w-4 h-4" />
                        {conf.label.split(' ')[0]}
                      </button>
                    );
                  })}
                </div>
                {customRoles.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-slate-500 mb-1.5">Custom Roles</p>
                    <div className="grid grid-cols-2 gap-2">
                      {customRoles.map(cr => (
                        <button key={cr.id} type="button"
                          onClick={() => setEditingUser(p => p ? { ...p, role: cr.role_name, custom_role_id: cr.id } : p)}
                          className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${editingUser.custom_role_id === cr.id ? cr.color : 'border-slate-600 bg-slate-900 text-slate-400'}`}>
                          {cr.role_name.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Phone</label>
                <input type="tel" value={editingUser.phone || ''}
                  onChange={e => setEditingUser(p => p ? { ...p, phone: e.target.value } : p)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500" />
              </div>

              <div className="border-t border-slate-700 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <p className="text-sm font-semibold text-white">Reset Password</p>
                </div>
                {resetSuccess && <div className="mb-2 p-2.5 bg-green-500/10 border border-green-500/30 rounded-lg flex gap-2"><CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" /><p className="text-green-400 text-xs">{resetSuccess}</p></div>}
                {resetError && <div className="mb-2 p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-2"><AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" /><p className="text-red-400 text-xs">{resetError}</p></div>}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      value={resetPassword}
                      onChange={e => setResetPassword(e.target.value)}
                      placeholder="New password (min 6 chars)"
                      className="w-full px-4 pr-10 py-2.5 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
                    />
                    <button type="button" onClick={() => setShowResetPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    onClick={resetUserPassword}
                    disabled={resetting || resetPassword.length < 6}
                    className="px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-xl text-sm font-medium transition-colors disabled:opacity-40 whitespace-nowrap"
                  >
                    {resetting ? <div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" /> : 'Reset'}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => { setEditingUser(null); setResetPassword(''); setResetSuccess(''); setResetError(''); }} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm transition-colors">Cancel</button>
                <button onClick={updateUser} className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl text-sm transition-all">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
