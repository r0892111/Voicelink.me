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

    // Dynamic callback URL for all platforms
    const redirectUri = `${window.location.protocol}//${window.location.host}/auth/${this.config.functionName}/callback`;

    let params: URLSearchParams;
    
    if (this.config.functionName === 'pipedrive') {
      // Pipedrive-specific OAuth parameters
      params = new URLSearchParams({
        client_id: this.config.clientId,
        state: state,
        redirect_uri: redirectUri,
      });
    } else {
      // Standard OAuth parameters for other platforms
      params = new URLSearchParams({
        client_id: this.config.clientId,
        response_type: 'code',
        redirect_uri: redirectUri,
        state: state
      });
    }

    // Store the new state
    localStorage.setItem(`${this.config.functionName}_oauth_state`, state);
    
    let authUrl: string;
    
    if (this.config.functionName === 'pipedrive') {
      authUrl = `https://oauth.pipedrive.com/oauth/authorize?${params.toString()}`;
    } else {
      authUrl = `${this.config.baseUrl}/oauth2/authorize?${params.toString()}`;
    }

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
      clientId: import.meta.env.VITE_PIPEDRIVE_CLIENT_ID || 'your-pipedrive-client-id',
      baseUrl: 'https://oauth.pipedrive.com'
    });
  }

  static createOdooAuth(): AuthService {
    return new AuthService({
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      functionName: 'odoo',
      clientId: '', // Not used for API key auth
      baseUrl: '' // Not used for API key auth
    });
  }

  // Special method for Odoo API key authentication
  async authenticateWithApiKey(accessToken: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.config.supabaseUrl}/functions/v1/odoo-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          access_token: accessToken
        })
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Reload the page to trigger auth state update
        window.location.href = '/dashboard';
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Authentication failed' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      };
    }
  }
}