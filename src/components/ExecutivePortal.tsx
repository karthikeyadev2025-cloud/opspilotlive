import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import CameraCapture from './CameraCapture';
import ProfileAvatar from './ProfileAvatar';
import {
  LogOut, User, Phone, MapPin, FileText, Send,
  CheckCircle, ChevronDown, ChevronUp, ClipboardList, PlusCircle,
  Camera, X, Navigation, Loader, Clock,
  MessageSquare, RefreshCw, AlertCircle, Search
} from 'lucide-react';

const REQUIREMENTS = [
  'Solar Panel Installation', 'CCTV Installation', 'Solar + CCTV Package',
  'Solar Maintenance', 'CCTV Maintenance', 'Inverter / Battery', 'Other',
];
const PRIORITIES = [
  { value: 'high', label: 'High', color: 'text-red-400' },
  { value: 'medium', label: 'Medium', color: 'text-amber-400' },
  { value: 'low', label: 'Low', color: 'text-green-400' },
];
const emptyForm = {
  full_name: '', contact_number: '', alternate_number: '', email: '',
  location: '', address: '', requirement: '', requirement_details: '', priority: 'medium',
};
const STATUS_COLORS: Record<string, string> = {
  new: 'bg-sky-500/20 text-sky-400',
  called: 'bg-slate-500/20 text-slate-400',
  interested: 'bg-amber-500/20 text-amber-400',
  not_interested: 'bg-red-500/20 text-red-400',
  converted: 'bg-green-500/20 text-green-400',
  callback: 'bg-orange-500/20 text-orange-400',
};
const STATUS_LABELS: Record<string, string> = {
  new: 'New', called: 'Called', interested: 'Interested',
  not_interested: 'Not Interested', converted: 'Converted', callback: 'Callback',
};
const ROLE_COLORS: Record<string, string> = {
  telecaller: 'text-sky-400 bg-sky-500/10',
  marketing_executive: 'text-amber-400 bg-amber-500/10',
  manager: 'text-orange-400 bg-orange-500/10',
  hr: 'text-rose-400 bg-rose-500/10',
  admin: 'text-slate-300 bg-slate-500/10',
};
const ATT_STATUS_COLORS: Record<string, string> = {
  present: 'bg-green-500/20 text-green-400',
  half_day: 'bg-amber-500/20 text-amber-400',
  absent: 'bg-red-500/20 text-red-400',
  leave: 'bg-blue-500/20 text-blue-400',
};

interface GeoLocation { lat: number; lng: number; address: string }
interface LeadRemark {
  id: string;
  lead_id: string;
  user_name: string;
  user_role: string;
  remark: string;
  call_type: string;
  created_at: string;
  lead?: { full_name: string; contact_number: string };
}
type Tab = 'submit' | 'my_leads' | 'conversations' | 'attendance';

const EXEC_CALL_TYPE_OPTIONS = [
  { value: 'executive_visit', label: 'Field Visit / Meeting' },
  { value: 'general', label: 'General Note' },
];

