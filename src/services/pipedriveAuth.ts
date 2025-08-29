export class PipedriveAuth {
  private clientId = import.meta.env.VITE_PIPEDRIVE_CLIENT_ID || 'your-pipedrive-client-id';
  private redirectUri = `${window.location.protocol}//${window.location.host}/auth/pipedrive/callback`;

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Generate authorization URL
  getAuthUrl(): string {
    // Clear any existing state to ensure fresh authentication
    localStorage.removeItem('pipedrive_oauth_state');

    // Generate a fresh state parameter
    const state = this.generateState();

    // Ensure consistent redirect URI
    const redirectUri = `${window.location.protocol}//${window.location.host}/auth/pipedrive/callback`;

    const params = new URLSearchParams({
      client_id: this.clientId,
      state: state,
      redirect_uri: redirectUri,
    });

    // Store the new state
    localStorage.setItem('pipedrive_oauth_state', state);
    
    const authUrl = `https://oauth.pipedrive.com/oauth/authorize?${params.toString()}`;

    return authUrl;
  }

  async initiateAuth(): Promise<{ success: boolean; redirectUrl?: string; error?: string }> {
    try {
      const authUrl = this.getAuthUrl();
      
      // Redirect to the OAuth URL
      window.location.href = authUrl;
      
      return { success: true, redirectUrl: authUrl };
    } catch (error) {
      console.error('Pipedrive authentication error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      };
    }
  }
}