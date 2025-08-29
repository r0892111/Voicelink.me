import { AuthConfig, AuthResponse } from '../types/auth';

export class AuthService {
  private config: AuthConfig;

  constructor(config: AuthConfig) {
    this.config = config;
  }

  async initiateAuth(): Promise<AuthResponse> {
    try {
      // Call the edge function to get the OAuth URL
      const response = await fetch(`${this.config.supabaseUrl}/functions/v1/${this.config.functionName}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get auth URL: ${response.statusText}`);
      }

      const data = await response.json();
      const authUrl = data.authUrl;

      if (!authUrl) {
        throw new Error('No auth URL returned from edge function');
      }
      
      // Redirect to the OAuth URL
      window.location.href = authUrl;
      
      return { success: true, redirectUrl: authUrl };
    } catch (error) {
      console.error('Authentication error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      };
    }
  }

  static createTeamleaderAuth(): AuthService {
    return new AuthService({
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      functionName: 'teamleader-auth'
    });
  }

  static createPipedriveAuth(): AuthService {
    return new AuthService({
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      functionName: 'pipedrive-auth'
    });
  }

  static createOdooAuth(): AuthService {
    return new AuthService({
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      functionName: 'odoo-auth'
    });
  }
}