import React from 'react';
import { User, Mail, Calendar, Building, Settings } from 'lucide-react';

interface UserInfoCardProps {
  platform: 'teamleader' | 'pipedrive' | 'odoo';
  userInfo: any;
}

export const UserInfoCard: React.FC<UserInfoCardProps> = ({ platform, userInfo }) => {
  const renderTeamleaderInfo = () => {
    const user = userInfo?.user || {};
    const account = userInfo?.account || {};
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-emerald-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <User className="w-4 h-4 text-emerald-600" />
              <h3 className="font-medium text-gray-900">Personal Info</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Name:</span> {user.first_name} {user.last_name}</p>
              <p><span className="font-medium">Language:</span> {user.language || 'N/A'}</p>
              <p><span className="font-medium">Time Zone:</span> {user.time_zone}</p>
            </div>
          </div>
          
          <div className="p-4 bg-emerald-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Mail className="w-4 h-4 text-emerald-600" />
              <h3 className="font-medium text-gray-900">Contact</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p><span className="font-medium">Status:</span> {user.email_verification_status}</p>
              {user.telephones && user.telephones.length > 0 && (
                <div>
                  <span className="font-medium">Phone:</span>
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
              <h3 className="font-medium text-gray-900">Account</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Account ID:</span> {account.id}</p>
              <p><span className="font-medium">Type:</span> {account.type}</p>
            </div>
          </div>
        )}

        {user.preferences && (
          <div className="p-4 bg-emerald-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <h3 className="font-medium text-gray-900">Preferences</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Invoiceable:</span> {user.preferences.invoiceable ? 'Yes' : 'No'}</p>
              <p><span className="font-medium">Whitelabeling:</span> {user.preferences.whitelabeling ? 'Yes' : 'No'}</p>
              {user.preferences.historic_time_tracking_limit && (
                <p><span className="font-medium">Time Tracking Limit:</span> {user.preferences.historic_time_tracking_limit}</p>
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
        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Personal Information</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Full Name</span>
            <span className="text-sm font-medium text-gray-900">{user.name}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Email</span>
            <span className="text-sm font-medium text-gray-900">{user.email}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Language</span>
            <span className="text-sm font-medium text-gray-900">
              {user.language?.language_code ? `${user.language.language_code}-${user.language.country_code}` : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Time Zone</span>
            <span className="text-sm font-medium text-gray-900">{user.timezone_name}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Locale</span>
            <span className="text-sm font-medium text-gray-900">{user.locale}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Admin Status</span>
            <span className="text-sm font-medium text-gray-900">{user.is_admin ? 'Admin' : 'User'}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Account Status</span>
            <span className="text-sm font-medium text-gray-900">{user.active_flag ? 'Active' : 'Inactive'}</span>
          </div>
          {user.phone && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Phone</span>
              <span className="text-sm font-medium text-gray-900">{user.phone}</span>
            </div>
          )}
          {user.company_name && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Company</span>
              <span className="text-sm font-medium text-gray-900">{user.company_name}</span>
            </div>
          )}
          {user.company_domain && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Company Domain</span>
              <span className="text-sm font-medium text-gray-900">{user.company_domain}</span>
            </div>
          )}
          {user.default_currency && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Default Currency</span>
              <span className="text-sm font-medium text-gray-900">{user.default_currency}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Last Login</span>
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
        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Personal Information</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Full Name</span>
            <span className="text-sm font-medium text-gray-900">{user.name}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Email</span>
            <span className="text-sm font-medium text-gray-900">{user.email}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">User ID</span>
            <span className="text-sm font-medium text-gray-900">{user.user_id}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Support Access</span>
            <span className="text-sm font-medium text-gray-900">{user.support ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Scope</span>
            <span className="text-sm font-medium text-gray-900">{user.scope}</span>
          </div>
          {user.audience && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Audience</span>
              <span className="text-sm font-medium text-gray-900">{user.audience}</span>
            </div>
          )}
          {user.expires_in && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Token Expires</span>
              <span className="text-sm font-medium text-gray-900">{Math.floor(user.expires_in / 60)} minutes</span>
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
            <p className="text-sm text-gray-600">Unknown platform: {platform}</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">User Information</h2>
      {renderPlatformInfo()}
    </div>
  );
};