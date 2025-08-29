import { AuthConfig, AuthResponse } from '../types/auth';

export class AuthService {
  private config: AuthConfig;

  constructor(config: AuthConfig) {
    this.config = config;
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  async initiateAuth(): Promise<AuthResponse> {
    try {
      const authUrl = this.getAuthUrl();
      
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

  private getAuthUrl(): string {
    // Clear any existing state to ensure fresh authentication
    localStorage.removeItem(`${this.config.functionName}_oauth_state`);

    // Generate a fresh state parameter
    const state = this.generateState();

    // Ensure consistent redirect URI
    const redirectUri = `${window.location.protocol}//${window.location.host}/auth/${this.config.functionName}/callback`;

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      state: state
    });

    // Store the new state
    localStorage.setItem(`${this.config.functionName}_oauth_state`, state);
    
    const authUrl = `${this.config.baseUrl}/oauth2/authorize?${params.toString()}`;

    return authUrl;
  }

  static createTeamleaderAuth(): AuthService {
    return new AuthService({
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      functionName: 'teamleader',
      clientId: import.meta.env.VITE_TEAMLEADER_CLIENT_ID || 'f6d23cd41fad1c1de3471253996c4588',
      baseUrl: import.meta.env.VITE_TEAMLEADER_BASE_URL || 'https://focus.teamleader.eu'
    });
  }

  static createPipedriveAuth(): AuthService {
    return new AuthService({
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      functionName: 'pipedrive',
      clientId: import.meta.env.VITE_PIPEDRIVE_CLIENT_ID || '',
      baseUrl: import.meta.env.VITE_PIPEDRIVE_BASE_URL || 'https://oauth.pipedrive.com'
    });
  }

  static createOdooAuth(): AuthService {
    return new AuthService({
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      functionName: 'odoo',
      clientId: import.meta.env.VITE_ODOO_CLIENT_ID || 'your-odoo-client-id',
      baseUrl: import.meta.env.VITE_ODOO_BASE_URL || 'https://your-odoo-instance.odoo.com'
    });
  }
}