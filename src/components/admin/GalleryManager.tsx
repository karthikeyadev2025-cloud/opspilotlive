import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Save, X } from 'lucide-react';
import ImageUpload from './ImageUpload';

interface GalleryItem {
  id: string;
  image_url: string;
  title: string;
  category: string;
  order_index: number;
  active: boolean;
}

export default function GalleryManager() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [adding, setAdding] = useState(false);
  const [formData, setFormData] = useState({
    image_url: '',
    title: '',
    category: 'cctv',
    order_index: 0,
    active: true,
  });

  useEffect(() => {
    loadGallery();
  }, []);

  async function loadGallery() {
    const { data } = await supabase.from('gallery').select('*').order('order_index');
    if (data) setItems(data);
  }

  async function handleAdd() {
    const { error } = await supabase.from('gallery').insert([formData]);
    if (!error) {
      loadGallery();
      setAdding(false);
      resetForm();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this item?')) return;

    const { error } = await supabase.from('gallery').delete().eq('id', id);
    if (!error) loadGallery();
  }

  function resetForm() {
    setFormData({
      image_url: '',
      title: '',
      category: 'cctv',
      order_index: 0,
      active: true,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Manage Gallery</h2>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold rounded-lg hover:scale-105 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Image</span>
        </button>
      </div>

      {adding && (
        <div className="bg-slate-800 rounded-xl p-6 border border-amber-500">
          <h3 className="text-xl font-bold text-white mb-4">Add New Image</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Gallery Image</label>
              <ImageUpload
                currentUrl={formData.image_url}
                onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
                folder="gallery"
              />
              <div className="mt-3">
                <label className="block text-sm text-slate-400 mb-2">Or paste URL:</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 outline-none"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
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
              <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 outline-none"
              >
                <option value="cctv">CCTV</option>
                <option value="solar">Solar</option>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(item => (
          <div key={item.id} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
            <div className="aspect-video bg-slate-900">
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <div className="flex items-center justify-between text-sm">
                <span className="px-2 py-1 bg-amber-500 text-slate-950 rounded">
                  {item.category.toUpperCase()}
                </span>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-red-500 hover:bg-slate-700 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
