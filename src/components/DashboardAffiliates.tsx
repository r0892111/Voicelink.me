import { useEffect, useState } from 'react';
import { Handshake, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useI18n } from '../hooks/useI18n';

interface AffiliateRow {
  id: string;
  ref_code: string;
  company_name: string;
  contact_name: string | null;
  contact_email: string;
  status: string;
  commission_rate: number;
  portal_claimed: boolean;
  signups: number;
  trials: number;
  paying: number;
  monthly_commission_cents: number;
}

interface ReferredUserRow {
  name: string | null;
  email: string | null;
  ref_code: string;
  ref_source: string | null;
  attributed_at: string | null;
  signed_up_at: string;
  status: 'trial' | 'paying' | 'churned';
  net_monthly_cents: number;
  currency: string;
}

interface OverviewData {
  affiliates: AffiliateRow[];
  users: ReferredUserRow[];
  unmatched_codes: string[];
}

function formatEur(cents: number): string {
  return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

const STATUS_STYLES: Record<ReferredUserRow['status'], string> = {
  paying: 'bg-emerald-50 text-emerald-700',
  trial: 'bg-amber-50 text-amber-700',
  churned: 'bg-navy/[0.06] text-navy/50',
};

export function DashboardAffiliates() {
  const { t, formatDate } = useI18n();
  const [data, setData] = useState<OverviewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          if (!cancelled) setError(t('dash.affiliates.error'));
          return;
        }
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/affiliate-overview`,
          { headers: { Authorization: `Bearer ${session.access_token}` } },
        );
        const body = await res.json();
        if (cancelled) return;
        if (!res.ok || !body.success) {
          setError(t('dash.affiliates.error'));
          return;
        }
        setData(body);
      } catch {
        if (!cancelled) setError(t('dash.affiliates.error'));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-16">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-8 text-center text-navy/60">
          {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-16">
        <div className="flex items-center justify-center py-20">
          <div className="dot-loader" />
        </div>
      </div>
    );
  }

  const statusLabel = (s: ReferredUserRow['status']) => t(`dash.affiliates.status.${s}`);

  return (
    <div className="max-w-6xl mx-auto px-6 pt-10 pb-16">
      <header className="mb-8">
        <div className="flex items-center gap-2.5 text-navy/50 mb-2">
          <Handshake className="w-4 h-4" />
          <span className="text-xs uppercase tracking-widest font-semibold">{t('dash.affiliates.eyebrow')}</span>
        </div>
        <h1 className="font-general font-bold text-navy text-3xl tracking-tight">{t('dash.affiliates.title')}</h1>
        <p className="text-navy/60 mt-1.5">{t('dash.affiliates.subtitle')}</p>
      </header>

      {data.unmatched_codes.length > 0 && (
        <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-800 text-sm">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{t('dash.affiliates.unmatched', { codes: data.unmatched_codes.join(', ') })}</span>
        </div>
      )}

      <section className="mb-10">
        <h2 className="font-general font-semibold text-navy text-lg mb-3">{t('dash.affiliates.partnersTitle')}</h2>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-navy/40 border-b border-navy/[0.07]">
                <th className="px-4 py-3 font-semibold">{t('dash.affiliates.colPartner')}</th>
                <th className="px-4 py-3 font-semibold">{t('dash.affiliates.colCode')}</th>
                <th className="px-4 py-3 font-semibold text-right">{t('dash.affiliates.colSignups')}</th>
                <th className="px-4 py-3 font-semibold text-right">{t('dash.affiliates.colTrials')}</th>
                <th className="px-4 py-3 font-semibold text-right">{t('dash.affiliates.colPaying')}</th>
                <th className="px-4 py-3 font-semibold text-right">{t('dash.affiliates.colCommission')}</th>
                <th className="px-4 py-3 font-semibold">{t('dash.affiliates.colStatus')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/[0.05]">
              {data.affiliates.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-navy/50">
                    {t('dash.affiliates.noPartners')}
                  </td>
                </tr>
              )}
              {data.affiliates.map((a) => (
                <tr key={a.id} className="text-navy">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{a.company_name}</div>
                    <div className="text-xs text-navy/50">{a.contact_email}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{a.ref_code}</td>
                  <td className="px-4 py-3 text-right">{a.signups}</td>
                  <td className="px-4 py-3 text-right">{a.trials}</td>
                  <td className="px-4 py-3 text-right">{a.paying}</td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {formatEur(a.monthly_commission_cents)}
                    <span className="text-navy/40 font-normal"> / {t('dash.affiliates.month')}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-navy/[0.06] text-navy/60 capitalize">
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-general font-semibold text-navy text-lg mb-3">{t('dash.affiliates.usersTitle')}</h2>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-navy/40 border-b border-navy/[0.07]">
                <th className="px-4 py-3 font-semibold">{t('dash.affiliates.colUser')}</th>
                <th className="px-4 py-3 font-semibold">{t('dash.affiliates.colCode')}</th>
                <th className="px-4 py-3 font-semibold">{t('dash.affiliates.colSignedUp')}</th>
                <th className="px-4 py-3 font-semibold">{t('dash.affiliates.colStatus')}</th>
                <th className="px-4 py-3 font-semibold text-right">{t('dash.affiliates.colNetMonthly')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/[0.05]">
              {data.users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-navy/50">
                    {t('dash.affiliates.noUsers')}
                  </td>
                </tr>
              )}
              {data.users.map((u, i) => (
                <tr key={i} className="text-navy">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{u.name ?? '—'}</div>
                    <div className="text-xs text-navy/50">{u.email ?? '—'}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{u.ref_code}</td>
                  <td className="px-4 py-3 text-navy/70">{formatDate(new Date(u.signed_up_at))}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[u.status]}`}>
                      {statusLabel(u.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.status === 'paying' ? formatEur(u.net_monthly_cents) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