const CALL_TYPE_META: Record<string, { label: string; color: string; bg: string }> = {
  telecaller_call: { label: 'Client Call', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
  answered: { label: 'Answered', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  executive_visit: { label: 'Field Visit', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  manager_review: { label: 'Manager Review', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  not_answered: { label: 'Not Answered', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  busy: { label: 'Busy', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  general: { label: 'Note', color: 'text-slate-400', bg: 'bg-slate-700/40 border-slate-600/30' },
};

export default function ExecutivePortal() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('submit');
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [myLeads, setMyLeads] = useState<any[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  // Inline expand for my_leads
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [remarksMap, setRemarksMap] = useState<Record<string, LeadRemark[]>>({});
  const [loadingRemarksId, setLoadingRemarksId] = useState<string | null>(null);
  const [inlineRemark, setInlineRemark] = useState('');
  const [inlineCallType, setInlineCallType] = useState('executive_visit');
  const [sendingInline, setSendingInline] = useState(false);

  const [allConversations, setAllConversations] = useState<LeadRemark[]>([]);
  const [convLoading, setConvLoading] = useState(false);
  const [convSearch, setConvSearch] = useState('');
  const [convNewRemark, setConvNewRemark] = useState('');
  const [convCallType, setConvCallType] = useState('executive_visit');
  const [convSelectedLeadId, setConvSelectedLeadId] = useState('');
  const [sendingConv, setSendingConv] = useState(false);

  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState<'lead' | 'checkin' | 'checkout'>('lead');
  const [leadPhotoUrl, setLeadPhotoUrl] = useState<string | null>(null);
  const [leadPhotoBlob, setLeadPhotoBlob] = useState<Blob | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [geoLocation, setGeoLocation] = useState<GeoLocation | null>(null);
  const [geoError, setGeoError] = useState('');
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown');

  const [attendance, setAttendance] = useState<any[]>([]);
  const [todayRecord, setTodayRecord] = useState<any | null>(null);
  const [attLoading, setAttLoading] = useState(false);
  const [attCapturing, setAttCapturing] = useState(false);

  const loadAttendance = useCallback(async () => {
    if (!user) return;
    setAttLoading(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('staff_user_id', user.id)
        .order('attendance_date', { ascending: false })
        .limit(30);
      const records = data || [];
      setAttendance(records);
      setTodayRecord(records.find((a: any) => a.attendance_date === today) || null);
    } finally {
      setAttLoading(false);
    }
  }, [user]);

  const loadMyLeads = useCallback(async () => {
    if (!user) return;
    setLoadingLeads(true);
    try {
      const { data } = await supabase
        .from('marketing_leads').select('*')
        .eq('executive_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(300);
      setMyLeads(data || []);
    } finally {
      setLoadingLeads(false);
    }
  }, [user]);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    setConvLoading(true);
    try {
      const { data: myLeadsData } = await supabase.from('marketing_leads').select('id').eq('executive_user_id', user.id);
      const leadIds = (myLeadsData || []).map((l: any) => l.id);
      if (leadIds.length === 0) { setAllConversations([]); return; }
      const { data } = await supabase
        .from('lead_remarks')
        .select('*, lead:marketing_leads(full_name, contact_number)')
        .in('lead_id', leadIds)
        .order('created_at', { ascending: false })
        .limit(200);
      setAllConversations((data || []) as LeadRemark[]);
    } finally {
      setConvLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'my_leads') loadMyLeads();
    if (activeTab === 'attendance') loadAttendance();
    if (activeTab === 'conversations') loadConversations();
  }, [activeTab, loadMyLeads, loadAttendance, loadConversations]);

  const getLocation = useCallback((): Promise<GeoLocation> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) { reject(new Error('Geolocation not supported')); return; }
      navigator.geolocation.getCurrentPosition(
        async pos => {
          const { latitude: lat, longitude: lng } = pos.coords;
          let address = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
            const d = await res.json();
            if (d.display_name) address = d.display_name;
          } catch { }
          resolve({ lat, lng, address });
        },
        err => reject(err),
        { enableHighAccuracy: true, timeout: 15000 }
      );
    });
  }, []);

  const captureLocation = useCallback(async (silent = false) => {
    if (!silent) { setGettingLocation(true); setGeoError(''); }
    try {
      const loc = await getLocation();
      setGeoLocation(loc);
      setLocationPermission('granted');
      setGeoError('');
    } catch (err: any) {
      if (err?.code === 1) {
        setLocationPermission('denied');
        if (!silent) setGeoError('Location access was denied. To enable: tap the lock/info icon in your browser address bar → Site Settings → Allow Location.');
      } else {
        if (!silent) setGeoError('Could not get location. Please try again.');
      }
    }
    if (!silent) setGettingLocation(false);
  }, [getLocation]);

  useEffect(() => {
    if (!navigator.geolocation) { setLocationPermission('denied'); return; }
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        setLocationPermission(result.state as 'prompt' | 'granted' | 'denied');
        if (result.state === 'granted') captureLocation(true);
        result.onchange = () => {
          setLocationPermission(result.state as 'prompt' | 'granted' | 'denied');
          if (result.state === 'granted') captureLocation(true);
        };
      });
    } else {
      captureLocation(true);
    }
  }, [captureLocation]);

  function handlePhotoCapture(dataUrl: string, blob: Blob) {
    if (cameraMode === 'lead') {
      setLeadPhotoUrl(dataUrl);
      setLeadPhotoBlob(blob);
      setShowCamera(false);
    } else {
      handleAttendanceSelfie(blob, cameraMode === 'checkin' ? 'check_in' : 'check_out');
      setShowCamera(false);
    }
  }

  async function uploadSelfie(blob: Blob, filename: string): Promise<string | null> {
    const { data, error } = await supabase.storage.from('attendance-selfies').upload(filename, blob, { contentType: 'image/jpeg', upsert: false });
    if (error || !data) return null;
    const { data: urlData } = supabase.storage.from('attendance-selfies').getPublicUrl(data.path);
    return urlData.publicUrl;
  }

  async function handleAttendanceSelfie(blob: Blob, type: 'check_in' | 'check_out') {
    if (!user) return;
    setAttCapturing(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const now = new Date();
      const nowIso = now.toISOString();

      let loc: GeoLocation | null = null;
      try { loc = await getLocation(); } catch { }

      const filename = `${user.id}/${today}_${type}_${Date.now()}.jpg`;
      const selfieUrl = await uploadSelfie(blob, filename);

      if (type === 'check_in') {
        await supabase.from('attendance_records').upsert({
          staff_user_id: user.id,
          attendance_date: today,
          check_in_time: nowIso,
          check_in_selfie_url: selfieUrl || null,
          check_in_lat: loc?.lat || null,
          check_in_lng: loc?.lng || null,
          check_in_address: loc?.address || null,
          status: 'present',
        }, { onConflict: 'staff_user_id,attendance_date' });
      } else {
        const { data: fresh } = await supabase.from('attendance_records').select('*').eq('staff_user_id', user.id).eq('attendance_date', today).maybeSingle();
        if (fresh) {
          const workHours = fresh.check_in_time
            ? Math.round(((now.getTime() - new Date(fresh.check_in_time).getTime()) / 3600000) * 10) / 10
            : 0;
          await supabase.from('attendance_records').update({
            check_out_time: nowIso,
            check_out_selfie_url: selfieUrl || null,
            check_out_lat: loc?.lat || null,
            check_out_lng: loc?.lng || null,
            check_out_address: loc?.address || null,
            work_hours: workHours,
            updated_at: nowIso,
          }).eq('id', fresh.id);
        }
      }
      await loadAttendance();
    } finally {
      setAttCapturing(false);
    }
  }

  async function uploadLeadPhoto(): Promise<string | null> {
    if (!leadPhotoBlob || !user) return null;
    const filename = `${user.id}/${Date.now()}.jpg`;
    const { data, error } = await supabase.storage.from('lead-photos').upload(filename, leadPhotoBlob, { contentType: 'image/jpeg', upsert: false });
    if (error || !data) return null;
    const { data: urlData } = supabase.storage.from('lead-photos').getPublicUrl(data.path);
    return urlData.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!formData.full_name || !formData.contact_number || !formData.location || !formData.requirement) {
      setError('Please fill in all required fields.'); return;
    }
    setSubmitting(true);
    const photoUrl = await uploadLeadPhoto();
    const payload = {
      ...formData,
      collected_by: user?.full_name || user?.email || '',
      executive_user_id: user?.id,
      status: 'new',
      lead_photo_url: photoUrl || null,
      latitude: geoLocation?.lat || null,
      longitude: geoLocation?.lng || null,
      location_address: geoLocation?.address || null,
    };
    const { error: dbError } = await supabase.from('marketing_leads').insert([payload]);
    setSubmitting(false);
    if (dbError) { setError('Failed to submit. Please try again.'); return; }
    setSubmitted(true);
  }

  async function sendConvRemark() {
    if (!convNewRemark.trim() || !convSelectedLeadId || !user) return;
    setSendingConv(true);
    try {
      await supabase.from('lead_remarks').insert({
        lead_id: convSelectedLeadId,
        user_id: user.id,
        user_name: user.full_name,
        user_role: user.role,
        remark: convNewRemark.trim(),
        call_type: convCallType,
      });
      setConvNewRemark('');
      await loadConversations();
    } finally {
      setSendingConv(false);
    }
  }

  async function toggleLeadExpand(lead: any) {
    if (expandedId === lead.id) { setExpandedId(null); return; }
    setExpandedId(lead.id);
    setInlineRemark('');
    if (!remarksMap[lead.id]) {
      setLoadingRemarksId(lead.id);
      try {
        const { data } = await supabase.from('lead_remarks').select('*').eq('lead_id', lead.id).order('created_at', { ascending: true });
        setRemarksMap(prev => ({ ...prev, [lead.id]: (data || []) as LeadRemark[] }));
      } finally {
        setLoadingRemarksId(null);
      }
    }
  }

  async function sendLeadInlineRemark(lead: any) {
    if (!inlineRemark.trim() || !user) return;
    setSendingInline(true);
    try {
      const now = new Date().toISOString();
      await supabase.from('lead_remarks').insert({
        lead_id: lead.id, user_id: user.id,
        user_name: user.full_name, user_role: user.role,
        remark: inlineRemark.trim(), call_type: inlineCallType,
      });
      await supabase.from('marketing_leads').update({
        last_called_at: now,
        follow_up_count: (lead.follow_up_count || 0) + 1,
        updated_at: now,
      }).eq('id', lead.id);
      const { data } = await supabase.from('lead_remarks').select('*').eq('lead_id', lead.id).order('created_at', { ascending: true });
      setRemarksMap(prev => ({ ...prev, [lead.id]: (data || []) as LeadRemark[] }));
      setMyLeads(prev => prev.map(l => l.id === lead.id ? { ...l, follow_up_count: (l.follow_up_count || 0) + 1 } : l));
      setInlineRemark('');
    } finally {
      setSendingInline(false);
    }
  }

  const filteredConversations = allConversations.filter(r => {
    if (!convSearch) return true;
    const q = convSearch.toLowerCase();
    return (
      (r.remark || '').toLowerCase().includes(q) ||
      (r.user_name || '').toLowerCase().includes(q) ||
      (r.lead as any)?.full_name?.toLowerCase().includes(q) ||
      (r.lead as any)?.contact_number?.includes(q)
    );
  });

  function resetForm() {
    setFormData(emptyForm);
    setSubmitted(false);
    setError('');
    setLeadPhotoUrl(null);
    setLeadPhotoBlob(null);
    setGeoLocation(null);
    setGeoError('');
  }

  if (!user || user.role !== 'marketing_executive') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">Access Denied</h2>
          <p className="text-slate-400 text-sm mb-6">You do not have permission to access the executive portal.</p>
          <button onClick={signOut} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl text-sm hover:bg-red-500/30 transition-colors">Sign Out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-none">{user?.full_name}</p>
              <p className="text-slate-500 text-xs">Marketing Executive</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ProfileAvatar size="sm" />
            <button onClick={signOut} className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 transition-colors text-sm">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4">
        {activeTab === 'submit' && (
          <>
            {submitted ? (
              <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 text-center mt-4">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Lead Submitted!</h3>
                <p className="text-slate-400 text-sm mb-6">The lead has been recorded and will be assigned to a telecaller.</p>
                <button onClick={resetForm} className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl">Add Another Lead</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <h2 className="text-white font-semibold">Customer Information</h2>
                  {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="text" name="full_name" value={formData.full_name} onChange={e => setFormData(p => ({ ...p, full_name: e.target.value }))} placeholder="Customer's full name"
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Contact No. <span className="text-red-400">*</span></label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="tel" name="contact_number" value={formData.contact_number} onChange={e => setFormData(p => ({ ...p, contact_number: e.target.value }))} placeholder="Primary"
                          className="w-full pl-10 pr-3 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm" required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Alternate No.</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="tel" name="alternate_number" value={formData.alternate_number} onChange={e => setFormData(p => ({ ...p, alternate_number: e.target.value }))} placeholder="Optional"
                          className="w-full pl-10 pr-3 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Location / Area <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="text" name="location" value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} placeholder="City / Area / Locality"
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm" required />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Address</label>
                    <textarea name="address" value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} placeholder="Street address (optional)" rows={2}
                      className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm resize-none" />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">GPS Location</label>
                    {geoLocation ? (
                      <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                        <Navigation className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-green-400 text-xs font-medium">Location Captured</p>
                          <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{geoLocation.address}</p>
                        </div>
                        <button type="button" onClick={() => captureLocation()} disabled={gettingLocation} className="text-amber-400 hover:text-amber-300 shrink-0 text-xs font-medium mr-1">
                          {gettingLocation ? <Loader className="w-3.5 h-3.5 animate-spin" /> : 'Refresh'}
                        </button>
                        <button type="button" onClick={() => setGeoLocation(null)} className="text-slate-500 hover:text-white shrink-0"><X className="w-4 h-4" /></button>
                      </div>
                    ) : locationPermission === 'denied' ? (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl space-y-2">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-red-400 text-xs font-semibold">Location Access Blocked</p>
                            <p className="text-slate-400 text-xs mt-0.5">To enable GPS for leads, allow location access in your browser:</p>
                          </div>
                        </div>
                        <ol className="text-xs text-slate-400 space-y-1 pl-2 list-decimal list-inside">
                          <li>Tap the <span className="text-white font-medium">lock icon</span> in the address bar</li>
                          <li>Select <span className="text-white font-medium">Site settings</span></li>
                          <li>Set <span className="text-white font-medium">Location</span> to <span className="text-green-400 font-medium">Allow</span></li>
                          <li>Refresh this page</li>
                        </ol>
                        <button type="button" onClick={() => captureLocation()} disabled={gettingLocation}
                          className="w-full flex items-center justify-center gap-2 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium transition-colors disabled:opacity-60">
                          {gettingLocation ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
                          Try Again
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => captureLocation()} disabled={gettingLocation}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500/10 border border-amber-500/30 border-dashed rounded-xl text-amber-400 hover:bg-amber-500/20 hover:border-amber-500 transition-colors text-sm disabled:opacity-60 font-medium">
                        {gettingLocation ? <><Loader className="w-4 h-4 animate-spin" /> Getting location...</> : <><Navigation className="w-4 h-4" /> Allow & Capture Location</>}
                      </button>
                    )}
                    {geoError && locationPermission !== 'denied' && <p className="text-red-400 text-xs mt-1.5 flex items-start gap-1"><AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />{geoError}</p>}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <h2 className="text-white font-semibold">Requirement Details</h2>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Requirement <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <select name="requirement" value={formData.requirement} onChange={e => setFormData(p => ({ ...p, requirement: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm appearance-none" required>
                        <option value="">Select requirement</option>
                        {REQUIREMENTS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Priority</label>
                    <div className="grid grid-cols-3 gap-2">
                      {PRIORITIES.map(p => (
                        <button key={p.value} type="button" onClick={() => setFormData(prev => ({ ...prev, priority: p.value }))}
                          className={`py-2 rounded-xl text-xs font-medium border transition-all ${formData.priority === p.value ? `border-amber-500/50 bg-amber-500/10 ${p.color}` : 'border-slate-700 bg-slate-800/60 text-slate-400'}`}>
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Additional Notes</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <textarea name="requirement_details" value={formData.requirement_details} onChange={e => setFormData(p => ({ ...p, requirement_details: e.target.value }))}
                        placeholder="Budget, timeline, specific needs..." rows={3}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm resize-none" />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h2 className="text-white font-semibold">Lead Photo</h2>
                  <p className="text-slate-500 text-xs">Take a photo of the customer, site, or their requirement.</p>
                  {leadPhotoUrl ? (
                    <div className="relative">
                      <img src={leadPhotoUrl} alt="Lead" className="w-full rounded-xl object-cover max-h-48" />
                      <button type="button" onClick={() => { setLeadPhotoUrl(null); setLeadPhotoBlob(null); }}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-black"><X className="w-4 h-4" /></button>
                      <button type="button" onClick={() => { setCameraMode('lead'); setShowCamera(true); }}
                        className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 py-1.5 bg-black/70 rounded-lg text-white text-xs hover:bg-black">
                        <Camera className="w-3 h-3" /> Retake
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => { setCameraMode('lead'); setShowCamera(true); }}
                      className="w-full flex flex-col items-center justify-center gap-2 py-8 bg-slate-800/60 border border-slate-700 border-dashed rounded-xl text-slate-400 hover:text-white hover:border-amber-500 transition-colors">
                      <Camera className="w-8 h-8" />
                      <span className="text-sm">Open Camera</span>
                    </button>
                  )}
                </div>

                <button type="submit" disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-700 disabled:opacity-60 transition-all text-base shadow-lg shadow-amber-500/10">
                  {submitting ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</> : <><Send className="w-5 h-5" />Submit Lead</>}
                </button>
              </form>
            )}
          </>
        )}

        {activeTab === 'my_leads' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">My Submitted Leads</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">{myLeads.length} total</span>
                <button onClick={loadMyLeads} className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-amber-400 transition-colors">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
            {loadingLeads ? (
              <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" /></div>
            ) : myLeads.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No leads submitted yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {myLeads.map(lead => {
                  const isExpanded = expandedId === lead.id;
                  const leadRemarks = remarksMap[lead.id] || [];
                  return (
                    <div key={lead.id} className={`bg-slate-900 border rounded-xl transition-all ${isExpanded ? 'border-amber-500/40' : 'border-slate-800 hover:border-slate-700'}`}>
                      <div className="p-4">
                        <div className="flex gap-3">
                          {lead.lead_photo_url && <img src={lead.lead_photo_url} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-700" />}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="text-white font-semibold text-sm">{lead.full_name}</h3>
                              <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap font-medium ${STATUS_COLORS[lead.status] || 'bg-slate-700 text-slate-400'}`}>
                                {STATUS_LABELS[lead.status] || lead.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.contact_number}</span>
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{lead.location}</span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1">{lead.requirement} · {new Date(lead.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => toggleLeadExpand(lead)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              isExpanded ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            {leadRemarks.length > 0 ? `${leadRemarks.length} notes` : 'Log note'}
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-slate-800 bg-slate-950/40">
                          <div className="max-h-60 overflow-y-auto px-4 py-3 space-y-3">
                            {loadingRemarksId === lead.id ? (
                              <div className="flex justify-center py-4">
                                <div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                              </div>
                            ) : leadRemarks.length === 0 ? (
                              <p className="text-slate-600 text-xs text-center py-4">No notes yet — log your first field visit below</p>
                            ) : leadRemarks.map((r, idx) => {
                              const meta = CALL_TYPE_META[r.call_type] || CALL_TYPE_META.general;
                              const dt = new Date(r.created_at);
                              const timeStr = dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ' · ' + dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
                              return (
                                <div key={r.id} className="relative pl-7">
                                  {idx < leadRemarks.length - 1 && <div className="absolute left-2.5 top-6 bottom-0 w-px bg-slate-800" />}
                                  <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
                                    {(r.user_name || '?').charAt(0).toUpperCase()}
                                  </div>
                                  <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-2.5">
                                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                      <span className="text-white text-xs font-semibold">{r.user_name}</span>
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${ROLE_COLORS[r.user_role] || 'text-slate-400 bg-slate-700'}`}>{r.user_role.replace(/_/g, ' ')}</span>
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium border ${meta.bg} ${meta.color}`}>{meta.label}</span>
                                      <span className="text-slate-500 text-[10px] ml-auto">{timeStr}</span>
                                    </div>
                                    <p className="text-slate-300 text-xs leading-relaxed">{r.remark}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="px-4 pb-4 pt-2 border-t border-slate-800 space-y-2">
                            <div className="flex gap-1.5">
                              {EXEC_CALL_TYPE_OPTIONS.map(opt => (
                                <button key={opt.value} onClick={() => setInlineCallType(opt.value)}
                                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                    inlineCallType === opt.value
                                      ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                                      : 'border-slate-700 bg-slate-800/60 text-slate-500 hover:text-slate-300'
                                  }`}>
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <textarea
                                value={inlineRemark}
                                onChange={e => setInlineRemark(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendLeadInlineRemark(lead); } }}
                                placeholder="Log your field visit or meeting notes... (Enter to send)"
                                rows={2}
                                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs resize-none"
                              />
                              <button onClick={() => sendLeadInlineRemark(lead)} disabled={sendingInline || !inlineRemark.trim()}
                                className="self-end p-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors disabled:opacity-40">
                                {sendingInline ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'conversations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">All Conversations</h2>
              <button onClick={loadConversations} className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-amber-400 transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={convSearch} onChange={e => setConvSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <p className="text-xs text-slate-400 font-medium">Log New Entry</p>
              <select
                value={convSelectedLeadId}
                onChange={e => setConvSelectedLeadId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">Select a lead...</option>
                {myLeads.map((l: any) => (
                  <option key={l.id} value={l.id}>{l.full_name} — {l.contact_number}</option>
                ))}
              </select>
              <div className="flex gap-2">
                {EXEC_CALL_TYPE_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setConvCallType(opt.value)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      convCallType === opt.value
                        ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                        : 'border-slate-700 bg-slate-800/60 text-slate-500 hover:text-slate-300'
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <textarea
                  value={convNewRemark}
                  onChange={e => setConvNewRemark(e.target.value)}
                  placeholder={convCallType === 'executive_visit' ? 'Log your field visit or client meeting notes...' : 'Add a general note...'}
                  rows={2}
                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm resize-none"
                />
                <button
                  onClick={sendConvRemark}
                  disabled={!convNewRemark.trim() || !convSelectedLeadId || sendingConv}
                  className="p-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors disabled:opacity-40 self-end"
                >
                  {sendingConv ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {convLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-16">
                <MessageSquare className="w-12 h-12 text-slate-800 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No conversations logged yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredConversations.map((r, idx) => {
                  const meta = CALL_TYPE_META[r.call_type] || CALL_TYPE_META.general;
                  const dt = new Date(r.created_at);
                  const dateStr = dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                  const timeStr = dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
                  return (
                    <div key={r.id} className="relative pl-8">
                      {idx < filteredConversations.length - 1 && (
                        <div className="absolute left-3 top-6 bottom-0 w-px bg-slate-800" />
                      )}
                      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                        {(r.user_name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                        {r.lead && (
                          <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-slate-800">
                            <Phone className="w-3 h-3 text-amber-500 shrink-0" />
                            <span className="text-amber-400 text-xs font-medium">{(r.lead as any).full_name}</span>
                            <span className="text-slate-600 text-xs">· {(r.lead as any).contact_number}</span>
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                          <span className="text-white text-xs font-semibold">{r.user_name}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${ROLE_COLORS[r.user_role] || 'text-slate-400 bg-slate-700'}`}>
                            {r.user_role.replace(/_/g, ' ')}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium border ${meta.bg} ${meta.color}`}>
                            {meta.label}
                          </span>
                          <span className="text-slate-500 text-xs ml-auto shrink-0">
                            {dateStr} · {timeStr}
                          </span>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed">{r.remark}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">My Attendance</h2>
              <button onClick={loadAttendance} className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-amber-400 transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {attLoading ? (
              <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" /></div>
            ) : (
              <>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <p className="text-slate-400 text-xs font-medium mb-3">Today — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long' })}</p>
                  {attCapturing ? (
                    <div className="flex items-center justify-center gap-2 py-4 text-amber-400">
                      <div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                      <span className="text-sm">Processing attendance...</span>
                    </div>
                  ) : todayRecord ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
                          <p className="text-green-400 text-xs mb-1">Checked In</p>
                          <p className="text-white font-bold">{todayRecord.check_in_time ? new Date(todayRecord.check_in_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</p>
                        </div>
                        <div className={`border rounded-xl p-3 text-center ${todayRecord.check_out_time ? 'bg-blue-500/10 border-blue-500/20' : 'bg-slate-800/60 border-slate-700'}`}>
                          <p className={`text-xs mb-1 ${todayRecord.check_out_time ? 'text-blue-400' : 'text-slate-500'}`}>Checked Out</p>
                          <p className="text-white font-bold">{todayRecord.check_out_time ? new Date(todayRecord.check_out_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</p>
                        </div>
                      </div>
                      {todayRecord.check_in_address && (
                        <p className="text-xs text-slate-500 flex items-start gap-1"><Navigation className="w-3 h-3 mt-0.5 shrink-0 text-green-500" />{String(todayRecord.check_in_address).slice(0, 80)}</p>
                      )}
                      {!todayRecord.check_out_time && (
                        <button onClick={() => { setCameraMode('checkout'); setShowCamera(true); }}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-semibold rounded-xl text-sm transition-all">
                          <Camera className="w-4 h-4" /> Check Out with Selfie
                        </button>
                      )}
                    </div>
                  ) : (
                    <button onClick={() => { setCameraMode('checkin'); setShowCamera(true); }}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl text-base transition-all shadow-lg shadow-green-500/10">
                      <Camera className="w-5 h-5" /> Check In with Selfie
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-slate-400 text-xs font-medium">Recent Attendance</p>
                  {attendance.slice(0, 14).map(a => (
                    <div key={a.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
                      <div className="text-center w-12 shrink-0">
                        <p className="text-white font-bold text-sm">{new Date(a.attendance_date).getDate()}</p>
                        <p className="text-slate-500 text-xs">{new Date(a.attendance_date).toLocaleDateString('en-IN', { month: 'short' })}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ATT_STATUS_COLORS[a.status] || 'bg-slate-700 text-slate-400'}`}>
                            {a.status?.replace('_', ' ')}
                          </span>
                          {a.work_hours > 0 && <span className="text-amber-400 text-xs">{Number(a.work_hours).toFixed(1)}h</span>}
                        </div>
                        <p className="text-slate-500 text-xs">
                          {a.check_in_time ? `In: ${new Date(a.check_in_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : ''}
                          {a.check_out_time ? ` · Out: ${new Date(a.check_out_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : ''}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {a.check_in_selfie_url && <img src={a.check_in_selfie_url} alt="in" className="w-9 h-9 rounded-lg object-cover border border-green-500/30" />}
                        {a.check_out_selfie_url && <img src={a.check_out_selfie_url} alt="out" className="w-9 h-9 rounded-lg object-cover border border-blue-500/30" />}
                      </div>
                    </div>
                  ))}
                  {attendance.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No attendance records yet</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-30">
        <div className="max-w-lg mx-auto px-4 flex">
          {[
            { key: 'submit' as Tab, icon: PlusCircle, label: 'Add Lead' },
            { key: 'my_leads' as Tab, icon: ClipboardList, label: 'My Leads' },
            { key: 'conversations' as Tab, icon: MessageSquare, label: 'Chats' },
            { key: 'attendance' as Tab, icon: Clock, label: 'Attendance' },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${activeTab === t.key ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}>
              <t.icon className="w-5 h-5" />
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {showCamera && (
        <CameraCapture
          onCapture={handlePhotoCapture}
          onClose={() => setShowCamera(false)}
          title={cameraMode === 'checkin' ? 'Check In Selfie' : cameraMode === 'checkout' ? 'Check Out Selfie' : 'Lead Photo'}
          hint={cameraMode !== 'lead' ? 'Face the camera clearly for attendance verification' : 'Take a photo of the customer or their site'}
          stampLabel={cameraMode === 'checkin' ? 'CHECK IN' : cameraMode === 'checkout' ? 'CHECK OUT' : undefined}
        />
      )}
    </div>
  );
}
