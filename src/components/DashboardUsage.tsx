import { useEffect, useState } from 'react';
import { BarChart3, MessageSquare, Coins, Clock, Type } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useI18n } from '../hooks/useI18n';

interface UsageStats {
  messages_sent: number;
  input_tokens_spent: number;
  output_tokens_spent: number;
  total_cost: number;
  sonnet_cost: number;
  haiku_cost: number;
  consolidation_cost: number;
  last_activity: string | null;
  avg_message_length: number;
  environments: string[];
}

const INPUT_TOKENS_PER_CREDIT = 10_000;

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

function formatCredits(inputTokens: number): string {
  const credits = inputTokens / INPUT_TOKENS_PER_CREDIT;
  const fractionDigits = credits >= 100 ? 0 : credits >= 10 ? 1 : 2;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(credits);
}

export function DashboardUsage() {
  const { t, currentLanguage } = useI18n();
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          if (!cancelled) {
            setError('Not signed in');
            setLoading(false);
          }
          return;
        }

        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-usage-stats`,
          { headers: { Authorization: `Bearer ${session.access_token}` } },
        );
        const data = await res.json();
        if (cancelled) return;

        if (!data.success) {
          setError(data.error ?? 'Failed to load usage');
        } else {
          setStats(data.usage as UsageStats | null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load usage');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  function formatRelative(iso: string | null): string {
    if (!iso) return t('dash.usage.relNone');
    const ts = Date.parse(iso);
    if (Number.isNaN(ts)) return t('dash.usage.relNone');
    const diff = Date.now() - ts;
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 1) return t('dash.usage.relJustNow');
    if (minutes < 60) return t('dash.usage.relMinutes', { n: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t('dash.usage.relHours', { n: hours });
    const days = Math.floor(hours / 24);
    if (days < 30) return t(days === 1 ? 'dash.usage.relDaysOne' : 'dash.usage.relDaysMany', { n: days });
    return new Date(ts).toLocaleDateString(currentLanguage, {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  }

  return (
    <div className="max-w-5xl mx-auto px-6 pt-10 pb-16">
      <header className="mb-8">
        <div className="flex items-center gap-2.5 text-navy/50 mb-2">
          <BarChart3 className="w-4 h-4" />
          <span className="text-xs uppercase tracking-widest font-semibold">{t('dash.usage.eyebrow')}</span>
        </div>
        <h1 className="font-general font-bold text-navy text-3xl tracking-tight">{t('dash.usage.title')}</h1>
        <p className="text-navy/60 mt-1.5">{t('dash.usage.subtitle')}</p>
      </header>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-5"
            >
              <div className="w-9 h-9 rounded-xl bg-navy/[0.06] mb-3 animate-pulse" />
              <div className="h-3 w-20 bg-navy/[0.07] rounded-full mb-2 animate-pulse" />
              <div className="h-7 w-24 bg-navy/[0.1] rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
          <p className="text-sm text-red-700 font-medium">{t('dash.usage.errorTitle')}</p>
          <p className="text-sm text-red-600/80 mt-1">{error}</p>
        </div>
      ) : !stats ? (
        <EmptyState />
      ) : (
        <UsageContent stats={stats} formatRelative={formatRelative} />
      )}
    </div>
  );
}

function UsageContent({
  stats,
  formatRelative,
}: {
  stats: UsageStats;
  formatRelative: (iso: string | null) => string;
}) {
  const { t, currentLanguage } = useI18n();

  const metrics = [
    {
      icon: MessageSquare,
      label: t('dash.usage.metricMessages'),
      value: formatNumber(stats.messages_sent),
      hint: t('dash.usage.metricMessagesHint'),
    },
    {
      icon: Coins,
      label: t('dash.usage.metricCredits'),
      value: formatCredits(stats.input_tokens_spent),
      hint: t('dash.usage.metricCreditsHint'),
    },
    {
      icon: Type,
      label: t('dash.usage.metricAvgLength'),
      value: `${formatNumber(stats.avg_message_length)}`,
      hint: t('dash.usage.metricAvgLengthHint'),
    },
    {
      icon: Clock,
      label: t('dash.usage.metricLastActivity'),
      value: formatRelative(stats.last_activity),
      hint: stats.last_activity
        ? new Date(stats.last_activity).toLocaleDateString(currentLanguage, {
            day: 'numeric', month: 'short', year: 'numeric',
          })
        : '—',
    },
  ];

  const uniqueEnvironments = Array.from(new Set(stats.environments));

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map(({ icon: Icon, label, value, hint }) => (
          <div
            key={label}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-5 hover:shadow-md transition-shadow duration-300"
          >
            <div className="w-9 h-9 rounded-xl bg-navy/[0.06] flex items-center justify-center mb-3">
              <Icon className="w-4 h-4 text-navy/70" />
            </div>
            <p className="text-xs uppercase tracking-widest font-semibold text-navy/40 mb-1">
              {label}
            </p>
            <p className="font-general font-bold text-navy text-2xl truncate">{value}</p>
            <p className="text-navy/45 text-xs mt-0.5">{hint}</p>
          </div>
        ))}
      </div>

      {uniqueEnvironments.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-5 mb-6 flex items-center gap-3 flex-wrap">
          <span className="text-xs uppercase tracking-widest font-semibold text-navy/40">
            {t('dash.usage.environments')}
          </span>
          {uniqueEnvironments.map((env) => (
            <span
              key={env}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-navy/[0.06] text-navy/70 capitalize"
            >
              {env}
            </span>
          ))}
        </div>
      )}

      <section className="bg-white/60 backdrop-blur-sm rounded-2xl border border-dashed border-navy/15 p-6 text-center">
        <p className="text-xs uppercase tracking-widest font-semibold text-navy/40 mb-2">
          {t('dash.usage.comingSoonLabel')}
        </p>
        <h3 className="font-general font-semibold text-navy text-lg mb-1">
          {t('dash.usage.comingSoonTitle')}
        </h3>
        <p className="text-navy/60 text-sm max-w-md mx-auto">{t('dash.usage.comingSoonBody')}</p>
      </section>
    </>
  );
}

function EmptyState() {
  const { t } = useI18n();
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-10 text-center">
      <div className="w-14 h-14 rounded-2xl bg-navy/[0.06] flex items-center justify-center mx-auto mb-4">
        <BarChart3 className="w-6 h-6 text-navy/50" />
      </div>
      <h3 className="font-general font-semibold text-navy text-lg mb-1.5">{t('dash.usage.emptyTitle')}</h3>
      <p className="text-navy/60 text-sm max-w-md mx-auto">{t('dash.usage.emptyBody')}</p>
    </div>
  );
}
