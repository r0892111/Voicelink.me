import React from 'react';
import { MessageCircle, Zap, ArrowRight, CheckCircle, Play, Settings } from 'lucide-react';
import { HeroDemo } from './HeroDemo';

/* -----------------------------
   Scroll animation
------------------------------ */
const useScrollAnimation = () => {
  const [visibleSections, setVisibleSections] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, (entry.target as HTMLElement).id]));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    );

    const sections = document.querySelectorAll('[data-animate-section]');
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return visibleSections;
};

/* -----------------------------
   Shared types & helpers
------------------------------ */
type BillingCycle = 'monthly' | 'annual';

type TierInfo = {
  tier: string;
  pricePerUser: number;
  discount: number;
};

/* -----------------------------
   Pricing Calculator (updated)
------------------------------ */
const PricingCalculator: React.FC<{ billing: BillingCycle }> = ({ billing }) => {
  const [userCount, setUserCount] = React.useState(1);
  const [customInput, setCustomInput] = React.useState('');
  const [isCustom, setIsCustom] = React.useState(false);

  const getMonthlyTier = (users: number): TierInfo => {
    if (users >= 1 && users <= 4) return { tier: 'Starter', pricePerUser: 29.90, discount: 0 };
    if (users >= 5 && users <= 9) return { tier: 'Team', pricePerUser: 27.00, discount: 10 };
    if (users >= 10 && users <= 24) return { tier: 'Business', pricePerUser: 24.00, discount: 20 };
    if (users >= 25 && users <= 49) return { tier: 'Growth', pricePerUser: 21.00, discount: 30 };
    if (users >= 50 && users <= 99) return { tier: 'Scale', pricePerUser: 18.00, discount: 40 };
    return { tier: 'Enterprise', pricePerUser: 15.00, discount: 50 };
  };

  // Annual per your table: 1–4: 299 | 5–9: 270 | 10–24: 240 | 25–49: 210 | 50+: 180
  const getAnnualTier = (users: number): TierInfo => {
    if (users >= 1 && users <= 4) return { tier: 'Starter', pricePerUser: 299.00, discount: 0 };
    if (users >= 5 && users <= 9) return { tier: 'Team', pricePerUser: 270.00, discount: 10 };
    if (users >= 10 && users <= 24) return { tier: 'Business', pricePerUser: 240.00, discount: 20 };
    if (users >= 25 && users <= 49) return { tier: 'Growth', pricePerUser: 210.00, discount: 30 };
    return { tier: 'Scale', pricePerUser: 180.00, discount: 40 }; // 50+
  };

  const tierInfo = billing === 'monthly' ? getMonthlyTier(userCount) : getAnnualTier(userCount);
  const totalPrice = userCount * tierInfo.pricePerUser;
  const starterPrice = billing === 'monthly' ? getMonthlyTier(1).pricePerUser : getAnnualTier(1).pricePerUser;
  const originalPrice = userCount * starterPrice;
  const savings = Math.max(0, originalPrice - totalPrice);

  const predefinedOptions = [1, 2, 3, 5, 10, 20, 50, 100];

  const handleUserCountChange = (value: string) => {
    if (value === 'custom') {
      setIsCustom(true);
      setCustomInput('');
    } else {
      setIsCustom(false);
      setUserCount(parseInt(value, 10));
    }
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomInput(value);
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      setUserCount(numValue);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-3" style={{ color: '#1C2C55' }}>
          Number of Users
        </label>
        <select
          value={isCustom ? 'custom' : userCount.toString()}
          onChange={(e) => handleUserCountChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-medium"
          style={{ color: '#1C2C55' }}
        >
          {predefinedOptions.map((option) => (
            <option key={option} value={option.toString()}>
              {option} user{option > 1 ? 's' : ''}
            </option>
          ))}
          <option value="custom">Custom amount</option>
        </select>
        {isCustom && (
          <input
            type="number"
            min="1"
            value={customInput}
            onChange={handleCustomInputChange}
            placeholder="Enter number of users"
            className="w-full mt-3 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-medium"
            style={{ color: '#1C2C55' }}
          />
        )}
      </div>

      <div className="text-center">
        <div className="flex items-baseline justify-center space-x-1 mb-2">
          <span className="text-4xl font-bold" style={{ color: '#1C2C55' }}>
            €{totalPrice.toFixed(2)}
          </span>
          <span className="text-lg" style={{ color: '#202226' }}>
            /{billing === 'monthly' ? 'month' : 'year'}
          </span>
        </div>
        <div className="mb-6">
          <p className="text-sm" style={{ color: '#202226' }}>
            €{tierInfo.pricePerUser.toFixed(2)}/user/{billing === 'monthly' ? 'month' : 'year'} • {userCount}{' '}
            user{userCount > 1 ? 's' : ''}
          </p>
          {tierInfo.discount > 0 && (
            <div className="mt-2">
              <span
                className="inline-block px-3 py-1 text-xs font-semibold rounded-full"
                style={{ backgroundColor: '#F7E69B', color: '#1C2C55' }}
              >
                {tierInfo.tier} Plan • {tierInfo.discount}% discount
              </span>
              <p className="text-xs text-green-600 mt-1">
                Save €{savings.toFixed(2)}/{billing === 'monthly' ? 'month' : 'year'} vs Starter pricing
              </p>
            </div>
          )}
        </div>
        <button
          className="w-full text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center justify-center space-x-2"
          style={{ backgroundColor: '#1C2C55' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0F1A3A')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1C2C55')}
        >
          <span>Start Free Trial</span>
          <ArrowRight className="w-5 h-5" />
        </button>
        <p className="text-xs text-gray-500 mt-3">14-day free trial • No credit card required</p>
      </div>
    </div>
  );
};

/* -----------------------------
   Billing Toggle
------------------------------ */
const BillingToggle: React.FC<{ billing: BillingCycle; onChange: (b: BillingCycle) => void }> = ({
  billing,
  onChange,
}) => (
  <div className="flex items-center gap-2">
    <button
      onClick={() => onChange('monthly')}
      className={`px-3 py-1 rounded-full text-sm font-medium border ${
        billing === 'monthly' ? 'bg-[#1C2C55] text-white border-[#1C2C55]' : 'bg-white text-gray-700 border-gray-300'
      }`}
    >
      Monthly
    </button>
    <button
      onClick={() => onChange('annual')}
      className={`px-3 py-1 rounded-full text-sm font-medium border ${
        billing === 'annual' ? 'bg-[#1C2C55] text-white border-[#1C2C55]' : 'bg-white text-gray-700 border-gray-300'
      }`}
    >
      Annual
    </button>
  </div>
);

/* -----------------------------
   Volume Tiers
------------------------------ */
const VolumeTiers: React.FC<{ billing: BillingCycle }> = ({ billing }) => {
  const rows =
    billing === 'monthly'
      ? [
          { plan: 'Starter', size: '1–4 users', price: 29.9, discount: '—' },
          { plan: 'Team', size: '5–9 users', price: 27.0, discount: '10% off' },
          { plan: 'Business', size: '10–24 users', price: 24.0, discount: '20% off' },
          { plan: 'Growth', size: '25–49 users', price: 21.0, discount: '30% off' },
          { plan: 'Scale', size: '50–99 users', price: 18.0, discount: '40% off' },
          { plan: 'Enterprise', size: '100+ users', price: 15.0, discount: '50%+ off' },
        ]
      : [
          { plan: 'Starter', size: '1–4 users', price: 299.0, discount: '—' },
          { plan: 'Team', size: '5–9 users', price: 270.0, discount: '10% off' },
          { plan: 'Business', size: '10–24 users', price: 240.0, discount: '20% off' },
          { plan: 'Growth', size: '25–49 users', price: 210.0, discount: '30% off' },
          { plan: 'Scale', size: '50+ users', price: 180.0, discount: '40% off' },
        ];

  const unit = billing === 'monthly' ? '/month' : '/year';
  const perUser = billing === 'monthly' ? 'Price per User (€/mo)' : 'Price per User (€/yr)';

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold mb-2" style={{ color: '#1C2C55' }}>
            Volume Discount Tiers
          </h3>
          <p className="text-gray-600">Automatic discounts applied based on team size</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200" style={{ backgroundColor: '#F8FAFC' }}>
                <th className="text-left py-4 px-6 font-semibold" style={{ color: '#1C2C55' }}>
                  Plan
                </th>
                <th className="text-left py-4 px-6 font-semibold" style={{ color: '#1C2C55' }}>
                  Team Size
                </th>
                <th className="text-left py-4 px-6 font-semibold" style={{ color: '#1C2C55' }}>
                  {perUser}
                </th>
                <th className="text-left py-4 px-6 font-semibold" style={{ color: '#1C2C55' }}>
                  Discount
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.plan}-${r.size}`} className="border-b border-gray-100">
                  <td className="py-4 px-6 font-medium" style={{ color: '#1C2C55' }}>
                    {r.plan}
                  </td>
                  <td className="py-4 px-6 text-gray-600">{r.size}</td>
                  <td className="py-4 px-6 font-semibold">
                    €{r.price.toFixed(2)} <span className="text-gray-500">{unit}</span>
                  </td>
                  <td className="py-4 px-6">
                    {r.discount === '—' ? (
                      <span className="text-gray-500">—</span>
                    ) : (
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                        {r.discount}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            All plans include unlimited WhatsApp voice notes, real-time CRM sync, and priority support
          </p>
        </div>
      </div>
    </div>
  );
};

/* -----------------------------
   Homepage
------------------------------ */
interface HomepageProps {
  openModal: () => void;
}

export const Homepage: React.FC<HomepageProps> = ({ openModal }) => {
  const visibleSections = useScrollAnimation();
  const [billing, setBilling] = React.useState<BillingCycle>('monthly');

  return (
    <div className="min-h-screen bg-white relative">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #1C2C55 0%, #FFFFFF 50%, #F7E69B 100%)' }}
        />
      </div>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden z-10 pt-48">
        <div className="w-full">
          <HeroDemo />
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" data-animate-section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="text-4xl font-bold mb-2" style={{ color: '#1C2C55' }}>
                Volume Pricing That Scales With You
              </h2>
              <p className="text-xl" style={{ color: '#202226' }}>
                Per user pricing. Start free, upgrade when you're ready. No hidden fees.
              </p>
            </div>
            <BillingToggle billing={billing} onChange={setBilling} />
          </div>

          <div className="grid lg:grid-cols-[1fr_1fr] gap-8 items-start">
            {/* VoiceLink Pro card */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">
              <div className="p-8 relative">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <img src="/Finit Voicelink Blue.svg" alt="VoiceLink Pro" className="h-12 w-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2" style={{ color: '#1C2C55' }}>
                      VoiceLink Pro
                    </h3>
                    <p className="mb-6" style={{ color: '#202226' }}>
                      Perfect for growing teams
                    </p>
                    <ul className="space-y-2 text-gray-700">
                      <li>✔ Unlimited WhatsApp voice notes</li>
                      <li>✔ Real-time CRM sync</li>
                      <li>✔ Native WhatsApp integration</li>
                      <li>✔ Multi-language support</li>
                      <li>✔ Priority support</li>
                    </ul>
                    <div className="mt-6 text-sm text-gray-500">
                      14-day free trial • No credit card required
                    </div>
                  </div>

                  <div className="text-center">
                    <PricingCalculator billing={billing} />
                  </div>
                </div>
              </div>
            </div>

            {/* Tiers table */}
            <div className="relative">
              <div className="absolute right-6 top-6 z-10">
                <BillingToggle billing={billing} onChange={setBilling} />
              </div>
              <VolumeTiers billing={billing} />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        id="final-cta"
        data-animate-section
        className="py-20 relative z-10"
        style={{ background: 'linear-gradient(135deg, #1C2C55 0%, #F7E69B 100%)' }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Ready to Transform Your Workflow?</h2>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto opacity-90">
            The more users you add, the more you save. Start free, scale affordably. Connect your WhatsApp and start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={openModal}
              className="group bg-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center justify-center space-x-2"
              style={{ color: '#1C2C55' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#F7E69B')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFFFFF')}
            >
              <img src="/Finit Voicelink Blue.svg" alt="" className="w-5 h-5 mr-1" />
              <span>Start Free Trial</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              className="group border-2 border-white text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2"
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFFFFF';
                (e.currentTarget as HTMLButtonElement).style.color = '#1C2C55';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF';
              }}
            >
              <Play className="w-5 h-5" />
              <span>Watch Demo</span>
            </button>
          </div>
          <div className="mt-8 flex items-center justify-center space-x-8 text-white opacity-90">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">14-day free trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">No setup fees</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-white py-12 relative z-10" style={{ backgroundColor: '#202226' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <img src="/Finit Voicelink White.svg" alt="VoiceLink" className="h-8 w-auto mb-4 md:mb-0" />
            <div className="flex items-center space-x-6 text-sm opacity-70">
              <span>© 2025 Finit Solutions</span>
              <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy</a>
              <a href="/saas-agreement" className="hover:text-white transition-colors">SaaS Agreement</a>
              <a href="/disclaimer" className="hover:text-white transition-colors">Disclaimer</a>
              <a href="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</a>
              <a href="/support" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
