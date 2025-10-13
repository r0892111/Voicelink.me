import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Users, Zap, Settings, Loader2 } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
import { supabase } from '../lib/supabase';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  crmPlatform: string;
}

export const TestSignup: React.FC = () => {
  const { t } = useI18n();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    crmPlatform: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const crmOptions = [
    {
      value: 'teamleader',
      name: 'Teamleader',
      logo: '/Teamleader_Icon.svg',
      icon: Users,
      color: '#00C9A2'
    },
    {
      value: 'pipedrive',
      name: 'Pipedrive',
      logo: '/Pipedrive_id-7ejZnwv_0.svg',
      icon: Zap,
      color: '#F26225'
    },
    {
      value: 'odoo',
      name: 'Odoo',
      logo: '/odoo_logo.svg',
      icon: Settings,
      color: '#714B67'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const signupData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone || null,
        crm_platform: formData.crmPlatform
      };

      const { error: insertError } = await supabase
        .from('test_signups')
        .insert([signupData]);

      if (insertError) {
        if (insertError.code === '23505') {
          setError(t('testSignup.emailAlreadyRegistered') || 'This email is already registered for testing.');
        } else {
          throw insertError;
        }
        setLoading(false);
        return;
      }

      // Send data to webhook
      try {
        await fetch('https://alexfinit.app.n8n.cloud/webhook/a4d75004-461b-4672-8f41-028a1aa70674', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone || '',
            crmPlatform: formData.crmPlatform,
            timestamp: new Date().toISOString()
          })
        });
      } catch (webhookError) {
        console.error('Error sending to webhook:', webhookError);
        // Don't fail the submission if webhook fails
      }

      setSuccess(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        crmPlatform: ''
      });
    } catch (err) {
      console.error('Error submitting test signup:', err);
      setError(t('testSignup.submissionError') || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <nav className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <Link to="/" className="flex items-center space-x-3">
                <img
                  src="/Finit Icon Blue.svg"
                  alt="VoiceLink"
                  className="h-10 w-10"
                />
                <span className="text-2xl font-bold" style={{ color: '#1C2C55' }}>
                  VoiceLink
                </span>
              </Link>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold mb-4" style={{ color: '#1C2C55' }}>
              {t('testSignup.successTitle') || 'Welcome to the VoiceLink Family!'}
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {t('testSignup.successMessage') || 'Thank you for signing up as an early test user. We will contact you soon with your free access to VoiceLink.'}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <p className="text-gray-700">
                <strong>{t('testSignup.nextSteps') || 'What happens next?'}:</strong>
              </p>
              <ul className="text-left mt-4 space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">1.</span>
                  {t('testSignup.step1') || 'We will review your application'}
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">2.</span>
                  {t('testSignup.step2') || 'You will receive an email with your free access credentials'}
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">3.</span>
                  {t('testSignup.step3') || 'Our team will guide you through the setup process'}
                </li>
              </ul>
            </div>
            <Link
              to="/"
              className="inline-block px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 hover:shadow-xl hover:scale-105"
              style={{ backgroundColor: '#1C2C55' }}
            >
              {t('testSignup.backToHome') || 'Back to Home'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center space-x-3">
              <img
                src="/Finit Icon Blue.svg"
                alt="VoiceLink"
                className="h-10 w-10"
              />
              <span className="text-2xl font-bold" style={{ color: '#1C2C55' }}>
                VoiceLink
              </span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6" style={{ color: '#1C2C55' }}>
            {t('testSignup.title') || 'Become an Early Test User'}
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            {t('testSignup.subtitle') || 'Get free access to VoiceLink and help us shape the future of voice-powered CRM integration'}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#1C2C55' }}>
              {t('testSignup.benefitsTitle') || 'What You Get:'}
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                {t('testSignup.benefit2') || 'Priority support from our team'}
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                {t('testSignup.benefit3') || 'Influence product development with your feedback'}
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                {t('testSignup.benefit4') || 'Early access to new features'}
              </li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('testSignup.firstName') || 'First Name'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder={t('testSignup.firstNamePlaceholder') || 'John'}
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('testSignup.lastName') || 'Last Name'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder={t('testSignup.lastNamePlaceholder') || 'Doe'}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('testSignup.email') || 'Email Address'} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                placeholder={t('testSignup.emailPlaceholder') || 'john.doe@example.com'}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('testSignup.phone') || 'Phone Number'} <span className="text-gray-400 text-xs">({t('common.optional') || 'Optional'})</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                placeholder={t('testSignup.phonePlaceholder') || '+32 123 456 789'}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                {t('testSignup.crmPlatform') || 'Which CRM do you plan to use VoiceLink with?'} <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {crmOptions.map((crm) => (
                  <button
                    key={crm.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, crmPlatform: crm.value })}
                    className={`relative p-6 rounded-xl border-2 transition-all hover:scale-105 ${
                      formData.crmPlatform === crm.value
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <img
                        src={crm.logo}
                        alt={crm.name}
                        className="h-12 w-12 object-contain"
                      />
                      <span className={`font-semibold ${
                        formData.crmPlatform === crm.value ? 'text-blue-900' : 'text-gray-700'
                      }`}>
                        {crm.name}
                      </span>
                    </div>
                    {formData.crmPlatform === crm.value && (
                      <div className="absolute top-2 right-2">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !formData.crmPlatform}
              className="w-full py-4 rounded-2xl font-semibold text-white text-lg transition-all duration-300 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
              style={{ backgroundColor: '#1C2C55' }}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  {t('testSignup.submitting') || 'Submitting...'}
                </span>
              ) : (
                t('testSignup.submitButton') || 'Join as Test User'
              )}
            </button>

            <p className="text-center text-sm text-gray-500">
              {t('testSignup.privacyNote') || 'By submitting this form, you agree to be contacted by our team regarding VoiceLink testing.'}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
