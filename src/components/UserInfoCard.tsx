import React from 'react';
import { User, Mail, Phone, Globe, Calendar, Building, Settings } from 'lucide-react';

interface UserInfoCardProps {
  platform: 'teamleader' | 'pipedrive' | 'odoo';
  userInfo: any;
  email: string;
}

export const UserInfoCard: React.FC<UserInfoCardProps> = ({ platform, userInfo, email }) => {
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
              <p><span className="font-medium">Language:</span> {user.language}</p>
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
    const company = user.company_name ? {
      name: user.company_name,
      domain: user.company_domain,
      country: user.company_country,
      currency: user.default_currency
    } : null;
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <User className="w-4 h-4 text-orange-500" />
              <h3 className="font-medium text-gray-900">Personal Info</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Name:</span> {user.name}</p>
              <p><span className="font-medium">Language:</span> {user.language?.language_code}-{user.language?.country_code}</p>
              <p><span className="font-medium">Locale:</span> {user.locale}</p>
              <p><span className="font-medium">Time Zone:</span> {user.timezone_name}</p>
              <p><span className="font-medium">Admin:</span> {user.is_admin ? 'Yes' : 'No'}</p>
            </div>
          </div>
          
          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Mail className="w-4 h-4 text-orange-500" />
              <h3 className="font-medium text-gray-900">Contact</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p><span className="font-medium">Status:</span> {user.active_flag ? 'Active' : 'Inactive'}</p>
              {user.phone && (
                <p><span className="font-medium">Phone:</span> {user.phone}</p>
              )}
              <p><span className="font-medium">Last Login:</span> {user.last_login}</p>
            </div>
          </div>
        </div>

        {company && (
          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Building className="w-4 h-4 text-orange-500" />
              <h3 className="font-medium text-gray-900">Company</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Company:</span> {company.name}</p>
              <p><span className="font-medium">Domain:</span> {company.domain}</p>
              <p><span className="font-medium">Country:</span> {company.country}</p>
              <p><span className="font-medium">Currency:</span> {company.currency}</p>
            </div>
          </div>
        )}

        {user.access && user.access.length > 0 && (
          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Settings className="w-4 h-4 text-orange-500" />
              <h3 className="font-medium text-gray-900">Permissions</h3>
            </div>
            <div className="space-y-2 text-sm">
              {user.access.map((access: any, index: number) => (
                <p key={index}>
                  <span className="font-medium">{access.app}:</span> {access.admin ? 'Admin' : 'User'}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderOdooInfo = () => {
    // Placeholder for Odoo data structure
    return (
      <div className="p-4 bg-purple-50 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <User className="w-4 h-4 text-purple-600" />
          <h3 className="font-medium text-gray-900">Odoo User Info</h3>
        </div>
        <p className="text-sm text-gray-600">Odoo user data will be displayed here once available.</p>
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