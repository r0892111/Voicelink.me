import React, { useState } from 'react';
import { MessageCircle, Check, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const WhatsAppVerification: React.FC = () => {
  const { user } = useAuth();
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Get current WhatsApp status from user data
  const whatsappStatus = user?.user_info?.whatsapp_status || 'not_set';
  const currentNumber = user?.user_info?.whatsapp_number;

  const handleSendOTP = async () => {
    if (!whatsappNumber.trim()) {
      setError('Please enter a valid WhatsApp number');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call Supabase function to send OTP
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          phone_number: whatsappNumber
        })
      });

      const result = await response.json();

      if (result.success) {
        setStep('verify');
      } else {
        setError(result.error || 'Failed to send OTP');
      }
    } catch (error) {
      setError('Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call Supabase function to verify OTP
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          phone_number: whatsappNumber,
          otp_code: otpCode
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setStep('input');
        setWhatsappNumber('');
        setOtpCode('');
      } else {
        setError(result.error || 'Invalid verification code');
      }
    } catch (error) {
      setError('Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  if (whatsappStatus === 'active' && currentNumber) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">WhatsApp Verified</h3>
            <p className="text-sm text-gray-600">Connected to {currentNumber}</p>
          </div>
        </div>
        <p className="text-gray-600 text-sm">
          Your WhatsApp number is verified and ready to receive notifications.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center space-x-3 mb-6">
        <MessageCircle className="w-6 h-6 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">WhatsApp Integration</h3>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2 text-green-700">
          <Check className="w-5 h-5" />
          <span className="text-sm">WhatsApp number verified successfully!</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {step === 'input' && (
        <div className="space-y-4">
          <div>
            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Number
            </label>
            <input
              type="tel"
              id="whatsapp"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="+32 123 456 789"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Include country code (e.g., +32 for Belgium)
            </p>
          </div>
          
          <button
            onClick={handleSendOTP}
            disabled={loading || !whatsappNumber.trim()}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <MessageCircle className="w-4 h-4" />
                <span>Send Verification Code</span>
              </>
            )}
          </button>
        </div>
      )}

      {step === 'verify' && (
        <div className="space-y-4">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              id="otp"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">
              Check your WhatsApp for the verification code sent to {whatsappNumber}
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setStep('input');
                setOtpCode('');
                setError(null);
              }}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleVerifyOTP}
              disabled={loading || !otpCode.trim()}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Verify</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};