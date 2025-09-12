import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Subscription {
  customer_id: string;
  subscription_id: string;
  subscription_status: 'active' | 'canceled' | 'incomplete' | 'past_due' | 'trialing';
  price_id: string | null;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
  crm_provider: string | null;
  crm_user_id: string | null;
  product_name: string;
  metadata: Record<string, string> | null;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSubscription = useCallback(async () => {
    setLoading(true);
    
    try {
      // Get current auth session
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        console.error('No active Supabase session:', error);
        setSubscription(null);
        return;
      }

      // Get CRM provider from localStorage
      const crmProvider = localStorage.getItem('userPlatform') || localStorage.getItem('auth_provider') || 'unknown';
      
      // Call your edge function with provider parameter
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-subscription?provider=${encodeURIComponent(crmProvider)}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!result.success || !result.subscription) {
        setSubscription(null);
        return;
      }

      setSubscription(result.subscription as Subscription);
    } catch (err) {
      console.error('Error checking subscription:', err);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  const hasActiveSubscription = subscription?.subscription_status === 'active';

  return { subscription, loading, hasActiveSubscription, checkSubscription };
};
