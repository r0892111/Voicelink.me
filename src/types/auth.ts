export interface AuthProvider {
  name: string;
  displayName: string;
  /** Platform key used by the `${platform}_users` tables, the auth
   *  callback route and the test slots — differs from `name` for
   *  Catermonkey ('catermonkey' → 'catermonkey_mcp'). */
  platform: 'teamleader' | 'pipedrive' | 'odoo' | 'catermonkey_mcp';
  icon: React.ComponentType<any>;
  color: string;
  hoverColor: string;
}

export interface AuthResponse {
  success: boolean;
  redirectUrl?: string;
  error?: string;
}

export interface AuthConfig {
  supabaseUrl: string;
  functionName: string;
  clientId: string;
  baseUrl: string;
}