import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Save, X, Award } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CompanyBenefit {
  id: string;
  icon: string;
  title: string;
  description: string;
  gradient: string;
  order_index: number;
}

interface WhyChooseUs {
  id: string;
  title: string;
  description: string;
  order_index: number;
}

export default function BenefitsManager() {
  const [benefits, setBenefits] = useState<CompanyBenefit[]>([]);
  const [whyChoose, setWhyChoose] = useState<WhyChooseUs[]>([]);
  const [editingBenefit, setPencilingBenefit] = useState<Partial<CompanyBenefit> | null>(null);
  const [editingWhy, setPencilingWhy] = useState<Partial<WhyChooseUs> | null>(null);
  const [activeTab, setActiveTab] = useState<'benefits' | 'why'>('benefits');

  const gradientOptions = [
    'from-blue-500 to-blue-700',
    'from-amber-500 to-orange-600',
    'from-purple-500 to-purple-700',
    'from-green-500 to-green-700',
    'from-red-500 to-red-700',
    'from-indigo-500 to-indigo-700',
    'from-teal-500 to-teal-700',
    'from-orange-500 to-orange-700',
    'from-pink-500 to-pink-700',
    'from-cyan-500 to-cyan-700'
  ];

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    const [benefitsData, whyData] = await Promise.all([
      supabase.from('company_benefits').select('*').order('order_index'),
      supabase.from('why_choose_us').select('*').order('order_index')
    ]);

    if (benefitsData.data) setBenefits(benefitsData.data);
    if (whyData.data) setWhyChoose(whyData.data);
  }

  async function saveBenefit() {
    if (!editingBenefit?.title) return;

    if (editingBenefit.id) {
      await supabase.from('company_benefits').update(editingBenefit).eq('id', editingBenefit.id);
    } else {
      await supabase.from('company_benefits').insert([{ ...editingBenefit, order_index: benefits.length }]);
    }

    setPencilingBenefit(null);
    loadAllData();
  }

  async function deleteBenefit(id: string) {
    if (confirm('Delete this benefit?')) {
      await supabase.from('company_benefits').delete().eq('id', id);
      loadAllData();
    }
  }

  async function saveWhy() {
    if (!editingWhy?.title) return;

    if (editingWhy.id) {
      await supabase.from('why_choose_us').update(editingWhy).eq('id', editingWhy.id);
    } else {
      await supabase.from('why_choose_us').insert([{ ...editingWhy, order_index: whyChoose.length }]);
    }

    setPencilingWhy(null);
    loadAllData();
  }

  async function deleteWhy(id: string) {
    if (confirm('Delete this item?')) {
      await supabase.from('why_choose_us').delete().eq('id', id);
      loadAllData();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Award className="w-8 h-8 text-amber-500" />
          <h2 className="text-2xl font-bold text-white">Benefits & Advantages Manager</h2>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('benefits')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'benefits'
              ? 'text-amber-500 border-b-2 border-amber-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Company Benefits
        </button>
        <button
          onClick={() => setActiveTab('why')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'why'
              ? 'text-amber-500 border-b-2 border-amber-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Why Choose Us
        </button>
      </div>

      {activeTab === 'benefits' && (
        <div className="space-y-4">
          <button
            onClick={() => setPencilingBenefit({ icon: 'Shield', title: '', description: '', gradient: 'from-blue-500 to-blue-700', order_index: benefits.length })}
            className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Benefit</span>
          </button>

          {editingBenefit && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {editingBenefit.id ? 'Pencil Benefit' : 'New Benefit'}
                </h3>
                <button onClick={() => setPencilingBenefit(null)}>
                  <X className="w-5 h-5 text-slate-400 hover:text-white" />
                </button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Icon name (e.g., Shield, Award, Zap)"
                  value={editingBenefit.icon || ''}
                  onChange={(e) => setPencilingBenefit({ ...editingBenefit, icon: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
                <input
                  type="text"
                  placeholder="Title"
                  value={editingBenefit.title || ''}
                  onChange={(e) => setPencilingBenefit({ ...editingBenefit, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
                <textarea
                  placeholder="Description"
                  value={editingBenefit.description || ''}
                  onChange={(e) => setPencilingBenefit({ ...editingBenefit, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
                <div>
                  <label className="block text-slate-400 mb-2 text-sm">Color Gradient</label>
                  <select
                    value={editingBenefit.gradient || 'from-blue-500 to-blue-700'}
                    onChange={(e) => setPencilingBenefit({ ...editingBenefit, gradient: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    {gradientOptions.map((gradient) => (
                      <option key={gradient} value={gradient}>
                        {gradient}
                      </option>
                    ))}
                  </select>
                  <div className={`mt-2 h-8 rounded bg-gradient-to-r ${editingBenefit.gradient || 'from-blue-500 to-blue-700'}`}></div>
                </div>
                <button
                  onClick={saveBenefit}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit) => (
              <div key={benefit.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`w-10 h-10 bg-gradient-to-r ${benefit.gradient} rounded-lg flex items-center justify-center text-sm`}>
                        {benefit.icon.substring(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{benefit.title}</h4>
                        <span className="text-xs text-slate-500">{benefit.icon}</span>
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm">{benefit.description}</p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => setPencilingBenefit(benefit)}
                      className="p-2 text-blue-400 hover:bg-slate-700 rounded"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteBenefit(benefit.id)}
                      className="p-2 text-red-400 hover:bg-slate-700 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'why' && (
        <div className="space-y-4">
          <button
            onClick={() => setPencilingWhy({ title: '', description: '', order_index: whyChoose.length })}
            className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Item</span>
          </button>

          {editingWhy && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {editingWhy.id ? 'Pencil Item' : 'New Item'}
                </h3>
                <button onClick={() => setPencilingWhy(null)}>
                  <X className="w-5 h-5 text-slate-400 hover:text-white" />
                </button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={editingWhy.title || ''}
                  onChange={(e) => setPencilingWhy({ ...editingWhy, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
                <textarea
                  placeholder="Description"
                  value={editingWhy.description || ''}
                  onChange={(e) => setPencilingWhy({ ...editingWhy, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
                <button
                  onClick={saveWhy}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {whyChoose.map((item, index) => (
              <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <span className="px-2 py-1 bg-amber-500 text-white text-sm font-bold rounded">{index + 1}</span>
                    <div>
                      <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                      <p className="text-slate-400 text-sm">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => setPencilingWhy(item)}
                      className="p-2 text-blue-400 hover:bg-slate-700 rounded"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteWhy(item.id)}
                      className="p-2 text-red-400 hover:bg-slate-700 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
