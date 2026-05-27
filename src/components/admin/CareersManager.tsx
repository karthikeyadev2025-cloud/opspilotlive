import { useEffect, useState } from 'react';
import { Briefcase, Trash2, Eye, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CareerApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  location: string;
  cover_letter: string;
  status: string;
  created_at: string;
}

export default function CareersManager() {
  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<CareerApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    setLoading(true);
    const { data } = await supabase
      .from('career_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setApplications(data);
    setLoading(false);
  }

  async function deleteApplication(id: string) {
    if (!confirm('Delete this application?')) return;

    await supabase.from('career_applications').delete().eq('id', id);
    loadApplications();
  }

  async function updateStatus(id: string, status: string) {
    await supabase
      .from('career_applications')
      .update({ status })
      .eq('id', id);

    loadApplications();
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      reviewing: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      contacted: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
      hired: 'bg-green-500/20 text-green-400 border-green-500/30'
    };
    return colors[status] || colors.new;
  };

  if (loading) {
    return <div className="text-white p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Briefcase className="w-8 h-8 text-amber-500" />
          <h2 className="text-3xl font-bold text-white">Career Applications</h2>
        </div>
        <div className="text-sm text-slate-400">
          Total: {applications.length}
        </div>
      </div>

      <div className="grid gap-4">
        {applications.map((app) => (
          <div
            key={app.id}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-amber-500/50 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{app.full_name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-slate-400">Position</p>
                    <p className="text-white font-medium">{app.position}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Experience</p>
                    <p className="text-white font-medium">{app.experience || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Email</p>
                    <p className="text-white font-medium">{app.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Phone</p>
                    <p className="text-white font-medium">{app.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Location</p>
                    <p className="text-white font-medium">{app.location || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Applied</p>
                    <p className="text-white font-medium">
                      {new Date(app.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedApp(app)}
                  className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                  title="View Details"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={() => deleteApplication(app.id)}
                  className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              {['new', 'reviewing', 'contacted', 'rejected', 'hired'].map((status) => (
                <button
                  key={status}
                  onClick={() => updateStatus(app.id, status)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    app.status === status
                      ? getStatusColor(status)
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedApp && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Application Details</h3>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-400 mb-1">Cover Letter</p>
                <p className="text-white p-4 bg-slate-900 rounded-lg whitespace-pre-wrap">
                  {selectedApp.cover_letter || 'No cover letter provided'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {applications.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400">No applications yet</p>
        </div>
      )}
    </div>
  );
}
