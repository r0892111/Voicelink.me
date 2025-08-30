export interface AuthProvider {
  name: string;
  displayName: string;
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

export interface OdooUser {
  id: string;
  name: string;
  email: string;
}

export interface CrmUserInfo {
  id: string;
  name: string;
  email: string;
}