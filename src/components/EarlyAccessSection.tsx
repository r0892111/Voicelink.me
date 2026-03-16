import React, { useState, useCallback } from 'react';
import { Minus, Plus, CheckCircle, AlertCircle, Send, ArrowRight, Users, Building2, MessageSquareText } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

const WEBHOOK_URL = 'https://alexfinit.app.n8n.cloud/webhook/07be1396-d13c-4e0e-894f-42beb70db4a9';

export const EarlyAccessSection: React.FC = () => {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    companyName: '',
    employeeCount: 1,
    description: '',
  });
  const [employeeInput, setEmployeeInput] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const updateEmployeeCount = useCallback((val: number) => {
    const clamped = Math.max(1, Math.min(999, isNaN(val) ? 1 : val));
    setFormData(prev => ({ ...prev, employeeCount: clamped }));
    setEmployeeInput(String(clamped));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          companyName: formData.companyName,
          employeeCount: formData.employeeCount,
          description: formData.description || '',
          submittedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Submission failed');
      setSubmitStatus('success');
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="max-w-[1400px] 2xl:max-w-screen-2xl mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-navy/[0.06] p-8 md:p-12 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="font-general text-2xl md:text-3xl font-bold text-navy mb-4">
              {t('earlyAccess.successTitle')}
            </h3>
            <p className="text-slate-blue font-instrument text-base md:text-lg leading-relaxed mb-3">
              {t('earlyAccess.successMessage')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] 2xl:max-w-screen-2xl mx-auto px-6">
      <div className="text-center mb-8 2xl:mb-10">
        <h2 className="font-general text-4xl lg:text-5xl 2xl:text-6xl font-bold text-navy mb-4">
          {t('earlyAccess.title')}
        </h2>
        <p className="text-xl 2xl:text-2xl font-instrument text-slate-blue max-w-3xl mx-auto mb-6">
          {t('earlyAccess.subtitle')}
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Left: Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-md border border-navy/[0.06] p-6 md:p-8">
              <h3 className="font-general text-lg md:text-xl font-bold text-navy mb-4">
                {t('earlyAccess.lookingForTitle')}
              </h3>
              <p className="text-slate-blue font-instrument text-sm md:text-base leading-relaxed mb-5">
                {t('earlyAccess.lookingForDescription')}
              </p>

              <div className="space-y-3">
                {['pain1', 'pain2', 'pain3'].map((key) => (
                  <div key={key} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MessageSquareText className="w-3 h-3 text-navy" />
                    </div>
                    <span className="text-sm text-slate-blue font-instrument">
                      {t(`earlyAccess.${key}`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-navy rounded-2xl shadow-xl p-6 md:p-8 relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/[0.04] pointer-events-none" />
              <div className="relative z-10">
                <h3 className="text-lg md:text-xl font-bold text-white mb-3 font-general">
                  {t('earlyAccess.rewardTitle')}
                </h3>
                <p className="text-white/70 font-instrument text-sm md:text-base leading-relaxed">
                  {t('earlyAccess.rewardDescription')}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-navy/[0.06] p-6 md:p-8">
            <h3 className="font-general text-lg md:text-xl font-bold text-navy mb-5">
              {t('earlyAccess.formTitle')}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {submitStatus === 'error' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-red-600 font-instrument text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{t('earlyAccess.submitError')}</span>
                </div>
              )}

              {/* Naam */}
              <div>
                <label htmlFor="ea-name" className="block text-sm font-instrument font-medium text-navy/70 mb-1.5">
                  {t('earlyAccess.name')} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="ea-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={t('earlyAccess.namePlaceholder')}
                  required
                  className="w-full px-4 py-2.5 border border-navy/15 rounded-full bg-white font-instrument text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy/40 transition-colors"
                />
              </div>

              {/* Tel */}
              <div>
                <label htmlFor="ea-phone" className="block text-sm font-instrument font-medium text-navy/70 mb-1.5">
                  {t('earlyAccess.phone')} <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  id="ea-phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder={t('earlyAccess.phonePlaceholder')}
                  required
                  className="w-full px-4 py-2.5 border border-navy/15 rounded-full bg-white font-instrument text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy/40 transition-colors"
                />
              </div>

              {/* Bedrijfsnaam */}
              <div>
                <label htmlFor="ea-company" className="block text-sm font-instrument font-medium text-navy/70 mb-1.5">
                  {t('earlyAccess.companyName')} <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy/30" />
                  <input
                    type="text"
                    id="ea-company"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder={t('earlyAccess.companyPlaceholder')}
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-navy/15 rounded-full bg-white font-instrument text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy/40 transition-colors"
                  />
                </div>
              </div>

              {/* # Werknemers */}
              <div>
                <label className="block text-sm font-instrument font-medium text-navy/70 mb-1.5">
                  {t('earlyAccess.employeeCount')} <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateEmployeeCount(formData.employeeCount - 1)}
                    disabled={formData.employeeCount <= 1}
                    className="w-10 h-10 rounded-full border border-navy/20 bg-white flex items-center justify-center text-navy hover:bg-navy/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                    aria-label="Decrease"
                  >
                    <Minus size={14} />
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={employeeInput}
                    onFocus={e => e.target.select()}
                    onChange={e => {
                      const raw = e.target.value;
                      if (raw === '' || /^\d+$/.test(raw)) {
                        setEmployeeInput(raw);
                        const num = parseInt(raw, 10);
                        if (!isNaN(num) && num >= 1 && num <= 999) {
                          setFormData(prev => ({ ...prev, employeeCount: num }));
                        }
                      }
                    }}
                    onBlur={() => {
                      const clamped = Math.max(1, Math.min(999, parseInt(employeeInput, 10) || 1));
                      setFormData(prev => ({ ...prev, employeeCount: clamped }));
                      setEmployeeInput(String(clamped));
                    }}
                    className="w-16 text-center text-base font-semibold text-navy border border-navy/20 rounded-xl py-2 focus:outline-none focus:ring-2 focus:ring-navy/20"
                  />
                  <button
                    type="button"
                    onClick={() => updateEmployeeCount(formData.employeeCount + 1)}
                    disabled={formData.employeeCount >= 999}
                    className="w-10 h-10 rounded-full border border-navy/20 bg-white flex items-center justify-center text-navy hover:bg-navy/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                    aria-label="Increase"
                  >
                    <Plus size={14} />
                  </button>
                  <div className="flex items-center gap-1.5 text-navy/50">
                    <Users className="w-4 h-4" />
                    <span className="text-xs font-instrument">{t('earlyAccess.employeeLabel')}</span>
                  </div>
                </div>
              </div>

              {/* Description (optional) */}
              <div>
                <label htmlFor="ea-description" className="block text-sm font-instrument font-medium text-navy/70 mb-1.5">
                  {t('earlyAccess.description')} <span className="text-navy/30 text-xs font-normal">({t('earlyAccess.optional')})</span>
                </label>
                <textarea
                  id="ea-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder={t('earlyAccess.descriptionPlaceholder')}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-navy/15 rounded-xl bg-white font-instrument text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy/40 transition-colors resize-none text-sm"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-navy hover:bg-navy-hover text-white font-semibold py-3.5 px-6 rounded-full transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2 group disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t('earlyAccess.submitting')}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t('earlyAccess.submitButton')}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
