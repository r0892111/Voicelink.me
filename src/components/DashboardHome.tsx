import { useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  CheckCircle,
  Zap,
  ArrowRight,
  Clock,
  Mic,
  BookOpen,
  Sparkles,
  Star,
  ChevronDown,
  X,
  ExternalLink,
  Users,
  BarChart3,
} from 'lucide-react';
import { useDashboardContext } from '../hooks/useDashboardContext';
import { WhatsAppConnectForm } from './WhatsAppConnectForm';
import { withUTM } from '../utils/utm';

const PLATFORM_LABELS: Record<string, string> = {
  teamleader: 'Teamleader',
  pipedrive: 'Pipedrive',
  odoo: 'Odoo',
};

const TIPS = [
  { emoji: '🗣️', text: 'Start with "Just spoke with [Name]" to log a contact.' },
  { emoji: '📅', text: '"Call him back Monday at 3 PM" creates a task automatically.' },
  { emoji: '🎯', text: 'One person per voice note keeps things accurate.' },
  { emoji: '✍️', text: 'Spell tricky names letter-by-letter for perfect CRM input.' },
];

function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function DashboardHome() {
  const navigate = useNavigate();
  const { user, wa, role, subscription } = useDashboardContext();

  const platformLabel = PLATFORM_LABELS[user.platform] ?? 'your CRM';
  const firstName = user.name?.split(' ')[0] || 'there';

  const subStatus = subscription.info?.subscription_status;
  const isSubscribed = subStatus === 'active' || subStatus === 'trialing';
  const isLapsed = !!subStatus && !isSubscribed && subStatus !== 'none';
  const needsTrial = !subscription.checking && (!subStatus || subStatus === 'none');
  const canConnectWhatsApp = isSubscribed;
  const fullySetUp = wa.status === 'active';

  const setupSteps = [
    {
      n: 1,
      done: true,
      title: `${platformLabel} Connected`,
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

  return (
    <div className="font-instrument">
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
            <span className="text-sm font-medium text-navy/65">{platformLabel} — Connected &amp; Active</span>
          </div>

          <h1
            className="font-general font-bold text-navy leading-[1.08] mb-4"
            style={{
              fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
              animation: 'hero-slide-in 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s both',
            }}
          >
            {getTimeGreeting()}, {firstName}! 👋
          </h1>

          <p
            className="text-lg md:text-xl text-navy/55 font-medium max-w-xl leading-relaxed"
            style={{ animation: 'hero-subtitle-in 0.6s cubic-bezier(0.22,1,0.36,1) 0.22s both' }}
          >
            {fullySetUp
              ? "VoiceLink is ready when you are. Just open WhatsApp and start talking — we'll handle the rest."
              : "Almost there. Let's finish connecting your account."}
          </p>
        </div>
      </section>

      {/* ── STATUS CARDS ── */}
      <section className="px-6 pb-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* CRM */}
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
            <p className="text-xs text-navy/50">{platformLabel} is connected &amp; syncing</p>
            <div className="mt-3 flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-medium text-emerald-600">Live</span>
            </div>
          </div>

          {/* WhatsApp */}
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
            <p className="text-xs text-navy/50 truncate">
              {wa.status === 'active' ? wa.number : wa.status === 'pending' ? 'Verification pending' : 'Not yet connected'}
            </p>
            <div className="mt-3 flex items-center space-x-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${wa.status === 'active' ? 'bg-emerald-400' : wa.status === 'pending' ? 'bg-amber-400' : 'bg-navy/20'}`} />
              <span className={`text-xs font-medium ${wa.status === 'active' ? 'text-emerald-600' : wa.status === 'pending' ? 'text-amber-600' : 'text-navy/40'}`}>
                {wa.status === 'active' ? 'Connected' : wa.status === 'pending' ? 'Pending' : 'Not connected'}
              </span>
            </div>
          </div>

          {/* Subscription */}
          {role.isMember ? (
            <div
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] p-5 shadow-sm hover:shadow-md transition-shadow duration-300"
              style={{ animation: 'hero-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.58s both' }}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-50">
                  <Star className="w-5 h-5 text-emerald-500" />
                </div>
                <span className="font-general font-semibold text-navy text-sm">Subscription</span>
              </div>
              <p className="text-xs text-navy/50">Managed by {role.adminName || 'your admin'}</p>
              <div className="mt-3 flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-medium text-emerald-600">Active</span>
              </div>
            </div>
          ) : (
            <div
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] p-5 shadow-sm hover:shadow-md transition-shadow duration-300"
              style={{ animation: 'hero-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.58s both' }}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${!subscription.checking && isSubscribed ? 'bg-emerald-50' : 'bg-navy/[0.05]'}`}>
                  <Star className={`w-5 h-5 ${!subscription.checking && isSubscribed ? 'text-emerald-500' : 'text-navy/50'}`} />
                </div>
                <span className="font-general font-semibold text-navy text-sm">Subscription</span>
              </div>
              {subscription.checking ? (
                <div className="h-3.5 w-28 bg-navy/[0.07] rounded-full animate-pulse mt-0.5" />
              ) : (
                <p className="text-xs text-navy/50 truncate">
                  {subscription.info?.plan_name ?? 'VoiceLink'}
                  {subscription.info?.amount != null && subscription.info?.currency && (
                    <span className="ml-1">
                      · {(subscription.info.amount / 100).toLocaleString('en', { style: 'currency', currency: subscription.info.currency.toUpperCase() })}{subscription.info.interval ? `/${subscription.info.interval}` : ''}
                    </span>
                  )}
                </p>
              )}
              <div className="mt-3 space-y-1">
                {subscription.checking && (
                  <div className="h-3 w-20 bg-navy/[0.07] rounded-full animate-pulse" />
                )}
                {!subscription.checking && subStatus === 'trialing' && (
                  <>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span className="text-xs font-medium text-amber-600">
                        Free trial · {subscription.info?.trial_end ? Math.max(0, Math.ceil((subscription.info.trial_end * 1000 - Date.now()) / 86_400_000)) : '—'} days left
                      </span>
                    </div>
                    {subscription.info?.trial_end && (
                      <p className="text-xs text-navy/40 pl-3">
                        Billing starts {new Date(subscription.info.trial_end * 1000).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </>
                )}
                {!subscription.checking && subStatus === 'active' && (
                  <>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-xs font-medium text-emerald-600">Active</span>
                    </div>
                    {subscription.info?.current_period_end && (
                      <p className="text-xs text-navy/40 pl-3">
                        Renews {new Date(subscription.info.current_period_end * 1000).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </>
                )}
                {!subscription.checking && subStatus === 'past_due' && (
                  <div className="flex items-center space-x-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    <span className="text-xs font-medium text-red-600">Payment due</span>
                  </div>
                )}
                {!subscription.checking && (!subStatus || subStatus === 'none') && (
                  <div className="flex items-center space-x-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-navy/20" />
                    <span className="text-xs font-medium text-navy/40">—</span>
                  </div>
                )}
              </div>
              {!subscription.checking && isSubscribed && (
                <button
                  onClick={() => navigate('/dashboard/billing')}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-navy/50 hover:text-navy transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Manage subscription
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── SUBSCRIPTION BANNER (admins only) ── */}
      {!role.isMember && (needsTrial || isLapsed) && (
        <section className="px-6 pb-6">
          <div className="max-w-4xl mx-auto">
            {needsTrial ? (
              <div
                className="relative overflow-hidden bg-navy rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-5"
                style={{ animation: 'hero-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.62s both' }}
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%)' }}
                  aria-hidden
                />
                <div className="relative flex-1">
                  <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-semibold px-3 py-1 rounded-full mb-2">
                    <Sparkles className="w-3 h-3" />
                    14-day free trial
                  </div>
                  <h3 className="font-general font-bold text-white text-lg leading-tight">
                    Unlock the full VoiceLink experience
                  </h3>
                  <p className="text-white/55 text-sm mt-1">
                    Try everything VoiceLink has to offer, free for 14 days. Cancel anytime.
                  </p>
                </div>
                <button
                  onClick={subscription.startTrial}
                  className="relative flex-shrink-0 inline-flex items-center gap-2 bg-white text-navy font-semibold text-sm py-3 px-6 rounded-full hover:bg-white/90 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                >
                  Start Free Trial
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                className="bg-amber-50 border border-amber-200/70 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-5"
                style={{ animation: 'hero-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.62s both' }}
              >
                <div className="flex-1">
                  <h3 className="font-general font-bold text-amber-800 text-lg leading-tight">
                    Your subscription has ended
                  </h3>
                  <p className="text-amber-700/70 text-sm mt-1">
                    Renew to keep your CRM syncing with VoiceLink.
                  </p>
                </div>
                <button
                  onClick={subscription.startTrial}
                  className="flex-shrink-0 inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm py-3 px-6 rounded-full transition-colors"
                >
                  Renew Now
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── SETUP CHECKLIST (only when not fully set up) ── */}
      {!fullySetUp && (
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
              <p className="text-sm text-navy/45 mb-7 ml-8">
                Three quick steps to get fully up and running
              </p>

              <div className="space-y-3">
                {setupSteps.map((step) => (
                  <div key={step.n}>
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
                        <p className="text-xs text-navy/50 mt-0.5 leading-relaxed">{step.description}</p>
                      </div>

                      {step.n === 2 && wa.status === 'not_set' && canConnectWhatsApp && (
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
                      {step.n === 2 && wa.status === 'not_set' && !canConnectWhatsApp && !subscription.checking && !role.isMember && (
                        <button
                          onClick={subscription.startTrial}
                          className="flex-shrink-0 inline-flex items-center gap-1.5 bg-navy text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-navy-hover transition-colors"
                        >
                          Start Trial First
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                      {step.n === 2 && wa.status === 'not_set' && !canConnectWhatsApp && !subscription.checking && role.isMember && (
                        <span className="flex-shrink-0 inline-flex items-center gap-1.5 bg-navy/[0.05] text-navy/60 text-xs font-semibold px-4 py-2 rounded-full">
                          Awaiting admin
                        </span>
                      )}
                    </div>

                    {step.n === 2 && wa.status === 'not_set' && canConnectWhatsApp && (
                      <WhatsAppConnectForm
                        open={wa.open}
                        step={wa.step}
                        phone={wa.phone}
                        otp={wa.otp}
                        busy={wa.busy}
                        error={wa.error}
                        success={wa.success}
                        onPhoneChange={(v) => wa.setPhone(v)}
                        onOtpChange={(v) => wa.setOtp(v)}
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
      )}

      {/* ── QUICK ACTIONS (fully set up) ── */}
      {fullySetUp && (
        <section className="px-6 pb-8">
          <div className="max-w-4xl mx-auto">
            <div
              className="bg-white/80 backdrop-blur-sm rounded-3xl border border-navy/[0.07] shadow-sm p-7"
              style={{ animation: 'hero-fade-up 0.6s cubic-bezier(0.22,1,0.36,1) 0.62s both' }}
            >
              <div className="flex items-center space-x-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="font-general font-bold text-navy text-lg leading-tight">You're all set</h2>
                  <p className="text-xs text-navy/45">Everything's connected — jump back into your workflow.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <a
                  href={`https://wa.me/${(wa.number || '').replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-start gap-2 p-4 rounded-2xl bg-navy/[0.03] hover:bg-navy/[0.06] border border-navy/[0.05] transition-colors"
                >
                  <Mic className="w-5 h-5 text-navy/60 group-hover:text-navy transition-colors" />
                  <span className="font-general font-semibold text-sm text-navy">Send voice note</span>
                </a>
                {role.isAdmin && (
                  <button
                    onClick={() => navigate('/dashboard/team')}
                    className="group flex flex-col items-start gap-2 p-4 rounded-2xl bg-navy/[0.03] hover:bg-navy/[0.06] border border-navy/[0.05] transition-colors text-left"
                  >
                    <Users className="w-5 h-5 text-navy/60 group-hover:text-navy transition-colors" />
                    <span className="font-general font-semibold text-sm text-navy">Invite teammate</span>
                  </button>
                )}
                <button
                  onClick={() => navigate('/dashboard/usage')}
                  className="group flex flex-col items-start gap-2 p-4 rounded-2xl bg-navy/[0.03] hover:bg-navy/[0.06] border border-navy/[0.05] transition-colors text-left"
                >
                  <BarChart3 className="w-5 h-5 text-navy/60 group-hover:text-navy transition-colors" />
                  <span className="font-general font-semibold text-sm text-navy">View usage</span>
                </button>
                <button
                  onClick={() => navigate('/dashboard/guide')}
                  className="group flex flex-col items-start gap-2 p-4 rounded-2xl bg-navy/[0.03] hover:bg-navy/[0.06] border border-navy/[0.05] transition-colors text-left"
                >
                  <BookOpen className="w-5 h-5 text-navy/60 group-hover:text-navy transition-colors" />
                  <span className="font-general font-semibold text-sm text-navy">User guide</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── TIPS ── */}
      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
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
                <p className="text-xs text-navy/40">Tips for the best results</p>
              </div>
            </div>
            <ul className="space-y-3.5">
              {TIPS.map((tip, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-base leading-tight mt-0.5 flex-shrink-0">{tip.emoji}</span>
                  <span className="text-sm text-navy/60 leading-relaxed">{tip.text}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate(withUTM('/dashboard/guide'))}
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-navy/50 hover:text-navy transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              View full user guide
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
