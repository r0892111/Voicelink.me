import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface CheckoutOptions {
  priceId: string;
  quantity?: number;
  successUrl?: string;
  cancelUrl?: string;
  crmProvider?: string;
}

export class StripeService {
  static async createCheckoutSession(options: CheckoutOptions) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error('User must be authenticated to make a purchase');
      }

      // Get CRM provider from localStorage or options
      const crmProvider = options.crmProvider || localStorage.getItem('userPlatform') || localStorage.getItem('auth_provider');
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          price_id: options.priceId,
          quantity: options.quantity || 1,
          success_url: options.successUrl || `${window.location.origin}/success`,
          cancel_url: options.cancelUrl || `${window.location.origin}/`,
          crm_provider: crmProvider,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { checkout_url } = await response.json();
      
      if (checkout_url) {
        window.location.href = checkout_url;
      } else {
        throw new Error('No checkout URL received');
      }
      
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    }
  }
}