import React, { useEffect, useState } from 'react';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthService } from '../services/authService';
import { markPendingCheckout } from '../utils/pendingCheckout';
import { NoiseOverlay } from './ui/NoiseOverlay';

const QR_REF = 'wms';
const SESSION_KEY = 'wms_ref';

// WorkSmarter promo onboarding — connect-only. The /lp/worksmarter landing is
// the entry; its CTA drops the visitor straight here on the "Koppel je CRM"
// screen. Connecting Teamleader stamps a pendingCheckout intent for a real
// Stripe Professional subscription with a 60-day trial and NO card up front
// (collectPaymentMethod: false → checkout uses payment_method_collection
// 'if_required'). AuthCallback runs the checkout after OAuth → dashboard.
export const WorkSmarterOnboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (searchParams.get('ref') === QR_REF) {
      sessionStorage.setItem(SESSION_KEY, '1');
    } else if (!sessionStorage.getItem(SESSION_KEY)) {
      navigate('/', { replace: true });
    }
  }, []);

  const handleConnect = async () => {
    if (starting) return;
    setStarting(true);
    // Mirror AuthPage: cache platform before OAuth so AuthCallback resolves the
    // right table, then stamp the WSM offer as the post-OAuth checkout intent.
    localStorage.setItem('userPlatform', 'teamleader');
    localStorage.setItem('auth_provider', 'teamleader');
    markPendingCheckout({
      tierKey: 'professional',
      interval: 'monthly',
      quantity: 1,
      trialDays: 60,
      collectPaymentMethod: false,
    });
    const result = await AuthService.createTeamleaderAuth().initiateAuth();
    if (!result.success) {
      localStorage.removeItem('userPlatform');
      localStorage.removeItem('auth_provider');
      setStarting(false);
    }
    // On success initiateAuth redirects the page away.
  };

  return (
    <div className="min-h-screen bg-porcelain font-instrument relative flex flex-col">
      <NoiseOverlay />

      <div className="flex justify-center pt-10 pb-6 px-6">
        <img src="/Finit Voicelink Blue.svg" alt="VoiceLink" className="h-8 w-auto" />
      </div>

      <div className="flex-1 flex items-start justify-center px-6 pb-16">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-8">
          <div className="text-center mb-7">
            <h1 className="font-general font-bold text-2xl text-navy mb-2">
              Koppel je CRM
            </h1>
            <p className="text-sm text-navy/60 leading-relaxed">
              Verbind jouw Teamleader en je 2 maanden gratis Professional starten meteen.
            </p>
          </div>

          <ul className="mb-7 space-y-2.5">
            {[
              '2 maanden Professional gratis',
              'Geen kaart nodig om te starten',
              'Daarna €59/gebruiker/maand — maandelijks opzegbaar',
            ].map((line) => (
              <li key={line} className="flex items-center gap-2.5 text-sm text-navy/70">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" strokeWidth={2.5} />
                <span>{line}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={handleConnect}
            disabled={starting}
            className="flex items-center gap-3 w-full border border-navy/[0.12] bg-white hover:bg-navy/[0.03] disabled:opacity-60 rounded-xl px-5 py-4 transition-colors"
          >
            {starting ? (
              <Loader2 className="w-5 h-5 animate-spin text-navy mx-auto" />
            ) : (
              <>
                <img src="/Teamleader_Icon.svg" alt="Teamleader" className="h-7 w-7 object-contain" />
                <span className="font-medium text-navy">Teamleader koppelen</span>
                <ArrowRight className="w-4 h-4 text-navy/40 ml-auto" />
              </>
            )}
          </button>

          <p className="mt-5 text-xs text-navy/40 text-center">
            Je wordt doorgestuurd naar Teamleader om toegang te verlenen. Dit duurt 30 seconden.
          </p>
        </div>
      </div>
    </div>
  );
};
