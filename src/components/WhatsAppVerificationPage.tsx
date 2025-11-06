import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MessageCircle, Check, Loader2, AlertCircle, ArrowLeft, Shield } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

export const WhatsAppVerificationPage: React.FC = () => {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasValidParams, setHasValidParams] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [autoVerified, setAutoVerified] = useState(false);

  useEffect(() => {
    // Get URL parameters from both search params and URL path
    const userIdParam = searchParams.get('user_id') || searchParams.get('userid');
    const otpCodeParam = searchParams.get('otp_code') || searchParams.get('otpcode');
    
    // Also check if parameters are in the URL path (for URLs like /verify-whatsappuserid=...&otpcode=...)
    const currentPath = window.location.pathname + window.location.search;
    const pathMatch = currentPath.match(/(?:user_id|userid)=([^&]+)&(?:otp_code|otpcode)=([^&\s]+)/);
    
    let finalUserId = userIdParam;
    let finalOtpCode = otpCodeParam;
    
    if (pathMatch) {
      finalUserId = pathMatch[1];
      finalOtpCode = pathMatch[2];
    }
    
    console.log('URL params:', { userIdParam, otpCodeParam, pathMatch, finalUserId, finalOtpCode });
    
    if (finalUserId && finalOtpCode) {
      setHasValidParams(true);
      setUserId(finalUserId);
      setOtpCode(finalOtpCode);
      
      // Auto-verify if both parameters are present
      if (!autoVerified) {
        setAutoVerified(true);
        verifyOTPWithParams(finalUserId, finalOtpCode);
      }
    } else {
      setHasValidParams(false);
    }
  }, [searchParams]);

  const verifyOTPWithParams = async (userIdParam: string, otpCodeParam: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-verify-external`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'verify_otp',
          user_id: userIdParam,
          otp_code: otpCodeParam
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to verify OTP');
      }

      const result = await response.json();
      
      if (result.success) {
        setSuccess(true);
        
        // No redirect - user should close the page
      } else {
        setError(result.error || 'Verification failed');
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : t('validation.failedToVerifyCode'));
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otpCode.trim() || otpCode.length !== 6) {
      setError(t('validation.enterValidSixDigitCode'));
      return;
    }

    if (!userId) {
      setError('User ID not found');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-verify-external`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'verify_otp',
          user_id: userId,
          otp_code: otpCode.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to verify OTP');
      }

      const result = await response.json();
      
      if (result.success) {
        setSuccess(true);
        
        // No redirect - user should close the page
      } else {
        setError(result.error || 'Verification failed');
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : t('validation.failedToVerifyCode'));
    } finally {
      setLoading(false);
    }
  };


  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtpCode(value);
    setError(null);
  };

  // Show error state if parameters are missing
  if (!hasValidParams) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Invalid Verification Link
          </h1>
          
          <p className="text-gray-600 mb-6">
            It looks like you're in the wrong place. This page requires a valid verification link with user ID and OTP code parameters.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Home</span>
            </button>
            
            <p className="text-sm text-gray-500">
              If you received a verification link, please use that link instead.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show success state
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-10 h-10 text-green-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t('whatsapp.verified')}
          </h1>
          
          <p className="text-gray-600 mb-6">
            {t('whatsapp.verifiedSuccessfully')}
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-700">
              {t('whatsapp.readyDescription')}
            </p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              <strong>✅ Verification Complete!</strong><br/>
              Your WhatsApp is now connected to VoiceLink. You can close this webpage.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show verification form
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <MessageCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('whatsapp.integration')}
          </h1>
          
          <p className="text-gray-600">
            Verify your WhatsApp number to complete setup
          </p>
        </div>

        {/* Auto-filled notice */}
        {hasValidParams && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800">Auto-Verification in Progress</span>
            </div>
            <p className="text-sm text-blue-700">
              Your verification code has been automatically detected and verification is in progress.
            </p>
          </div>
        )}

        {!hasValidParams && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-800">Invalid Verification Link</span>
            </div>
            <p className="text-sm text-red-700">
              This page requires valid userid and otpcode parameters in the URL.
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* OTP Input */}
        <div className="space-y-4">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              {t('whatsapp.verificationCode')}
            </label>
            <input
              type="text"
              id="otp"
              value={otpCode}
              onChange={handleOtpChange}
              placeholder={t('whatsapp.enterCode')}
              maxLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-xl font-mono tracking-widest"
              autoComplete="one-time-code"
            />
            <p className="text-xs text-gray-500 mt-1 text-center">
              Enter the 6-digit code from your WhatsApp message
            </p>
          </div>
          
          {/* Verify Button */}
          <button
            onClick={verifyOTP}
            disabled={loading || otpCode.length !== 6}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t('whatsapp.verifying')}</span>
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>{t('whatsapp.verify')}</span>
              </>
            )}
          </button>

          {/* Back to Home */}
          <button
            onClick={() => navigate('/')}
            className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Security Notice */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-800">Secure Verification</span>
            </div>
            <p className="text-xs text-gray-600">
              This verification link is unique and expires after use for your security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};