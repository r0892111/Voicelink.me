import { OdooUser, CrmUserInfo } from '../types/auth';

export class OdooAuth {
  private clientId = import.meta.env.VITE_ODOO_CLIENT_ID || '6c18f564-c3ca-470f-b218-831e1c64f0be';
  private redirectUri = `${window.location.protocol}//${window.location.host}/auth/odoo/callback`;

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Generate authorization URL
  getAuthUrl(): string {
    // Clear any existing state to ensure fresh authentication
    localStorage.removeItem('odoo_oauth_state');

    // Generate a fresh state parameter
    const state = this.generateState();

    // Ensure consistent redirect URI
    const redirectUri = `${window.location.protocol}//${window.location.host}/auth/odoo/callback`;

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: redirectUri,
      scope: 'userinfo',
      state: state,
    });

    // Store the new state
    localStorage.setItem('odoo_oauth_state', state);
    const authUrl = `https://accounts.odoo.com/oauth2/auth?${params.toString()}`;

    return authUrl;
  }

  async exchangeCodeForToken(
    accessToken: string,
    state: string
  ): Promise<{
    success: boolean;
    user?: CrmUserInfo;
    session?: { access_token: string; refresh_token: string };
    error?: string;
  }> {
    return this.handleCallback(accessToken, state);
  }

  // Handle callback with access token from URL fragment
  async handleCallback(accessToken: string, state: string): Promise<{ success: boolean; user?: OdooUser; error?: string }> {
    // Verify state parameter
    const storedState = localStorage.getItem('odoo_oauth_state');
    
    if (!storedState) {
      // Don't fail immediately, let the backend handle the validation
    } else if (state !== storedState) {
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
  }
}