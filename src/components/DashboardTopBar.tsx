import { Menu } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

export interface DashboardTopBarProps {
  title: string;
  onOpenSidebar: () => void;
}

export function DashboardTopBar({ title, onOpenSidebar }: DashboardTopBarProps) {
  const { t } = useI18n();
  return (
    <header className="lg:hidden sticky top-0 z-30 bg-porcelain/85 backdrop-blur-md border-b border-navy/[0.06]">
      <div className="flex items-center gap-3 px-4 h-14">
        <button
          onClick={onOpenSidebar}
          aria-label={t('dash.nav.openSidebar')}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-navy/70 hover:text-navy hover:bg-navy/[0.05] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="font-general font-semibold text-navy text-base truncate">{title}</h1>
      </div>
    </header>
  );
}
