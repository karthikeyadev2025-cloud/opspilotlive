import { useAuth } from '../contexts/AuthContext';
import { Users, LogOut } from 'lucide-react';
import ProfileAvatar from './ProfileAvatar';
import HRManager from './admin/HRManager';

// Portal shell for the 'hr' role. The actual HR functionality (staff,
// payroll, leave, advances, attendance) lives in admin/HRManager.tsx —
// the same component the admin dashboard uses — so there is exactly one
// implementation of HR logic instead of two that can drift apart.
export default function HRPortal() {
  const { user, signOut } = useAuth();

  if (!user || user.role !== 'hr') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">Access Denied</h2>
          <p className="text-slate-400 text-sm mb-6">You do not have permission to access the HR portal.</p>
          <button onClick={signOut} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl text-sm hover:bg-red-500/30 transition-colors">
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-none">HR Portal</h1>
            <p className="text-slate-500 text-xs mt-0.5">{user.full_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/20 text-rose-400 text-xs font-medium rounded-full border border-rose-500/30">
            <Users className="w-3 h-3" /> HR
          </span>
          <ProfileAvatar size="sm" />
          <button onClick={signOut} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6">
        <HRManager />
      </main>
    </div>
  );
}
