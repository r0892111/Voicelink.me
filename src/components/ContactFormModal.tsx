import React, { useState } from 'react';
import { X, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactFormModal: React.FC<ContactFormModalProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Simulate API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For now, just show success
      setSubmitStatus('success');
      
      // Reset form after success
      setTimeout(() => {
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          message: ''
        });
        setSubmitStatus('idle');
        onClose();
      }, 2000);
      
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-porcelain rounded-2xl shadow-xl max-w-lg w-full max-h-[92svh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 pb-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-general font-bold text-navy">{t('contact.title')}</h2>
              <p className="text-navy/60 font-instrument mt-0.5 text-xs sm:text-sm">{t('contact.subtitle')}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-navy/5 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-navy/40" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 pt-3 sm:pt-4 space-y-3 sm:space-y-5">
            {/* Status Messages */}
            {submitStatus === 'success' && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-700 font-instrument">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>{t('contact.messageSent')}</span>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-red-600 font-instrument">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{t('contact.submitFailed')}</span>
              </div>
            )}

            {/* Form Fields — single column */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-instrument font-medium text-navy/70 mb-1.5">
                {t('contact.fullName')} <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder={t('contact.fullNamePlaceholder')}
                required
                className="w-full px-4 py-2.5 border border-navy/15 rounded-full bg-white font-instrument text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy/40 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-instrument font-medium text-navy/70 mb-1.5">
                {t('contact.emailAddress')} <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={t('contact.emailPlaceholder')}
                required
                className="w-full px-4 py-2.5 border border-navy/15 rounded-full bg-white font-instrument text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy/40 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-instrument font-medium text-navy/70 mb-1.5">
                {t('contact.phoneNumber')}
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder={t('contact.phonePlaceholder')}
                className="w-full px-4 py-2.5 border border-navy/15 rounded-full bg-white font-instrument text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy/40 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-instrument font-medium text-navy/70 mb-1.5">
                {t('contact.message')} <span className="text-red-400">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder={t('contact.messagePlaceholder')}
                required
                rows={3}
                className="w-full px-4 py-2.5 border border-navy/15 rounded-xl bg-white font-instrument text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy/40 transition-colors resize-none"
              />
            </div>

            {/* Response Time Info */}
            <div className="bg-navy/5 rounded-xl p-2.5 sm:p-3">
              <p className="text-xs sm:text-sm text-navy/60 font-instrument">
                {t('contact.responseTime')}
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-2 sm:space-x-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-4 sm:px-6 py-2.5 border border-navy/20 text-navy/60 hover:text-navy hover:border-navy/40 rounded-full font-instrument font-medium transition-colors text-sm whitespace-nowrap"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || submitStatus === 'success'}
                className="px-4 sm:px-6 py-2.5 bg-navy hover:bg-navy-hover text-white rounded-full font-semibold font-instrument disabled:opacity-50 transition-colors flex items-center space-x-1.5 text-sm whitespace-nowrap"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t('contact.sendingMessage')}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t('contact.sendMessage')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};