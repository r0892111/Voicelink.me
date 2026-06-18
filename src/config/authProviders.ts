import { Users, Zap, Network } from 'lucide-react';
import { AuthProvider } from '../types/auth';

export const authProviders: AuthProvider[] = [
  {
    name: 'teamleader',
    displayName: 'Teamleader',
    icon: Users,
    color: 'bg-emerald-600',
    hoverColor: 'hover:bg-emerald-700'
  },
  {
    name: 'pipedrive',
    displayName: 'Pipedrive',
    icon: Zap,
    color: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-600'
  },
  {
    name: 'hubspot',
    displayName: 'HubSpot',
    icon: Network,
    color: 'bg-orange-600',
    hoverColor: 'hover:bg-orange-700'
  }
];
