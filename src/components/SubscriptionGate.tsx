// ── SubscriptionGate ─────────────────────────────────────────────────────────
// Wrapper for dashboard routes that require an active / trialing subscription.
// If the caller has no active subscription, redirects to /dashboard (the only
// place they can actually act — that's where the trial banner lives). User
// Guide and Dashboard home never need gating.

import { Navigate } from 'react-router-dom';
import { useDashboardContext } from '../hooks/useDashboardContext';

interface SubscriptionGateProps {
  children: React.ReactNode;
}

export function SubscriptionGate({ children }: SubscriptionGateProps) {
  const { subscription } = useDashboardContext();

  // While we're still checking Stripe, render nothing (blank) — prevents a
  // flash of the gated page before a redirect, and avoids redirecting while
  // we don't know the status yet.
  if (subscription.checking) return null;

  const status = subscription.info?.subscription_status;
  const active = status === 'active' || status === 'trialing';
  if (!active) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
