import { Users, ChefHat, Database } from 'lucide-react';
import { AuthProvider } from '../types/auth';

export const authProviders: AuthProvider[] = [
  {
    name: 'teamleader',
    platform: 'teamleader',
    displayName: 'Teamleader',
    icon: Users,
    color: 'bg-emerald-600',
    hoverColor: 'hover:bg-emerald-700'
  },
  // Catermonkey via its MCP server. The OAuth dance runs in the VoiceLink
  // backend (VITE_VLAGENT_URL /oauth/mcp/start), which hands the browser back
  // to /auth/catermonkey_mcp/callback with a single-use token — see
  // AuthPage.handleSignIn and AuthCallback. Platform key: 'catermonkey_mcp'.
  {
    name: 'catermonkey',
    platform: 'catermonkey_mcp',
    displayName: 'Catermonkey',
    icon: ChefHat,
    color: 'bg-amber-600',
    hoverColor: 'hover:bg-amber-700'
  },
  // Odoo connects with a static API key, not OAuth (Odoo has no OAuth
  // provider for third parties). The button opens AuthPage.renderOdooConnect;
  // the form posts to the odoo-connect edge function, which has VoiceLink
  // prove the key and store it, then creates the portal account. Spec:
  // VoiceLink docs/crm-onboarding/odoo/specs/D3-portal.md (OD-17).
  {
    name: 'odoo',
    platform: 'odoo',
    displayName: 'Odoo',
    kind: 'credentials',
    icon: Database,
    color: 'bg-purple-700',
    hoverColor: 'hover:bg-purple-800'
  },
  // TEMPORARY: Pipedrive disabled
  // {
  //   name: 'pipedrive',
  //   displayName: 'Pipedrive',
  //   icon: Zap,
  //   color: 'bg-orange-500',
  //   hoverColor: 'hover:bg-orange-600'
  // }
];