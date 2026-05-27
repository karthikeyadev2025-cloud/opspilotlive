import { useEffect, useState } from 'react';
import { TrendingUp, Trash2, Eye, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface InvestmentInquiry {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  investment_amount: string;
  investment_type: string;
  message: string;
  status: string;
  created_at: string;
}

export default function InvestmentsManager() {
  const [inquiries, setInquiries] = useState<InvestmentInquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<InvestmentInquiry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInquiries();
  }, []);

  async function loadInquiries() {
    setLoading(true);
    const { data } = await supabase
      .from('investment_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setInquiries(data);
    setLoading(false);
  }

  async function deleteInquiry(id: string) {
    if (!confirm('Delete this inquiry?')) return;

    await supabase.from('investment_inquiries').delete().eq('id', id);
    loadInquiries();
  }

  async function updateStatus(id: string, status: string) {
    await supabase
      .from('investment_inquiries')
      .update({ status })
      .eq('id', id);

    loadInquiries();
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      contacted: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      interested: 'bg-green-500/20 text-green-400 border-green-500/30',
      closed: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
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
          <TrendingUp className="w-8 h-8 text-green-500" />
          <h2 className="text-3xl font-bold text-white">Investment Inquiries</h2>
        </div>
        <div className="text-sm text-slate-400">
          Total: {inquiries.length}
        </div>
      </div>

      <div className="grid gap-4">
        {inquiries.map((inquiry) => (
          <div
            key={inquiry.id}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-green-500/50 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{inquiry.full_name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(inquiry.status)}`}>
                    {inquiry.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-slate-400">Investment Amount</p>
                    <p className="text-white font-medium">{inquiry.investment_amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Investment Type</p>
                    <p className="text-white font-medium">{inquiry.investment_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Email</p>
                    <p className="text-white font-medium">{inquiry.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Phone</p>
                    <p className="text-white font-medium">{inquiry.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Submitted</p>
                    <p className="text-white font-medium">
                      {new Date(inquiry.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedInquiry(inquiry)}
                  className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                  title="View Details"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={() => deleteInquiry(inquiry.id)}
                  className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              {['new', 'contacted', 'interested', 'closed'].map((status) => (
                <button
                  key={status}
                  onClick={() => updateStatus(inquiry.id, status)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    inquiry.status === status
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

      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Inquiry Details</h3>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-400 mb-1">Message</p>
                <p className="text-white p-4 bg-slate-900 rounded-lg whitespace-pre-wrap">
                  {selectedInquiry.message || 'No message provided'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {inquiries.length === 0 && (
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400">No inquiries yet</p>
        </div>
      )}
    </div>
  );
}
