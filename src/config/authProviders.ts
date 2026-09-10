import { Users, ChefHat } from 'lucide-react';
import { AuthProvider } from '../types/auth';

export const authProviders: AuthProvider[] = [
  {
    name: 'teamleader',
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
    displayName: 'Catermonkey',
    icon: ChefHat,
    color: 'bg-amber-600',
    hoverColor: 'hover:bg-amber-700'
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