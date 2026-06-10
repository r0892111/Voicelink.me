import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Hourglass, BadgeEuro, TrendingUp, Copy, Check, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useI18n } from '../hooks/useI18n';

interface PortalSummary {
  signups: number;
  trials: number;
  paying: number;
  projected_commission_cents: number;
  currency: string;
  commission_rate: number;
}

interface PortalReferral {
  signed_up_at: string;
  status: 'trial' | 'paying' | 'churned';
  monthly_commission_cents: number;
  currency: string;
}

interface PortalData {
  partner: { company_name: string; ref_code: string };
  summary: PortalSummary;
  referrals: PortalReferral[];
}

type ViewState = 'loading' | 'unauthed' | 'denied' | 'error' | 'ready';

function formatEur(cents: number): string {
  return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

const STATUS_STYLES: Record<PortalReferral['status'], string> = {
  paying: 'bg-emerald-50 text-emerald-700',
  trial: 'bg-amber-50 text-amber-700',
  churned: 'bg-navy/[0.06] text-navy/50',
};

export function PartnerDashboard() {
  const { t, formatDate } = useI18n();
  const navigate = useNavigate();
  const [state, setState] = useState<ViewState>('loading');
  const [data, setData] = useState<PortalData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async (accessToken: string) => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/affiliate-portal`,
          { headers: { Authorization: `Bearer ${accessToken}` } },
        );
        const body = await res.json();
        if (cancelled) return;
        if (res.status === 403) {
          setState('denied');
          return;
        }
        if (!res.ok || !body.success) {
          setState('error');
          return;
        }
        setData(body);
        setState('ready');
      } catch {
        if (!cancelled) setState('error');
      }
    };

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session) {
        load(session.access_token);
        return;
      }
      // Magic-link landing: the #access_token hash may still be processing —
      // wait for the auth event instead of bouncing straight to login.
      if (window.location.hash.includes('access_token')) {
        const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
          if (s && !cancelled) {
            sub.subscription.unsubscribe();
            load(s.access_token);
          }
        });
        return;
      }
      setState('unauthed');
    })();

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (state === 'unauthed') navigate('/partner/login', { replace: true });
  }, [state, navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/partner/login', { replace: true });
  };

  const refLink = data ? `${window.location.origin}/?ref=${data.partner.ref_code}` : '';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(refLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (e.g. non-HTTPS) — the link is selectable text.
    }
  };

  if (state === 'loading' || state === 'unauthed') {
    return (
      <div className="min-h-screen bg-porcelain flex items-center justify-center">
        <div className="dot-loader" />
      </div>
    );
  }

  if (state === 'denied' || state === 'error') {
    return (
      <div className="min-h-screen bg-porcelain flex flex-col items-center justify-center px-6">
        <img src="/Finit Voicelink Blue.svg" alt="VoiceLink" className="h-9 w-auto mb-10" />
        <div className="w-full max-w-md bg-white rounded-2xl border border-navy/[0.07] shadow-sm p-8 text-center">
          <h1 className="font-general font-bold text-navy text-xl tracking-tight mb-2">
            {t(state === 'denied' ? 'partner.denied.title' : 'partner.error.title')}
          </h1>
          <p className="text-navy/60 text-sm mb-6">
            {t(state === 'denied' ? 'partner.denied.body' : 'partner.error.body')}
          </p>
          <button
            onClick={signOut}
            className="text-navy/60 hover:text-navy text-sm font-medium underline underline-offset-4"
          >
            {t('partner.signOut')}
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    { icon: UserPlus, labelKey: 'partner.stats.signups', value: String(data.summary.signups) },
    { icon: Hourglass, labelKey: 'partner.stats.trials', value: String(data.summary.trials) },
    { icon: BadgeEuro, labelKey: 'partner.stats.paying', value: String(data.summary.paying) },
    {
      icon: TrendingUp,
      labelKey: 'partner.stats.commission',
      value: formatEur(data.summary.projected_commission_cents),
    },
  ];

  return (
    <div className="min-h-screen bg-porcelain">
      <header className="bg-white border-b border-navy/[0.07]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <img src="/Finit Voicelink Blue.svg" alt="VoiceLink" className="h-7 w-auto" />
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-navy hidden sm:block">
              {data.partner.company_name}
            </span>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-navy/50 hover:text-navy text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('partner.signOut')}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-10 pb-16">
        <header className="mb-8">
          <h1 className="font-general font-bold text-navy text-3xl tracking-tight">
            {t('partner.title')}
          </h1>
          <p className="text-navy/60 mt-1.5">
            {t('partner.subtitle', { rate: Math.round(data.summary.commission_rate * 100) })}
          </p>
        </header>

        <div className="mb-8 bg-white rounded-2xl border border-navy/[0.07] shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-widest font-semibold text-navy/40 mb-1">
              {t('partner.linkLabel')}
            </p>
            <p className="font-mono text-sm text-navy truncate">{refLink}</p>
          </div>
          <button
            onClick={copyLink}
            className="flex items-center justify-center gap-2 bg-navy hover:bg-navy-hover text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors flex-shrink-0"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? t('partner.copied') : t('partner.copy')}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.labelKey} className="bg-white rounded-2xl border border-navy/[0.07] shadow-sm p-5">
                <div className="flex items-center gap-2 text-navy/45 mb-2">
                  <Icon className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wider font-semibold">{t(s.labelKey)}</span>
                </div>
                <div className="font-general font-bold text-navy text-2xl tracking-tight">{s.value}</div>
              </div>
            );
          })}
        </div>

        <section>
          <h2 className="font-general font-semibold text-navy text-lg mb-3">{t('partner.referralsTitle')}</h2>
          <div className="bg-white rounded-2xl border border-navy/[0.07] shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-navy/40 border-b border-navy/[0.07]">
                  <th className="px-4 py-3 font-semibold">{t('partner.table.date')}</th>
                  <th className="px-4 py-3 font-semibold">{t('partner.table.status')}</th>
                  <th className="px-4 py-3 font-semibold text-right">{t('partner.table.commission')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy/[0.05]">
                {data.referrals.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-navy/50">
                      {t('partner.noReferrals')}
                    </td>
                  </tr>
                )}
                {data.referrals.map((ref, i) => (
                  <tr key={i} className="text-navy">
                    <td className="px-4 py-3 text-navy/70">{formatDate(new Date(ref.signed_up_at))}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[ref.status]}`}>
                        {t(`partner.status.${ref.status}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {ref.status === 'paying' ? `${formatEur(ref.monthly_commission_cents)} / ${t('partner.month')}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-navy/45 text-xs mt-4">{t('partner.payoutNote')}</p>
        </section>
      </main>
    </div>
  );
}
