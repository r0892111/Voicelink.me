import React, { useEffect } from 'react';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { withUTM } from '../utils/utm';

export const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productName = searchParams.get('product');

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate(withUTM('/'));
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>
        
        <p className="text-gray-600 mb-6">
          {productName 
            ? `Thank you for purchasing ${productName}. Your payment has been processed successfully.`
            : 'Thank you for your purchase. Your payment has been processed successfully.'
          }
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => navigate(withUTM('/'))}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>
          
          <p className="text-sm text-gray-500">
            Redirecting automatically in 5 seconds...
          </p>
        </div>
      </div>
    </div>
  );
};