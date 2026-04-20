import { useEffect, useState } from 'react';
import {
  BarChart3,
  MessageSquare,
  Coins,
  Clock,
  Type,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Mic,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

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

function formatUsd(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

function formatRelative(iso: string | null): string {
  if (!iso) return 'No activity yet';
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return 'No activity yet';
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(ts).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function DashboardUsage() {
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

  return (
    <div className="max-w-5xl mx-auto px-6 pt-10 pb-16">
      <header className="mb-8">
        <div className="flex items-center gap-2.5 text-navy/50 mb-2">
          <BarChart3 className="w-4 h-4" />
          <span className="text-xs uppercase tracking-widest font-semibold">Insights</span>
        </div>
        <h1 className="font-general font-bold text-navy text-3xl tracking-tight">Usage</h1>
        <p className="text-navy/60 mt-1.5">
          Cumulative VoiceLink activity for your account.
        </p>
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
          <p className="text-sm text-red-700 font-medium">Couldn't load usage</p>
          <p className="text-sm text-red-600/80 mt-1">{error}</p>
        </div>
      ) : !stats ? (
        <EmptyState />
      ) : (
        <UsageContent stats={stats} />
      )}
    </div>
  );
}

function UsageContent({ stats }: { stats: UsageStats }) {
  const sonnetPct = stats.total_cost > 0 ? (stats.sonnet_cost / stats.total_cost) * 100 : 0;
  const haikuPct = stats.total_cost > 0 ? (stats.haiku_cost / stats.total_cost) * 100 : 0;
  const consolidationPct =
    stats.total_cost > 0 ? (stats.consolidation_cost / stats.total_cost) * 100 : 0;

  const metrics = [
    {
      icon: MessageSquare,
      label: 'Messages sent',
      value: formatNumber(stats.messages_sent),
      hint: 'All time',
    },
    {
      icon: Coins,
      label: 'Total spend',
      value: formatUsd(stats.total_cost),
      hint: 'LLM processing',
    },
    {
      icon: Type,
      label: 'Avg length',
      value: `${formatNumber(stats.avg_message_length)}`,
      hint: 'Chars / message',
    },
    {
      icon: Clock,
      label: 'Last activity',
      value: formatRelative(stats.last_activity),
      hint: stats.last_activity
        ? new Date(stats.last_activity).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        : '—',
    },
  ];

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

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <Sparkles className="w-4 h-4 text-navy/60" />
            <h2 className="font-general font-semibold text-navy text-sm uppercase tracking-widest">
              Spend by model
            </h2>
          </div>

          <CostRow
            label="Sonnet"
            amount={stats.sonnet_cost}
            pct={sonnetPct}
            dotClass="bg-navy"
          />
          <CostRow
            label="Haiku"
            amount={stats.haiku_cost}
            pct={haikuPct}
            dotClass="bg-slate-blue"
          />
          <CostRow
            label="Consolidation"
            amount={stats.consolidation_cost}
            pct={consolidationPct}
            dotClass="bg-muted-blue"
          />

          <div className="mt-5 pt-4 border-t border-navy/[0.07] flex items-baseline justify-between">
            <span className="text-xs uppercase tracking-widest font-semibold text-navy/40">Total</span>
            <span className="font-general font-bold text-navy text-lg">
              {formatUsd(stats.total_cost)}
            </span>
          </div>
        </section>

        <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <Mic className="w-4 h-4 text-navy/60" />
            <h2 className="font-general font-semibold text-navy text-sm uppercase tracking-widest">
              Tokens processed
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-widest font-semibold text-navy/40 mb-0.5">
                  Input
                </p>
                <p className="font-general font-bold text-navy text-xl">
                  {formatNumber(stats.input_tokens_spent)}
                </p>
                <p className="text-navy/45 text-xs">From your voice notes</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-navy/[0.06] flex items-center justify-center flex-shrink-0">
                <ArrowDownLeft className="w-4 h-4 text-navy/70" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-widest font-semibold text-navy/40 mb-0.5">
                  Output
                </p>
                <p className="font-general font-bold text-navy text-xl">
                  {formatNumber(stats.output_tokens_spent)}
                </p>
                <p className="text-navy/45 text-xs">CRM updates + summaries</p>
              </div>
            </div>
          </div>

          {stats.environments.length > 0 && (
            <div className="mt-5 pt-4 border-t border-navy/[0.07] flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase tracking-widest font-semibold text-navy/40">
                Environments
              </span>
              {Array.from(new Set(stats.environments)).map((env) => (
                <span
                  key={env}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-navy/[0.06] text-navy/70 capitalize"
                >
                  {env}
                </span>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="bg-white/60 backdrop-blur-sm rounded-2xl border border-dashed border-navy/15 p-6 text-center">
        <p className="text-xs uppercase tracking-widest font-semibold text-navy/40 mb-2">Coming soon</p>
        <h3 className="font-general font-semibold text-navy text-lg mb-1">
          Weekly trends &amp; per-teammate breakdown
        </h3>
        <p className="text-navy/60 text-sm max-w-md mx-auto">
          Time-series charts and team rollups land once we start snapshotting daily activity.
        </p>
      </section>
    </>
  );
}

function CostRow({
  label,
  amount,
  pct,
  dotClass,
}: {
  label: string;
  amount: number;
  pct: number;
  dotClass: string;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-baseline justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dotClass}`} />
          <span className="text-sm font-medium text-navy/75">{label}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-navy">{formatUsd(amount)}</span>
          <span className="text-xs text-navy/40 tabular-nums w-10 text-right">
            {pct.toFixed(0)}%
          </span>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-navy/[0.05] overflow-hidden">
        <div
          className={`h-full rounded-full ${dotClass} transition-[width] duration-500`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-10 text-center">
      <div className="w-14 h-14 rounded-2xl bg-navy/[0.06] flex items-center justify-center mx-auto mb-4">
        <BarChart3 className="w-6 h-6 text-navy/50" />
      </div>
      <h3 className="font-general font-semibold text-navy text-lg mb-1.5">No usage yet</h3>
      <p className="text-navy/60 text-sm max-w-md mx-auto">
        Send your first WhatsApp voice note to VoiceLink and your activity will show up here.
      </p>
    </div>
  );
}
