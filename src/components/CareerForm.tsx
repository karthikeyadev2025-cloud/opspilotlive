import { useState } from 'react';
import { Briefcase, Mail, Phone, User, MapPin, FileText, Send, Upload, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function CareerForm() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    location: '',
    cover_letter: '',
    photo_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('career_applications')
        .insert([formData]);

      if (error) throw error;

      setSuccess(true);
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        position: '',
        experience: '',
        location: '',
        cover_letter: '',
        photo_url: ''
      });
      setPhotoPreview(null);

      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Photo size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `career-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, photo_url: publicUrl }));
      setPhotoPreview(publicUrl);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, photo_url: '' }));
    setPhotoPreview(null);
  };

  return (
    <section id="careers" className="py-24 bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTEsMTkxLDM2LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full mb-4 animate-pulse-glow">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Join Our Team
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Be part of a growing company revolutionizing solar and security solutions
          </p>
        </div>

        {success && (
          <div className="mb-8 p-4 bg-green-500/10 border border-green-500 rounded-xl text-green-500 text-center animate-[fadeInUp_0.5s_ease-out]">
            Application submitted successfully! We'll contact you soon.
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
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
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
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
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
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                <Briefcase className="w-4 h-4 inline mr-2" />
                Position *
              </label>
              <select
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
              >
                <option value="">Select position</option>
                <option value="Solar Technician">Solar Technician</option>
                <option value="CCTV Technician">CCTV Technician</option>
                <option value="Sales Executive">Sales Executive</option>
                <option value="Site Supervisor">Site Supervisor</option>
                <option value="Customer Support">Customer Support</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Experience
              </label>
              <select
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
              >
                <option value="">Select experience</option>
                <option value="Fresher">Fresher</option>
                <option value="1-2 years">1-2 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="5+ years">5+ years</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Preferred Location
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
              >
                <option value="">Select location</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Telangana">Telangana</option>
                <option value="Both">Both States</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              <Upload className="w-4 h-4 inline mr-2" />
              Passport Size Photo *
            </label>

            {!photoPreview ? (
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                  className="hidden"
                  id="photo-upload"
                  required
                />
                <label
                  htmlFor="photo-upload"
                  className="w-full flex flex-col items-center justify-center px-4 py-8 bg-slate-900 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 cursor-pointer hover:border-amber-500 hover:bg-slate-800 transition-all"
                >
                  <Upload className="w-12 h-12 mb-3" />
                  <span className="text-sm font-medium">
                    {uploading ? 'Uploading...' : 'Click to upload passport size photo'}
                  </span>
                  <span className="text-xs mt-1">PNG, JPG, WebP (Max 5MB)</span>
                </label>
              </div>
            ) : (
              <div className="relative inline-block">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-32 h-40 object-cover rounded-xl border-2 border-amber-500"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Cover Letter / Message
            </label>
            <textarea
              name="cover_letter"
              value={formData.cover_letter}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all resize-none"
              placeholder="Tell us why you'd be a great fit for our team..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full group relative px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold rounded-xl overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <span className="relative z-10 flex items-center justify-center space-x-2">
              <span>{loading ? 'Submitting...' : 'Submit Application'}</span>
              <Send className="w-5 h-5" />
            </span>
          </button>
        </form>
      </div>
    </section>
  );
}
