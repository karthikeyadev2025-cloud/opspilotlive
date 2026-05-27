import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Camera, Save, X, User, Phone, Mail, CheckCircle, AlertCircle, Upload, Trash2 } from 'lucide-react';

interface ProfileEditorProps {
  onClose: () => void;
}

export default function ProfileEditor({ onClose }: ProfileEditorProps) {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [photoPreview, setPhotoPreview] = useState<string | null>(user?.profile_photo_url || null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo must be under 5MB.');
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = ev => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleRemovePhoto() {
    setPhotoFile(null);
    setPhotoPreview(null);
  }

  async function save() {
    if (!user) return;
    if (!fullName.trim()) { setError('Name cannot be empty.'); return; }
    setSaving(true); setError(''); setSuccess('');
    let photoUrl = user.profile_photo_url || null;

    if (photoFile) {
      const ext = photoFile.name.split('.').pop();
      const path = `${user.id}/profile.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(path, photoFile, { upsert: true });
      if (uploadError) {
        setError('Photo upload failed: ' + uploadError.message);
        setSaving(false);
        return;
      }
      const { data: urlData } = supabase.storage.from('profile-photos').getPublicUrl(path);
      photoUrl = urlData.publicUrl + '?t=' + Date.now();
    } else if (photoPreview === null && user.profile_photo_url) {
      photoUrl = null;
    }

    const { error: updateError } = await supabase
      .from('app_users')
      .update({ full_name: fullName.trim(), phone: phone.trim(), profile_photo_url: photoUrl })
      .eq('id', user.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    await refreshUser();
    setSuccess('Profile updated successfully!');
    setSaving(false);
    setTimeout(() => { setSuccess(''); onClose(); }, 1500);
  }

  const initials = (user?.full_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h3 className="text-white font-bold text-lg">Edit Profile</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
              <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600 flex items-center justify-center">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-slate-300">{initials}</span>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-500 hover:bg-amber-600 rounded-xl flex items-center justify-center transition-colors shadow-lg"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            <div className="flex gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors"
              >
                <Upload className="w-3.5 h-3.5" /> Upload Photo
              </button>
              {photoPreview && (
                <button
                  onClick={handleRemovePhoto}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              )}
            </div>
            <p className="text-slate-500 text-xs">JPG, PNG, WEBP — max 5MB</p>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
                placeholder="Your full name"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
                placeholder="Your phone number"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-500" />
              <span className="text-slate-400 text-sm">{user?.email}</span>
            </div>
            <p className="text-slate-600 text-xs mt-1 ml-6">Email cannot be changed here</p>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-60"
            >
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
