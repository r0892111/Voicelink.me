import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate, matchPath } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAuth, type AuthUser } from '../hooks/useAuth';
import { useWhatsAppConnect } from '../hooks/useWhatsAppConnect';
import { useTeamRole } from '../hooks/useTeamRole';
import { supabase } from '../lib/supabase';
import { StripeService } from '../services/stripeService';
import { DEFAULT_TIER } from '../config/teamPricing';
import { withUTM } from '../utils/utm';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardTopBar } from './DashboardTopBar';
import { DashboardContext, type SubscriptionInfo } from '../hooks/useDashboardContext';

// Dev-only impersonation: karel@... — a real teamleader_users row with
// analytics data (120 messages, $3.10 spend as of 2026-04-12). Used when
// running `npm run dev` without a Supabase session so the team can verify
// actual data paths against a known fixture.
const DEV_PREVIEW_USER: AuthUser = {
  id: '0f6b55f0-8124-4788-bdf3-eb7e5c77e410',
  email: 'karel.vanransbeeck@outlook.be',
  name: 'Karel Van Ransbeeck',
  platform: 'teamleader',
  user_info: {
    name: 'Karel Van Ransbeeck',
    email: 'karel.vanransbeeck@outlook.be',
    teamleader_id: '3e7a2d42-5df2-09ad-b852-a7384ab77b3a',
  },
};

const PRICE_ID = DEFAULT_TIER.monthlyPriceId;

const PAGE_TITLES: Array<{ pattern: string; title: string }> = [
  { pattern: '/dashboard', title: 'Dashboard' },
  { pattern: '/dashboard/team', title: 'Team' },
  { pattern: '/dashboard/usage', title: 'Usage' },
  { pattern: '/dashboard/settings', title: 'Settings' },
  { pattern: '/dashboard/profile', title: 'Profile' },
  { pattern: '/dashboard/billing', title: 'Billing' },
  { pattern: '/dashboard/guide', title: 'User Guide' },
];

function resolvePageTitle(pathname: string): string {
  for (const entry of PAGE_TITLES) {
    if (matchPath({ path: entry.pattern, end: true }, pathname)) {
      return entry.title;
    }
  }
  return 'Dashboard';
}

export function DashboardLayout() {
  const { user: realUser, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Dev-only preview: when running `npm run dev` and no session exists, show the
  // dashboard with a mock user instead of redirecting to /signup. Lets the team
  // iterate on layout/styling without needing to log in every reload. Prod always
  // requires a real session.
  const devPreview = import.meta.env.DEV && !loading && !realUser;
  const user = realUser ?? (devPreview ? DEV_PREVIEW_USER : null);
  const [devImpersonating, setDevImpersonating] = useState(false);

  // Dev-only: when both `VITE_DEV_IMPERSONATE_KEY` is configured and no session
  // exists, mint a real Supabase session for the karel fixture so every hook
  // and edge function sees authentic data. `useAuth` picks up the new session
  // via its `onAuthStateChange` listener.
  useEffect(() => {
    if (!devPreview) return;
    const key = import.meta.env.VITE_DEV_IMPERSONATE_KEY;
    const email = import.meta.env.VITE_DEV_IMPERSONATE_EMAIL ?? DEV_PREVIEW_USER.email;
    if (!key || devImpersonating) return;

    let cancelled = false;
    setDevImpersonating(true);
    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dev-impersonate`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-dev-key': key,
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({ email }),
          },
        );
        if (!res.ok) {
          console.warn('[dev-impersonate] failed', await res.text());
          return;
        }
        const data = (await res.json()) as { token_hash?: string; email?: string };
        if (!data.token_hash || !data.email || cancelled) return;
        const { error } = await supabase.auth.verifyOtp({
          email: data.email,
          token_hash: data.token_hash,
          type: 'magiclink',
        });
        if (error) console.warn('[dev-impersonate] verifyOtp failed', error.message);
      } catch (err) {
        console.warn('[dev-impersonate] error', err);
      }
    })();

    return () => { cancelled = true; };
  }, [devPreview, devImpersonating]);

  const wa = useWhatsAppConnect(user);
  const realRole = useTeamRole(user);
  const role = devPreview
    ? { isAdmin: true, isMember: false, adminName: null, loading: false }
    : realRole;

  const [subInfo, setSubInfo] = useState<SubscriptionInfo | null>(null);
  const [subChecking, setSubChecking] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);

  useEffect(() => {
    if (loading) return;
    if (!realUser) {
      if (devPreview) {
        setSubChecking(false);
        return;
      }
      navigate(withUTM('/signup'), { replace: true });
      return;
    }
    checkSubscription();
  }, [realUser, loading, devPreview]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: tlUser } = await supabase
        .from('teamleader_users')
        .select('is_test_user')
        .eq('user_id', session.user.id)
        .maybeSingle();
      // Skip test-user redirect in dev so impersonated test fixtures (e.g.
      // karel, is_test_user=true) can exercise the real /dashboard flow.
      if (tlUser?.is_test_user && !import.meta.env.DEV) {
        if (mounted.current) navigate('/test-dashboard', { replace: true });
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('session_id');
      if (sessionId) {
        window.history.replaceState({}, '', window.location.pathname);
        await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-confirm-checkout`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ session_id: sessionId }),
          },
        ).catch(() => {});
      }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-subscription`,
        { headers: { Authorization: `Bearer ${session.access_token}` } },
      );
      const data = await res.json();
      if (!mounted.current) return;
      if (data.success && data.subscription) setSubInfo(data.subscription);
    } catch (err) {
      console.error('Subscription check failed:', err);
    } finally {
      if (mounted.current) setSubChecking(false);
    }
  };

  const startTrial = async () => {
    await StripeService.createCheckoutSession({
      priceId: PRICE_ID,
      successUrl: `${window.location.origin}/dashboard`,
      cancelUrl: `${window.location.origin}/`,
    });
  };

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-portal`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ return_url: `${window.location.origin}/dashboard/billing` }),
        },
      );
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error('Portal error:', err);
    } finally {
      setPortalLoading(false);
    }
  };

  const pageTitle = useMemo(() => resolvePageTitle(location.pathname), [location.pathname]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-porcelain flex items-center justify-center">
        <div className="dot-loader" />
      </div>
    );
  }

  const ctxValue = {
    user,
    wa,
    role: {
      isAdmin: role.isAdmin,
      isMember: role.isMember,
      adminName: role.adminName,
      loading: role.loading,
    },
    subscription: {
      info: subInfo,
      checking: subChecking,
      openPortal,
      portalLoading,
      startTrial,
    },
  };

  return (
    <DashboardContext.Provider value={ctxValue}>
      <div className="min-h-screen bg-porcelain">
        <aside className="hidden lg:block fixed top-0 left-0 h-screen w-64 z-30">
          <DashboardSidebar user={user} isAdmin={role.isAdmin} onSignOut={signOut} />
        </aside>

        {drawerOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div
              className="absolute inset-0 bg-navy/30 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
              aria-hidden
            />
            <div className="relative w-64 h-full bg-white shadow-xl flex">
              <DashboardSidebar
                user={user}
                isAdmin={role.isAdmin}
                onSignOut={signOut}
                onNavigate={() => setDrawerOpen(false)}
              />
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close sidebar"
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-navy/5 text-navy/60 hover:text-navy hover:bg-navy/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <main className="min-w-0 min-h-screen lg:ml-64">
          <DashboardTopBar title={pageTitle} onOpenSidebar={() => setDrawerOpen(true)} />
          <Outlet />
        </main>
      </div>
    </DashboardContext.Provider>
  );
}
