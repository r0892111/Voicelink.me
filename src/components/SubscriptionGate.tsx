// ── SubscriptionGate ─────────────────────────────────────────────────────────
// Wrapper for dashboard routes that require an active / trialing subscription.
// Test users (is_test_user=true) bypass the gate — they get free credits via
// the VLAgent test-user shortcut and have no Stripe subscription, so the
// active/trialing check would lock them out of Settings / Profile / Usage.
// The credit checker is the source of truth for whether they can use the
// agent; gating the dashboard UI on top of that is noise.

import { Navigate } from 'react-router-dom';
import { useDashboardContext } from '../hooks/useDashboardContext';

interface SubscriptionGateProps {
  children: React.ReactNode;
}

export function SubscriptionGate({ children }: SubscriptionGateProps) {
  const { subscription, isTestUser } = useDashboardContext();

  if (isTestUser) return <>{children}</>;

  // While we're still checking Stripe, render nothing (blank) — prevents a
  // flash of the gated page before a redirect, and avoids redirecting while
  // we don't know the status yet.
  if (subscription.checking) return null;

  const status = subscription.info?.subscription_status;
  const active = status === 'active' || status === 'trialing';
  if (!active) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
