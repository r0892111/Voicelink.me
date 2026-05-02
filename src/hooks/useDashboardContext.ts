import { createContext, useContext } from 'react';
import type { AuthUser } from './useAuth';
import type { WhatsAppConnect } from './useWhatsAppConnect';

export interface SubscriptionInfo {
  subscription_status: string;
  trial_end: number | null;
  current_period_end: number | null;
  plan_name: string | null;
  voicelink_key: string | null;
  amount: number | null;
  currency: string | null;
  interval: string | null;
}

export interface DashboardContextValue {
  user: AuthUser;
  wa: WhatsAppConnect;
  role: {
    isAdmin: boolean;
    isMember: boolean;
    adminName: string | null;
    loading: boolean;
  };
  subscription: {
    info: SubscriptionInfo | null;
    checking: boolean;
    openPortal: () => Promise<void>;
    portalLoading: boolean;
    startTrial: () => Promise<void>;
  };
}

export const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useDashboardContext(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error('useDashboardContext must be used within a DashboardLayout');
  }
  return ctx;
}
