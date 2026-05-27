import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, Plus, X, Save, RefreshCw, AlertCircle, CheckCircle, Trash2, Pencil, Eye, Users, ToggleLeft, ToggleRight, Lock, Unlock } from 'lucide-react';

interface Permission {
  can_view_leads: boolean;
  can_manage_leads: boolean;
  can_assign_leads: boolean;
  can_add_lead_remarks: boolean;
  can_view_staff: boolean;
  can_manage_staff: boolean;
  can_view_attendance: boolean;
  can_manage_attendance: boolean;
  can_view_payroll: boolean;
  can_manage_payroll: boolean;
  can_approve_leaves: boolean;
  can_approve_advances: boolean;
  can_view_reports: boolean;
  can_export_data: boolean;
  can_manage_users: boolean;
  can_manage_roles: boolean;
  can_view_crm: boolean;
  can_manage_crm: boolean;
  can_view_website_content: boolean;
  can_manage_website_content: boolean;
}

interface RolePermission {
  id: string;
  role_name: string;
  description: string;
  color: string;
  permissions: Permission;
  is_active: boolean;
  created_at: string;
}

const PERMISSION_GROUPS = [
  {
    group: 'Leads',
    items: [
      { key: 'can_view_leads', label: 'View Leads' },
      { key: 'can_manage_leads', label: 'Manage Leads' },
      { key: 'can_assign_leads', label: 'Assign Leads' },
      { key: 'can_add_lead_remarks', label: 'Add Lead Remarks' },
    ],
  },
  {
    group: 'Staff & HR',
    items: [
      { key: 'can_view_staff', label: 'View Staff' },
      { key: 'can_manage_staff', label: 'Manage Staff' },
      { key: 'can_view_attendance', label: 'View Attendance' },
      { key: 'can_manage_attendance', label: 'Manage Attendance' },
      { key: 'can_approve_leaves', label: 'Approve Leaves' },
      { key: 'can_approve_advances', label: 'Approve Advances' },
    ],
  },
  {
    group: 'Payroll & Finance',
    items: [
      { key: 'can_view_payroll', label: 'View Payroll' },
      { key: 'can_manage_payroll', label: 'Manage Payroll' },
    ],
  },
  {
    group: 'Reports & Data',
    items: [
      { key: 'can_view_reports', label: 'View Reports' },
      { key: 'can_export_data', label: 'Export Data' },
    ],
  },
  {
    group: 'CRM',
    items: [
      { key: 'can_view_crm', label: 'View CRM' },
      { key: 'can_manage_crm', label: 'Manage CRM' },
    ],
  },
  {
    group: 'Administration',
    items: [
      { key: 'can_manage_users', label: 'Manage Users' },
      { key: 'can_manage_roles', label: 'Manage Roles' },
      { key: 'can_view_website_content', label: 'View Website Content' },
      { key: 'can_manage_website_content', label: 'Manage Website Content' },
    ],
  },
];

