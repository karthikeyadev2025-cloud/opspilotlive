import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  order_index: number;
  active: boolean;
}

export default function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [editing, setPenciling] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: 'Camera',
    order_index: 0,
    active: true,
  });

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    const { data } = await supabase.from('services').select('*').order('order_index');
    if (data) setServices(data);
  }

  async function handleAdd() {
    const { error } = await supabase.from('services').insert([formData]);
    if (!error) {
      loadServices();
      setAdding(false);
      resetForm();
    }
  }

  async function handleUpdate(id: string) {
    const service = services.find(s => s.id === id);
    if (!service) return;

    const { error } = await supabase
      .from('services')
      .update({
        title: service.title,
        description: service.description,
        icon: service.icon,
        order_index: service.order_index,
        active: service.active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (!error) {
      setPenciling(null);
      loadServices();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this service?')) return;

    const { error } = await supabase.from('services').delete().eq('id', id);
    if (!error) loadServices();
  }

  function resetForm() {
    setFormData({
      title: '',
      description: '',
      icon: 'Camera',
      order_index: 0,
      active: true,
    });
  }

  function updateService(id: string, field: keyof Service, value: any) {
    setServices(services.map(s => s.id === id ? { ...s, [field]: value } : s));
  }

  const iconOptions = ['Camera', 'Sun', 'Shield', 'Settings'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Manage Services</h2>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold rounded-lg hover:scale-105 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Service</span>
        </button>
      </div>

      {adding && (
        <div className="bg-slate-800 rounded-xl p-6 border border-amber-500">
          <h3 className="text-xl font-bold text-white mb-4">Add New Service</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Icon</label>
              <select
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 outline-none"
              >
                {iconOptions.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Order</label>
              <input
                type="number"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 outline-none"
              />
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleAdd}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
              <button
                onClick={() => { setAdding(false); resetForm(); }}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {services.map(service => (
          <div
            key={service.id}
            className={`bg-slate-800 rounded-xl p-6 border ${
              editing === service.id ? 'border-amber-500' : 'border-slate-700'
            }`}
          >
            {editing === service.id ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={service.title}
                  onChange={(e) => updateService(service.id, 'title', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
                <textarea
                  value={service.description}
                  onChange={(e) => updateService(service.id, 'description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white resize-none"
                />
                <select
                  value={service.icon}
                  onChange={(e) => updateService(service.id, 'icon', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                >
                  {iconOptions.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={service.order_index}
                  onChange={(e) => updateService(service.id, 'order_index', parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleUpdate(service.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setPenciling(null)}
                    className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
                  <p className="text-slate-400 mb-2">{service.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-slate-500">
                    <span>Icon: {service.icon}</span>
                    <span>Order: {service.order_index}</span>
                    <span className={service.active ? 'text-green-500' : 'text-red-500'}>
                      {service.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPenciling(service.id)}
                    className="p-2 text-amber-500 hover:bg-slate-700 rounded-lg"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="p-2 text-red-500 hover:bg-slate-700 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
