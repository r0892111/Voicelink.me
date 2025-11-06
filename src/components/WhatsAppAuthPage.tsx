import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MessageCircle, Loader2, AlertCircle, Shield, LogIn } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
import { supabase } from '../lib/supabase';

export const WhatsAppAuthPage: React.FC = () => {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState<string | null>(null);

  useEffect(() => {
    // Extract URL parameters
    const userIdParam = searchParams.get('user_id') || searchParams.get('userid');
    const otpCodeParam = searchParams.get('otp_code') || searchParams.get('otpcode');

    // Also check if parameters are in the URL path
    const currentPath = window.location.pathname + window.location.search;
    const pathMatch = currentPath.match(/(?:user_id|userid)=([^&]+)&(?:otp_code|otpcode)=([^&\s]+)/);

    let finalUserId = userIdParam;
    let finalOtpCode = otpCodeParam;

    if (pathMatch) {
      finalUserId = pathMatch[1];
      finalOtpCode = pathMatch[2];
    }

    if (!finalUserId || !finalOtpCode) {
      setError('Invalid verification link. Missing required parameters.');
      return;
    }

    setUserId(finalUserId);
    setOtpCode(finalOtpCode);
  }, [searchParams]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !name) {
      setError('Please fill in all fields');
      return;
    }

    if (!userId || !otpCode) {
      setError('Invalid verification link');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create new auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            whatsapp_verification_pending: true,
            whatsapp_user_id: userId,
            whatsapp_otp_code: otpCode
          }
        }
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        // Save verification token in database
        const { error: insertError } = await supabase
          .from('whatsapp_verification_tokens')
          .insert({
            auth_user_id: authData.user.id,
            crm_user_id: userId,
            otp_code: otpCode,
            email: email,
            name: name,
            created_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error saving verification token:', insertError);
        }

        // Redirect to verification page
        navigate(`/verify-whatsapp?user_id=${userId}&otp_code=${otpCode}&auth_user_id=${authData.user.id}`);
      }

    } catch (error) {
      console.error('Sign up error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!userId || !otpCode) {
      setError('Invalid verification link');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Sign in existing user
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (authData.user) {
        // Save/update verification token in database
        const { error: upsertError } = await supabase
          .from('whatsapp_verification_tokens')
          .upsert({
            auth_user_id: authData.user.id,
            crm_user_id: userId,
            otp_code: otpCode,
            email: email,
            name: authData.user.user_metadata?.name || email,
            created_at: new Date().toISOString()
          }, {
            onConflict: 'auth_user_id,crm_user_id'
          });

        if (upsertError) {
          console.error('Error saving verification token:', upsertError);
        }

        // Redirect to verification page
        navigate(`/verify-whatsapp?user_id=${userId}&otp_code=${otpCode}&auth_user_id=${authData.user.id}`);
      }

    } catch (error) {
      console.error('Sign in error:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  if (!userId || !otpCode) {
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
            This link appears to be invalid or incomplete. Please check your WhatsApp message for the correct verification link.
          </p>
        </div>
      </div>
    );
  }

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
            WhatsApp Verification
          </h1>

          <p className="text-gray-600">
            {isSignUp ? 'Create an account to verify your WhatsApp' : 'Sign in to verify your WhatsApp'}
          </p>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-800">Secure Authentication Required</span>
          </div>
          <p className="text-sm text-blue-700">
            To complete WhatsApp verification, please {isSignUp ? 'create an account' : 'sign in'} with your credentials.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
          {isSignUp && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
            {isSignUp && (
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 6 characters
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>{isSignUp ? 'Create Account & Continue' : 'Sign In & Continue'}</span>
              </>
            )}
          </button>

          {/* Toggle Sign In / Sign Up */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </form>

        {/* Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 text-center">
              Your account will be linked to your WhatsApp verification. This ensures secure access to your VoiceLink features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
