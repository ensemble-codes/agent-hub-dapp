/**
 * Ensemble Authentication Service
 * Calls backend endpoints that wrap Supabase
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is not set');
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  session_id?: string;
  token_type: 'bearer';
}

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: Record<string, any>;
}

export interface AuthResult {
  success: boolean;
  message: string;
  user: AuthUser;
  session: AuthSession;
}

export class EnsembleAuthService {
  /**
   * Request access code via backend
   */
  async requestAccessCode(email: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/request-access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || data.message || 'Failed to request access code');
    }

    return data;
  }

  /**
   * Verify access code via backend
   */
  async verifyAccessCode(email: string, code: string): Promise<AuthResult> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/verify-access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || data.message || 'Failed to verify code');
    }

    return data;
  }

  /**
   * Refresh access token via backend
   */
  async refreshToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || data.message || 'Failed to refresh token');
    }

    return data;
  }

  /**
   * Logout via backend
   */
  async logout(refreshToken?: string): Promise<void> {
    if (refreshToken) {
      try {
        await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      } catch (error) {
        console.error('[EnsembleAuth] Logout error:', error);
      }
    }
  }
}

// Singleton
let instance: EnsembleAuthService | null = null;

export function getEnsembleAuthService(): EnsembleAuthService {
  if (!instance) {
    instance = new EnsembleAuthService();
  }
  return instance;
}
