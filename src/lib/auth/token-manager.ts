/**
 * Token Manager
 * Handles secure storage of authentication tokens
 */

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'ensemble_access_token',
  REFRESH_TOKEN: 'ensemble_refresh_token',
  EXPIRES_AT: 'ensemble_expires_at',
  USER: 'ensemble_user',
} as const;

export interface StoredUser {
  id: string;
  email: string;
  user_metadata?: Record<string, any>;
}

export class TokenManager {
  /**
   * Store authentication tokens
   */
  storeTokens(tokens: {
    access_token: string;
    refresh_token: string;
    expires_in: number; // seconds
  }): void {
    const expiresAt = Date.now() + tokens.expires_in * 1000;

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);
    localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, expiresAt.toString());

    console.log('[TokenManager] Tokens stored, expires at:', new Date(expiresAt).toISOString());
  }

  /**
   * Update access token after refresh
   */
  updateAccessToken(accessToken: string, expiresIn: number): void {
    const expiresAt = Date.now() + expiresIn * 1000;

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, expiresAt.toString());

    console.log('[TokenManager] Access token updated, expires at:', new Date(expiresAt).toISOString());
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Check if token is expired or will expire soon
   * @param thresholdMs Time in milliseconds before expiry to consider token as expired (default: 5 minutes)
   */
  isTokenExpired(thresholdMs: number = 5 * 60 * 1000): boolean {
    const expiresAt = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);

    if (!expiresAt) {
      return true;
    }

    const expiryTime = parseInt(expiresAt, 10);
    const now = Date.now();

    // Token is expired or will expire within threshold
    return now >= expiryTime - thresholdMs;
  }

  /**
   * Decode and validate JWT token (without verification)
   * Used to check expiry from token payload
   */
  private decodeToken(token: string): { exp?: number; sub?: string; email?: string } | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      console.error('[TokenManager] Failed to decode token:', error);
      return null;
    }
  }

  /**
   * Check if token is valid based on JWT expiry
   */
  isJWTExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) {
      return true;
    }

    const expiryTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expiryTime;
  }

  /**
   * Store user data
   */
  storeUser(user: StoredUser): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  /**
   * Get stored user data
   */
  getUser(): StoredUser | null {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    if (!user) return null;

    try {
      return JSON.parse(user);
    } catch (error) {
      console.error('[TokenManager] Failed to parse user data:', error);
      return null;
    }
  }

  /**
   * Check if user has valid authentication
   */
  hasValidAuth(): boolean {
    const accessToken = this.getAccessToken();
    return accessToken !== null && !this.isTokenExpired(0);
  }

  /**
   * Clear all stored data
   */
  clear(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.EXPIRES_AT);
    localStorage.removeItem(STORAGE_KEYS.USER);

    console.log('[TokenManager] All tokens cleared');
  }
}

// Singleton
let instance: TokenManager | null = null;

export function getTokenManager(): TokenManager {
  if (!instance) {
    instance = new TokenManager();
  }
  return instance;
}
