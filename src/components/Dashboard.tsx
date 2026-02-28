import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  CheckCircle,
  Zap,
  ArrowRight,
  Clock,
  Mic,
  BookOpen,
  Calendar,
  Sparkles,
  Headphones,
  Star,
  ChevronDown,
  X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useWhatsAppConnect } from '../hooks/useWhatsAppConnect';
import { WhatsAppConnectForm } from './WhatsAppConnectForm';
import { StripeService } from '../services/stripeService';
import { supabase } from '../lib/supabase';
import { withUTM } from '../utils/utm';
import { NoiseOverlay } from './ui/NoiseOverlay';

const PRICE_ID = 'price_1S5o6zLPohnizGblsQq7OYCT';

export const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate          = useNavigate();
  const wa                = useWhatsAppConnect(user);
  const [subChecking, setSubChecking] = useState(true);

  interface SubInfo {
    subscription_status: string;
    trial_end: number | null;
    current_period_end: number | null;
    plan_name: string | null;
    amount: number | null;
    currency: string | null;
    interval: string | null;
  }
  const [subInfo, setSubInfo] = useState<SubInfo | null>(null);

  // Redirect unauthenticated users + check subscription
  useEffect(() => {
    if (loading) return;
    if (!user) { navigate(withUTM('/signup')); return; }
    checkSubscription();
  }, [user, loading]);

  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // If returning from Stripe checkout, confirm the session and save
      // stripe_customer_id — then trust the user and skip the subscription
      // check to avoid a race condition where Stripe hasn't created the
      // subscription record yet.
      const params    = new URLSearchParams(window.location.search);
      const sessionId = params.get('session_id');
      if (sessionId) {
        window.history.replaceState({}, '', '/dashboard');
        const confirmRes = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-confirm-checkout`,
          {
            method:  'POST',
            headers: {
              Authorization:  `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ session_id: sessionId }),
          },
        );
        const confirmData = await confirmRes.json();
        if (confirmData.success) {
          // Customer ID saved — user just paid, let them through
          return;
        }
        // If confirm failed, fall through to normal subscription check
      }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-subscription`,
        { headers: { Authorization: `Bearer ${session.access_token}` } },
      );
      const data = await res.json();
      if (data.success && data.subscription) setSubInfo(data.subscription);

      const isActive =
        data.success &&
        (data.subscription?.subscription_status === 'active' ||
         data.subscription?.subscription_status === 'trialing');

      if (!isActive) {
        await StripeService.createCheckoutSession({
          priceId:    PRICE_ID,
          successUrl: `${window.location.origin}/dashboard`,
          cancelUrl:  `${window.location.origin}/`,
        });
        // StripeService redirects, so nothing runs after this
        return;
      }
    } catch (err) {
      console.error('Subscription check failed:', err);
      // On error, let the user through rather than blocking them
    } finally {
      setSubChecking(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getTimeGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getFirstName = () => user?.name?.split(' ')[0] || 'there';

  const getPlatformLabel = () =>
    ({ teamleader: 'Teamleader', pipedrive: 'Pipedrive', odoo: 'Odoo' }[user?.platform || ''] || 'your CRM');

  if (loading || subChecking) {
    return (
      <div className="min-h-screen bg-porcelain flex items-center justify-center">
        <div className="dot-loader" />
      </div>
    );
  }

  if (!user) return null;

  const setupSteps = [
    {
      n: 1,
      done: true,
      title: `${getPlatformLabel()} Connected`,
      description: 'Your CRM is linked and syncing. Voice note data will flow in automatically.',
    },
    {
      n: 2,
      done: wa.status === 'active',
      pending: wa.status === 'pending',
      title: 'Connect WhatsApp',
      description:
        wa.status === 'active'
          ? `Verified · ${wa.number}`
          : wa.status === 'pending'
          ? 'Verification pending — check your WhatsApp for the code.'
          : 'Link your WhatsApp number to start sending voice notes.',
    },
    {
      n: 3,
      done: wa.status === 'active',
      title: 'Send Your First Voice Note',
      description:
        'Open WhatsApp, send a voice message to VoiceLink, and watch your CRM update in seconds.',
    },
  ];

  const tips = [
    { emoji: '🗣️', text: 'Start with "Just spoke with [Name]" to log a contact.' },
    { emoji: '📅', text: '"Call him back Monday at 3 PM" creates a task automatically.' },
    { emoji: '🎯', text: 'One person per voice note keeps things accurate.' },
    { emoji: '✍️', text: 'Spell tricky names letter-by-letter for perfect CRM input.' },
  ];

  return (
    <div className="min-h-screen bg-porcelain font-instrument relative">
      <NoiseOverlay />

      {/* ── HERO GREETING ── */}
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
            <span className="text-sm font-medium text-navy/65 font-instrument">
              {getPlatformLabel()} — Connected &amp; Active
            </span>
          </div>

          <h1
            className="font-general font-bold text-navy leading-[1.08] mb-4"
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
              animation: 'hero-slide-in 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s both',
            }}
          >
            {getTimeGreeting()}, {getFirstName()}! 👋
          </h1>

          <p
            className="text-lg md:text-xl text-navy/55 font-instrument font-medium max-w-xl mb-8 leading-relaxed"
            style={{ animation: 'hero-subtitle-in 0.6s cubic-bezier(0.22,1,0.36,1) 0.22s both' }}
          >
            VoiceLink is ready when you are. Just open WhatsApp and start talking — we'll handle the rest.
          </p>

          <div
            className="flex flex-wrap gap-3"
            style={{ animation: 'hero-fade-up 0.6s cubic-bezier(0.22,1,0.36,1) 0.35s both' }}
          >
            <a
              href="https://wa.me/32460229893"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center space-x-2 bg-navy hover:bg-navy-hover text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Open WhatsApp</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* ── STATUS CARDS ── */}
      <section className="px-6 pb-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] p-5 shadow-sm hover:shadow-md transition-shadow duration-300"
            style={{ animation: 'hero-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.42s both' }}
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="font-general font-semibold text-navy text-sm">CRM</span>
            </div>
            <p className="text-xs text-navy/50 font-instrument">{getPlatformLabel()} is connected &amp; syncing</p>
            <div className="mt-3 flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-medium text-emerald-600">Live</span>
            </div>
          </div>

          <div
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] p-5 shadow-sm hover:shadow-md transition-shadow duration-300"
            style={{ animation: 'hero-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.5s both' }}
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${wa.status === 'active' ? 'bg-emerald-50' : 'bg-navy/[0.05]'}`}>
                <MessageCircle className={`w-5 h-5 ${wa.status === 'active' ? 'text-emerald-500' : 'text-navy/35'}`} />
              </div>
              <span className="font-general font-semibold text-navy text-sm">WhatsApp</span>
            </div>
            <p className="text-xs text-navy/50 font-instrument truncate">
              {wa.status === 'active' ? wa.number : wa.status === 'pending' ? 'Verification pending' : 'Not yet connected'}
            </p>
            <div className="mt-3 flex items-center space-x-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${wa.status === 'active' ? 'bg-emerald-400' : wa.status === 'pending' ? 'bg-amber-400' : 'bg-navy/20'}`} />
              <span className={`text-xs font-medium ${wa.status === 'active' ? 'text-emerald-600' : wa.status === 'pending' ? 'text-amber-600' : 'text-navy/40'}`}>
                {wa.status === 'active' ? 'Connected' : wa.status === 'pending' ? 'Pending' : 'Not connected'}
              </span>
            </div>
          </div>

          <div
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] p-5 shadow-sm hover:shadow-md transition-shadow duration-300"
            style={{ animation: 'hero-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.58s both' }}
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${subInfo?.subscription_status === 'active' || subInfo?.subscription_status === 'trialing' ? 'bg-emerald-50' : 'bg-navy/[0.05]'}`}>
                <Star className={`w-5 h-5 ${subInfo?.subscription_status === 'active' || subInfo?.subscription_status === 'trialing' ? 'text-emerald-500' : 'text-navy/50'}`} />
              </div>
              <span className="font-general font-semibold text-navy text-sm">Subscription</span>
            </div>
            <p className="text-xs text-navy/50 font-instrument truncate">
              {subInfo?.plan_name ?? 'VoiceLink'}
              {subInfo?.amount != null && subInfo?.currency && (
                <span className="ml-1">
                  · {(subInfo.amount / 100).toLocaleString('en', { style: 'currency', currency: subInfo.currency.toUpperCase() })}{subInfo.interval ? `/${subInfo.interval}` : ''}
                </span>
              )}
            </p>
            <div className="mt-3 space-y-1">
              {subInfo?.subscription_status === 'trialing' && (
                <>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="text-xs font-medium text-amber-600">
                      Free trial · {subInfo.trial_end ? Math.max(0, Math.ceil((subInfo.trial_end * 1000 - Date.now()) / 86_400_000)) : '—'} days left
                    </span>
                  </div>
                  {subInfo.trial_end && (
                    <p className="text-xs text-navy/40 font-instrument pl-3">
                      Billing starts {new Date(subInfo.trial_end * 1000).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </>
              )}
              {subInfo?.subscription_status === 'active' && (
                <>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-medium text-emerald-600">Active</span>
                  </div>
                  {subInfo.current_period_end && (
                    <p className="text-xs text-navy/40 font-instrument pl-3">
                      Renews {new Date(subInfo.current_period_end * 1000).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </>
              )}
              {subInfo?.subscription_status === 'past_due' && (
                <div className="flex items-center space-x-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  <span className="text-xs font-medium text-red-600">Payment due</span>
                </div>
              )}
              {(!subInfo || subInfo.subscription_status === 'none') && (
                <div className="flex items-center space-x-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-navy/20" />
                  <span className="text-xs font-medium text-navy/40">—</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── SETUP CHECKLIST ── */}
      <section className="px-6 pb-8">
        <div className="max-w-4xl mx-auto">
          <div
            className="bg-white/80 backdrop-blur-sm rounded-3xl border border-navy/[0.07] shadow-sm p-7 md:p-9"
            style={{ animation: 'hero-fade-up 0.6s cubic-bezier(0.22,1,0.36,1) 0.62s both' }}
          >
            <div className="flex items-center space-x-3 mb-1">
              <Zap className="w-5 h-5 text-navy/60" />
              <h2 className="font-general font-bold text-navy text-xl">Your Setup Checklist</h2>
            </div>
            <p className="text-sm text-navy/45 font-instrument mb-7 ml-8">
              Three quick steps to get fully up and running
            </p>

            <div className="space-y-3">
              {setupSteps.map((step) => (
                <div key={step.n}>
                  {/* ── Step row ── */}
                  <div
                    className={`flex items-start gap-4 p-4 rounded-2xl transition-colors duration-200 ${
                      step.done
                        ? 'bg-emerald-50/70 border border-emerald-100/80'
                        : step.n === 2 && wa.open
                        ? 'bg-navy/[0.05] border border-navy/[0.09] rounded-b-none'
                        : 'bg-navy/[0.03] border border-transparent hover:border-navy/[0.06]'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        step.done ? 'bg-emerald-100 text-emerald-600' : 'bg-navy/[0.07] text-navy/45'
                      }`}
                    >
                      {step.done ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <span className="text-sm font-bold font-general">{step.n}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-general font-semibold text-sm ${step.done ? 'text-emerald-700' : 'text-navy'}`}>
                          {step.title}
                        </span>
                        {step.pending && (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-navy/50 font-instrument mt-0.5 leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    {/* "Connect Now" toggle — only step 2 when not yet connected */}
                    {step.n === 2 && wa.status === 'not_set' && (
                      <button
                        onClick={wa.toggle}
                        className="flex-shrink-0 inline-flex items-center gap-1.5 bg-navy text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-navy-hover transition-colors"
                      >
                        {wa.open ? (
                          <>
                            <X className="w-3 h-3" />
                            Cancel
                          </>
                        ) : (
                          <>
                            Connect Now
                            <ChevronDown className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* ── Inline WA form (step 2 only) ── */}
                  {step.n === 2 && wa.status === 'not_set' && (
                    <WhatsAppConnectForm
                      open={wa.open}
                      step={wa.step}
                      phone={wa.phone}
                      otp={wa.otp}
                      busy={wa.busy}
                      error={wa.error}
                      success={wa.success}
                      onPhoneChange={(v) => { wa.setPhone(v); }}
                      onOtpChange={(v) => { wa.setOtp(v); }}
                      onSendOtp={wa.sendOtp}
                      onVerifyOtp={wa.verifyOtp}
                      onBackToPhone={wa.backToPhone}
                      onResendOtp={wa.resendOtp}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM GRID: TIPS + SUPPORT ── */}
      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-5">
          {/* Tips */}
          <div
            className="bg-white/80 backdrop-blur-sm rounded-3xl border border-navy/[0.07] shadow-sm p-7"
            style={{ animation: 'hero-fade-up 0.6s cubic-bezier(0.22,1,0.36,1) 0.7s both' }}
          >
            <div className="flex items-center space-x-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-navy flex items-center justify-center shadow-sm flex-shrink-0">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-general font-bold text-navy text-base leading-tight">How to Use VoiceLink</h3>
                <p className="text-xs text-navy/40 font-instrument">Tips for the best results</p>
              </div>
            </div>
            <ul className="space-y-3.5">
              {tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-base leading-tight mt-0.5 flex-shrink-0">{tip.emoji}</span>
                  <span className="text-sm text-navy/60 font-instrument leading-relaxed">{tip.text}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate(withUTM('/support'))}
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-navy/50 hover:text-navy transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              View full usage guide
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Support */}
          <div
            className="bg-navy rounded-3xl p-7 relative overflow-hidden shadow-lg"
            style={{ animation: 'hero-fade-up 0.6s cubic-bezier(0.22,1,0.36,1) 0.78s both' }}
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
                  <p className="text-xs text-white/45 font-instrument">We're here for you</p>
                </div>
              </div>
              <p className="text-sm text-white/60 font-instrument leading-relaxed mb-6">
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
                <button
                  onClick={() => navigate(withUTM('/support'))}
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold text-sm py-2.5 px-5 rounded-full transition-colors border border-white/[0.12]"
                >
                  <Headphones className="w-4 h-4" />
                  Support Center
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pb-10 px-6 text-center">
        <p className="text-xs text-navy/28 font-instrument">
          © 2025 Finit Solutions ·{' '}
          <a href="/privacy-policy" className="hover:text-navy/50 transition-colors">Privacy</a>{' '}·{' '}
          <a href="/saas-agreement" className="hover:text-navy/50 transition-colors">SaaS Agreement</a>{' '}·{' '}
          <a href="/support" className="hover:text-navy/50 transition-colors">Support</a>
        </p>
      </footer>
    </div>
  );
};
