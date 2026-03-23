import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Clock, XCircle, UserPlus } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
import { NoiseOverlay } from './ui/NoiseOverlay';
import { AuthService } from '../services/authService';
import { supabase } from '../lib/supabase';

type InviteState =
  | { status: 'loading' }
  | { status: 'valid'; adminName: string; teamName: string }
  | { status: 'expired' }
  | { status: 'invalid'; reason?: string };

export const InviteAccept: React.FC = () => {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [state, setState] = useState<InviteState>({ status: 'loading' });
  const [accepting, setAccepting] = useState(false);

  // ── Verify token on mount ──────────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      setState({ status: 'invalid', reason: 'No invitation token provided.' });
      return;
    }

    const verify = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/team-verify-invite`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({ token }),
          },
        );

        const data = await res.json();

        if (!res.ok || !data.success) {
          if (data.reason === 'expired') {
            setState({ status: 'expired' });
          } else {
            setState({ status: 'invalid', reason: data.error ?? 'Invalid invitation.' });
          }
          return;
        }

        setState({
          status: 'valid',
          adminName: data.admin_name ?? 'Your team admin',
          teamName: data.team_name ?? 'VoiceLink',
        });
      } catch {
        setState({ status: 'invalid', reason: 'Could not verify invitation.' });
      }
    };

    verify();
  }, [token]);

  // ── Accept invitation ──────────────────────────────────────────────────────
  const handleAccept = async () => {
    if (!token) return;
    setAccepting(true);

    try {
      // Store the invite token so the OAuth callback can link the user
      localStorage.setItem('team_invite_token', token);

      // Start Teamleader OAuth flow
      const auth = AuthService.createTeamleaderAuth();
      await auth.initiateAuth();
    } catch {
      setAccepting(false);
    }
  };

  // ── Render helpers ─────────────────────────────────────────────────────────
  const renderLoading = () => (
    <div
      className="flex flex-col items-center justify-center py-16"
      style={{
        animation: 'hero-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both',
      }}
    >
      <Loader2 className="w-8 h-8 text-navy/30 animate-spin mb-4" />
      <p className="text-sm text-navy/50 font-instrument">
        {t('invite.verifying')}
      </p>
    </div>
  );

  const renderValid = () => {
    if (state.status !== 'valid') return null;
    return (
      <div
        className="space-y-6"
        style={{
          animation: 'hero-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s both',
        }}
      >
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-navy/[0.06] flex items-center justify-center mx-auto">
          <UserPlus className="w-7 h-7 text-navy" />
        </div>

        {/* Heading */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-navy font-general mb-2">
            {t('invite.title')}
          </h1>
          <p className="text-sm text-navy/60 font-instrument leading-relaxed">
            {t('invite.description', { name: state.adminName })}
          </p>
        </div>

        {/* Admin info card */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-navy/[0.03] border border-navy/[0.08]">
          <div className="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center text-sm font-semibold font-general">
            {state.adminName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </div>
          <div>
            <p className="text-sm font-semibold text-navy font-general">
              {state.adminName}
            </p>
            <p className="text-xs text-navy/40 font-instrument">
              {t('invite.invitedYou')}
            </p>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleAccept}
          disabled={accepting}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-navy text-white text-sm font-semibold rounded-full hover:bg-navy-hover transition-colors font-instrument disabled:opacity-70"
        >
          {accepting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <UserPlus className="w-4 h-4" />
          )}
          {t('invite.acceptCta')}
        </button>

        <p className="text-xs text-navy/30 font-instrument text-center">
          {t('invite.termsNotice')}
        </p>
      </div>
    );
  };

  const renderExpired = () => (
    <div
      className="flex flex-col items-center justify-center py-12 space-y-4"
      style={{
        animation: 'hero-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s both',
      }}
    >
      <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center">
        <Clock className="w-7 h-7 text-amber-500" />
      </div>
      <h2 className="text-xl font-semibold text-navy font-general">
        {t('invite.expiredTitle')}
      </h2>
      <p className="text-sm text-navy/50 font-instrument text-center max-w-xs leading-relaxed">
        {t('invite.expiredMessage')}
      </p>
    </div>
  );

  const renderInvalid = () => (
    <div
      className="flex flex-col items-center justify-center py-12 space-y-4"
      style={{
        animation: 'hero-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s both',
      }}
    >
      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
        <XCircle className="w-7 h-7 text-red-500" />
      </div>
      <h2 className="text-xl font-semibold text-navy font-general">
        {t('invite.invalidTitle')}
      </h2>
      <p className="text-sm text-navy/50 font-instrument text-center max-w-xs leading-relaxed">
        {state.status === 'invalid' && state.reason
          ? state.reason
          : t('invite.invalidMessage')}
      </p>
    </div>
  );

  // ── Page ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-porcelain flex flex-col items-center justify-center px-4 py-12 relative">
      <NoiseOverlay />

      {/* Logo */}
      <div
        className="mb-8"
        style={{
          animation: 'hero-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both',
        }}
      >
        <img
          src="/Finit Voicelink Blue.svg"
          alt="VoiceLink"
          className="h-8 w-auto"
        />
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-3xl border border-navy/[0.07] shadow-sm p-8">
        {state.status === 'loading' && renderLoading()}
        {state.status === 'valid' && renderValid()}
        {state.status === 'expired' && renderExpired()}
        {state.status === 'invalid' && renderInvalid()}
      </div>
    </div>
  );
};
