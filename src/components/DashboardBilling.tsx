import { CreditCard, ExternalLink, Loader2, Lock } from 'lucide-react';
import { useDashboardContext } from '../hooks/useDashboardContext';

const STATUS_LABELS: Record<string, { label: string; tone: 'positive' | 'warning' | 'neutral' }> = {
  active: { label: 'Active', tone: 'positive' },
  trialing: { label: 'Trial', tone: 'positive' },
  past_due: { label: 'Past due', tone: 'warning' },
  canceled: { label: 'Canceled', tone: 'warning' },
  incomplete: { label: 'Incomplete', tone: 'warning' },
  unpaid: { label: 'Unpaid', tone: 'warning' },
};

function formatCurrency(amount: number | null, currency: string | null): string {
  if (amount == null || !currency) return '—';
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  });
  return formatter.format(amount / 100);
}

function formatDate(timestamp: number | null): string {
  if (!timestamp) return '—';
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function DashboardBilling() {
  const { role, subscription } = useDashboardContext();

  if (!role.isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-16">
        <header className="mb-8">
          <h1 className="font-general font-bold text-navy text-3xl tracking-tight">Billing</h1>
          <p className="text-navy/60 mt-1.5">Billing is managed by your workspace admin.</p>
        </header>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-navy/[0.06] flex items-center justify-center mx-auto mb-4">
            <Lock className="w-5 h-5 text-navy/50" />
          </div>
          <h2 className="font-general font-semibold text-navy text-lg mb-2">Managed by your admin</h2>
          <p className="text-navy/60 text-sm max-w-md mx-auto">
            {role.adminName
              ? `${role.adminName} owns the billing for your workspace.`
              : 'Your workspace admin owns billing.'}
          </p>
        </div>
      </div>
    );
  }

  const info = subscription.info;
  const status = info?.subscription_status ?? null;
  const statusMeta = status ? STATUS_LABELS[status] ?? { label: status, tone: 'neutral' as const } : null;

  return (
    <div className="max-w-4xl mx-auto px-6 pt-10 pb-16">
      <header className="mb-8">
        <div className="flex items-center gap-2.5 text-navy/50 mb-2">
          <CreditCard className="w-4 h-4" />
          <span className="text-xs uppercase tracking-widest font-semibold">Billing</span>
        </div>
        <h1 className="font-general font-bold text-navy text-3xl tracking-tight">Subscription & invoices</h1>
        <p className="text-navy/60 mt-1.5">
          Manage your plan, payment method, and download invoices via the Stripe customer portal.
        </p>
      </header>

      <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-6 mb-6">
        {subscription.checking ? (
          <div className="flex items-center justify-center py-8">
            <div className="dot-loader" />
          </div>
        ) : info ? (
          <>
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-xs uppercase tracking-widest font-semibold text-navy/40 mb-1">Current plan</p>
                <h2 className="font-general font-bold text-navy text-2xl">
                  {info.plan_name ?? 'VoiceLink'}
                </h2>
                <p className="text-navy/60 text-sm mt-1">
                  {formatCurrency(info.amount, info.currency)}
                  {info.interval ? ` / ${info.interval}` : ''}
                </p>
              </div>
              {statusMeta && (
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    statusMeta.tone === 'positive'
                      ? 'bg-emerald-50 text-emerald-700'
                      : statusMeta.tone === 'warning'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-navy/[0.06] text-navy/70'
                  }`}
                >
                  {statusMeta.label}
                </span>
              )}
            </div>

            <dl className="grid sm:grid-cols-2 gap-4 mb-6">
              {info.trial_end && (
                <div>
                  <dt className="text-xs uppercase tracking-widest font-semibold text-navy/40 mb-1">Trial ends</dt>
                  <dd className="text-navy font-medium">{formatDate(info.trial_end)}</dd>
                </div>
              )}
              {info.current_period_end && (
                <div>
                  <dt className="text-xs uppercase tracking-widest font-semibold text-navy/40 mb-1">Next renewal</dt>
                  <dd className="text-navy font-medium">{formatDate(info.current_period_end)}</dd>
                </div>
              )}
            </dl>

            <button
              onClick={subscription.openPortal}
              disabled={subscription.portalLoading}
              className="inline-flex items-center gap-2 bg-navy text-white px-5 py-2.5 rounded-full font-semibold hover:bg-navy-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {subscription.portalLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4" />
              )}
              Manage in Stripe portal
            </button>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-navy/60 mb-4">No active subscription found.</p>
            <button
              onClick={subscription.startTrial}
              className="inline-flex items-center gap-2 bg-navy text-white px-5 py-2.5 rounded-full font-semibold hover:bg-navy-hover transition-colors"
            >
              Start trial
            </button>
          </div>
        )}
      </section>

      <section className="bg-white/60 backdrop-blur-sm rounded-2xl border border-dashed border-navy/15 p-6">
        <p className="text-xs uppercase tracking-widest font-semibold text-navy/40 mb-2">Coming soon</p>
        <h3 className="font-general font-semibold text-navy text-lg mb-1">Voice-note credits</h3>
        <p className="text-navy/60 text-sm">
          Top-up credits and per-message billing land alongside the new usage dashboard.
        </p>
      </section>
    </div>
  );
}
