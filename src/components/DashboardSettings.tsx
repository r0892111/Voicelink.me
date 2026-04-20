import { useEffect } from 'react';
import { Settings, Phone, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import { useDashboardContext } from '../hooks/useDashboardContext';
import { WhatsAppConnectForm } from './WhatsAppConnectForm';

export function DashboardSettings() {
  const { wa, subscription, role } = useDashboardContext();
  const isConnected = wa.status === 'active';
  const subStatus = subscription.info?.subscription_status;
  const canConnect = subStatus === 'active' || subStatus === 'trialing';

  useEffect(() => {
    if (!isConnected && canConnect && !wa.open) wa.toggle();
  }, [isConnected, canConnect]);

  return (
    <div className="max-w-4xl mx-auto px-6 pt-10 pb-16">
      <header className="mb-8">
        <div className="flex items-center gap-2.5 text-navy/50 mb-2">
          <Settings className="w-4 h-4" />
          <span className="text-xs uppercase tracking-widest font-semibold">Account</span>
        </div>
        <h1 className="font-general font-bold text-navy text-3xl tracking-tight">Settings</h1>
        <p className="text-navy/60 mt-1.5">Manage your VoiceLink connections and preferences.</p>
      </header>

      <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-navy/[0.06] flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-navy/70" />
            </div>
            <div>
              <h2 className="font-general font-semibold text-navy text-lg">WhatsApp number</h2>
              <p className="text-navy/55 text-sm">
                The number that voice notes are sent from.
              </p>
            </div>
          </div>
          {isConnected && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active
            </span>
          )}
        </div>

        {isConnected ? (
          <div className="bg-navy/[0.03] rounded-xl px-4 py-3">
            <p className="text-xs uppercase tracking-widest font-semibold text-navy/40 mb-0.5">Connected number</p>
            <p className="text-navy font-medium font-mono">{wa.number}</p>
          </div>
        ) : !canConnect && role.isMember ? (
          <div className="bg-navy/[0.03] border border-navy/[0.07] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-navy/[0.06] flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 text-navy/60" />
            </div>
            <div className="flex-1">
              <p className="font-general font-semibold text-navy text-sm">Waiting on your admin</p>
              <p className="text-navy/55 text-sm mt-0.5">
                {role.adminName
                  ? `${role.adminName} needs to activate the workspace trial before you can connect WhatsApp.`
                  : 'Your workspace admin needs to activate the trial before you can connect WhatsApp.'}
              </p>
            </div>
          </div>
        ) : !canConnect ? (
          <div className="bg-navy/[0.03] border border-navy/[0.07] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-navy/[0.06] flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 text-navy/60" />
            </div>
            <div className="flex-1">
              <p className="font-general font-semibold text-navy text-sm">Start your free trial first</p>
              <p className="text-navy/55 text-sm mt-0.5">
                Activate your 14-day free trial to unlock WhatsApp connection.
              </p>
            </div>
            <button
              onClick={subscription.startTrial}
              className="flex-shrink-0 inline-flex items-center gap-2 bg-navy hover:bg-navy-hover text-white font-semibold text-sm py-2.5 px-5 rounded-full transition-colors"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <WhatsAppConnectForm
            open={wa.open}
            step={wa.step}
            phone={wa.phone}
            otp={wa.otp}
            busy={wa.busy}
            error={wa.error}
            success={wa.success}
            onPhoneChange={wa.setPhone}
            onOtpChange={wa.setOtp}
            onSendOtp={wa.sendOtp}
            onVerifyOtp={wa.verifyOtp}
            onBackToPhone={wa.backToPhone}
            onResendOtp={wa.resendOtp}
          />
        )}
      </section>

      <section className="bg-white/60 backdrop-blur-sm rounded-2xl border border-dashed border-navy/15 p-6">
        <p className="text-xs uppercase tracking-widest font-semibold text-navy/40 mb-2">Coming soon</p>
        <h3 className="font-general font-semibold text-navy text-lg mb-1">Notifications & language</h3>
        <p className="text-navy/60 text-sm">
          Choose your preferred language, email notifications, and sync cadence with your CRM.
        </p>
      </section>
    </div>
  );
}
