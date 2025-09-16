import React, { useState } from 'react';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { StripeService } from '../services/stripeService';
import { useAuth } from '../hooks/useAuth';

interface BuyButtonProps {
  priceId: string;
  productName: string;
  price: string;
  description?: string;
  className?: string;
}

export const BuyButton: React.FC<BuyButtonProps> = ({
  priceId,
  productName,
  price,
  description,
  className = ''
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handlePurchase = async () => {
    if (!user) {
      setError(t('validation.pleaseSignInToPurchase'));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await StripeService.createCheckoutSession({
        priceId,
        quantity: 1,
        successUrl: `${window.location.origin}/success?product=${encodeURIComponent(productName)}`,
        cancelUrl: window.location.href,
      });
      
    } catch (error) {
      setError(error instanceof Error ? error.message : t('validation.purchaseFailed'));
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{productName}</h3>
        <div className="text-3xl font-bold text-blue-600 mb-4">{price}</div>
        {description && (
          <p className="text-gray-600 mb-6">{description}</p>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        
        <button
          onClick={handlePurchase}
          disabled={loading || !user}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-lg flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              <span>{user ? 'Buy Now' : 'Sign In to Purchase'}</span>
            </>
          )}
        </button>
        
        {!user && (
          <p className="mt-2 text-sm text-gray-500">
            Please sign in with your CRM platform to make a purchase
          </p>
        )}
      </div>
    </div>
  );
};