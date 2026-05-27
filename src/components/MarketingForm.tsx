import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Phone, MapPin, FileText, Send, CheckCircle, ChevronDown } from 'lucide-react';

const REQUIREMENTS = [
  'Solar Panel Installation',
  'CCTV Installation',
  'Solar + CCTV Package',
  'Solar Maintenance',
  'CCTV Maintenance',
  'Inverter / Battery',
  'Other',
];

export default function MarketingForm() {
  const [formData, setFormData] = useState({
    full_name: '',
    contact_number: '',
    alternate_number: '',
    email: '',
    location: '',
    address: '',
    requirement: '',
    requirement_details: '',
    collected_by: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.full_name || !formData.contact_number || !formData.location || !formData.requirement || !formData.collected_by) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    const { error: dbError } = await supabase.from('marketing_leads').insert([formData]);
    setSubmitting(false);
    if (dbError) {
      setError('Failed to submit. Please try again.');
      return;
    }
    setSubmitted(true);
  };

  const handleReset = () => {
    setFormData({
      full_name: '',
      contact_number: '',
      alternate_number: '',
      email: '',
      location: '',
      address: '',
      requirement: '',
      requirement_details: '',
      collected_by: '',
    });
    setSubmitted(false);
    setError('');
  };

  if (submitted) {
    return (
      <section id="marketing-form" className="py-20 bg-gradient-to-br from-slate-900 to-slate-950">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-slate-800 rounded-2xl p-12 border border-slate-700">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Lead Submitted Successfully</h3>
            <p className="text-slate-400 mb-8">The customer data has been recorded and will be contacted by our telecalling team shortly.</p>
            <button
              onClick={handleReset}
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all"
            >
              Submit Another Lead
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="marketing-form" className="py-20 bg-gradient-to-br from-slate-900 to-slate-950">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm font-medium mb-4">
            Marketing Executive Portal
          </span>
          <h2 className="text-4xl font-bold text-white mb-4">Customer Lead Collection</h2>
          <p className="text-slate-400 text-lg">Record prospect details collected during field visits for telecalling follow-up.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800/60 backdrop-blur rounded-2xl border border-slate-700 p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Customer Full Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Contact Number <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="tel"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  placeholder="Primary phone number"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Alternate Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="tel"
                  name="alternate_number"
                  value={formData.alternate_number}
                  onChange={handleChange}
                  placeholder="Alternate phone (optional)"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email (optional)"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Location / Area <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City / Area / Locality"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Requirement <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  name="requirement"
                  value={formData.requirement}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors appearance-none"
                  required
                >
                  <option value="">Select requirement</option>
                  {REQUIREMENTS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Full Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Complete address (optional)"
              rows={2}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Requirement Details</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <textarea
                name="requirement_details"
                value={formData.requirement_details}
                onChange={handleChange}
                placeholder="Additional details about what the customer needs, budget, timeline, etc."
                rows={3}
                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Marketing Executive Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                name="collected_by"
                value={formData.collected_by}
                onChange={handleChange}
                placeholder="Your name (who collected this lead)"
                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all text-lg"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Lead
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
