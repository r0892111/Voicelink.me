import React, { useState, useEffect } from 'react';
import { MessageCircle, Check, Loader2, AlertCircle, X, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface WhatsAppStatus {
  whatsapp_number: string | null;
  whatsapp_status: 'not_set' | 'pending' | 'active';
}

export const WhatsAppVerification: React.FC = () => {
  const { user } = useAuth();
  const [whatsappInput, setWhatsappInput] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpStep, setOtpStep] = useState<'input' | 'verify'>('input');
  const [loading, setLoading] = useState(false);
  const [fetchingStatus, setFetchingStatus] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState<string | null>(null);
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsAppStatus>({
    whatsapp_number: null,
    whatsapp_status: 'not_set'
  });

  // Fetch WhatsApp status from the appropriate table based on platform
  const fetchWhatsAppStatus = async () => {
    if (!user) return;

    setFetchingStatus(true);
    try {
      const platform = user.platform;
      const tableName = `${platform}_users`;
      
      const { data, error } = await supabase
        .from(tableName)
        .select('whatsapp_number, whatsapp_status')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .single();

      if (error) {
        console.error('Error fetching WhatsApp status:', error);
        return;
      }

      if (data) {
        setWhatsappStatus({
          whatsapp_number: data.whatsapp_number,
          whatsapp_status: data.whatsapp_status || 'not_set'
        });
      }
    } catch (error) {
      console.error('Error fetching WhatsApp status:', error);
    } finally {
      setFetchingStatus(false);
    }
  };

  // Fetch status on component mount and when user changes
  useEffect(() => {
    fetchWhatsAppStatus();
  }, [user]);

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
      const platform = user.platform;
      if (!platform) {
        throw new Error('User platform not found');
      }

      // Get CRM user ID based on platform
      let crmUserId;
      switch (platform) {
        case 'teamleader':
          crmUserId = user.user_info?.id || user.id;
          break;
        case 'pipedrive':
          crmUserId = user.user_info?.id || user.id;
          break;
        case 'odoo':
          crmUserId = user.user_info?.user_id || user.id;
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
      
      // Don't update status to pending - keep it as 'not_set' to show the verification form
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
      const platform = user.platform;
      if (!platform) {
        throw new Error('User platform not found');
      }

      // Get CRM user ID based on platform
      let crmUserId;
      switch (platform) {
        case 'teamleader':
          crmUserId = user.user_info?.id || user.id;
          break;
        case 'pipedrive':
          crmUserId = user.user_info?.id || user.id;
          break;
        case 'odoo':
          crmUserId = user.user_info?.user_id || user.id;
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

      // Update local status to active
      setWhatsappStatus({
        whatsapp_number: whatsappInput.trim(),
        whatsapp_status: 'active'
      });

      // Refresh status from database to ensure consistency
      setTimeout(() => {
        fetchWhatsAppStatus();
        setSuccess(false);
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

  const disconnectWhatsApp = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const platform = user.platform;
      const tableName = `${platform}_users`;
      
      const { error } = await supabase
        .from(tableName)
        .update({ 
          whatsapp_number: null,
          whatsapp_status: 'not_set',
          whatsapp_otp_code: null,
          whatsapp_otp_expires_at: null,
          whatsapp_otp_phone: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        throw new Error(error.message);
      }

      // Update local state
      setWhatsappStatus({
        whatsapp_number: null,
        whatsapp_status: 'not_set'
      });

      setSuccess(false);
      setWhatsappInput('');
      setOtpCode('');
      setOtpStep('input');
      setOtpExpiresAt(null);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to disconnect WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  const cancelOTP = () => {
    setOtpStep('input');
    setOtpCode('');
    setOtpExpiresAt(null);
    setError(null);
  };

  // Show loading state while fetching status
  if (fetchingStatus) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-green-600 mr-3" />
          <span className="text-gray-600">Loading WhatsApp status...</span>
        </div>
      </div>
    );
  }

  // Show verified state
  if (whatsappStatus.whatsapp_status === 'active' && whatsappStatus.whatsapp_number) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">WhatsApp Verified</h3>
            <p className="text-sm text-gray-600">Connected to {whatsappStatus.whatsapp_number}</p>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium text-green-800">Active & Ready</span>
          </div>
          <p className="text-sm text-green-700">
            Your WhatsApp number is verified and ready to receive voice note confirmations. 
            You can now send voice messages to VoiceLink!
          </p>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 mb-1">Change WhatsApp Number</h4>
                <p className="text-xs text-gray-600">
                  Disconnect to connect a different WhatsApp number
                </p>
              </div>
              <button
                onClick={disconnectWhatsApp}
                disabled={loading}
                className="ml-4 inline-flex items-center px-3 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span>Disconnecting...</span>
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    <span>Disconnect</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show pending state
  if (whatsappStatus.whatsapp_status === 'pending') {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">WhatsApp Verification Pending</h3>
            <p className="text-sm text-gray-600">Verification in progress</p>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-700">
            Your WhatsApp verification is pending. Please complete the verification process to start using VoiceLink.
          </p>
          <button
            onClick={() => {
              setWhatsappStatus(prev => ({ ...prev, whatsapp_status: 'not_set' }));
              fetchWhatsAppStatus();
            }}
            className="mt-3 text-sm text-yellow-600 hover:text-yellow-800 underline"
          >
            Refresh Status
          </button>
        </div>
      </div>
    );
  }

  // Show verification form
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