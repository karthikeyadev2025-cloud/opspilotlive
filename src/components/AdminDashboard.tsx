import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  LogOut, FileText, Briefcase, Image, MessageSquare, Home, Sun, Camera,
  Users, Award, Settings, User, TrendingUp, UserCheck, LayoutDashboard,
  Menu, X, Phone, Shield, HeartHandshake, ChevronDown, ChevronRight,
  Lock
} from 'lucide-react';
import DashboardOverview from './admin/DashboardOverview';
import ContentEditor from './admin/ContentEditor';
import ServicesManager from './admin/ServicesManager';
import GalleryManager from './admin/GalleryManager';
import TestimonialsManager from './admin/TestimonialsManager';
import SolarManager from './admin/SolarManager';
import CCTVManager from './admin/CCTVManager';
import TechniciansManager from './admin/TechniciansManager';
import BenefitsManager from './admin/BenefitsManager';
import SettingsManager from './admin/SettingsManager';
import MDManager from './admin/MDManager';
import CareersManager from './admin/CareersManager';
import InvestmentsManager from './admin/InvestmentsManager';
import MarketingLeadsManager from './admin/MarketingLeadsManager';
import UserManager from './admin/UserManager';
import HRManager from './admin/HRManager';
import SecurityLogs from './admin/SecurityLogs';
import RolePermissionsManager from './admin/RolePermissionsManager';
import LeadsDashboard from './LeadsDashboard';
import ProfileAvatar from './ProfileAvatar';

type Tab =
  | 'overview' | 'leads_analytics'
  | 'users' | 'roles' | 'hr'
  | 'marketing' | 'investments' | 'careers'
  | 'content' | 'md' | 'services' | 'solar' | 'cctv' | 'benefits' | 'gallery' | 'testimonials' | 'technicians'
  | 'security' | 'settings';

