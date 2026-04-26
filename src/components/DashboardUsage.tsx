import { useEffect, useState } from 'react';
import { BarChart3, MessageSquare, Coins, Clock, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useI18n } from '../hooks/useI18n';
import { useAuth } from '../hooks/useAuth';
import { useTeamRole } from '../hooks/useTeamRole';

interface SelfUsage {
  credits_used: number;
  credits_total: number | null;
  messages_sent: number;
  last_activity: string | null;
  is_trial: boolean;
}

interface TeamMemberUsage {
  user_id: string;
  name: string;
  credits_used: number;
  messages_sent: number;
  last_activity: string | null;
}

interface TeamUsage {
  credits_per_seat: number | null;
  credits_total: number | null;
  seats: number;
  is_trial: boolean;
  members: TeamMemberUsage[];
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

function formatCredits(credits: number): string {
  const fractionDigits = credits >= 100 ? 0 : credits >= 10 ? 1 : 2;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(credits);
}

function pct(used: number, total: number | null): number {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.max(0, (used / total) * 100));
}

function barColor(percent: number): string {
  if (percent >= 90) return 'bg-rose-500';
  if (percent >= 75) return 'bg-amber-500';
  return 'bg-navy';
}

export function DashboardUsage() {
  const { t, currentLanguage } = useI18n();
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useTeamRole(user);

  const [self, setSelf] = useState<SelfUsage | null>(null);
  const [team, setTeam] = useState<TeamUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (roleLoading) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          if (!cancelled) {
            setError('Not signed in');
            setLoading(false);
          }
          return;
        }

        const headers = { Authorization: `Bearer ${session.access_token}` };
        const base = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-usage-stats`;

        const requests: Promise<Response>[] = [fetch(base, { headers })];
        if (isAdmin) requests.push(fetch(`${base}?scope=team`, { headers }));

        const responses = await Promise.all(requests);
        const [selfData, teamData] = await Promise.all(responses.map((r) => r.json()));
        if (cancelled) return;

        if (!selfData.success) {
          setError(selfData.error ?? 'Failed to load usage');
        } else {
          setSelf(selfData.usage as SelfUsage | null);
        }

        if (isAdmin && teamData?.success) {
          setTeam(teamData.team as TeamUsage | null);
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
  }, [isAdmin, roleLoading]);

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

      {loading || roleLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
          <p className="text-sm text-red-700 font-medium">{t('dash.usage.errorTitle')}</p>
          <p className="text-sm text-red-600/80 mt-1">{error}</p>
        </div>
      ) : !self ? (
        <EmptyState />
      ) : (
        <UsageContent
          self={self}
          team={team}
          isAdmin={isAdmin}
          formatRelative={formatRelative}
        />
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {Array.from({ length: 3 }).map((_, i) => (
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
  );
}

function UsageContent({
  self,
  team,
  isAdmin,
  formatRelative,
}: {
  self: SelfUsage;
  team: TeamUsage | null;
  isAdmin: boolean;
  formatRelative: (iso: string | null) => string;
}) {
  const { t, currentLanguage } = useI18n();
  const creditsPct = pct(self.credits_used, self.credits_total);

  return (
    <>
      <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-6 mb-4">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-navy/[0.06] flex items-center justify-center">
            <Coins className="w-4 h-4 text-navy/70" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-navy/40">
              {t('dash.usage.metricCredits')}
            </p>
            {self.is_trial && (
              <p className="text-[10px] uppercase tracking-widest font-semibold text-emerald-600/80">
                {t('dash.usage.trialBadge')}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-baseline justify-between mb-2">
          <p className="font-general font-bold text-navy text-3xl tabular-nums">
            {formatCredits(self.credits_used)}
            {self.credits_total !== null && (
              <span className="text-navy/40 text-xl font-semibold ml-1">
                / {formatCredits(self.credits_total)}
              </span>
            )}
          </p>
          {self.credits_total !== null && (
            <span className="text-sm font-semibold text-navy/60 tabular-nums">
              {creditsPct.toFixed(0)}%
            </span>
          )}
        </div>

        {self.credits_total !== null ? (
          <div className="h-2 rounded-full bg-navy/[0.07] overflow-hidden">
            <div
              className={`h-full rounded-full ${barColor(creditsPct)} transition-[width] duration-500`}
              style={{ width: `${creditsPct}%` }}
            />
          </div>
        ) : (
          <p className="text-xs text-navy/45">{t('dash.usage.noPlanHint')}</p>
        )}
      </section>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <MetricCard
          icon={MessageSquare}
          label={t('dash.usage.metricMessages')}
          value={formatNumber(self.messages_sent)}
          hint={t('dash.usage.metricMessagesHint')}
        />
        <MetricCard
          icon={Clock}
          label={t('dash.usage.metricLastActivity')}
          value={formatRelative(self.last_activity)}
          hint={
            self.last_activity
              ? new Date(self.last_activity).toLocaleDateString(currentLanguage, {
                  day: 'numeric', month: 'short', year: 'numeric',
                })
              : '—'
          }
        />
      </div>

      {isAdmin ? (
        <TeamPanel team={team} />
      ) : (
        <ComingSoonBlock />
      )}
    </>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof MessageSquare;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-5 hover:shadow-md transition-shadow duration-300">
      <div className="w-9 h-9 rounded-xl bg-navy/[0.06] flex items-center justify-center mb-3">
        <Icon className="w-4 h-4 text-navy/70" />
      </div>
      <p className="text-xs uppercase tracking-widest font-semibold text-navy/40 mb-1">
        {label}
      </p>
      <p className="font-general font-bold text-navy text-2xl truncate">{value}</p>
      <p className="text-navy/45 text-xs mt-0.5">{hint}</p>
    </div>
  );
}

function TeamPanel({ team }: { team: TeamUsage | null }) {
  const { t } = useI18n();

  if (!team) {
    return (
      <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-6">
        <TeamHeader />
        <p className="text-navy/55 text-sm">{t('dash.usage.teamLoadFailed')}</p>
      </section>
    );
  }

  if (team.members.length === 0) {
    return (
      <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-6">
        <TeamHeader />
        <p className="text-navy/55 text-sm">{t('dash.usage.teamEmpty')}</p>
      </section>
    );
  }

  const perSeatCap = team.credits_per_seat;

  return (
    <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-6">
      <TeamHeader />
      <ul className="divide-y divide-navy/[0.06]">
        {team.members.map((m) => {
          const memberPct = pct(m.credits_used, perSeatCap);
          return (
            <li key={m.user_id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-baseline justify-between mb-1.5">
                <p className="text-sm font-semibold text-navy truncate pr-3">{m.name}</p>
                <p className="text-sm font-medium text-navy/70 tabular-nums whitespace-nowrap">
                  {formatCredits(m.credits_used)}
                  {perSeatCap !== null && (
                    <span className="text-navy/40 ml-1">/ {formatCredits(perSeatCap)}</span>
                  )}
                </p>
              </div>
              {perSeatCap !== null && (
                <div className="h-1.5 rounded-full bg-navy/[0.05] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor(memberPct)} transition-[width] duration-500`}
                    style={{ width: `${memberPct}%` }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function TeamHeader() {
  const { t } = useI18n();
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <Users className="w-4 h-4 text-navy/60" />
      <h2 className="font-general font-semibold text-navy text-sm uppercase tracking-widest">
        {t('dash.usage.teamTitle')}
      </h2>
    </div>
  );
}

function ComingSoonBlock() {
  const { t } = useI18n();
  return (
    <section className="bg-white/60 backdrop-blur-sm rounded-2xl border border-dashed border-navy/15 p-6 text-center">
      <p className="text-xs uppercase tracking-widest font-semibold text-navy/40 mb-2">
        {t('dash.usage.comingSoonLabel')}
      </p>
      <h3 className="font-general font-semibold text-navy text-lg mb-1">
        {t('dash.usage.comingSoonTitle')}
      </h3>
      <p className="text-navy/60 text-sm max-w-md mx-auto">{t('dash.usage.comingSoonBody')}</p>
    </section>
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
