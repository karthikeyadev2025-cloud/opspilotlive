import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Save, X, Sun } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SolarBenefit {
  id: string;
  icon: string;
  title: string;
  description: string;
  order_index: number;
}

interface SolarType {
  id: string;
  icon: string;
  title: string;
  size: string;
  features: string[];
  order_index: number;
}

interface BestPractice {
  id: string;
  practice: string;
  order_index: number;
}

export default function SolarManager() {
  const [benefits, setBenefits] = useState<SolarBenefit[]>([]);
  const [solarTypes, setSolarTypes] = useState<SolarType[]>([]);
  const [practices, setPractices] = useState<BestPractice[]>([]);
  const [editingBenefit, setPencilingBenefit] = useState<Partial<SolarBenefit> | null>(null);
  const [editingType, setPencilingType] = useState<Partial<SolarType> | null>(null);
  const [editingPractice, setPencilingPractice] = useState<Partial<BestPractice> | null>(null);
  const [activeTab, setActiveTab] = useState<'benefits' | 'types' | 'practices'>('benefits');

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    const [benefitsData, typesData, practicesData] = await Promise.all([
      supabase.from('solar_benefits').select('*').order('order_index'),
      supabase.from('solar_types').select('*').order('order_index'),
      supabase.from('solar_best_practices').select('*').order('order_index')
    ]);

    if (benefitsData.data) setBenefits(benefitsData.data);
    if (typesData.data) setSolarTypes(typesData.data);
    if (practicesData.data) setPractices(practicesData.data);
  }

  async function saveBenefit() {
    if (!editingBenefit?.title) return;

    if (editingBenefit.id) {
      await supabase.from('solar_benefits').update(editingBenefit).eq('id', editingBenefit.id);
    } else {
      await supabase.from('solar_benefits').insert([{ ...editingBenefit, order_index: benefits.length }]);
    }

    setPencilingBenefit(null);
    loadAllData();
  }

  async function deleteBenefit(id: string) {
    if (confirm('Delete this benefit?')) {
      await supabase.from('solar_benefits').delete().eq('id', id);
      loadAllData();
    }
  }

  async function saveSolarType() {
    if (!editingType?.title) return;

    if (editingType.id) {
      await supabase.from('solar_types').update(editingType).eq('id', editingType.id);
    } else {
      await supabase.from('solar_types').insert([{ ...editingType, order_index: solarTypes.length }]);
    }

    setPencilingType(null);
    loadAllData();
  }

  async function deleteSolarType(id: string) {
    if (confirm('Delete this solar type?')) {
      await supabase.from('solar_types').delete().eq('id', id);
      loadAllData();
    }
  }

  async function savePractice() {
    if (!editingPractice?.practice) return;

    if (editingPractice.id) {
      await supabase.from('solar_best_practices').update(editingPractice).eq('id', editingPractice.id);
    } else {
      await supabase.from('solar_best_practices').insert([{ ...editingPractice, order_index: practices.length }]);
    }

    setPencilingPractice(null);
    loadAllData();
  }

  async function deletePractice(id: string) {
    if (confirm('Delete this practice?')) {
      await supabase.from('solar_best_practices').delete().eq('id', id);
      loadAllData();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Sun className="w-8 h-8 text-amber-500" />
          <h2 className="text-2xl font-bold text-white">Solar Content Manager</h2>
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
          Solar Benefits
        </button>
        <button
          onClick={() => setActiveTab('types')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'types'
              ? 'text-amber-500 border-b-2 border-amber-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Solar Types
        </button>
        <button
          onClick={() => setActiveTab('practices')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'practices'
              ? 'text-amber-500 border-b-2 border-amber-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Best Practices
        </button>
      </div>

      {activeTab === 'benefits' && (
        <div className="space-y-4">
          <button
            onClick={() => setPencilingBenefit({ icon: 'Sun', title: '', description: '', order_index: benefits.length })}
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
                  placeholder="Icon name (e.g., TrendingDown)"
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

          <div className="grid gap-4">
            {benefits.map((benefit) => (
              <div key={benefit.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2 py-1 bg-amber-500/20 text-amber-500 text-xs rounded">{benefit.icon}</span>
                      <h4 className="font-semibold text-white">{benefit.title}</h4>
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

      {activeTab === 'types' && (
        <div className="space-y-4">
          <button
            onClick={() => setPencilingType({ icon: 'Home', title: '', size: '', features: [], order_index: solarTypes.length })}
            className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Solar Type</span>
          </button>

          {editingType && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {editingType.id ? 'Pencil Solar Type' : 'New Solar Type'}
                </h3>
                <button onClick={() => setPencilingType(null)}>
                  <X className="w-5 h-5 text-slate-400 hover:text-white" />
                </button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Icon name (e.g., Home)"
                  value={editingType.icon || ''}
                  onChange={(e) => setPencilingType({ ...editingType, icon: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
                <input
                  type="text"
                  placeholder="Title (e.g., Residential Solar)"
                  value={editingType.title || ''}
                  onChange={(e) => setPencilingType({ ...editingType, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
                <input
                  type="text"
                  placeholder="Size (e.g., 1-10 kW)"
                  value={editingType.size || ''}
                  onChange={(e) => setPencilingType({ ...editingType, size: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
                <textarea
                  placeholder="Features (one per line)"
                  value={editingType.features?.join('\n') || ''}
                  onChange={(e) => setPencilingType({ ...editingType, features: e.target.value.split('\n').filter(f => f.trim()) })}
                  rows={5}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
                <button
                  onClick={saveSolarType}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          )}

          <div className="grid gap-4">
            {solarTypes.map((type) => (
              <div key={type.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2 py-1 bg-amber-500/20 text-amber-500 text-xs rounded">{type.icon}</span>
                      <h4 className="font-semibold text-white">{type.title}</h4>
                      <span className="text-slate-400 text-sm">({type.size})</span>
                    </div>
                    <ul className="text-slate-400 text-sm space-y-1">
                      {type.features.map((feature, idx) => (
                        <li key={idx}>• {feature}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => setPencilingType(type)}
                      className="p-2 text-blue-400 hover:bg-slate-700 rounded"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteSolarType(type.id)}
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

      {activeTab === 'practices' && (
        <div className="space-y-4">
          <button
            onClick={() => setPencilingPractice({ practice: '', order_index: practices.length })}
            className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Best Practice</span>
          </button>

          {editingPractice && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {editingPractice.id ? 'Pencil Practice' : 'New Practice'}
                </h3>
                <button onClick={() => setPencilingPractice(null)}>
                  <X className="w-5 h-5 text-slate-400 hover:text-white" />
                </button>
              </div>
              <div className="space-y-4">
                <textarea
                  placeholder="Best Practice"
                  value={editingPractice.practice || ''}
                  onChange={(e) => setPencilingPractice({ ...editingPractice, practice: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
                <button
                  onClick={savePractice}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          )}

          <div className="grid gap-4">
            {practices.map((practice, index) => (
              <div key={practice.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <span className="px-2 py-1 bg-amber-500 text-white text-sm font-bold rounded">{index + 1}</span>
                    <p className="text-slate-300 pt-0.5">{practice.practice}</p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => setPencilingPractice(practice)}
                      className="p-2 text-blue-400 hover:bg-slate-700 rounded"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deletePractice(practice.id)}
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
