import React from 'react';
import { Loader2 } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

interface CompanyUser {
  id: number | string;
  name: string;
  email: string;
  function?: string;
  phone?: string;
  [key: string]: any;
}

interface CompanyUserDropdownProps {
  users: CompanyUser[];
  loading: boolean;
  selectedUser: CompanyUser | null;
  onUserSelect: (user: CompanyUser) => void;
  onAutofillPhone?: (phone: string) => void;
  platform: string;
}

export const CompanyUserDropdown: React.FC<CompanyUserDropdownProps> = ({
  users,
  loading,
  selectedUser,
  onUserSelect,
  onAutofillPhone,
  platform
}) => {
  const { t } = useI18n();

  const getUserDisplayName = (user: CompanyUser): string => {
    switch (platform) {
      case 'teamleader':
        // For TeamLeader, combine first_name and last_name if available
        const firstName = (user as any).first_name || '';
        const lastName = (user as any).last_name || '';
        if (firstName && lastName) {
          return `${firstName} ${lastName}`;
        }
        return user.name;
      default:
        return user.name;
    }
  };

  const getUserDisplayInfo = (user: CompanyUser): string => {
    const displayName = getUserDisplayName(user);
    return `${displayName} (${user.email})`;
  };

  const getPlatformSpecificFields = (user: CompanyUser) => {
    switch (platform) {
      case 'pipedrive':
        return {
          active: (user as any).active_flag ? t('common.active') : t('common.inactive'),
        };
      case 'teamleader':
        return {
          function: user.function || t('common.notProvided'),
        };
      case 'odoo':
        return {
          function: user.function || t('common.notProvided'),
        };
      default:
        return {};
    }
  };

  if (loading) {
    return (
      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center space-x-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>{t('teamManagement.loadingUsers')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('teamManagement.selectCompanyUser')}
        </label>
        <select
          value={selectedUser?.id || ''}
          onChange={(e) => {
            const userId = e.target.value;
            const user = users.find(u => u.id.toString() === userId);
            if (user) onUserSelect(user);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">{t('teamManagement.selectCompanyUser')}</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {getUserDisplayInfo(user)}
            </option>
          ))}
        </select>
      </div>

      {selectedUser && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="font-medium text-blue-900 mb-2">{t('teamManagement.selectedUserDetails')}</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">{t('teamManagement.name')}:</span> {getUserDisplayName(selectedUser)}
            </div>
            <div>
              <span className="font-medium">{t('teamManagement.email')}:</span> {selectedUser.email}
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">{t('teamManagement.phone')}:</span> {selectedUser.phone || t('teamManagement.notProvided')}
              </div>
              {selectedUser.phone && onAutofillPhone && (
                <button
                  onClick={() => onAutofillPhone(selectedUser.phone!)}
                  className="ml-2 px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {t('common.autofill')}
                </button>
              )}
            </div>
            {Object.entries(getPlatformSpecificFields(selectedUser)).map(([key, value]) => (
              <div key={key}>
                <span className="font-medium">{t(`common.${key}`)}:</span> {value}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
