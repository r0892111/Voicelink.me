import React, { useState } from 'react';
import { MessageCircle, Check, Loader2, AlertCircle, X, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const WhatsAppVerification: React.FC = () => {
  const { user } = useAuth();
  const [whatsappInput, setWhatsappInput] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpStep, setOtpStep] = useState<'input' | 'verify'>('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState<string | null>(null);

  // Get current WhatsApp status from user data
  const whatsappStatus = user?.user_info?.whatsapp_status || 'not_set';
  const currentNumber = user?.user_info?.whatsapp_number;

  // Phone number validation
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  const isValidPhoneNumber = (phoneNumber: string): boolean => {
    if (!phoneNumber) return false;
    return phoneRegex.test(phoneNumber.trim());
  };

  const sendOTP = async () => {
    if (!whatsappInput.trim() || !isValidPhoneNumber(whatsappInput.trim())) {
      setError('Please enter a valid international phone number');
      return;
    }

    if (!user) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get user platform and ID
      const platform = localStorage.getItem('userPlatform') || localStorage.getItem('auth_provider');
      if (!platform) {
        throw new Error('User platform not found');
      }

      // Get CRM user ID based on platform
      let crmUserId;
      switch (platform) {
        case 'teamleader':
          crmUserId = user.user_info?.user?.id;
          break;
        case 'pipedrive':
          crmUserId = user.user_info?.id;
          break;
        case 'odoo':
          crmUserId = user.user_info?.uid;
          break;
        default:
          throw new Error('Unknown platform');
      }

      if (!crmUserId) {
        throw new Error('CRM user ID not found');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'send',
          crm_provider: platform,
          crm_user_id: crmUserId.toString(),
          phone_number: whatsappInput.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send OTP');
      }

      const result = await response.json();
      setOtpExpiresAt(result.expires_at);
      setOtpStep('verify');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otpCode.trim() || otpCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    if (!user) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const platform = localStorage.getItem('userPlatform') || localStorage.getItem('auth_provider');
      if (!platform) {
        throw new Error('User platform not found');
      }

      // Get CRM user ID based on platform
      let crmUserId;
      switch (platform) {
        case 'teamleader':
          crmUserId = user.user_info?.user?.id;
          break;
        case 'pipedrive':
          crmUserId = user.user_info?.id;
          break;
        case 'odoo':
          crmUserId = user.user_info?.uid;
          break;
        default:
          throw new Error('Unknown platform');
      }

      if (!crmUserId) {
        throw new Error('CRM user ID not found');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'verify',
          crm_provider: platform,
          crm_user_id: crmUserId.toString(),
          otp_code: otpCode.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to verify OTP');
      }

      // Send welcome message
      await sendWelcomeMessage(platform, crmUserId.toString());

      setSuccess(true);
      setOtpStep('input');
      setWhatsappInput('');
      setOtpCode('');
      setOtpExpiresAt(null);

      // Refresh the page to update user data
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  const sendWelcomeMessage = async (platform: string, crmUserId: string) => {
    try {
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-welcome`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          crm_provider: platform,
          crm_user_id: crmUserId,
          phone_number: whatsappInput.trim()
        })
      });
    } catch (error) {
      console.error('Failed to send welcome message:', error);
      // Don't throw - welcome message failure shouldn't break the flow
    }
  };

  const cancelOTP = () => {
    setOtpStep('input');
    setOtpCode('');
    setOtpExpiresAt(null);
    setError(null);
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

      {otpStep === 'input' ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Number
            </label>
            <input
              type="tel"
              id="whatsapp"
              value={whatsappInput}
              onChange={(e) => setWhatsappInput(e.target.value)}
              placeholder="+32 123 456 789"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                whatsappInput.trim() && !isValidPhoneNumber(whatsappInput.trim())
                  ? 'border-red-300'
                  : 'border-gray-300'
              }`}
            />
            <p className="text-xs text-gray-500 mt-1">
              Include country code (e.g., +32 for Belgium)
            </p>
            {whatsappInput.trim() && !isValidPhoneNumber(whatsappInput.trim()) && (
              <p className="text-xs text-red-500 mt-1">
                Please enter a valid international phone number
              </p>
            )}
          </div>
          
          <button
            onClick={sendOTP}
            disabled={loading || !whatsappInput.trim() || !isValidPhoneNumber(whatsappInput.trim())}
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
      ) : (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">Verification Code Sent</span>
            </div>
            <p className="text-sm text-yellow-700">
              We've sent a 6-digit code to <strong>{whatsappInput}</strong>
            </p>
            {otpExpiresAt && (
              <p className="text-xs text-yellow-600 mt-1">
                Code expires at {new Date(otpExpiresAt).toLocaleTimeString()}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              id="otp"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono tracking-widest"
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={cancelOTP}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            <button
              onClick={verifyOTP}
              disabled={loading || otpCode.length !== 6}
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

          <button
            onClick={sendOTP}
            disabled={loading}
            className="w-full text-sm text-blue-600 hover:underline disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Resend Code'}
          </button>
        </div>
      )}
    </div>
  );
};