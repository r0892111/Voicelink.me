import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
export const stripe = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);