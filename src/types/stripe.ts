export interface StripeSubscription {
  customer_id: string;
  subscription_id: string | null;
  subscription_status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'not_started' | 'past_due' | 'paused' | 'trialing' | 'unpaid';
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean | null;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export interface StripeOrder {
  customer_id: string;
  order_id: number;
  checkout_session_id: string;
  payment_intent_id: string;
  amount_subtotal: number;
  amount_total: number;
  currency: string;
  payment_status: string;
  order_status: 'canceled' | 'completed' | 'pending';
  order_date: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
}