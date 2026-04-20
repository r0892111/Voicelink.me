import { UserCircle, Mail, Building2, Phone } from 'lucide-react';
import { useDashboardContext } from '../hooks/useDashboardContext';

const PLATFORM_LABELS: Record<string, string> = {
  teamleader: 'Teamleader',
  pipedrive: 'Pipedrive',
  odoo: 'Odoo',
};

export function DashboardProfile() {
  const { user, wa } = useDashboardContext();

  const initials =
    user.name
      .split(' ')
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U';

  return (
    <div className="max-w-4xl mx-auto px-6 pt-10 pb-16">
      <header className="mb-8">
        <div className="flex items-center gap-2.5 text-navy/50 mb-2">
          <UserCircle className="w-4 h-4" />
          <span className="text-xs uppercase tracking-widest font-semibold">Account</span>
        </div>
        <h1 className="font-general font-bold text-navy text-3xl tracking-tight">Profile</h1>
        <p className="text-navy/60 mt-1.5">Your VoiceLink identity and connected accounts.</p>
      </header>

      <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-navy text-white flex items-center justify-center font-general font-semibold text-lg">
            {initials}
          </div>
          <div>
            <h2 className="font-general font-bold text-navy text-xl">{user.name}</h2>
            <p className="text-navy/55 text-sm capitalize">
              {PLATFORM_LABELS[user.platform] ?? user.platform} workspace
            </p>
          </div>
        </div>

        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
          <div>
            <dt className="flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-navy/40 mb-1.5">
              <Mail className="w-3.5 h-3.5" />
              Email
            </dt>
            <dd className="text-navy font-medium break-all">{user.email}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-navy/40 mb-1.5">
              <Building2 className="w-3.5 h-3.5" />
              CRM
            </dt>
            <dd className="text-navy font-medium">
              {PLATFORM_LABELS[user.platform] ?? user.platform}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-navy/40 mb-1.5">
              <Phone className="w-3.5 h-3.5" />
              WhatsApp
            </dt>
            <dd className="text-navy font-medium">
              {wa.number || (
                <span className="text-navy/45 font-normal">Not connected yet</span>
              )}
            </dd>
          </div>
        </dl>
      </section>

      <section className="bg-white/60 backdrop-blur-sm rounded-2xl border border-dashed border-navy/15 p-6">
        <p className="text-xs uppercase tracking-widest font-semibold text-navy/40 mb-2">Coming soon</p>
        <h3 className="font-general font-semibold text-navy text-lg mb-1">Profile editing</h3>
        <p className="text-navy/60 text-sm">
          Update your display name, language, and notification preferences from this page.
        </p>
      </section>
    </div>
  );
}
