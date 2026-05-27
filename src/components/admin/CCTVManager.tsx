import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Save, X, Camera } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CCTVPackage {
  id: string;
  title: string;
  cameras: string;
  price: string;
  features: string[];
  is_popular: boolean;
  order_index: number;
}

interface CCTVBrand {
  id: string;
  name: string;
  order_index: number;
}

export default function CCTVManager() {
  const [packages, setPackages] = useState<CCTVPackage[]>([]);
  const [brands, setBrands] = useState<CCTVBrand[]>([]);
  const [editingPackage, setPencilingPackage] = useState<Partial<CCTVPackage> | null>(null);
  const [editingBrand, setPencilingBrand] = useState<Partial<CCTVBrand> | null>(null);
  const [activeTab, setActiveTab] = useState<'packages' | 'brands'>('packages');

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    const [packagesData, brandsData] = await Promise.all([
      supabase.from('cctv_packages').select('*').order('order_index'),
      supabase.from('cctv_brands').select('*').order('order_index')
    ]);

    if (packagesData.data) setPackages(packagesData.data);
    if (brandsData.data) setBrands(brandsData.data);
  }

  async function savePackage() {
    if (!editingPackage?.title) return;

    if (editingPackage.id) {
      await supabase.from('cctv_packages').update(editingPackage).eq('id', editingPackage.id);
    } else {
      await supabase.from('cctv_packages').insert([{ ...editingPackage, order_index: packages.length }]);
    }

    setPencilingPackage(null);
    loadAllData();
  }

  async function deletePackage(id: string) {
    if (confirm('Delete this package?')) {
      await supabase.from('cctv_packages').delete().eq('id', id);
      loadAllData();
    }
  }

  async function saveBrand() {
    if (!editingBrand?.name) return;

    if (editingBrand.id) {
      await supabase.from('cctv_brands').update(editingBrand).eq('id', editingBrand.id);
    } else {
      await supabase.from('cctv_brands').insert([{ ...editingBrand, order_index: brands.length }]);
    }

    setPencilingBrand(null);
    loadAllData();
  }

  async function deleteBrand(id: string) {
    if (confirm('Delete this brand?')) {
      await supabase.from('cctv_brands').delete().eq('id', id);
      loadAllData();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Camera className="w-8 h-8 text-blue-500" />
          <h2 className="text-2xl font-bold text-white">CCTV Content Manager</h2>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('packages')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'packages'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          CCTV Packages
        </button>
        <button
          onClick={() => setActiveTab('brands')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'brands'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Brands
        </button>
      </div>

      {activeTab === 'packages' && (
        <div className="space-y-4">
          <button
            onClick={() => setPencilingPackage({ title: '', cameras: '', price: '', features: [], is_popular: false, order_index: packages.length })}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Package</span>
          </button>

          {editingPackage && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {editingPackage.id ? 'Pencil Package' : 'New Package'}
                </h3>
                <button onClick={() => setPencilingPackage(null)}>
                  <X className="w-5 h-5 text-slate-400 hover:text-white" />
                </button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Title (e.g., Basic Package)"
                  value={editingPackage.title || ''}
                  onChange={(e) => setPencilingPackage({ ...editingPackage, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
                <input
                  type="text"
                  placeholder="Cameras (e.g., 4 Cameras)"
                  value={editingPackage.cameras || ''}
                  onChange={(e) => setPencilingPackage({ ...editingPackage, cameras: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
                <input
                  type="text"
                  placeholder="Price (e.g., Starting ₹25,000)"
                  value={editingPackage.price || ''}
                  onChange={(e) => setPencilingPackage({ ...editingPackage, price: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
                <textarea
                  placeholder="Features (one per line)"
                  value={editingPackage.features?.join('\n') || ''}
                  onChange={(e) => setPencilingPackage({ ...editingPackage, features: e.target.value.split('\n').filter(f => f.trim()) })}
                  rows={6}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
                <label className="flex items-center space-x-2 text-white">
                  <input
                    type="checkbox"
                    checked={editingPackage.is_popular || false}
                    onChange={(e) => setPencilingPackage({ ...editingPackage, is_popular: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span>Mark as Popular</span>
                </label>
                <button
                  onClick={savePackage}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          )}

          <div className="grid gap-4">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-white">{pkg.title}</h4>
                      {pkg.is_popular && (
                        <span className="px-2 py-1 bg-amber-500 text-white text-xs rounded">Popular</span>
                      )}
                    </div>
                    <p className="text-blue-400 text-sm mb-1">{pkg.cameras} • {pkg.price}</p>
                    <ul className="text-slate-400 text-sm space-y-1">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx}>• {feature}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => setPencilingPackage(pkg)}
                      className="p-2 text-blue-400 hover:bg-slate-700 rounded"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deletePackage(pkg.id)}
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

      {activeTab === 'brands' && (
        <div className="space-y-4">
          <button
            onClick={() => setPencilingBrand({ name: '', order_index: brands.length })}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Brand</span>
          </button>

          {editingBrand && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {editingBrand.id ? 'Pencil Brand' : 'New Brand'}
                </h3>
                <button onClick={() => setPencilingBrand(null)}>
                  <X className="w-5 h-5 text-slate-400 hover:text-white" />
                </button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Brand Name (e.g., Hikvision)"
                  value={editingBrand.name || ''}
                  onChange={(e) => setPencilingBrand({ ...editingBrand, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
                <button
                  onClick={saveBrand}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {brands.map((brand) => (
              <div key={brand.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">{brand.name}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPencilingBrand(brand)}
                      className="p-2 text-blue-400 hover:bg-slate-700 rounded"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteBrand(brand.id)}
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