interface NavItem { id: Tab; label: string; icon: React.ElementType; badge?: number }
interface NavGroup { label: string; icon: React.ElementType; items: NavItem[]; defaultOpen?: boolean }

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    icon: LayoutDashboard,
    defaultOpen: true,
    items: [
      { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'leads_analytics', label: 'Leads Analytics', icon: TrendingUp },
    ],
  },
  {
    label: 'Staff & HR',
    icon: Users,
    defaultOpen: true,
    items: [
      { id: 'users', label: 'Staff Accounts', icon: Users },
      { id: 'roles', label: 'Roles & Permissions', icon: Lock },
      { id: 'hr', label: 'HR Management', icon: HeartHandshake },
    ],
  },
  {
    label: 'Sales & Leads',
    icon: UserCheck,
    defaultOpen: true,
    items: [
      { id: 'marketing', label: 'Marketing Leads', icon: UserCheck },
      { id: 'investments', label: 'Investments', icon: TrendingUp },
      { id: 'careers', label: 'Careers', icon: Briefcase },
    ],
  },
  {
    label: 'Website Content',
    icon: FileText,
    defaultOpen: false,
    items: [
      { id: 'content', label: 'Site Content', icon: FileText },
      { id: 'md', label: 'MD Profile', icon: User },
      { id: 'services', label: 'Services', icon: Briefcase },
      { id: 'solar', label: 'Solar Details', icon: Sun },
      { id: 'cctv', label: 'CCTV Details', icon: Camera },
      { id: 'benefits', label: 'Benefits', icon: Award },
      { id: 'gallery', label: 'Gallery', icon: Image },
      { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
      { id: 'technicians', label: 'Technicians', icon: Phone },
    ],
  },
  {
    label: 'System',
    icon: Shield,
    defaultOpen: false,
    items: [
      { id: 'security', label: 'Security Logs', icon: Shield },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

const TAB_LABELS: Partial<Record<Tab, string>> = {
  overview: 'Dashboard', leads_analytics: 'Leads Analytics',
  users: 'Staff Accounts', roles: 'Roles & Permissions', hr: 'HR Management',
  marketing: 'Marketing Leads', investments: 'Investments', careers: 'Careers',
  content: 'Site Content', md: 'MD Profile', services: 'Services',
  solar: 'Solar Details', cctv: 'CCTV Details', benefits: 'Benefits',
  gallery: 'Gallery', testimonials: 'Testimonials', technicians: 'Technicians',
  security: 'Security Logs', settings: 'Settings',
};

function SidebarContent({
  activeTab, onTabChange, onClose, user, signOut
}: {
  activeTab: Tab;
  onTabChange: (t: Tab) => void;
  onClose?: () => void;
  user: any;
  signOut: () => void;
}) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    NAV_GROUPS.forEach(g => { init[g.label] = g.defaultOpen ?? true; });
    return init;
  });

  function toggleGroup(label: string) {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
  }

  return (
    <div className="flex flex-col h-full w-64 bg-slate-900 border-r border-slate-800">
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold text-sm leading-none">Admin Panel</p>
            <p className="text-slate-500 text-xs mt-0.5 truncate">{user?.full_name}</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 shrink-0">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV_GROUPS.map(group => {
          const isOpen = openGroups[group.label] !== false;
          const GroupIcon = group.icon;
          const hasActive = group.items.some(i => i.id === activeTab);

          return (
            <div key={group.label} className="mb-1">
              <button
                onClick={() => toggleGroup(group.label)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                  hasActive ? 'text-amber-400/80' : 'text-slate-500 hover:text-slate-400'
                } hover:bg-slate-800/60`}
              >
                <GroupIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="flex-1 text-left">{group.label}</span>
                {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {isOpen && (
                <div className="mt-0.5 ml-2 pl-2 border-l border-slate-800 space-y-0.5">
                  {group.items.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400 border border-amber-500/20'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate flex-1">{item.label}</span>
                        {item.badge ? (
                          <span className="ml-auto min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 shrink-0">
                            {item.badge}
                          </span>
                        ) : isActive ? (
                          <div className="ml-auto w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800 space-y-1">
        <a href="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all">
          <Home className="w-4 h-4 shrink-0" />
          <span>View Site</span>
        </a>
        <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { signOut, user } = useAuth();

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">Access Denied</h2>
          <p className="text-slate-400 text-sm mb-6">You do not have permission to access the admin panel.</p>
          <button onClick={signOut} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl text-sm hover:bg-red-500/30 transition-colors">Sign Out</button>
        </div>
      </div>
    );
  }

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <div className="hidden md:flex shrink-0">
        <SidebarContent activeTab={activeTab} onTabChange={handleTabChange} user={user} signOut={signOut} />
      </div>

      {mobileSidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setMobileSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 md:hidden">
            <SidebarContent activeTab={activeTab} onTabChange={handleTabChange} onClose={() => setMobileSidebarOpen(false)} user={user} signOut={signOut} />
          </div>
        </>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 h-14 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileSidebarOpen(true)} className="md:hidden p-2 hover:bg-slate-800 rounded-lg text-slate-400">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-white font-semibold text-sm sm:text-base">{TAB_LABELS[activeTab] || 'Dashboard'}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-xl">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-slate-300 text-sm">{user?.full_name}</span>
              <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">Admin</span>
            </div>
            <ProfileAvatar size="md" />
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'overview' && <DashboardOverview />}
            {activeTab === 'leads_analytics' && <div className="p-6"><LeadsDashboard isAdmin /></div>}
            {activeTab === 'users' && <UserManager />}
            {activeTab === 'roles' && <RolePermissionsManager />}
            {activeTab === 'hr' && <HRManager />}
            {activeTab === 'content' && <div className="p-6"><ContentEditor /></div>}
            {activeTab === 'md' && <div className="p-6"><MDManager /></div>}
            {activeTab === 'services' && <div className="p-6"><ServicesManager /></div>}
            {activeTab === 'solar' && <div className="p-6"><SolarManager /></div>}
            {activeTab === 'cctv' && <div className="p-6"><CCTVManager /></div>}
            {activeTab === 'technicians' && <div className="p-6"><TechniciansManager /></div>}
            {activeTab === 'benefits' && <div className="p-6"><BenefitsManager /></div>}
            {activeTab === 'gallery' && <div className="p-6"><GalleryManager /></div>}
            {activeTab === 'testimonials' && <div className="p-6"><TestimonialsManager /></div>}
            {activeTab === 'careers' && <div className="p-6"><CareersManager /></div>}
            {activeTab === 'investments' && <div className="p-6"><InvestmentsManager /></div>}
            {activeTab === 'marketing' && <MarketingLeadsManager />}
            {activeTab === 'security' && <div className="p-6"><SecurityLogs /></div>}
            {activeTab === 'settings' && <div className="p-6"><SettingsManager /></div>}
          </div>
        </main>
      </div>
    </div>
  );
}
