import { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import SEOHead from './components/SEOHead';
import PWAInstallBanner from './components/PWAInstallBanner';
import { useTheme } from './hooks/useTheme';

// Aadya internal portals
const UnifiedLogin = lazy(() => import('./components/UnifiedLogin'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const ExecutivePortal = lazy(() => import('./components/ExecutivePortal'));
const TelecallerPortal = lazy(() => import('./components/TelecallerPortal'));
const ManagerPortal = lazy(() => import('./components/ManagerPortal'));
const HRPortal = lazy(() => import('./components/HRPortal'));
const EmployeePortal = lazy(() => import('./components/EmployeePortal'));

// SaaS platform
const SaasLanding = lazy(() => import('./components/saas/SaasLanding'));
const SaasAuth = lazy(() => import('./components/saas/SaasAuth'));
const TenantDashboard = lazy(() => import('./components/saas/TenantDashboard'));
const SuperAdminPanel = lazy(() => import('./components/saas/SuperAdminPanel'));
const PrivacyPolicy = lazy(() => import('./components/saas/PrivacyPolicy'));
const TermsConditions = lazy(() => import('./components/saas/TermsConditions'));
const AboutUs = lazy(() => import('./components/saas/AboutUs'));

function PageLoader() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading…</p>
      </div>
    </div>
  );
}

type Route =
  | 'saas-landing'
  | 'saas-signup'
  | 'saas-login'
  | 'tenant-dashboard'
  | 'super-admin'
  | 'privacy'
  | 'terms'
  | 'about'
  | 'aadya-login'
  | 'aadya-portal';

function getRoute(): Route {
  const hash = window.location.hash.replace('#', '');
  const path = window.location.pathname;

  if (hash === 'saas-signup') return 'saas-signup';
  if (hash === 'saas-login') return 'saas-login';
  if (hash === 'tenant-dashboard') return 'tenant-dashboard';
  if (hash === 'super-admin') return 'super-admin';
  if (hash === 'privacy') return 'privacy';
  if (hash === 'terms') return 'terms';
  if (hash === 'about') return 'about';

  // Aadya internal routes (preserved from original)
  if (path === '/login' || hash === 'login') return 'aadya-login';
  if (path === '/admin' || hash === 'admin') return 'aadya-portal';
  if (path === '/portal' || hash === 'portal') return 'aadya-portal';
  if (path === '/employee' || hash === 'employee') return 'aadya-portal';
  if (path === '/myportal' || hash === 'myportal') return 'aadya-portal';

  return 'saas-landing';
}

type SaasUserType = 'super_admin' | 'tenant_owner' | 'none' | 'checking';

function AppContent() {
  const { user, loading } = useAuth();
  const [route, setRoute] = useState<Route>(getRoute());
  const [saasUserType, setSaasUserType] = useState<SaasUserType>('checking');
  useTheme();

  useEffect(() => {
    const checkRoute = () => setRoute(getRoute());
    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);
    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
    };
  }, []);

  // For SaaS routes, check auth session directly (not via AuthContext app_users)
  const checkSaasSession = useCallback(async () => {
    const isSaasRoute = ['saas-login', 'saas-signup', 'tenant-dashboard', 'super-admin', 'saas-landing'].includes(route);
    if (!isSaasRoute) { setSaasUserType('none'); return; }

    setSaasUserType('checking');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { setSaasUserType('none'); return; }

    const uid = session.user.id;
    const { data: sa } = await supabase.from('super_admins').select('id, is_active').eq('id', uid).maybeSingle();
    if (sa && sa.is_active) { setSaasUserType('super_admin'); return; }

    const { data: tenant } = await supabase.from('tenants').select('id').eq('auth_user_id', uid).maybeSingle();
    if (tenant) { setSaasUserType('tenant_owner'); return; }

    setSaasUserType('none');
  }, [route]);

  useEffect(() => { checkSaasSession(); }, [checkSaasSession]);

  // Re-check saas session when auth state changes (handles logout without hash change)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setSaasUserType('none');
      } else if (event === 'SIGNED_IN') {
        checkSaasSession();
      }
    });
    return () => subscription.unsubscribe();
  }, [checkSaasSession]);

  if (loading) return <PageLoader />;

  // ── Static pages (no auth required) ─────────────────────────────
  if (route === 'privacy') {
    return <Suspense fallback={<PageLoader />}><PrivacyPolicy /></Suspense>;
  }
  if (route === 'terms') {
    return <Suspense fallback={<PageLoader />}><TermsConditions /></Suspense>;
  }
  if (route === 'about') {
    return <Suspense fallback={<PageLoader />}><AboutUs /></Suspense>;
  }

  // ── SaaS routes ─────────────────────────────────────────────────
  if (route === 'saas-signup') {
    return <Suspense fallback={<PageLoader />}><SaasAuth mode="signup" /></Suspense>;
  }

  if (route === 'saas-login') {
    if (saasUserType === 'checking') return <PageLoader />;
    if (saasUserType === 'super_admin') {
      window.location.hash = '#super-admin';
      return <PageLoader />;
    }
    if (saasUserType === 'tenant_owner') {
      window.location.hash = '#tenant-dashboard';
      return <PageLoader />;
    }
    return <Suspense fallback={<PageLoader />}><SaasAuth mode="login" /></Suspense>;
  }

  if (route === 'super-admin') {
    if (saasUserType === 'checking') return <PageLoader />;
    if (saasUserType !== 'super_admin') {
      return <Suspense fallback={<PageLoader />}><SaasAuth mode="login" /></Suspense>;
    }
    return <Suspense fallback={<PageLoader />}><SuperAdminPanel /></Suspense>;
  }

  if (route === 'tenant-dashboard') {
    if (saasUserType === 'checking') return <PageLoader />;
    if (saasUserType === 'none') {
      return <Suspense fallback={<PageLoader />}><SaasAuth mode="login" /></Suspense>;
    }
    if (saasUserType === 'super_admin') {
      window.location.hash = '#super-admin';
      return <PageLoader />;
    }
    return <Suspense fallback={<PageLoader />}><TenantDashboard /></Suspense>;
  }

  // ── Aadya internal routes ────────────────────────────────────────
  if (route === 'aadya-login' || route === 'aadya-portal') {
    if (!user) return <Suspense fallback={<PageLoader />}><UnifiedLogin /></Suspense>;
    if (user.role === 'admin') return <Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>;
    if (user.role === 'marketing_executive') return <Suspense fallback={<PageLoader />}><ExecutivePortal /></Suspense>;
    if (user.role === 'telecaller') return <Suspense fallback={<PageLoader />}><TelecallerPortal /></Suspense>;
    if (user.role === 'manager') return <Suspense fallback={<PageLoader />}><ManagerPortal /></Suspense>;
    if (user.role === 'hr') return <Suspense fallback={<PageLoader />}><HRPortal /></Suspense>;
    if (user.role === 'employee') return <Suspense fallback={<PageLoader />}><EmployeePortal /></Suspense>;
    return <Suspense fallback={<PageLoader />}><UnifiedLogin /></Suspense>;
  }

  // ── Default: SaaS landing ─────────────────────────────────────────
  return (
    <>
      <SEOHead />
      <PWAInstallBanner />
      <Suspense fallback={<PageLoader />}>
        <SaasLanding />
      </Suspense>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
