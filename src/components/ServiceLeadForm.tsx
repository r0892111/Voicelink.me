import React, { useEffect, useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { NoiseOverlay } from './ui/NoiseOverlay';

const QR_REF = 'service';
const SESSION_KEY = 'service_ref';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormState {
  naam: string;
  bedrijf: string;
  telefoonnummer: string;
  email: string;
}

export const ServiceLeadForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState<FormState>({ naam: '', bedrijf: '', telefoonnummer: '', email: '' });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref === QR_REF) {
      sessionStorage.setItem(SESSION_KEY, '1');
    } else if (!sessionStorage.getItem(SESSION_KEY)) {
      navigate('/', { replace: true });
    }
  }, []);

  const validate = (): boolean => {
    const next: Partial<FormState> = {};
    if (!form.naam.trim()) next.naam = 'Naam is verplicht';
    if (!form.bedrijf.trim()) next.bedrijf = 'Bedrijf is verplicht';
    if (!form.telefoonnummer.trim()) next.telefoonnummer = 'Telefoonnummer is verplicht';
    if (!EMAIL_RE.test(form.email.trim())) next.email = 'Geldig e-mailadres vereist';
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
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-service-lead`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            naam: form.naam.trim(),
            bedrijf: form.bedrijf.trim(),
            telefoonnummer: form.telefoonnummer.trim(),
            email: form.email.trim().toLowerCase(),
          }),
        },
      );

      const data = await res.json();
      if (!data.success) {
        setSubmitError(data.error || 'Er is iets misgegaan. Probeer opnieuw.');
        return;
      }

      setSubmitted(true);
    } catch {
      setSubmitError('Verbindingsfout. Controleer je internet en probeer opnieuw.');
    } finally {
      setSubmitting(false);
    }
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

          {!submitted ? (
            <>
              <div className="mb-7">
                <h1 className="font-general font-bold text-2xl text-navy mb-2">
                  Neem contact op
                </h1>
                <p className="text-sm text-navy/60 leading-relaxed">
                  Interesse in een audit of maatwerk? Laat je gegevens achter en we nemen zo snel mogelijk contact met je op.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {field('naam', 'Naam', 'text', 'Jan Janssen')}
                {field('bedrijf', 'Bedrijf', 'text', 'Acme BV')}
                {field('telefoonnummer', 'Telefoonnummer', 'tel', '+32471234567')}
                {field('email', 'E-mailadres', 'email', 'jan@acme.be')}

                {submitError && (
                  <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-xl">{submitError}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 inline-flex items-center justify-center gap-2 bg-navy hover:bg-navy-hover disabled:opacity-60 text-white font-semibold py-3.5 px-6 rounded-full transition-all duration-300 hover:shadow-lg"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span>Versturen</span>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="flex justify-center mb-5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-emerald-500" />
                </div>
              </div>
              <h2 className="font-general font-bold text-xl text-navy mb-2">Ontvangen!</h2>
              <p className="text-sm text-navy/60 leading-relaxed">
                We hebben je aanvraag ontvangen en nemen zo snel mogelijk contact met je op.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