const COLOR_OPTIONS = [
  { value: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'Amber' },
  { value: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Blue' },
  { value: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Green' },
  { value: 'bg-teal-500/20 text-teal-400 border-teal-500/30', label: 'Teal' },
  { value: 'bg-rose-500/20 text-rose-400 border-rose-500/30', label: 'Rose' },
  { value: 'bg-orange-500/20 text-orange-400 border-orange-500/30', label: 'Orange' },
  { value: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', label: 'Cyan' },
  { value: 'bg-slate-500/20 text-slate-400 border-slate-500/30', label: 'Slate' },
];

const defaultPermissions: Permission = {
  can_view_leads: false, can_manage_leads: false, can_assign_leads: false, can_add_lead_remarks: false,
  can_view_staff: false, can_manage_staff: false, can_view_attendance: false, can_manage_attendance: false,
  can_view_payroll: false, can_manage_payroll: false, can_approve_leaves: false, can_approve_advances: false,
  can_view_reports: false, can_export_data: false, can_manage_users: false, can_manage_roles: false,
  can_view_crm: false, can_manage_crm: false, can_view_website_content: false, can_manage_website_content: false,
};

const BUILT_IN_ROLES = [
  { name: 'admin', label: 'Admin', desc: 'Full system access — superuser', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', perms: 'All permissions' },
  { name: 'manager', label: 'Manager', desc: 'Leads, staff management, HR approvals', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', perms: 'Leads + Staff + Approvals' },
  { name: 'hr', label: 'HR', desc: 'Office & staff management, payroll, CRM', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30', perms: 'Staff + Payroll + CRM' },
  { name: 'marketing_executive', label: 'Marketing Executive', desc: 'Field lead submission and attendance', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', perms: 'Submit Leads + Attendance' },
  { name: 'telecaller', label: 'Telecaller', desc: 'Call assigned leads and log conversations', color: 'bg-green-500/20 text-green-400 border-green-500/30', perms: 'View + Call Assigned Leads' },
  { name: 'employee', label: 'Employee', desc: 'Attendance, payslip, leave, advance requests', color: 'bg-teal-500/20 text-teal-400 border-teal-500/30', perms: 'Self-service only' },
];

export default function RolePermissionsManager() {
  const { user: currentUser } = useAuth();
  const [roles, setRoles] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<RolePermission | null>(null);
  const [form, setForm] = useState({ role_name: '', description: '', color: COLOR_OPTIONS[0].value, permissions: { ...defaultPermissions } });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [viewRole, setViewRole] = useState<RolePermission | null>(null);

  useEffect(() => { loadRoles(); }, []);

  async function loadRoles() {
    setLoading(true);
    const { data } = await supabase.from('role_permissions').select('*').order('created_at', { ascending: false });
    setRoles(data || []);
    setLoading(false);
  }

  function openCreate() {
    setEditingRole(null);
    setForm({ role_name: '', description: '', color: COLOR_OPTIONS[0].value, permissions: { ...defaultPermissions } });
    setError(''); setSuccess('');
    setShowForm(true);
  }

  function openEdit(role: RolePermission) {
    setEditingRole(role);
    setForm({ role_name: role.role_name, description: role.description, color: role.color, permissions: { ...defaultPermissions, ...role.permissions } });
    setError(''); setSuccess('');
    setShowForm(true);
  }

  function togglePermission(key: keyof Permission) {
    setForm(p => ({ ...p, permissions: { ...p.permissions, [key]: !p.permissions[key] } }));
  }

  function selectAllGroup(groupItems: { key: string }[], value: boolean) {
    const updates: Partial<Permission> = {};
    groupItems.forEach(item => { updates[item.key as keyof Permission] = value; });
    setForm(p => ({ ...p, permissions: { ...p.permissions, ...updates } }));
  }

  async function save() {
    setError('');
    if (!form.role_name.trim()) { setError('Role name is required.'); return; }
    const normalizedName = form.role_name.trim().toLowerCase().replace(/\s+/g, '_');
    const builtInNames = ['admin', 'manager', 'hr', 'marketing_executive', 'telecaller', 'employee'];
    if (!editingRole && builtInNames.includes(normalizedName)) {
      setError('This name conflicts with a built-in role. Choose a different name.');
      return;
    }
    setSaving(true);
    const payload = {
      role_name: normalizedName,
      description: form.description,
      color: form.color,
      permissions: form.permissions,
      created_by: currentUser?.id,
    };
    if (editingRole) {
      const { error: e } = await supabase.from('role_permissions').update(payload).eq('id', editingRole.id);
      if (e) { setError(e.message); setSaving(false); return; }
    } else {
      const { error: e } = await supabase.from('role_permissions').insert(payload);
      if (e) { setError(e.message); setSaving(false); return; }
    }
    setSuccess(editingRole ? 'Role updated!' : 'Custom role created!');
    await loadRoles();
    setSaving(false);
    setTimeout(() => { setShowForm(false); setSuccess(''); }, 1500);
  }

  async function toggleRoleActive(role: RolePermission) {
    await supabase.from('role_permissions').update({ is_active: !role.is_active }).eq('id', role.id);
    setRoles(prev => prev.map(r => r.id === role.id ? { ...r, is_active: !r.is_active } : r));
  }

  async function deleteRole(role: RolePermission) {
    if (!confirm(`Delete custom role "${role.role_name}"? Users assigned this role will need reassignment.`)) return;
    await supabase.from('role_permissions').delete().eq('id', role.id);
    setRoles(prev => prev.filter(r => r.id !== role.id));
  }

  const enabledCount = (perms: Permission) => Object.values(perms).filter(Boolean).length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-amber-500" />
          <div>
            <h2 className="text-3xl font-bold text-white">Roles & Permissions</h2>
            <p className="text-slate-400 text-sm">Define built-in roles and create custom roles with specific permissions</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={loadRoles} className="p-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" /> New Custom Role
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-500" />
          Built-in Roles (System Defined)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {BUILT_IN_ROLES.map(role => (
            <div key={role.name} className={`rounded-xl p-4 border ${role.color}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">{role.label}</span>
                <span className="text-xs opacity-70 flex items-center gap-1"><Lock className="w-3 h-3" /> Built-in</span>
              </div>
              <p className="text-xs opacity-80 mb-2">{role.desc}</p>
              <p className="text-xs opacity-60">{role.perms}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Unlock className="w-4 h-4 text-blue-400" />
          Custom Roles ({roles.length})
        </h3>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : roles.length === 0 ? (
          <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl">
            <Shield className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400">No custom roles yet</p>
            <p className="text-slate-600 text-sm mt-1">Create custom roles with specific permissions for specialized staff</p>
          </div>
        ) : (
          <div className="space-y-3">
            {roles.map(role => (
              <div key={role.id} className={`bg-slate-800/60 border border-slate-700 rounded-xl p-5 transition-all ${!role.is_active ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${role.color}`}>
                        {role.role_name.replace(/_/g, ' ')}
                      </span>
                      {!role.is_active && <span className="text-xs text-red-400">Inactive</span>}
                    </div>
                    {role.description && <p className="text-slate-400 text-sm mt-1">{role.description}</p>}
                    <p className="text-slate-500 text-xs mt-1.5">
                      {enabledCount(role.permissions)} of {Object.keys(defaultPermissions).length} permissions enabled
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setViewRole(role)} className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors" title="View permissions">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => openEdit(role)} className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors" title="Edit role">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => toggleRoleActive(role)} className={`p-2 rounded-lg transition-colors ${role.is_active ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}>
                      {role.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    </button>
                    <button onClick={() => deleteRole(role)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-700">
            <div className="sticky top-0 bg-slate-800 flex items-center justify-between p-5 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white">{editingRole ? 'Edit Custom Role' : 'Create Custom Role'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              {error && <div className="flex gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl"><AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" /><p className="text-red-400 text-sm">{error}</p></div>}
              {success && <div className="flex gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-xl"><CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" /><p className="text-green-400 text-sm">{success}</p></div>}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Role Name *</label>
                  <input
                    value={form.role_name} onChange={e => setForm(p => ({ ...p, role_name: e.target.value }))}
                    placeholder="e.g. field_supervisor"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-slate-600 text-xs mt-1">Use lowercase letters and underscores</p>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Badge Color</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {COLOR_OPTIONS.map(c => (
                      <button key={c.value} onClick={() => setForm(p => ({ ...p, color: c.value }))}
                        className={`py-2 rounded-lg text-xs border transition-all ${c.value} ${form.color === c.value ? 'ring-2 ring-white/30' : 'opacity-50 hover:opacity-80'}`}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Description</label>
                <input
                  value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Brief description of this role's responsibilities"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Permissions</label>
                  <div className="flex gap-2">
                    <button onClick={() => setForm(p => ({ ...p, permissions: Object.fromEntries(Object.keys(defaultPermissions).map(k => [k, true])) as Permission }))}
                      className="px-2.5 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg hover:bg-green-500/30 transition-colors">
                      Enable All
                    </button>
                    <button onClick={() => setForm(p => ({ ...p, permissions: { ...defaultPermissions } }))}
                      className="px-2.5 py-1 bg-red-500/20 text-red-400 text-xs rounded-lg hover:bg-red-500/30 transition-colors">
                      Disable All
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {PERMISSION_GROUPS.map(group => {
                    const allOn = group.items.every(item => form.permissions[item.key as keyof Permission]);
                    return (
                      <div key={group.group} className="bg-slate-900 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-white text-sm font-medium">{group.group}</h4>
                          <button onClick={() => selectAllGroup(group.items, !allOn)}
                            className={`text-xs px-2 py-0.5 rounded-lg transition-colors ${allOn ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                            {allOn ? 'All On' : 'All Off'}
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {group.items.map(item => {
                            const enabled = form.permissions[item.key as keyof Permission];
                            return (
                              <button key={item.key} onClick={() => togglePermission(item.key as keyof Permission)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${enabled ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700 hover:border-slate-600'}`}>
                                {enabled ? <CheckCircle className="w-3.5 h-3.5 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0" />}
                                {item.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm transition-colors">Cancel</button>
                <button onClick={save} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl text-sm disabled:opacity-60 transition-all">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : (editingRole ? 'Save Changes' : 'Create Role')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewRole && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-lg border border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 flex items-center justify-between p-5 border-b border-slate-700">
              <div>
                <h3 className="text-white font-bold">Permissions for</h3>
                <span className={`text-sm px-2.5 py-0.5 rounded-full border ${viewRole.color}`}>{viewRole.role_name.replace(/_/g, ' ')}</span>
              </div>
              <button onClick={() => setViewRole(null)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              {PERMISSION_GROUPS.map(group => {
                const enabledItems = group.items.filter(item => viewRole.permissions[item.key as keyof Permission]);
                return (
                  <div key={group.group} className="bg-slate-900 rounded-xl p-4">
                    <h4 className="text-white text-sm font-medium mb-2">{group.group}</h4>
                    <div className="grid grid-cols-2 gap-1.5">
                      {group.items.map(item => {
                        const enabled = viewRole.permissions[item.key as keyof Permission];
                        return (
                          <div key={item.key} className={`flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg ${enabled ? 'text-green-400' : 'text-slate-600'}`}>
                            {enabled ? <CheckCircle className="w-3 h-3 shrink-0" /> : <X className="w-3 h-3 shrink-0" />}
                            {item.label}
                          </div>
                        );
                      })}
                    </div>
                    {enabledItems.length === 0 && <p className="text-slate-600 text-xs mt-1">No permissions in this group</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
