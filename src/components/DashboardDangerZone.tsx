import { useState } from 'react';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { requestErasure } from '../services/gdprService';

// GDPR Art. 17 self-service erasure. Irreversible and immediate (no grace
// period — that's the subscription-end path); gated on a typed DELETE.
export function DashboardDangerZone() {
  const { signOut } = useAuth();
  const { t } = useI18n();
  const [confirmText, setConfirmText] = useState('');
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const armed = confirmText === 'DELETE';

  const handleErase = async () => {
    if (!armed || working) return;
    setWorking(true);
    setError(null);
    try {
      await requestErasure();
      // Account is gone server-side; drop the local session and leave.
      await signOut();
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setWorking(false);
    }
  };

  return (
    <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-red-200 shadow-sm p-6 mt-6">
      <div className="flex items-center gap-2.5 text-red-500/70 mb-2">
        <AlertTriangle className="w-4 h-4" />
        <span className="text-xs uppercase tracking-widest font-semibold">
          {t('dash.danger.eyebrow')}
        </span>
      </div>
      <h3 className="font-general font-semibold text-navy text-lg mb-1">
        {t('dash.danger.title')}
      </h3>
      <p className="text-navy/60 text-sm mb-5">{t('dash.danger.body')}</p>

      <label className="block text-xs font-semibold text-navy/60 mb-1.5">
        {t('dash.danger.confirmLabel')}
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="DELETE"
          autoComplete="off"
          className="flex-1 max-w-xs px-4 py-2 rounded-xl border border-navy/[0.15] bg-white text-sm font-mono focus:outline-none focus:border-red-400"
        />
        <button
          onClick={handleErase}
          disabled={!armed || working}
          className="inline-flex items-center justify-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded-full font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {working ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          {working ? t('dash.danger.working') : t('dash.danger.button')}
        </button>
      </div>
      {error && <p className="text-red-600 text-sm mt-3">{t('dash.danger.error', { detail: error })}</p>}
    </section>
  );
}
