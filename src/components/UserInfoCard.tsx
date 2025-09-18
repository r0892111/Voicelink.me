import React from 'react';
import { User, Mail, Calendar, Building, Settings } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

interface UserInfoCardProps {
  platform: 'teamleader' | 'pipedrive' | 'odoo';
  userInfo: any;
}

export const UserInfoCard: React.FC<UserInfoCardProps> = ({ platform, userInfo }) => {
  const { t } = useI18n();

  const renderTeamleaderInfo = () => {
    const user = userInfo?.user || {};
    const account = userInfo?.account || {};
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-emerald-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <User className="w-4 h-4 text-emerald-600" />
              <h3 className="font-medium text-gray-900">{t('dashboard.accountProfile.personalInfo')}</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">{t('dashboard.accountProfile.fullName')}:</span> {user.first_name} {user.last_name}</p>
              <p><span className="font-medium">{t('dashboard.accountProfile.language')}:</span> {user.language || 'N/A'}</p>
              <p><span className="font-medium">{t('dashboard.accountProfile.timeZone')}:</span> {user.time_zone}</p>
            </div>
          </div>
          
          <div className="p-4 bg-emerald-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Mail className="w-4 h-4 text-emerald-600" />
              <h3 className="font-medium text-gray-900">{t('dashboard.accountProfile.contact')}</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">{t('dashboard.accountProfile.email')}:</span> {user.email}</p>
              <p><span className="font-medium">{t('dashboard.accountProfile.status')}:</span> {user.email_verification_status}</p>
              {user.telephones && user.telephones.length > 0 && (
                <div>
                  <span className="font-medium">{t('dashboard.accountProfile.phone')}:</span>
                  {user.telephones.map((phone: any, index: number) => (
                    <div key={index} className="ml-2">
                      {phone.type}: +{phone.number}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {account.id && (
          <div className="p-4 bg-emerald-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Building className="w-4 h-4 text-emerald-600" />
              <h3 className="font-medium text-gray-900">{t('dashboard.accountProfile.account')}</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">{t('dashboard.accountProfile.accountID')}:</span> {account.id}</p>
              <p><span className="font-medium">{t('dashboard.accountProfile.type')}:</span> {account.type}</p>
            </div>
          </div>
        )}

        {user.preferences && (
          <div className="p-4 bg-emerald-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <h3 className="font-medium text-gray-900">{t('dashboard.accountProfile.preferences')}</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">{t('dashboard.accountProfile.invoiceable')}:</span> {user.preferences.invoiceable ? t('dashboard.accountProfile.yes') : t('dashboard.accountProfile.no')}</p>
              <p><span className="font-medium">{t('dashboard.accountProfile.whitelabeling')}:</span> {user.preferences.whitelabeling ? t('dashboard.accountProfile.yes') : t('dashboard.accountProfile.no')}</p>
              {user.preferences.historic_time_tracking_limit && (
                <p><span className="font-medium">{t('dashboard.accountProfile.timeTrackingLimit')}:</span> {user.preferences.historic_time_tracking_limit}</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPipedriveInfo = () => {
    const user = userInfo || {};
    
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">{t('dashboard.accountProfile.personalInfo')}</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">{t('dashboard.accountProfile.fullName')}</span>
            <span className="text-sm font-medium text-gray-900">{user.name}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">{t('dashboard.accountProfile.email')}</span>
            <span className="text-sm font-medium text-gray-900">{user.email}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">{t('dashboard.accountProfile.language')}</span>
            <span className="text-sm font-medium text-gray-900">
              {user.language?.language_code ? `${user.language.language_code}-${user.language.country_code}` : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">{t('dashboard.accountProfile.timeZone')}</span>
            <span className="text-sm font-medium text-gray-900">{user.timezone_name}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">{t('dashboard.accountProfile.locale')}</span>
            <span className="text-sm font-medium text-gray-900">{user.locale}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">{t('dashboard.accountProfile.adminStatus')}</span>
            <span className="text-sm font-medium text-gray-900">{user.is_admin ? t('dashboard.accountProfile.admin') : t('dashboard.accountProfile.user')}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">{t('dashboard.accountProfile.accountStatus')}</span>
            <span className="text-sm font-medium text-gray-900">{user.active_flag ? t('dashboard.accountProfile.active') : t('dashboard.accountProfile.inactive')}</span>
          </div>
          {user.phone && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">{t('dashboard.accountProfile.phone')}</span>
              <span className="text-sm font-medium text-gray-900">{user.phone}</span>
            </div>
          )}
          {user.company_name && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">{t('dashboard.accountProfile.company')}</span>
              <span className="text-sm font-medium text-gray-900">{user.company_name}</span>
            </div>
          )}
          {user.company_domain && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">{t('dashboard.accountProfile.companyDomain')}</span>
              <span className="text-sm font-medium text-gray-900">{user.company_domain}</span>
            </div>
          )}
          {user.default_currency && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">{t('dashboard.accountProfile.defaultCurrency')}</span>
              <span className="text-sm font-medium text-gray-900">{user.default_currency}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">{t('dashboard.accountProfile.lastLogin')}</span>
            <span className="text-sm font-medium text-gray-900">{user.last_login || 'N/A'}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderOdooInfo = () => {
    const user = userInfo || {};
    
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">{t('dashboard.accountProfile.personalInfo')}</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">{t('dashboard.accountProfile.fullName')}</span>
            <span className="text-sm font-medium text-gray-900">{user.name}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">{t('dashboard.accountProfile.email')}</span>
            <span className="text-sm font-medium text-gray-900">{user.email}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">{t('dashboard.accountProfile.userID')}</span>
            <span className="text-sm font-medium text-gray-900">{user.user_id}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">{t('dashboard.accountProfile.supportAccess')}</span>
            <span className="text-sm font-medium text-gray-900">{user.support ? t('dashboard.accountProfile.yes') : t('dashboard.accountProfile.no')}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">{t('dashboard.accountProfile.scope')}</span>
            <span className="text-sm font-medium text-gray-900">{user.scope}</span>
          </div>
          {user.audience && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">{t('dashboard.accountProfile.audience')}</span>
              <span className="text-sm font-medium text-gray-900">{user.audience}</span>
            </div>
          )}
          {user.expires_in && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">{t('dashboard.accountProfile.tokenExpires')}</span>
              <span className="text-sm font-medium text-gray-900">{Math.floor(user.expires_in / 60)} {t('dashboard.accountProfile.minutes')}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPlatformInfo = () => {
    switch (platform) {
      case 'teamleader':
        return renderTeamleaderInfo();
      case 'pipedrive':
        return renderPipedriveInfo();
      case 'odoo':
        return renderOdooInfo();
      default:
        return (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">{t('dashboard.accountProfile.unknownPlatform')}: {platform}</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('dashboard.accountProfile.title')}</h2>
      {renderPlatformInfo()}
    </div>
  );
};
