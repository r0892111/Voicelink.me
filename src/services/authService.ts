import { CrmUserInfo } from '../types/auth';

export class AuthService {
  private provider: string;
  private clientId: string;
  private redirectUri: string;

  constructor(provider: string, clientId: string, redirectUri: string) {
    this.provider = provider;
    this.clientId = clientId;
    this.redirectUri = redirectUri;
  }

  static createTeamleaderAuth(): AuthService {
    const clientId = import.meta.env.VITE_TEAMLEADER_CLIENT_ID || '';
    const redirectUri = `${window.location.protocol}//${window.location.host}/auth/teamleader/callback`;
    return new AuthService('teamleader', clientId, redirectUri);
  }

  static createPipedriveAuth(): AuthService {
    const clientId = import.meta.env.VITE_PIPEDRIVE_CLIENT_ID || '';
    const redirectUri = `${window.location.protocol}//${window.location.host}/auth/pipedrive/callback`;
    return new AuthService('pipedrive', clientId, redirectUri);
  }

  static createOdooAuth(): AuthService {
    const clientId = import.meta.env.VITE_ODOO_CLIENT_ID || '9849446b-87d1-4901-863b-a756148ee670';
    const redirectUri = `${window.location.protocol}//${window.location.host}/auth/odoo/callback`;
    return new AuthService('odoo', clientId, redirectUri);
  }

  async initiateAuth(): Promise<{ success: boolean; redirectUrl?: string; error?: string }> {
    try {
      if (this.provider === 'odoo') {
        // Clear any existing state to ensure fresh authentication
        localStorage.removeItem('odoo_oauth_state');

        // Generate a fresh state parameter
        const state = this.generateState();

        const params = new URLSearchParams({
          response_type: 'code',
          client_id: this.clientId,
          redirect_uri: this.redirectUri,
          scope: 'userinfo',
          state: state,
        });

        // Store the new state
        localStorage.setItem('odoo_oauth_state', state);
        const authUrl = `https://accounts.odoo.com/oauth2/auth?${params.toString()}`;

        // Redirect to Odoo OAuth
        window.location.href = authUrl;
        return { success: true };
      } else {
        // Handle other providers
        const state = this.generateState();
        localStorage.setItem(`${this.provider}_oauth_state`, state);

        let authUrl = '';
        if (this.provider === 'teamleader') {
          const params = new URLSearchParams({
            response_type: 'code',
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            state: state,
          });
          authUrl = `https://app.teamleader.eu/oauth2/authorize?${params.toString()}`;
        } else if (this.provider === 'pipedrive') {
          const params = new URLSearchParams({
            response_type: 'code',
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            state: state,
          });
          authUrl = `https://oauth.pipedrive.com/oauth/authorize?${params.toString()}`;
        }

        window.location.href = authUrl;
        return { success: true };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  async handleCallback(code?: string, state?: string, accessToken?: string): Promise<{
    success: boolean;
    user?: CrmUserInfo;
    session?: { access_token: string; refresh_token: string };
    error?: string;
  }> {
    try {
      if (this.provider === 'odoo') {
        // For Odoo, we expect accessToken and state from URL fragment
        if (!accessToken || !state) {
          return { success: false, error: 'Missing access token or state parameter' };
        }

        // Verify state parameter
        const storedState = localStorage.getItem('odoo_oauth_state');
        
        if (storedState && state !== storedState) {
          return { success: false, error: `Invalid state parameter. Expected: ${storedState}, Received: ${state}` };
        }

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/odoo-auth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            access_token: accessToken,
            state,
          }),
        });

        if (!response.ok) {
          const responseText = await response.text();

          let errorData;
          try {
            errorData = JSON.parse(responseText);
          } catch {
            errorData = { error: `Server returned HTML instead of JSON. Status: ${response.status}` };
          }

          return { success: false, error: errorData.error || 'Authentication failed' };
        }

        const result = await response.json();

        // Clean up state after successful authentication
        localStorage.removeItem('odoo_oauth_state');

        return result;
      } else {
        // Handle other providers with authorization code
        if (!code || !state) {
          return { success: false, error: 'Missing authorization code or state parameter' };
        }

        // Verify state parameter
        const storedState = localStorage.getItem(`${this.provider}_oauth_state`);
        if (!storedState || state !== storedState) {
          return { success: false, error: 'Invalid state parameter' };
        }

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${this.provider}-auth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            code,
            state,
            redirect_uri: this.redirectUri,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          return { success: false, error: errorData.error || 'Authentication failed' };
        }

        const result = await response.json();

        // Clean up state after successful authentication
        localStorage.removeItem(`${this.provider}_oauth_state`);

        return result;
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}