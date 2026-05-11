import { useState } from 'react';
import { Check, Languages } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
import type { SupportedLanguage } from '../hooks/useDashboardContext';

const LANGUAGE_OPTIONS: { code: SupportedLanguage; label: string; sample: string }[] = [
  { code: 'nl', label: 'Nederlands', sample: 'Hallo!' },
  { code: 'en', label: 'English',    sample: 'Hello!' },
  { code: 'fr', label: 'Français',   sample: 'Bonjour !' },
  { code: 'de', label: 'Deutsch',    sample: 'Hallo!' },
];

interface Props {
  initial: SupportedLanguage;
  onConfirm: (code: SupportedLanguage) => Promise<void>;
}

export function LanguagePickerModal({ initial, onConfirm }: Props) {
  const { t } = useI18n();
  const [selected, setSelected] = useState<SupportedLanguage>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setSaving(true);
    setError(null);
    try {
      await onConfirm(selected);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 border border-navy/10">
        <div className="flex items-center gap-2.5 text-navy/50 mb-2">
          <Languages className="w-4 h-4" />
          <span className="text-xs uppercase tracking-widest font-semibold">
            {t('languagePicker.eyebrow')}
          </span>
        </div>
        <h2 className="font-general font-bold text-navy text-2xl mb-2">
          {t('languagePicker.title')}
        </h2>
        <p className="text-navy/60 text-sm mb-6">{t('languagePicker.subtitle')}</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {LANGUAGE_OPTIONS.map((lang) => {
            const active = selected === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setSelected(lang.code)}
                disabled={saving}
                className={`relative flex flex-col items-start text-left p-4 rounded-xl border transition-colors disabled:opacity-60 ${
                  active
                    ? 'bg-navy text-white border-navy'
                    : 'bg-white text-navy border-navy/10 hover:border-navy/30'
                }`}
              >
                <span className="font-general font-semibold">{lang.label}</span>
                <span className={`text-xs mt-0.5 ${active ? 'text-white/70' : 'text-navy/55'}`}>
                  {lang.sample}
                </span>
                {active && <Check className="w-4 h-4 absolute top-3 right-3" />}
              </button>
            );
          })}
        </div>

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <button
          type="button"
          onClick={handleConfirm}
          disabled={saving}
          className="w-full py-3 rounded-xl bg-navy text-white font-medium hover:bg-navy/90 disabled:opacity-50 transition-colors"
        >
          {saving ? t('common.saving') : t('languagePicker.confirm')}
        </button>

        <p className="text-xs text-navy/45 mt-4 text-center">
          {t('languagePicker.editLater')}
        </p>
      </div>
    </div>
  );
}
