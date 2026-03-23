import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  MessageCircle,
  CheckCircle,
  Mic,
  BookOpen,
  Calendar,
  Sparkles,
  Headphones,
  ArrowRight,
  Link2,
  Loader2,
} from 'lucide-react';
import { NoiseOverlay } from './ui/NoiseOverlay';
import { AuthService } from '../services/authService';
import { TeamManagement } from './TeamManagement';
import { useTeamRole } from '../hooks/useTeamRole';
import { supabase } from '../lib/supabase';
import type { AuthUser } from '../hooks/useAuth';

const tips = [
  { emoji: '🗣️', text: 'Start with "Just spoke with [Name]" to log a contact.' },
  { emoji: '📅', text: '"Call him back Monday at 3 PM" creates a task automatically.' },
  { emoji: '🎯', text: 'One person per voice note keeps things accurate.' },
  { emoji: '✍️', text: 'Spell tricky names letter-by-letter for perfect CRM input.' },
];

export const TestDashboard: React.FC = () => {
  const location = useLocation();

  // Phone: prefer location.state, fall back to localStorage (survives refreshes)
  const statePhone = (location.state as { phone?: string } | null)?.phone ?? null;
  const phone = statePhone ?? localStorage.getItem('test_user_phone_display') ?? null;
  if (statePhone) localStorage.setItem('test_user_phone_display', statePhone);

  const [connecting, setConnecting]   = React.useState(false);
  const [revoking, setRevoking]       = React.useState(false);
  const [tlConnected, setTlConnected] = React.useState<boolean | null>(null); // null = loading
  const [teamUser, setTeamUser]       = React.useState<AuthUser | null>(null);
  const { isAdmin } = useTeamRole(teamUser);

  // Check if this is the nomulpe admin user — show team management if so
  React.useEffect(() => {
    const checkTeamUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email === 'nomulpe@outlook.com') {
        setTeamUser({
          id: session.user.id,
          email: session.user.email,
          name: 'Jord Goossens',
          platform: 'teamleader',
          user_info: {},
        });
      }
    };
    checkTeamUser();
  }, []);

  // Check if Teamleader is connected.
  // Primary: active Supabase session → look up teamleader_users (works after magic link).
  // Fallback: no session yet → check test_users.tl_user_id by phone.
  React.useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('teamleader_users')
          .select('user_id')
          .eq('user_id', session.user.id)
          .eq('is_test_user', true)
          .maybeSingle();
        setTlConnected(!!data);
        return;
      }
      // No session yet (before TL connect) — use tl_user_id link by phone
      if (!phone) { setTlConnected(false); return; }
      const { data } = await supabase
        .from('test_users')
        .select('tl_user_id')
        .eq('phone', phone)
        .maybeSingle();
      setTlConnected(!!data?.tl_user_id);
    };
    check();
  }, [phone]);

  const handleConnectTeamleader = async () => {
    setConnecting(true);
    localStorage.setItem('is_test_user_flow', 'true');
    if (phone) localStorage.setItem('test_user_phone', phone);
    await AuthService.createTeamleaderAuth().initiateAuth();
    setConnecting(false);
  };

  const handleRevoke = async () => {
    if (!phone) return;
    setRevoking(true);
    await supabase
      .from('test_users')
      .update({ tl_user_id: null })
      .eq('phone', phone);
    setTlConnected(false);
    setRevoking(false);
  };

  return (
    <div className="min-h-screen bg-porcelain font-instrument relative">
      <NoiseOverlay />

      {/* ── HERO ── */}
      <section className="pt-10 pb-10 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          <div
            className="absolute -top-40 -right-32 w-[560px] h-[560px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(26,45,99,0.07) 0%, transparent 70%)' }}
          />
          <div
            className="absolute top-16 -left-24 w-[380px] h-[380px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(71,93,143,0.05) 0%, transparent 70%)' }}
          />
        </div>

        <div className="max-w-4xl mx-auto relative">
          <div
            className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-navy/[0.08] rounded-full px-4 py-1.5 mb-5 shadow-sm"
            style={{ animation: 'hero-subtitle-in 0.5s cubic-bezier(0.22,1,0.36,1) 0.05s both' }}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-medium text-navy/65">WhatsApp — Connected</span>
          </div>

          <h1
            className="font-general font-bold text-navy leading-[1.08] mb-4"
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
              animation: 'hero-slide-in 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s both',
            }}
          >
            You're all set! 🎉
          </h1>

          <p
            className="text-lg md:text-xl text-navy/55 font-medium max-w-xl mb-8 leading-relaxed"
            style={{ animation: 'hero-subtitle-in 0.6s cubic-bezier(0.22,1,0.36,1) 0.22s both' }}
          >
            VoiceLink is ready. Open WhatsApp and send a voice note — we'll take care of the rest.
          </p>
        </div>
      </section>

      {/* ── STATUS CARDS ── */}
      <section className="px-6 pb-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* WhatsApp */}
          <div
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] p-5 shadow-sm"
            style={{ animation: 'hero-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.42s both' }}
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="font-general font-semibold text-navy text-sm">WhatsApp</span>
            </div>
            <p className="text-xs text-navy/50 truncate">{phone ?? 'Connected'}</p>
            <div className="mt-3 flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-medium text-emerald-600">Connected</span>
            </div>
          </div>

          {/* Teamleader */}
          <div
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] p-5 shadow-sm"
            style={{ animation: 'hero-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.5s both' }}
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tlConnected ? 'bg-emerald-50' : 'bg-navy/[0.05]'}`}>
                <Link2 className={`w-5 h-5 ${tlConnected ? 'text-emerald-500' : 'text-navy/35'}`} />
              </div>
              <span className="font-general font-semibold text-navy text-sm">Teamleader</span>
            </div>
            <p className="text-xs text-navy/50">
              {tlConnected === null ? '—' : tlConnected ? 'Account linked' : 'Not yet connected'}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                {tlConnected === null ? (
                  <div className="h-3 w-16 bg-navy/[0.07] rounded-full animate-pulse" />
                ) : (
                  <>
                    <div className={`w-1.5 h-1.5 rounded-full ${tlConnected ? 'bg-emerald-400' : 'bg-navy/20'}`} />
                    <span className={`text-xs font-medium ${tlConnected ? 'text-emerald-600' : 'text-navy/40'}`}>
                      {tlConnected ? 'Connected' : 'Not connected'}
                    </span>
                  </>
                )}
              </div>
              {tlConnected && (
                <button
                  onClick={handleRevoke}
                  disabled={revoking}
                  className="text-xs text-navy/35 hover:text-red-500 transition-colors disabled:opacity-40"
                >
                  {revoking ? 'Revoking…' : 'Revoke'}
                </button>
              )}
            </div>
          </div>

          {/* Status */}
          <div
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] p-5 shadow-sm"
            style={{ animation: 'hero-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.58s both' }}
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="font-general font-semibold text-navy text-sm">Status</span>
            </div>
            <p className="text-xs text-navy/50">Test access — active</p>
            <div className="mt-3 flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-medium text-emerald-600">Live</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONNECT TEAMLEADER (only when not yet connected) ── */}
      {tlConnected === false && (
        <section className="px-6 pb-8">
          <div className="max-w-4xl mx-auto">
            <div
              className="bg-white/80 backdrop-blur-sm rounded-3xl border border-navy/[0.07] shadow-sm p-7"
              style={{ animation: 'hero-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.55s both' }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-10 h-10 rounded-2xl bg-navy/[0.06] flex items-center justify-center flex-shrink-0">
                    <Link2 className="w-5 h-5 text-navy/60" />
                  </div>
                  <div>
                    <h3 className="font-general font-bold text-navy text-base leading-tight">Connect Teamleader</h3>
                    <p className="text-xs text-navy/45 mt-0.5">
                      Link your Teamleader account so voice notes flow straight into your CRM.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleConnectTeamleader}
                  disabled={connecting}
                  className="flex-shrink-0 inline-flex items-center justify-center gap-2 bg-navy hover:bg-navy-hover disabled:bg-navy/40 text-white font-semibold text-sm py-2.5 px-5 rounded-full transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed"
                >
                  {connecting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Connecting…</>
                  ) : (
                    <>Connect<ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── TEAM MANAGEMENT (nomulpe only) ── */}
      {isAdmin && teamUser && <TeamManagement user={teamUser} />}

      {/* ── BOTTOM GRID: TIPS + SUPPORT ── */}
      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-5">
          {/* Tips */}
          <div
            className="bg-white/80 backdrop-blur-sm rounded-3xl border border-navy/[0.07] shadow-sm p-7"
            style={{ animation: 'hero-fade-up 0.6s cubic-bezier(0.22,1,0.36,1) 0.58s both' }}
          >
            <div className="flex items-center space-x-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-navy flex items-center justify-center shadow-sm flex-shrink-0">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-general font-bold text-navy text-base leading-tight">How to Use VoiceLink</h3>
                <p className="text-xs text-navy/40">Tips for the best results</p>
              </div>
            </div>
            <ul className="space-y-3.5">
              {tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-base leading-tight mt-0.5 flex-shrink-0">{tip.emoji}</span>
                  <span className="text-sm text-navy/60 leading-relaxed">{tip.text}</span>
                </li>
              ))}
            </ul>
            <a
              href="/support"
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-navy/50 hover:text-navy transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              View full usage guide
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          {/* Support */}
          <div
            className="bg-navy rounded-3xl p-7 relative overflow-hidden shadow-lg"
            style={{ animation: 'hero-fade-up 0.6s cubic-bezier(0.22,1,0.36,1) 0.66s both' }}
          >
            <div
              className="absolute inset-0 pointer-events-none rounded-3xl"
              style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, transparent 55%)' }}
              aria-hidden
            />
            <div className="relative">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-general font-bold text-white text-base leading-tight">Need a Hand?</h3>
                  <p className="text-xs text-white/45">We're here for you</p>
                </div>
              </div>
              <p className="text-sm text-white/60 leading-relaxed mb-6">
                Our team loves helping new users get the most out of VoiceLink. Reach out anytime — we usually respond within a few hours.
              </p>
              <div className="flex flex-col gap-2.5">
                <a
                  href="https://calendly.com/alex-finitsolutions/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-white text-navy font-semibold text-sm py-2.5 px-5 rounded-full hover:bg-white/90 transition-all duration-200 hover:shadow-md"
                >
                  <Calendar className="w-4 h-4" />
                  Book a Call
                </a>
                <a
                  href="/support"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold text-sm py-2.5 px-5 rounded-full transition-colors border border-white/[0.12]"
                >
                  <Headphones className="w-4 h-4" />
                  Support Center
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pb-10 px-6 text-center">
        <p className="text-xs text-navy/28">
          © 2026 Finit Solutions ·{' '}
          <a href="/privacy-policy" className="hover:text-navy/50 transition-colors">Privacy</a>{' '}·{' '}
          <a href="/support" className="hover:text-navy/50 transition-colors">Support</a>
        </p>
      </footer>
    </div>
  );
};
