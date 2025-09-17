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
              <h3 className="font-medium text-gray-900">{t('userInfo.personalInformation')}</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">{t('userInfo.fullName')}:</span> {user.first_name} {user.last_name}</p>
              <p><span className="font-medium">{t('userInfo.language')}:</span> {user.language || t('userInfo.notAvailable')}</p>
              <p><span className="font-medium">{t('userInfo.timeZone')}:</span> {user.time_zone}</p>
            </div>
          </div>
          
          <div className="p-4 bg-emerald-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Mail className="w-4 h-4 text-emerald-600" />
              <h3 className="font-medium text-gray-900">{t('userInfo.contactInformation')}</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">{t('userInfo.emailAddress')}:</span> {user.email}</p>
              <p><span className="font-medium">{t('userInfo.emailStatus')}:</span> {user.email_verification_status}</p>
              {user.telephones && user.telephones.length > 0 && (
                <div>
                  <span className="font-medium">{t('userInfo.phoneNumber')}:</span>
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
              <h3 className="font-medium text-gray-900">{t('userInfo.accountDetails')}</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">{t('userInfo.accountId')}:</span> {account.id}</p>
              <p><span className="font-medium">{t('userInfo.accountType')}:</span> {account.type}</p>
            </div>
          </div>
        )}

        {user.preferences && (
          <div className="p-4 bg-emerald-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <h3 className="font-medium text-gray-900">{t('userInfo.preferences')}</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">{t('userInfo.invoiceable')}:</span> {user.preferences.invoiceable ? t('userInfo.yes') : t('userInfo.no')}</p>
              <p><span className="font-medium">{t('userInfo.whitelabeling')}:</span> {user.preferences.whitelabeling ? t('userInfo.yes') : t('userInfo.no')}</p>
              {user.preferences.historic_time_tracking_limit && (
                <p><span className="font-medium">{t('userInfo.timeTrackingLimit')}:</span> {user.preferences.historic_time_tracking_limit}</p>
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
        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">{t('userInfo.personalInformation')}</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">{t('userInfo.fullName')}</span>
            <span className="text-sm font-medium text-gray-900">{user.name}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">{t('userInfo.emailAddress')}</span>
            <span className="text-sm font-medium text-gray-900">{user.email}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">{t('userInfo.language')}</span>
            <span className="text-sm font-medium text-gray-900">
              {user.language?.language_code ? `${user.language.language_code}-${user.language.country_code}` : t('userInfo.notAvailable')}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">{t('userInfo.timeZone')}</span>
            <span className="text-sm font-medium text-gray-900">{user.timezone_name}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">{t('userInfo.locale')}</span>
            <span className="text-sm font-medium text-gray-900">{user.locale}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">{t('userInfo.adminStatus')}</span>
            <span className="text-sm font-medium text-gray-900">{user.is_admin ? t('userInfo.admin') : t('userInfo.user')}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">{t('userInfo.accountStatus')}</span>
            <span className="text-sm font-medium text-gray-900">{user.active_flag ? t('userInfo.active') : t('userInfo.inactive')}</span>
          </div>
          {user.phone && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">{t('userInfo.phoneNumber')}</span>
              <span className="text-sm font-medium text-gray-900">{user.phone}</span>
            </div>
          )}
          {user.company_name && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">{t('userInfo.companyName')}</span>
              <span className="text-sm font-medium text-gray-900">{user.company_name}</span>
            </div>
          )}
          {user.company_domain && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">{t('userInfo.companyDomain')}</span>
              <span className="text-sm font-medium text-gray-900">{user.company_domain}</span>
            </div>
          )}
          {user.default_currency && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">{t('userInfo.defaultCurrency')}</span>
              <span className="text-sm font-medium text-gray-900">{user.default_currency}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">{t('userInfo.lastLogin')}</span>
            <span className="text-sm font-medium text-gray-900">{user.last_login || t('userInfo.notAvailable')}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderOdooInfo = () => {
    const user = userInfo || {};
    
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">{t('userInfo.personalInformation')}</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">{t('userInfo.fullName')}</span>
            <span className="text-sm font-medium text-gray-900">{user.name}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">{t('userInfo.emailAddress')}</span>
            <span className="text-sm font-medium text-gray-900">{user.email}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">{t('userInfo.userId')}</span>
            <span className="text-sm font-medium text-gray-900">{user.user_id}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">{t('userInfo.supportAccess')}</span>
            <span className="text-sm font-medium text-gray-900">{user.support ? t('userInfo.yes') : t('userInfo.no')}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">{t('userInfo.scope')}</span>
            <span className="text-sm font-medium text-gray-900">{user.scope}</span>
          </div>
          {user.audience && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">{t('userInfo.audience')}</span>
              <span className="text-sm font-medium text-gray-900">{user.audience}</span>
            </div>
          )}
          {user.expires_in && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">{t('userInfo.tokenExpires')}</span>
              <span className="text-sm font-medium text-gray-900">{Math.floor(user.expires_in / 60)} {t('userInfo.minutes')}</span>
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
            <p className="text-sm text-gray-600">{t('platforms.unknown')} {t('common.platform')}: {platform}</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('userInfo.personalInformation')}</h2>
      {renderPlatformInfo()}
    </div>
  );
};