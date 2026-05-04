// ── BusinessSyncTile ─────────────────────────────────────────────────────────
// Optional optimisation tile shown on /dashboard once the user finishes
// onboarding. Reads entity_sync_* columns from teamleader_users (own row,
// covered by RLS) and renders one of four states:
//
//   never_synced  → "Optimise VoiceLink for your CRM" + Sync button
//   in_progress   → "Syncing your CRM…" + animated dots, no button
//   completed     → "Synced N entities, T ago" + Sync now button
//   failed        → "Sync failed: <reason>" + Retry button
//
// The Sync button POSTs to the trigger-entity-sync edge function which
// resolves the user's TL access_token + teamleader_id and forwards to
// VLAgent /admin/prewarm. The actual work runs async server-side; this
// component polls teamleader_users every 5s while in_progress.

import { useEffect, useState } from 'react';
import { Loader2, RefreshCw, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useI18n } from '../hooks/useI18n';

type SyncStatus = 'never' | 'in_progress' | 'completed' | 'failed';

interface SyncRow {
  entity_sync_status: string | null;
  entity_sync_started_at: string | null;
  entity_sync_completed_at: string | null;
  entity_sync_companies: number | null;
  entity_sync_contacts: number | null;
  entity_sync_products: number | null;
  entity_sync_aliases_written: number | null;
  entity_sync_error: string | null;
}

function relativeTime(iso: string | null, locale: string): string {
  if (!iso) return '';
  const now = Date.now();
  const then = new Date(iso).getTime();
  const seconds = Math.max(0, Math.floor((now - then) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function absoluteTime(iso: string | null, locale: string): string {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return new Date(iso).toLocaleString();
  }
}

export function BusinessSyncTile() {
  const { t, currentLanguage } = useI18n();
  const [row, setRow] = useState<SyncRow | null>(null);
  const [triggering, setTriggering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    const { data } = await supabase
      .from('teamleader_users')
      .select(
        'entity_sync_status, entity_sync_started_at, entity_sync_completed_at, ' +
        'entity_sync_companies, entity_sync_contacts, entity_sync_products, ' +
        'entity_sync_aliases_written, entity_sync_error',
      )
      .eq('user_id', session.user.id)
      .is('deleted_at', null)
      .maybeSingle();
    if (data) setRow(data as SyncRow);
  };

  useEffect(() => {
    refresh();
  }, []);

  // Poll every 5s while a sync is in progress so the UI updates without
  // requiring a page reload. Stops as soon as the status moves on.
  useEffect(() => {
    if (row?.entity_sync_status !== 'in_progress') return;
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, [row?.entity_sync_status]);

  const trigger = async () => {
    setError(null);
    setTriggering(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError(t('dash.sync.errSession'));
        return;
      }
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trigger-entity-sync`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      if (resp.status !== 202 && resp.status !== 200) {
        const body = await resp.json().catch(() => ({}));
        setError(body.error ?? t('dash.sync.errKickoff'));
        return;
      }
      // Optimistic: bump status to in_progress so UI flips immediately.
      setRow((prev) => ({
        ...(prev ?? ({} as SyncRow)),
        entity_sync_status: 'in_progress',
        entity_sync_started_at: new Date().toISOString(),
        entity_sync_error: null,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('dash.sync.errKickoff'));
    } finally {
      setTriggering(false);
    }
  };

  const status: SyncStatus =
    row?.entity_sync_status === 'in_progress' ? 'in_progress'
    : row?.entity_sync_status === 'completed'  ? 'completed'
    : row?.entity_sync_status === 'failed'     ? 'failed'
    : 'never';

  return (
    <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-6">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          status === 'completed' ? 'bg-emerald-50' :
          status === 'failed'    ? 'bg-red-50' :
          status === 'in_progress' ? 'bg-blue-50' : 'bg-navy/[0.06]'
        }`}>
          {status === 'completed'    && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          {status === 'failed'       && <AlertTriangle className="w-5 h-5 text-red-600" />}
          {status === 'in_progress'  && <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />}
          {status === 'never'        && <Sparkles className="w-5 h-5 text-navy/60" />}
        </div>
        <div className="flex-1">
          <h3 className="font-general font-semibold text-navy text-base">
            {t('dash.sync.title')}
          </h3>
          <p className="text-navy/65 text-sm mt-0.5 leading-relaxed">
            {status === 'never'       && t('dash.sync.bodyNever')}
            {status === 'in_progress' && t('dash.sync.bodyInProgress')}
            {status === 'completed'   && t('dash.sync.bodyCompleted', {
              companies: row?.entity_sync_companies ?? 0,
              contacts:  row?.entity_sync_contacts  ?? 0,
              products:  row?.entity_sync_products  ?? 0,
              ago:       relativeTime(row?.entity_sync_completed_at ?? null, currentLanguage),
            })}
            {status === 'failed'      && t('dash.sync.bodyFailed', {
              error: (row?.entity_sync_error ?? t('dash.sync.errUnknown')).slice(0, 200),
            })}
          </p>
          {row?.entity_sync_completed_at && status !== 'never' && (
            <p className="text-navy/45 text-xs mt-1.5">
              {t('dash.sync.lastSynced', {
                date: absoluteTime(row.entity_sync_completed_at, currentLanguage),
              })}
            </p>
          )}
          {error && (
            <p className="text-red-600 text-xs mt-2">{error}</p>
          )}
        </div>
        <div className="flex-shrink-0">
          {status !== 'in_progress' && (
            <button
              onClick={trigger}
              disabled={triggering}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
                status === 'failed'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-navy text-white hover:bg-navy-hover'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {triggering
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <RefreshCw className="w-4 h-4" />}
              {status === 'never'     ? t('dash.sync.btnSync') :
               status === 'failed'    ? t('dash.sync.btnRetry') :
                                         t('dash.sync.btnResync')}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
