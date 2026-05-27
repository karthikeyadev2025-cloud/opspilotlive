import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Pencil, Trash2, Save, X, Star } from 'lucide-react';
import ImageUpload from './ImageUpload';

interface Testimonial {
  id: string;
  client_name: string;
  client_company: string;
  testimonial: string;
  rating: number;
  image_url: string;
  order_index: number;
  active: boolean;
}

export default function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [editing, setPenciling] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [formData, setFormData] = useState({
    client_name: '',
    client_company: '',
    testimonial: '',
    rating: 5,
    image_url: '',
    order_index: 0,
    active: true,
  });

  useEffect(() => {
    loadTestimonials();
  }, []);

  async function loadTestimonials() {
    const { data } = await supabase.from('testimonials').select('*').order('order_index');
    if (data) setTestimonials(data);
  }

  async function handleAdd() {
    const { error } = await supabase.from('testimonials').insert([formData]);
    if (!error) {
      loadTestimonials();
      setAdding(false);
      resetForm();
    }
  }

  async function handleUpdate(id: string) {
    const testimonial = testimonials.find(t => t.id === id);
    if (!testimonial) return;

    const { error } = await supabase
      .from('testimonials')
      .update({
        client_name: testimonial.client_name,
        client_company: testimonial.client_company,
        testimonial: testimonial.testimonial,
        rating: testimonial.rating,
        image_url: testimonial.image_url,
        order_index: testimonial.order_index,
        active: testimonial.active,
      })
      .eq('id', id);

    if (!error) {
      setPenciling(null);
      loadTestimonials();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (!error) loadTestimonials();
  }

  function resetForm() {
    setFormData({
      client_name: '',
      client_company: '',
      testimonial: '',
      rating: 5,
      image_url: '',
      order_index: 0,
      active: true,
    });
  }

  function updateTestimonial(id: string, field: keyof Testimonial, value: any) {
    setTestimonials(testimonials.map(t => t.id === id ? { ...t, [field]: value } : t));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Manage Testimonials</h2>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold rounded-lg hover:scale-105 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Testimonial</span>
        </button>
      </div>

      {adding && (
        <div className="bg-slate-800 rounded-xl p-6 border border-amber-500">
          <h3 className="text-xl font-bold text-white mb-4">Add New Testimonial</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Client Name</label>
              <input
                type="text"
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Company (optional)</label>
              <input
                type="text"
                value={formData.client_company}
                onChange={(e) => setFormData({ ...formData, client_company: e.target.value })}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Testimonial</label>
              <textarea
                value={formData.testimonial}
                onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Rating</label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 outline-none"
              >
                {[5, 4, 3, 2, 1].map(r => (
                  <option key={r} value={r}>{r} Stars</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Client Photo (optional)</label>
              <ImageUpload
                currentUrl={formData.image_url}
                onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
                folder="testimonials"
              />
              <div className="mt-3">
                <label className="block text-sm text-slate-400 mb-2">Or paste URL:</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 outline-none"
                />
              </div>
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
        {testimonials.map(testimonial => (
          <div
            key={testimonial.id}
            className={`bg-slate-800 rounded-xl p-6 border ${
              editing === testimonial.id ? 'border-amber-500' : 'border-slate-700'
            }`}
          >
            {editing === testimonial.id ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={testimonial.client_name}
                  onChange={(e) => updateTestimonial(testimonial.id, 'client_name', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
                <input
                  type="text"
                  value={testimonial.client_company}
                  onChange={(e) => updateTestimonial(testimonial.id, 'client_company', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  placeholder="Company (optional)"
                />
                <textarea
                  value={testimonial.testimonial}
                  onChange={(e) => updateTestimonial(testimonial.id, 'testimonial', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white resize-none"
                />
                <select
                  value={testimonial.rating}
                  onChange={(e) => updateTestimonial(testimonial.id, 'rating', parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                >
                  {[5, 4, 3, 2, 1].map(r => (
                    <option key={r} value={r}>{r} Stars</option>
                  ))}
                </select>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Client Photo (optional)</label>
                  <ImageUpload
                    currentUrl={testimonial.image_url}
                    onUploadComplete={(url) => updateTestimonial(testimonial.id, 'image_url', url)}
                    folder="testimonials"
                  />
                  <div className="mt-3">
                    <label className="block text-sm text-slate-400 mb-2">Or paste URL:</label>
                    <input
                      type="url"
                      value={testimonial.image_url}
                      onChange={(e) => updateTestimonial(testimonial.id, 'image_url', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                      placeholder="Image URL (optional)"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleUpdate(testimonial.id)}
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
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < testimonial.rating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-slate-300 mb-4 italic">"{testimonial.testimonial}"</p>
                  <p className="text-white font-bold">{testimonial.client_name}</p>
                  {testimonial.client_company && (
                    <p className="text-amber-500 text-sm">{testimonial.client_company}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPenciling(testimonial.id)}
                    className="p-2 text-amber-500 hover:bg-slate-700 rounded-lg"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial.id)}
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
