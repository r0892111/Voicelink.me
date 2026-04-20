import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  UserCircle,
  CreditCard,
  BookOpen,
  LogOut,
  User,
  Lock,
} from 'lucide-react';
import type { AuthUser } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';

export interface DashboardSidebarProps {
  user: AuthUser;
  isAdmin: boolean;
  onSignOut: () => void;
  onNavigate?: () => void;
}

interface NavItem {
  to: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
  end?: boolean;
}

interface NavGroup {
  labelKey: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    labelKey: 'dash.nav.groupMain',
    items: [
      { to: '/dashboard',         labelKey: 'dash.nav.dashboard', icon: LayoutDashboard, end: true },
      { to: '/dashboard/team',    labelKey: 'dash.nav.team',      icon: Users,           adminOnly: true },
      { to: '/dashboard/usage',   labelKey: 'dash.nav.usage',     icon: BarChart3 },
    ],
  },
  {
    labelKey: 'dash.nav.groupAccount',
    items: [
      { to: '/dashboard/settings', labelKey: 'dash.nav.settings', icon: Settings },
      { to: '/dashboard/profile',  labelKey: 'dash.nav.profile',  icon: UserCircle },
      { to: '/dashboard/billing',  labelKey: 'dash.nav.billing',  icon: CreditCard, adminOnly: true },
    ],
  },
  {
    labelKey: 'dash.nav.groupHelp',
    items: [{ to: '/dashboard/guide', labelKey: 'dash.nav.guide', icon: BookOpen }],
  },
];

export function DashboardSidebar({ user, isAdmin, onSignOut, onNavigate }: DashboardSidebarProps) {
  const navigate = useNavigate();
  const { t } = useI18n();

  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

  return (
    <aside className="w-64 h-full bg-white border-r border-navy/[0.07] flex flex-col">
      <div className="px-5 pt-6 pb-4 flex-shrink-0">
        <button
          onClick={() => navigate('/')}
          className="flex items-center group"
          aria-label="VoiceLink home"
        >
          <img
            src="/Finit Voicelink Blue.svg"
            alt="VoiceLink"
            className="h-7 w-auto group-hover:scale-[1.02] transition-transform duration-200"
          />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.labelKey} className="mb-6">
            <p className="px-3 mb-2 text-[10px] uppercase tracking-widest font-semibold text-navy/35">
              {t(group.labelKey)}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const locked = item.adminOnly && !isAdmin;
                const Icon = item.icon;
                const label = t(item.labelKey);

                if (locked) {
                  return (
                    <li key={item.to}>
                      <div className="group/locked relative">
                        <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-navy/35 cursor-not-allowed transition-colors group-hover/locked:bg-navy/[0.03] group-hover/locked:text-navy/50">
                          <Icon className="w-4 h-4" />
                          <span className="text-sm font-medium flex-1">{label}</span>
                          <Lock className="w-3 h-3 transition-transform group-hover/locked:scale-110" />
                        </div>
                        <div
                          role="tooltip"
                          className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 whitespace-nowrap rounded-lg bg-navy text-white text-xs font-medium px-2.5 py-1.5 shadow-lg opacity-0 translate-x-[-4px] group-hover/locked:opacity-100 group-hover/locked:translate-x-0 transition-all duration-150"
                        >
                          {t('dash.nav.adminOnlyTooltip')}
                          <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-navy" />
                        </div>
                      </div>
                    </li>
                  );
                }

                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        `relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-navy/[0.06] text-navy font-semibold'
                            : 'text-navy/60 hover:text-navy hover:bg-navy/[0.03]'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full bg-navy" />
                          )}
                          <Icon className="w-4 h-4" />
                          <span className="flex-1">{label}</span>
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-navy/[0.07] p-3 flex-shrink-0">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center flex-shrink-0 text-white text-xs font-semibold font-general">
            {initials !== 'U' ? initials : <User className="w-4 h-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-navy truncate">{user.name}</div>
            <div className="text-xs text-navy/45 capitalize truncate">{user.platform}</div>
          </div>
        </div>
        <button
          onClick={onSignOut}
          className="mt-1 w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-navy/60 hover:text-red-600 hover:bg-red-50/50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('dash.nav.signOut')}</span>
        </button>
      </div>
    </aside>
  );
}
