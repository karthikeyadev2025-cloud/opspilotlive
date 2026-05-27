import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Save, X, Users, Award, Clock, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ImageUpload from './ImageUpload';

interface Technician {
  id: string;
  name: string;
  role: string;
  experience: string;
  specialization: string;
  image_url: string;
  order_index: number;
}

type FormData = Omit<Technician, 'id'> & { id?: string };

const EMPTY_FORM: FormData = { name: '', role: '', experience: '', specialization: '', image_url: '', order_index: 0 };

export default function TechniciansManager() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormData | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { loadTechnicians(); }, []);

  async function loadTechnicians() {
    setLoading(true);
    const { data } = await supabase.from('technicians').select('*').order('order_index');
    setTechnicians(data || []);
    setLoading(false);
  }

  function openAdd() {
    setForm({ ...EMPTY_FORM, order_index: technicians.length });
    setError(''); setSuccess('');
  }

  function openEdit(tech: Technician) {
    setForm({ ...tech });
    setError(''); setSuccess('');
  }

  async function save() {
    if (!form) return;
    if (!form.name.trim() || !form.role.trim()) { setError('Name and role are required.'); return; }
    setSaving(true); setError('');
    if (form.id) {
      const { error: e } = await supabase.from('technicians').update({
        name: form.name, role: form.role, experience: form.experience,
        specialization: form.specialization, image_url: form.image_url, order_index: form.order_index,
      }).eq('id', form.id);
      if (e) { setError(e.message); setSaving(false); return; }
    } else {
      const { error: e } = await supabase.from('technicians').insert([{
        name: form.name, role: form.role, experience: form.experience,
        specialization: form.specialization, image_url: form.image_url, order_index: form.order_index,
      }]);
      if (e) { setError(e.message); setSaving(false); return; }
    }
    setSaving(false);
    setSuccess(form.id ? 'Technician updated successfully!' : 'Technician added successfully!');
    setForm(null);
    await loadTechnicians();
    setTimeout(() => setSuccess(''), 3000);
  }

  async function deleteTechnician(id: string) {
    if (!confirm('Delete this technician? This cannot be undone.')) return;
    setDeletingId(id);
    await supabase.from('technicians').delete().eq('id', id);
    await loadTechnicians();
    setDeletingId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Team Leaders</h2>
            <p className="text-slate-400 text-sm">Manage the "Meet Our Team Leaders" section on the public site</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={loadTechnicians} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl text-sm hover:from-amber-600 hover:to-orange-700 transition-all">
            <Plus className="w-4 h-4" /> Add Team Member
          </button>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" /> {success}
        </div>
      )}

      {form && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700 bg-slate-800">
            <h3 className="text-white font-bold">{form.id ? 'Edit Team Member' : 'Add Team Member'}</h3>
            <button onClick={() => setForm(null)} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => f ? { ...f, name: e.target.value } : f)}
                  placeholder="e.g. Rahul Kumar"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Role / Designation *</label>
                <input
                  type="text"
                  value={form.role}
                  onChange={e => setForm(f => f ? { ...f, role: e.target.value } : f)}
                  placeholder="e.g. Senior Solar Technician"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Experience</label>
                <input
                  type="text"
                  value={form.experience}
                  onChange={e => setForm(f => f ? { ...f, experience: e.target.value } : f)}
                  placeholder="e.g. 12 Years"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Specialization</label>
                <input
                  type="text"
                  value={form.specialization}
                  onChange={e => setForm(f => f ? { ...f, specialization: e.target.value } : f)}
                  placeholder="e.g. Rooftop Solar Installation"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Display Order</label>
                <input
                  type="number"
                  min={0}
                  value={form.order_index}
                  onChange={e => setForm(f => f ? { ...f, order_index: Number(e.target.value) } : f)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Profile Photo</label>
              <ImageUpload
                currentUrl={form.image_url}
                onUploadComplete={url => setForm(f => f ? { ...f, image_url: url } : f)}
                folder="technicians"
              />
              <div className="mt-3">
                <label className="block text-xs text-slate-500 mb-1.5">Or paste image URL:</label>
                <input
                  type="text"
                  value={form.image_url}
                  onChange={e => setForm(f => f ? { ...f, image_url: e.target.value } : f)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>
              {form.image_url && (
                <div className="mt-3">
                  <img src={form.image_url} alt="Preview" className="w-20 h-20 rounded-xl object-cover border border-slate-600"
                    onError={e => { e.currentTarget.style.display = 'none'; }} />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setForm(null)} className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm transition-colors">
                Cancel
              </button>
              <button onClick={save} disabled={saving} className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                {form.id ? 'Update' : 'Add Member'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : technicians.length === 0 ? (
        <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-slate-500" />
          </div>
          <p className="text-slate-400 text-lg font-medium mb-2">No team members added</p>
          <p className="text-slate-500 text-sm mb-6">Add your first team member to display them on the public site</p>
          <button onClick={openAdd} className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl text-sm">
            Add First Member
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {technicians.map(tech => (
            <div key={tech.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all group">
              <div className="aspect-square bg-slate-800 overflow-hidden">
                {tech.image_url ? (
                  <img
                    src={tech.image_url}
                    alt={tech.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={e => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Users className="w-16 h-16 text-slate-600" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h4 className="text-white font-bold text-base mb-0.5">{tech.name}</h4>
                <p className="text-amber-500 text-sm font-semibold mb-2">{tech.role}</p>
                <div className="space-y-1 mb-4">
                  {tech.experience && (
                    <p className="flex items-center gap-1.5 text-slate-400 text-xs">
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" /> {tech.experience}
                    </p>
                  )}
                  {tech.specialization && (
                    <p className="flex items-center gap-1.5 text-slate-400 text-xs">
                      <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" /> {tech.specialization}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(tech)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => deleteTechnician(tech.id)}
                    disabled={deletingId === tech.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    {deletingId === tech.id ? (
                      <div className="w-3.5 h-3.5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
