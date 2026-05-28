import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthService } from '../services/authService';
import { NoiseOverlay } from './ui/NoiseOverlay';

const QR_REF = 'wms';
const SESSION_KEY = 'wms_ref';
const E164_RE = /^\+[1-9]\d{6,14}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Step = 'form' | 'connect';

interface FormState {
  naam: string;
  telefoonnummer: string;
  email: string;
  bedrijf: string;
}

export const WorkSmarterOnboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<Step>('form');
  const [form, setForm] = useState<FormState>({ naam: '', telefoonnummer: '+32', email: '', bedrijf: '' });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (searchParams.get('ref') === QR_REF) {
      sessionStorage.setItem(SESSION_KEY, '1');
    } else if (!sessionStorage.getItem(SESSION_KEY)) {
      navigate('/', { replace: true });
    }
  }, []);

  const validate = (): boolean => {
    const next: Partial<FormState> = {};
    if (!form.naam.trim()) next.naam = 'Naam is verplicht';
    if (!E164_RE.test(form.telefoonnummer.trim()))
      next.telefoonnummer = 'Geldig telefoonnummer vereist (bijv. +32471234567)';
    if (!EMAIL_RE.test(form.email.trim())) next.email = 'Geldig e-mailadres vereist';
    if (!form.bedrijf.trim()) next.bedrijf = 'Bedrijfsnaam is verplicht';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-worksmarter-signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            naam: form.naam.trim(),
            telefoonnummer: form.telefoonnummer.trim(),
            email: form.email.trim().toLowerCase(),
            bedrijf: form.bedrijf.trim(),
          }),
        },
      );

      const data = await res.json().catch(() => ({ success: false }));
      if (!data.success && res.ok) {
        // Hard validation error from the server (e.g. missing field)
        setSubmitError(data.error || 'Er is iets misgegaan. Probeer opnieuw.');
        return;
      }
      // On network errors or non-critical backend failures, still advance —
      // lead capture is best-effort; the CRM connect step is what matters.
    } catch {
      // Best-effort — advance anyway
    } finally {
      setSubmitting(false);
    }

    setStep('connect');
  };

  const handleOAuth = async () => {
    localStorage.setItem('pending_promo', JSON.stringify({ source: 'worksmarter', months: 2 }));
    await AuthService.createTeamleaderAuth().initiateAuth();
  };

  const field = (
    key: keyof FormState,
    label: string,
    type = 'text',
    placeholder = '',
  ) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-navy/70">{label}</label>
      <input
        type={type}
        value={form[key]}
        placeholder={placeholder}
        onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
        className={`w-full px-4 py-3 rounded-xl border bg-white text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-navy/20 transition ${
          errors[key] ? 'border-red-400' : 'border-navy/[0.12]'
        }`}
      />
      {errors[key] && <p className="text-xs text-red-500">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-porcelain font-instrument relative flex flex-col">
      <NoiseOverlay />

      {/* Header */}
      <div className="flex justify-center pt-10 pb-6 px-6">
        <img src="/Finit Voicelink Blue.svg" alt="VoiceLink" className="h-8 w-auto" />
      </div>

      <div className="flex-1 flex items-start justify-center px-6 pb-16">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-8">

          {step === 'form' && (
            <>
              <div className="mb-7">
                <h1 className="font-general font-bold text-2xl text-navy mb-2">
                  Jouw gegevens
                </h1>
                <p className="text-sm text-navy/60">
                  We registreren je voor 2 maanden gratis Professional. Daarna koppel je je CRM.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {field('naam', 'Naam', 'text', 'Jan Janssen')}
                {field('bedrijf', 'Bedrijf', 'text', 'Acme BV')}
                {field('telefoonnummer', 'WhatsApp-nummer', 'tel', '+32471234567')}
                {field('email', 'E-mailadres', 'email', 'jan@acme.be')}

                {submitError && (
                  <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-xl">{submitError}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="group mt-2 inline-flex items-center justify-center gap-2 bg-navy hover:bg-navy-hover disabled:opacity-60 text-white font-semibold py-3.5 px-6 rounded-full transition-all duration-300 hover:shadow-lg"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Volgende</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {step === 'connect' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-emerald-500" />
                </div>
              </div>

              <div className="text-center mb-7">
                <h1 className="font-general font-bold text-2xl text-navy mb-2">
                  Koppel je CRM
                </h1>
                <p className="text-sm text-navy/60 leading-relaxed">
                  Verbind jouw Teamleader of Pipedrive. Je 2 maanden Professional worden automatisch geactiveerd — geen betaalscherm.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleOAuth()}
                  className="flex items-center gap-3 w-full border border-navy/[0.12] bg-white hover:bg-navy/[0.03] rounded-xl px-5 py-4 transition-colors"
                >
                  <img src="/Teamleader_Icon.svg" alt="Teamleader" className="h-7 w-7 object-contain" />
                  <span className="font-medium text-navy">Teamleader koppelen</span>
                  <ArrowRight className="w-4 h-4 text-navy/40 ml-auto" />
                </button>
              </div>

              <p className="mt-5 text-xs text-navy/40 text-center">
                Je wordt doorgestuurd naar je CRM om toegang te verlenen. Dit duurt 30 seconden.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
