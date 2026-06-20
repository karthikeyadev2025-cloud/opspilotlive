import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { logLogin, logLogout, logAccountDisabled } from '../lib/securityLogger';

export type UserRole = 'admin' | 'marketing_executive' | 'telecaller' | 'manager' | 'hr' | 'employee' | string;

export interface AppUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone: string;
  is_active: boolean;
  profile_photo_url?: string | null;
  custom_role_id?: string | null;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchAppUser(userId: string): Promise<AppUser | null> {
  const { data } = await supabase
    .from('app_users')
    .select('id, email, full_name, role, phone, is_active, profile_photo_url, custom_role_id')
    .eq('id', userId)
    .maybeSingle();
  return data as AppUser | null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async (userId: string, email: string) => {
    const appUser = await fetchAppUser(userId);
    if (appUser) {
      if (!appUser.is_active) {
        logAccountDisabled({ userId, email, fullName: appUser.full_name, role: appUser.role });
        await supabase.auth.signOut();
        setUser(null);
      } else {
        setUser(appUser);
      }
    } else {
      // Not an app_user — could be a SaaS super admin or tenant owner. Keep session alive.
      // App.tsx will check super_admins / tenants tables independently.
      const { data: sa } = await supabase.from('super_admins').select('id').eq('id', userId).maybeSingle();
      if (sa) { setUser(null); return; }
      const { data: tenant } = await supabase.from('tenants').select('id').eq('auth_user_id', userId).maybeSingle();
      if (tenant) { setUser(null); return; }
      // Truly unknown user — sign out
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  const refreshUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await loadUser(session.user.id, session.user.email!);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await loadUser(session.user.id, session.user.email!);
        }
      } finally {
        setLoading(false);
      }
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) {
          await loadUser(session.user.id, session.user.email!);
        } else {
          setUser(null);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      logLogin({ email, success: false, failureReason: error.message });
      return { error: error.message };
    }
    if (data.user) {
      const appUser = await fetchAppUser(data.user.id);
      if (appUser && !appUser.is_active) {
        logAccountDisabled({ userId: data.user.id, email, fullName: appUser.full_name, role: appUser.role });
        await supabase.auth.signOut();
        return { error: 'Your account has been disabled. Contact admin.' };
      }
      logLogin({
        userId: data.user.id,
        email,
        fullName: appUser?.full_name || email,
        role: appUser?.role || '',
        success: true,
        sessionId: data.session?.access_token?.slice(-12) || '',
      });
      await loadUser(data.user.id, data.user.email!);
    }
    return { error: null };
  };

  const signOut = async () => {
    if (user) {
      logLogout({ userId: user.id, email: user.email, fullName: user.full_name, role: user.role });
    }
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
