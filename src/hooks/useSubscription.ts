import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface Subscription {
  id: string;
  status: 'active' | 'canceled' | 'incomplete' | 'past_due' | 'trialing';
  current_period_end: number;
  cancel_at_period_end: boolean;
  price_id: string;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Query the stripe_user_subscriptions view
        const { data: subscriptionData } = await supabase
          .from('stripe_user_subscriptions')
          .select('*')
          .single();

        if (subscriptionData && subscriptionData.subscription_status === 'active') {
          setSubscription({
            id: subscriptionData.subscription_id,
            status: subscriptionData.subscription_status,
            current_period_end: subscriptionData.current_period_end,
            cancel_at_period_end: subscriptionData.cancel_at_period_end,
            price_id: subscriptionData.price_id
          });
        } else {
          setSubscription(null);
        }
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const hasActiveSubscription = subscription?.status === 'active';

  return { subscription, loading, hasActiveSubscription, checkSubscription };
};