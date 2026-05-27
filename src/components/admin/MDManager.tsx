import { useEffect, useState } from 'react';
import { User, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ImageUpload from './ImageUpload';

interface MDData {
  id: string;
  name: string;
  photo_url: string;
  title: string;
  message: string;
  address: string;
}

export default function MDManager() {
  const [mdData, setMDData] = useState<MDData>({
    id: '',
    name: '',
    photo_url: '',
    title: '',
    message: '',
    address: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMDData();
  }, []);

  async function loadMDData() {
    setLoading(true);
    const { data, error } = await supabase
      .from('managing_director')
      .select('*')
      .maybeSingle();

    if (data && !error) {
      setMDData(data);
    } else {
      setMDData({
        id: '',
        name: 'Managing Director Name',
        photo_url: '',
        title: 'Managing Director',
        message: 'Your message here...',
        address: 'Guntur, Andhra Pradesh'
      });
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (mdData.id) {
        const { error } = await supabase
          .from('managing_director')
          .update({
            name: mdData.name,
            photo_url: mdData.photo_url,
            title: mdData.title,
            message: mdData.message,
            address: mdData.address,
            updated_at: new Date().toISOString()
          })
          .eq('id', mdData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('managing_director')
          .insert({
            name: mdData.name,
            photo_url: mdData.photo_url,
            title: mdData.title,
            message: mdData.message,
            address: mdData.address
          });

        if (error) throw error;
      }

      alert('MD information saved successfully!');
      loadMDData();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setMDData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (loading) {
    return <div className="text-white p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center space-x-3 mb-8">
        <User className="w-8 h-8 text-amber-500" />
        <h2 className="text-3xl font-bold text-white">Managing Director Info</h2>
      </div>

      <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={mdData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
            placeholder="Managing Director's Name"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            MD Photo
          </label>
          <ImageUpload
            currentUrl={mdData.photo_url}
            onUploadComplete={(url) => setMDData(prev => ({ ...prev, photo_url: url }))}
            folder="md"
          />
          <div className="mt-4">
            <label className="block text-sm text-slate-400 mb-2">Or paste URL directly:</label>
            <input
              type="text"
              name="photo_url"
              value={mdData.photo_url}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
              placeholder="https://example.com/photo.jpg"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Title/Designation
          </label>
          <input
            type="text"
            name="title"
            value={mdData.title}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
            placeholder="Managing Director"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Address/Region
          </label>
          <input
            type="text"
            name="address"
            value={mdData.address}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
            placeholder="Andhra Pradesh & Telangana"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Message to Visitors
          </label>
          <textarea
            name="message"
            value={mdData.message}
            onChange={handleChange}
            rows={6}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all resize-none"
            placeholder="Welcome message or quote from the Managing Director..."
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>
    </div>
  );
}
