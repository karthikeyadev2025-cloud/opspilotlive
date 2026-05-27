import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';

interface ContentItem {
  section: string;
  key: string;
  value: string;
  type: string;
}

export default function ContentEditor() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadContent();
  }, []);

  async function loadContent() {
    const { data } = await supabase.from('site_content').select('*').order('section');
    if (data) setContent(data);
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    try {
      for (const item of content) {
        const { error } = await supabase
          .from('site_content')
          .upsert({
            section: item.section,
            key: item.key,
            value: item.value,
            type: item.type,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'section,key'
          });

        if (error) throw error;
      }

      setMessage({ type: 'success', text: 'Content saved successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }

    setSaving(false);
  }

  function updateValue(section: string, key: string, value: string) {
    setContent(content.map(item =>
      item.section === section && item.key === key
        ? { ...item, value }
        : item
    ));
  }

  const sections = [...new Set(content.map(item => item.section))];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Edit Site Content</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold rounded-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-start space-x-3 ${
          message.type === 'success'
            ? 'bg-green-500/10 border border-green-500/50'
            : 'bg-red-500/10 border border-red-500/50'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          )}
          <p className={message.type === 'success' ? 'text-green-400' : 'text-red-400'}>
            {message.text}
          </p>
        </div>
      )}

      {sections.map(section => (
        <div key={section} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-amber-500 mb-4 capitalize">{section} Section</h3>
          <div className="space-y-4">
            {content.filter(item => item.section === section).map(item => (
              <div key={`${item.section}-${item.key}`}>
                <label className="block text-sm font-medium text-slate-400 mb-2 capitalize">
                  {item.key.replace(/_/g, ' ')}
                </label>
                {item.key === 'description' || item.value.length > 100 ? (
                  <textarea
                    value={item.value}
                    onChange={(e) => updateValue(item.section, item.key, e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all resize-none"
                  />
                ) : (
                  <input
                    type="text"
                    value={item.value}
                    onChange={(e) => updateValue(item.section, item.key, e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
