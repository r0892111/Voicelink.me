import { AuthConfig, AuthResponse } from '../types/auth';

export class AuthService {
  private config: AuthConfig;

  constructor(config: AuthConfig) {
    this.config = config;
  }

  async initiateAuth(): Promise<AuthResponse> {
    try {
      const authUrl = `${this.config.supabaseUrl}/functions/v1/${this.config.functionName}`;
      
      // For OAuth flows, we typically redirect directly
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