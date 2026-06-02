import React, { useState, useRef, useEffect } from 'react';
import { User, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { useNavigate } from 'react-router-dom';
import { withUTM } from '../utils/utm';

/**
 * Signed-in account menu for the marketing navbar.
 *
 * Collapses the old three-element cluster (Dashboard button + user pill +
 * Sign out button) into a single avatar circle that opens a dropdown. Mirrors
 * the structure of LanguageSwitcher (button + backdrop + absolute panel) so the
 * nav stays consistent. Marine-only navy palette.
 */
export const UserMenu: React.FC = () => {
  const { user, signOut } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on any click outside the menu, or on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const handlePointer = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  if (!user) return null;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={user.name}
        className="flex items-center justify-center w-9 h-9 bg-navy rounded-full shadow-sm hover:bg-navy-hover hover:shadow-md transition-all duration-200"
      >
        <User className="w-4 h-4 text-white" />
      </button>

      {isOpen && (
          /* Dropdown */
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-navy/[0.08] py-2 z-20">
            {/* Account header */}
            <div className="px-4 py-2.5 border-b border-navy/[0.06]">
              <div className="font-semibold text-sm text-navy leading-tight">{user.name}</div>
              <div className="text-xs text-navy/50 capitalize leading-tight mt-0.5">{user.platform}</div>
            </div>

            <div className="py-1">
              <button
                onClick={() => { setIsOpen(false); navigate(withUTM('/dashboard')); }}
                className="w-full text-left px-4 py-2 flex items-center gap-3 text-navy hover:bg-navy/[0.04] transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-navy/60" />
                <span className="font-medium text-sm">{t('navigation.dashboard')}</span>
              </button>
              <button
                onClick={() => { setIsOpen(false); signOut(); }}
                className="w-full text-left px-4 py-2 flex items-center gap-3 text-navy hover:bg-navy/[0.04] transition-colors"
              >
                <LogOut className="w-4 h-4 text-navy/60" />
                <span className="font-medium text-sm">{t('navigation.signOut')}</span>
              </button>
            </div>
          </div>
      )}
    </div>
  );
};
