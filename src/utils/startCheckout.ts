// ── Paid-checkout kickoff ────────────────────────────────────────────────────
// Stamp the post-OAuth Stripe checkout intent, then start Teamleader OAuth.
// AuthCallback (and the DashboardLayout safety net) consume the pendingCheckout
// bridge after OAuth and launch Stripe Checkout for the chosen plan.
//
// Shared by the homepage pricing CTAs and the WorkSmarter promo onboarding so
// the localStorage-hint + mark + initiate + rollback sequence lives in one place.
// On success initiateAuth redirects the page away; on failure the platform
// hints are rolled back so a later signup isn't mis-routed.

import { AuthService, type AuthResult } from '../services/authService';
import { markPendingCheckout, type PendingCheckout } from './pendingCheckout';

export async function startTeamleaderCheckout(intent: PendingCheckout): Promise<AuthResult> {
  localStorage.setItem('userPlatform', 'teamleader');
  localStorage.setItem('auth_provider', 'teamleader');
  markPendingCheckout(intent);
  const result = await AuthService.createTeamleaderAuth().initiateAuth();
  if (!result.success) {
    localStorage.removeItem('userPlatform');
    localStorage.removeItem('auth_provider');
  }
  return result;
}
