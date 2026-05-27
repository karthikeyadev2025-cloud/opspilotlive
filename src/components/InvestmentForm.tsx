import { useState } from 'react';
import { TrendingUp, Mail, Phone, User, DollarSign, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function InvestmentForm() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    investment_amount: '',
    investment_type: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('investment_inquiries')
        .insert([formData]);

      if (error) throw error;

      setSuccess(true);
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        investment_amount: '',
        investment_type: '',
        message: ''
      });

      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      alert('Failed to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <section id="invest" className="py-24 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTEsMTkxLDM2LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[120px] animate-float animate-morph"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] animate-float animate-morph" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4 animate-pulse-glow">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Invest in Our Projects
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Partner with us in the renewable energy revolution and earn sustainable returns
          </p>
        </div>

        {success && (
          <div className="mb-8 p-4 bg-green-500/10 border border-green-500 rounded-xl text-green-500 text-center animate-[fadeInUp_0.5s_ease-out]">
            Thank you for your interest! Our team will contact you shortly.
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 md:p-12 border border-slate-700 hover-lift">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Full Name *
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                <DollarSign className="w-4 h-4 inline mr-2" />
                Investment Range *
              </label>
              <select
                name="investment_amount"
                value={formData.investment_amount}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
              >
                <option value="">Select range</option>
                <option value="5-10 Lakhs">₹5-10 Lakhs</option>
                <option value="10-25 Lakhs">₹10-25 Lakhs</option>
                <option value="25-50 Lakhs">₹25-50 Lakhs</option>
                <option value="50 Lakhs - 1 Crore">₹50 Lakhs - 1 Crore</option>
                <option value="1 Crore+">₹1 Crore+</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Investment Interest *
              </label>
              <select
                name="investment_type"
                value={formData.investment_type}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
              >
                <option value="">Select type</option>
                <option value="Solar Projects">Solar Projects</option>
                <option value="CCTV Projects">CCTV Projects</option>
                <option value="Both Solar & CCTV">Both Solar & CCTV</option>
                <option value="Business Partnership">Business Partnership</option>
                <option value="Franchise Opportunity">Franchise Opportunity</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Additional Information
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all resize-none"
              placeholder="Tell us about your investment goals and any questions you have..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full group relative px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <span className="relative z-10 flex items-center justify-center space-x-2">
              <span>{loading ? 'Submitting...' : 'Submit Inquiry'}</span>
              <Send className="w-5 h-5" />
            </span>
          </button>

          <p className="text-xs text-slate-500 text-center mt-4">
            Our investment team will review your inquiry and contact you within 24-48 hours
          </p>
        </form>
      </div>
    </section>
  );
}
