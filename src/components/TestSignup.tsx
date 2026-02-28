import React from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../hooks/useI18n';
import { withUTM } from '../utils/utm';
import { CheckCircle, ArrowLeft } from 'lucide-react';

export const TestSignup: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [crmPlatform, setCrmPlatform] = React.useState<'teamleader' | 'pipedrive' | 'odoo'>('teamleader');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { error: insertError } = await supabase.from('test_signups').insert({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || null,
        crm_platform: crmPlatform,
      });
      if (insertError) {
        if (insertError.code === '23505') {
          setError(t('testSignup.emailAlreadyRegistered'));
        } else {
          setError(t('testSignup.submissionError'));
        }
        return;
      }
      setSuccess(true);
    } catch {
      setError(t('testSignup.submissionError'));
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-porcelain flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-navy/10 p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-navy mb-4">{t('testSignup.successTitle')}</h1>
          <p className="text-slate-blue mb-8">{t('testSignup.successMessage')}</p>
          <div className="text-left bg-navy/5 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-navy mb-3">{t('testSignup.nextSteps')}</h3>
            <ol className="list-decimal list-inside space-y-2 text-slate-blue">
              <li>{t('testSignup.step1')}</li>
              <li>{t('testSignup.step2')}</li>
              <li>{t('testSignup.step3')}</li>
            </ol>
          </div>
          <button
            onClick={() => navigate(withUTM('/'))}
            className="inline-flex items-center gap-2 px-6 py-3 bg-navy text-white rounded-full font-medium hover:bg-navy-hover transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('testSignup.backToHome')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-porcelain flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-navy/10 p-8">
        <h1 className="text-2xl font-bold text-navy mb-2">{t('testSignup.title')}</h1>
        <p className="text-slate-blue mb-8">{t('testSignup.subtitle')}</p>

        <div className="mb-8">
          <h3 className="font-semibold text-navy mb-3">{t('testSignup.benefitsTitle')}</h3>
          <ul className="space-y-2 text-slate-blue">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-navy flex-shrink-0" />
              {t('testSignup.benefit1')}
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-navy flex-shrink-0" />
              {t('testSignup.benefit2')}
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-navy flex-shrink-0" />
              {t('testSignup.benefit3')}
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-navy flex-shrink-0" />
              {t('testSignup.benefit4')}
            </li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy mb-1">{t('testSignup.firstName')}</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={t('testSignup.firstNamePlaceholder')}
                className="w-full px-4 py-3 rounded-xl border border-navy/20 focus:border-navy focus:ring-2 focus:ring-navy/20 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1">{t('testSignup.lastName')}</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={t('testSignup.lastNamePlaceholder')}
                className="w-full px-4 py-3 rounded-xl border border-navy/20 focus:border-navy focus:ring-2 focus:ring-navy/20 outline-none transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1">{t('testSignup.email')}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('testSignup.emailPlaceholder')}
              className="w-full px-4 py-3 rounded-xl border border-navy/20 focus:border-navy focus:ring-2 focus:ring-navy/20 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1">{t('testSignup.phone')}</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('testSignup.phonePlaceholder')}
              className="w-full px-4 py-3 rounded-xl border border-navy/20 focus:border-navy focus:ring-2 focus:ring-navy/20 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1">{t('testSignup.crmPlatform')}</label>
            <select
              required
              value={crmPlatform}
              onChange={(e) => setCrmPlatform(e.target.value as 'teamleader' | 'pipedrive' | 'odoo')}
              className="w-full px-4 py-3 rounded-xl border border-navy/20 focus:border-navy focus:ring-2 focus:ring-navy/20 outline-none transition-all"
            >
              <option value="teamleader">Teamleader</option>
              <option value="pipedrive">Pipedrive</option>
              <option value="odoo">Odoo</option>
            </select>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-6 bg-navy text-white rounded-full font-semibold hover:bg-navy-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? t('testSignup.submitting') : t('testSignup.submitButton')}
          </button>
        </form>
        <p className="text-xs text-slate-blue mt-6 text-center">{t('testSignup.privacyNote')}</p>
        <p className="text-sm text-slate-blue mt-4 text-center">
          <button
            type="button"
            onClick={() => navigate(withUTM('/signup'))}
            className="text-navy font-medium hover:underline"
          >
            Already have access? Sign in
          </button>
        </p>
      </div>
    </div>
  );
};
