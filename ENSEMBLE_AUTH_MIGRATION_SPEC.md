# Ensemble Authentication Migration Specification

## Executive Summary

This specification outlines the migration from the current Supabase OTP authentication system to the Ensemble backend authentication system, while preserving the existing UI/UX flow in the register-user page.

**Current State:** Supabase OTP-based passwordless authentication
**Target State:** Ensemble backend JWT authentication with access codes
**Timeline:** Phased migration with backward compatibility

---

## Table of Contents

1. [Current System Analysis](#current-system-analysis)
2. [Target Architecture](#target-architecture)
3. [Migration Strategy](#migration-strategy)
4. [Implementation Specification](#implementation-specification)
5. [UI/UX Integration](#uiux-integration)
6. [API Integration Layer](#api-integration-layer)
7. [Token Management](#token-management)
8. [Security Considerations](#security-considerations)
9. [Testing Strategy](#testing-strategy)
10. [Rollback Plan](#rollback-plan)

---

## 1. Current System Analysis

### Current Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  CURRENT: Supabase Auth Flow                     │
└─────────────────────────────────────────────────────────────────┘

1. User enters email
   └─> POST /api/auth/check-user (Check if exists in Supabase)
       ├─> User exists: Continue to OTP
       └─> User doesn't exist: Request access code

2. New users: Access Code Verification
   └─> POST /api/access-codes/redeem
       └─> Validates 6-char code from access_codes table
       └─> Redeems code (increments counter)

3. Send OTP via Supabase Auth
   └─> supabase.auth.signInWithOtp({ email })
       └─> Supabase sends 6-digit OTP to email
   └─> POST /api/auth/register (Create user record)

4. Verify OTP
   └─> supabase.auth.verifyOtp({ email, token, type: "email" })
       └─> Creates Supabase session (JWT in cookies)
   └─> POST /api/auth/verify-user (Mark is_verified = true)

5. Session Management
   └─> Supabase manages JWT tokens via cookies
   └─> Token used as Bearer token for backend API calls
```

### Current Data Storage

**Supabase Tables:**
- `users`: User profiles, verification status, wallet addresses
- `access_codes`: Beta access codes with redemption tracking

**Supabase Auth:**
- User credentials, sessions, JWT tokens

### Current Components

**Key Files:**
- `src/app/register-user/page.tsx` - Login/registration UI
- `src/context/app/index.tsx` - Auth state management
- `src/lib/supabase/client.ts` - Supabase browser client
- `src/lib/api/conversations-api.ts` - Uses Supabase JWT for API auth

---

## 2. Target Architecture

### Ensemble Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              TARGET: Ensemble Backend Auth Flow                  │
└─────────────────────────────────────────────────────────────────┘

1. User enters email
   └─> POST /api/v1/auth/request-access
       └─> Backend checks if user exists
       └─> Sends 6-character access code to email
       └─> Returns: { success: true, message: "Access code sent" }

2. User enters access code from email
   └─> POST /api/v1/auth/verify-access
       └─> Validates access code
       └─> Creates/updates user record
       └─> Returns:
           ├─> access_token (JWT, 1 hour expiry)
           ├─> refresh_token (7 days expiry)
           ├─> user data
           └─> session_id

3. Token Storage
   └─> Store access_token in localStorage/secure storage
   └─> Store refresh_token securely
   └─> Store user data in app state

4. Authenticated Requests
   └─> Add Authorization: Bearer <access_token> header
   └─> Backend validates JWT signature

5. Token Refresh (Automatic)
   └─> On 401 response: POST /api/v1/auth/refresh
       └─> Send refresh_token
       └─> Get new access_token
       └─> Retry original request

6. Logout
   └─> POST /api/v1/auth/logout (Optional: revoke session)
   └─> Clear all stored tokens
```

### Token Types

**Access Token (JWT):**
- Expiry: 1 hour
- Payload: `{ sub: user_id, email, exp, iat, session_id }`
- Storage: localStorage (web) / secure storage (mobile)
- Usage: All authenticated API requests

**Refresh Token (Opaque):**
- Expiry: 7 days
- Format: Random string (not JWT)
- Storage: localStorage (web) / secure storage (mobile)
- Usage: Get new access tokens

### Backend Endpoints

```
POST /api/v1/auth/request-access
  Body: { "email": "user@example.com" }
  Response: { "success": true, "message": "Access code sent to email" }

POST /api/v1/auth/verify-access
  Body: { "email": "user@example.com", "code": "ABC123" }
  Response: {
    "success": true,
    "message": "Login successful" | "Registration successful",
    "user": { "id": "...", "email": "...", "user_metadata": {} },
    "session": {
      "access_token": "eyJ...",
      "refresh_token": "abc123...",
      "expires_in": 3600,
      "session_id": "...",
      "token_type": "bearer"
    }
  }

POST /api/v1/auth/refresh
  Body: { "refresh_token": "..." }
  Response: {
    "access_token": "eyJ...",
    "expires_in": 3600,
    "token_type": "bearer"
  }

POST /api/v1/auth/logout
  Body: { "refresh_token": "..." }
  Response: { "success": true, "message": "Logged out successfully" }
```

---

## 3. Migration Strategy

### Phased Approach

**Phase 1: Dual Authentication Support** (Week 1-2)
- Implement Ensemble auth alongside Supabase
- Feature flag to switch between systems
- No UI changes, backend compatibility layer

**Phase 2: UI/UX Adaptation** (Week 3)
- Update register-user page to support both flows
- Merge access code and OTP steps
- Unified 6-character code input

**Phase 3: Token Management Migration** (Week 4)
- Implement token refresh mechanism
- Update conversations-api.ts to use Ensemble tokens
- Migrate existing sessions

**Phase 4: Complete Migration** (Week 5)
- Remove Supabase auth dependency
- Keep Supabase for user data storage (optional)
- Full cutover to Ensemble backend

**Phase 5: Cleanup** (Week 6)
- Remove deprecated code
- Update documentation
- Performance optimization

### Feature Flags

```typescript
// src/config/auth-config.ts
export const AUTH_CONFIG = {
  provider: process.env.NEXT_PUBLIC_AUTH_PROVIDER || 'supabase', // 'supabase' | 'ensemble'

  // Ensemble configuration
  ensemble: {
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    tokenRefreshThreshold: 5 * 60 * 1000, // 5 minutes before expiry
  },

  // Supabase configuration (for backward compatibility)
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};
```

---

## 4. Implementation Specification

### 4.1 New Directory Structure

```
src/
├── lib/
│   ├── auth/
│   │   ├── ensemble-auth.ts       # Ensemble authentication service
│   │   ├── token-manager.ts       # Token storage and refresh
│   │   ├── auth-provider.ts       # Unified auth interface
│   │   └── auth-interceptor.ts    # Axios/fetch interceptor
│   ├── supabase/                  # Existing Supabase (keep for data)
│   └── api/
│       ├── conversations-api.ts   # Update to use unified auth
│       └── ensemble-client.ts     # Axios instance with interceptors
├── context/
│   └── app/
│       └── index.tsx              # Update to support both auth systems
└── app/
    └── register-user/
        └── page.tsx               # Minimal UI changes
```

### 4.2 Core Implementation Files

#### File 1: `src/lib/auth/ensemble-auth.ts`

```typescript
/**
 * Ensemble Authentication Service
 *
 * Handles authentication with the Ensemble backend using access codes
 * and JWT token management.
 */

export interface EnsembleAuthConfig {
  apiBaseUrl: string;
  tokenRefreshThreshold?: number; // milliseconds before expiry to refresh
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  session_id: string;
  token_type: 'bearer';
}

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResult {
  success: boolean;
  message: string;
  user: AuthUser;
  session: AuthSession;
}

export class EnsembleAuthService {
  private config: EnsembleAuthConfig;

  constructor(config: EnsembleAuthConfig) {
    this.config = config;
  }

  /**
   * Request an access code to be sent to the user's email
   */
  async requestAccessCode(email: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.config.apiBaseUrl}/api/v1/auth/request-access`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || data.message || 'Failed to request access code');
    }

    return data;
  }

  /**
   * Verify the access code and complete login/registration
   */
  async verifyAccessCode(email: string, code: string): Promise<AuthResult> {
    const response = await fetch(`${this.config.apiBaseUrl}/api/v1/auth/verify-access`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code: code.toUpperCase() }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Map backend errors to user-friendly messages
      const errorMessage = this.mapErrorMessage(data.detail || data.message);
      throw new Error(errorMessage);
    }

    return data;
  }

  /**
   * Refresh the access token using the refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
    const response = await fetch(`${this.config.apiBaseUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || data.message || 'Failed to refresh token');
    }

    return data;
  }

  /**
   * Logout and optionally revoke the session on the server
   */
  async logout(refreshToken?: string): Promise<void> {
    if (refreshToken) {
      try {
        await fetch(`${this.config.apiBaseUrl}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      } catch (error) {
        console.error('[EnsembleAuth] Logout error:', error);
        // Continue with local cleanup even if server logout fails
      }
    }
  }

  /**
   * Map backend error codes to user-friendly messages
   */
  private mapErrorMessage(error: string): string {
    const errorMap: Record<string, string> = {
      'access_code_not_found': 'Invalid or expired access code',
      'access_code_expired': 'Access code has expired. Please request a new one.',
      'invalid_access_code': 'Invalid access code. Please try again.',
      'too_many_attempts': 'Too many failed attempts. Please request a new code.',
      'rate_limit_exceeded': 'Too many requests. Please try again later.',
      'invalid_refresh_token': 'Session expired. Please login again.',
      'refresh_token_expired': 'Session expired. Please login again.',
      'user_already_exists': 'User already exists. Please login.',
      'invalid_email': 'Invalid email address.',
    };

    return errorMap[error] || error || 'An error occurred. Please try again.';
  }
}

// Singleton instance
let ensembleAuthInstance: EnsembleAuthService | null = null;

export function getEnsembleAuthService(): EnsembleAuthService {
  if (!ensembleAuthInstance) {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBaseUrl) {
      throw new Error('NEXT_PUBLIC_API_BASE_URL environment variable is not set');
    }

    ensembleAuthInstance = new EnsembleAuthService({
      apiBaseUrl,
      tokenRefreshThreshold: 5 * 60 * 1000, // 5 minutes
    });
  }

  return ensembleAuthInstance;
}
```

#### File 2: `src/lib/auth/token-manager.ts`

```typescript
/**
 * Token Manager
 *
 * Handles secure storage and retrieval of authentication tokens.
 * Supports both browser (localStorage) and future mobile (secure storage).
 */

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp
  sessionId?: string;
}

export interface StoredUser {
  id: string;
  email: string;
  user_metadata?: Record<string, any>;
}

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'ensemble_access_token',
  REFRESH_TOKEN: 'ensemble_refresh_token',
  EXPIRES_AT: 'ensemble_expires_at',
  SESSION_ID: 'ensemble_session_id',
  USER: 'ensemble_user',
} as const;

export class TokenManager {
  /**
   * Store authentication tokens
   */
  storeTokens(tokens: {
    access_token: string;
    refresh_token: string;
    expires_in: number; // seconds
    session_id?: string;
  }): void {
    const expiresAt = Date.now() + tokens.expires_in * 1000;

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);
    localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, expiresAt.toString());

    if (tokens.session_id) {
      localStorage.setItem(STORAGE_KEYS.SESSION_ID, tokens.session_id);
    }

    console.log('[TokenManager] Tokens stored, expires at:', new Date(expiresAt).toISOString());
  }

  /**
   * Get stored tokens
   */
  getTokens(): StoredTokens | null {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const expiresAt = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);
    const sessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);

    if (!accessToken || !refreshToken || !expiresAt) {
      return null;
    }

    return {
      accessToken,
      refreshToken,
      expiresAt: parseInt(expiresAt, 10),
      sessionId: sessionId || undefined,
    };
  }

  /**
   * Update only the access token (after refresh)
   */
  updateAccessToken(accessToken: string, expiresIn: number): void {
    const expiresAt = Date.now() + expiresIn * 1000;

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, expiresAt.toString());

    console.log('[TokenManager] Access token updated, expires at:', new Date(expiresAt).toISOString());
  }

  /**
   * Get the current access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Get the refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Check if the access token is expired or will expire soon
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

    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user);
    } catch (error) {
      console.error('[TokenManager] Failed to parse user data:', error);
      return null;
    }
  }

  /**
   * Clear all stored authentication data
   */
  clear(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.EXPIRES_AT);
    localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
    localStorage.removeItem(STORAGE_KEYS.USER);

    console.log('[TokenManager] All tokens cleared');
  }

  /**
   * Check if user has valid authentication
   */
  hasValidAuth(): boolean {
    const tokens = this.getTokens();
    return tokens !== null && !this.isTokenExpired(0); // Check actual expiry, not threshold
  }
}

// Singleton instance
let tokenManagerInstance: TokenManager | null = null;

export function getTokenManager(): TokenManager {
  if (!tokenManagerInstance) {
    tokenManagerInstance = new TokenManager();
  }

  return tokenManagerInstance;
}
```

#### File 3: `src/lib/auth/auth-interceptor.ts`

```typescript
/**
 * Authentication Interceptor
 *
 * Automatically adds authentication headers to requests and handles token refresh.
 */

import { getEnsembleAuthService } from './ensemble-auth';
import { getTokenManager } from './token-manager';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

function processQueue(error: Error | null, token: string | null = null) {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });

  failedQueue = [];
}

/**
 * Fetch wrapper with automatic token refresh
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const tokenManager = getTokenManager();
  const authService = getEnsembleAuthService();

  // Get current access token
  let accessToken = tokenManager.getAccessToken();

  // Check if token needs refresh before making request
  if (tokenManager.isTokenExpired()) {
    if (isRefreshing) {
      // Wait for refresh to complete
      try {
        accessToken = await new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
      } catch (error) {
        throw error;
      }
    } else {
      // Start refresh
      isRefreshing = true;

      try {
        const refreshToken = tokenManager.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const result = await authService.refreshToken(refreshToken);
        tokenManager.updateAccessToken(result.access_token, result.expires_in);

        accessToken = result.access_token;
        processQueue(null, accessToken);
      } catch (error) {
        processQueue(error as Error, null);

        // Clear tokens and redirect to login
        tokenManager.clear();
        window.location.href = '/register-user';
        throw error;
      } finally {
        isRefreshing = false;
      }
    }
  }

  // Add authorization header
  const headers = new Headers(options.headers);
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  // Make request
  let response = await fetch(url, {
    ...options,
    headers,
  });

  // If 401, try to refresh token and retry
  if (response.status === 401 && !isRefreshing) {
    isRefreshing = true;

    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const result = await authService.refreshToken(refreshToken);
      tokenManager.updateAccessToken(result.access_token, result.expires_in);

      // Update authorization header
      headers.set('Authorization', `Bearer ${result.access_token}`);

      // Retry original request
      response = await fetch(url, {
        ...options,
        headers,
      });

      processQueue(null, result.access_token);
    } catch (error) {
      processQueue(error as Error, null);

      // Clear tokens and redirect to login
      tokenManager.clear();
      window.location.href = '/register-user';
      throw error;
    } finally {
      isRefreshing = false;
    }
  }

  return response;
}

/**
 * Create an axios-like API client with interceptors
 */
export function createAuthenticatedClient() {
  return {
    get: (url: string, config?: RequestInit) =>
      authenticatedFetch(url, { ...config, method: 'GET' }),

    post: (url: string, data?: any, config?: RequestInit) =>
      authenticatedFetch(url, {
        ...config,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...config?.headers,
        },
        body: JSON.stringify(data),
      }),

    put: (url: string, data?: any, config?: RequestInit) =>
      authenticatedFetch(url, {
        ...config,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...config?.headers,
        },
        body: JSON.stringify(data),
      }),

    delete: (url: string, config?: RequestInit) =>
      authenticatedFetch(url, { ...config, method: 'DELETE' }),
  };
}
```

#### File 4: Update `src/lib/api/conversations-api.ts`

```typescript
/**
 * Updated Conversations API to support both Supabase and Ensemble auth
 */

import {
  ConversationResponse,
  PaginatedMessagesResponse,
  ConversationOperationResponse,
} from '@/types/conversations';
import { createClient } from '@/lib/supabase/client';
import { getTokenManager } from '@/lib/auth/token-manager';
import { AUTH_CONFIG } from '@/config/auth-config';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL environment variable is not set');
}

export class ConversationsAPI {
  /**
   * Get authentication token based on configured provider
   */
  private static async getAuthToken(): Promise<string | null> {
    // Check which auth provider is configured
    if (AUTH_CONFIG.provider === 'ensemble') {
      // Use Ensemble tokens
      const tokenManager = getTokenManager();
      const accessToken = tokenManager.getAccessToken();

      if (!accessToken) {
        console.warn('[ConversationsAPI] No Ensemble access token - user may not be logged in');
        return null;
      }

      return accessToken;
    } else {
      // Use Supabase tokens (existing behavior)
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
          console.warn('[ConversationsAPI] No active Supabase session - user may not be logged in');
          return null;
        }

        return session.access_token;
      } catch (error) {
        console.error('[ConversationsAPI] Error getting Supabase auth token:', error);
        return null;
      }
    }
  }

  private static async fetch<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    // Get JWT token from configured auth provider
    const jwt = await this.getAuthToken();

    if (!jwt) {
      console.error('[ConversationsAPI] No JWT token available - user must be logged in');
      throw new Error('Authentication required - please log in to continue');
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`,
        ...options?.headers,
      },
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      console.error('[ConversationsAPI] Unauthorized - session may be expired');

      // If using Ensemble auth, the interceptor will handle refresh
      // For Supabase, we need to redirect to login
      if (AUTH_CONFIG.provider === 'supabase') {
        throw new Error('Unauthorized - please log in again');
      } else {
        // Let the auth interceptor handle it
        throw new Error('Unauthorized - token refresh failed');
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // ... rest of the existing methods remain unchanged
}
```

#### File 5: Update `src/app/register-user/page.tsx`

```typescript
/**
 * Updated Register User Page
 *
 * Supports both Supabase OTP and Ensemble access code authentication
 * with minimal UI changes.
 */

"use client";

import { useState, useEffect, useContext, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getEnsembleAuthService } from "@/lib/auth/ensemble-auth";
import { getTokenManager } from "@/lib/auth/token-manager";
import { AUTH_CONFIG } from "@/config/auth-config";
import { AppContext } from "@/context/app";
import { SET_USER } from "@/context/app/actions";
import Link from "next/link";

const Register = () => {
  const [state, dispatch] = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(""); // Renamed from 'otp' to support both systems
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { push } = useRouter();

  // Get auth services based on configuration
  const supabase = createClient();
  const ensembleAuth = getEnsembleAuthService();
  const tokenManager = getTokenManager();

  const useEnsembleAuth = AUTH_CONFIG.provider === 'ensemble';

  /**
   * ENSEMBLE AUTH: Request access code
   */
  const handleSendEnsembleCode = async () => {
    if (!email) return;
    setIsLoading(true);
    setError(null);

    try {
      await ensembleAuth.requestAccessCode(email);

      setShowCodeInput(true);
      setResendDisabled(true);
      setResendCountdown(300); // 5 minutes = 300 seconds
    } catch (error) {
      console.log(error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send access code";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * SUPABASE AUTH: Send OTP (existing behavior)
   */
  const handleSendSupabaseOTP = async (skipUserCheck = false) => {
    if (!email) return;
    setIsLoading(true);
    setError(null);

    try {
      if (!skipUserCheck) {
        // Check if user exists in our database
        const checkUserResponse = await fetch(`/api/auth/check-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (!checkUserResponse.ok) {
          throw new Error("Failed to check user status");
        }

        const checkUserData = await checkUserResponse.json();

        if (!checkUserData.user) {
          // User doesn't exist - in Ensemble mode, this shouldn't happen
          // In Supabase mode, show access code input
          setError("User not found. Please contact support.");
          return;
        }
      }

      // Send OTP via Supabase
      const result = await supabase.auth.signInWithOtp({ email });
      if (result.error) {
        throw result.error;
      }

      // Register user in database
      const response = await fetch(`/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to register user");
      }

      const data = await response.json();
      if (!data.success) throw new Error("Failed to register user");

      setShowCodeInput(true);
      setResendDisabled(true);
      setResendCountdown(300);
    } catch (error) {
      console.log(error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send code";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Unified: Request access code (routes to appropriate auth system)
   */
  const handleRequestCode = () => {
    if (useEnsembleAuth) {
      handleSendEnsembleCode();
    } else {
      handleSendSupabaseOTP(false);
    }
  };

  /**
   * Unified: Resend access code
   */
  const handleResendCode = () => {
    if (useEnsembleAuth) {
      handleSendEnsembleCode();
    } else {
      handleSendSupabaseOTP(true);
    }
  };

  /**
   * ENSEMBLE AUTH: Verify access code
   */
  const handleVerifyEnsembleCode = async () => {
    if (!email || !code) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await ensembleAuth.verifyAccessCode(email, code);

      // Store tokens
      tokenManager.storeTokens({
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token,
        expires_in: result.session.expires_in,
        session_id: result.session.session_id,
      });

      // Store user data
      tokenManager.storeUser({
        id: result.user.id,
        email: result.user.email,
        user_metadata: result.user.user_metadata,
      });

      // Update app state
      dispatch({
        type: SET_USER,
        payload: result.user,
      });

      console.log('[Register] Login successful:', result.message);
      push("/");
    } catch (error) {
      console.log(error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to verify code";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * SUPABASE AUTH: Verify OTP (existing behavior)
   */
  const handleVerifySupabaseOTP = async () => {
    if (!email || !code) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "email",
      });

      if (result.error) {
        throw result.error;
      }

      console.log("result", result);

      // Verify user in database
      const response = await fetch(`/api/auth/verify-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      console.log("response", response);

      if (!response.ok) {
        throw new Error("Failed to verify user");
      }

      const data = await response.json();
      console.log("data", data);

      if (!data.success) throw new Error("Failed to verify user");

      dispatch({
        type: SET_USER,
        payload: data.user,
      });

      push("/");
    } catch (error) {
      console.log(error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to verify code";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Unified: Verify access code (routes to appropriate auth system)
   */
  const handleVerifyCode = () => {
    if (useEnsembleAuth) {
      handleVerifyEnsembleCode();
    } else {
      handleVerifySupabaseOTP();
    }
  };

  /**
   * Handle sign out
   */
  const handleSignOut = async () => {
    if (!state.user) return;
    setSigningOut(true);

    try {
      if (useEnsembleAuth) {
        const refreshToken = tokenManager.getRefreshToken();
        await ensembleAuth.logout(refreshToken || undefined);
        tokenManager.clear();
      } else {
        const result = await supabase.auth.signOut();
        if (result.error) {
          throw result.error;
        }
      }
    } catch (error) {
      console.log(error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during sign out.";
      setError(errorMessage);
    } finally {
      setSigningOut(false);
    }
  };

  // Countdown effect for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [resendCountdown]);

  // ... rest of the UI remains the same with minor text changes
  // Change "Enter OTP" to "Enter Code"
  // Change "6-digit OTP" to "6-character code"

  return (
    <>
      {/* UI rendering - mostly unchanged, just text updates */}
      {/* ... existing JSX ... */}
    </>
  );
};

export default Register;
```

#### File 6: Create `src/config/auth-config.ts`

```typescript
/**
 * Authentication Configuration
 *
 * Central configuration for authentication system selection
 */

export type AuthProvider = 'supabase' | 'ensemble';

export interface AuthConfig {
  provider: AuthProvider;

  ensemble: {
    apiBaseUrl: string;
    tokenRefreshThreshold: number; // milliseconds before expiry to refresh
  };

  supabase: {
    url: string;
    anonKey: string;
  };
}

// Determine auth provider from environment
const AUTH_PROVIDER = (process.env.NEXT_PUBLIC_AUTH_PROVIDER || 'supabase') as AuthProvider;

if (!['supabase', 'ensemble'].includes(AUTH_PROVIDER)) {
  throw new Error(`Invalid AUTH_PROVIDER: ${AUTH_PROVIDER}. Must be 'supabase' or 'ensemble'`);
}

export const AUTH_CONFIG: AuthConfig = {
  provider: AUTH_PROVIDER,

  ensemble: {
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '',
    tokenRefreshThreshold: 5 * 60 * 1000, // 5 minutes before expiry
  },

  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
};

console.log(`[AuthConfig] Using auth provider: ${AUTH_CONFIG.provider}`);
```

#### File 7: Update `src/context/app/index.tsx`

```typescript
/**
 * Updated App Context
 *
 * Supports both Supabase and Ensemble authentication systems
 */

"use client";
import { createContext, FC, useEffect, useReducer, useState } from "react";
import { Action } from "./action";
import reducer from "./reducer";
import initialState, { AppState } from "./state";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { SET_AUTH_LOADING, SET_EMBEDDED_WALLET, SET_USER } from "./actions";
import { createClient } from "@/lib/supabase/client";
import { getTokenManager } from "@/lib/auth/token-manager";
import { AUTH_CONFIG } from "@/config/auth-config";
import { useRouter } from "next/navigation";

interface ContextProps {
  children: React.ReactNode;
}

export const AppContext = createContext<[AppState, React.Dispatch<Action>]>([
  initialState,
  () => {},
]);

export const AppContextProvider: FC<ContextProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { push } = useRouter();
  const [redirecting, setRedirecting] = useState(true);

  // Get auth services based on configuration
  const supabase = createClient();
  const tokenManager = getTokenManager();
  const useEnsembleAuth = AUTH_CONFIG.provider === 'ensemble';

  // Refresh user function (works with both auth systems)
  const refreshUser = async (email: string) => {
    if (email) {
      const response = await fetch("/api/auth/check-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load user data");
      }

      const data = await response.json();
      dispatch({ type: SET_USER, payload: data.user });
    } else {
      dispatch({ type: SET_USER, payload: null });
    }
  };

  // Initial session check based on auth provider
  useEffect(() => {
    async function initializeAuth() {
      try {
        if (useEnsembleAuth) {
          // Check Ensemble tokens
          const user = tokenManager.getUser();

          if (user && tokenManager.hasValidAuth()) {
            // Refresh user data from database
            await refreshUser(user.email);
          } else {
            dispatch({ type: SET_USER, payload: null });
          }
        } else {
          // Check Supabase session (existing behavior)
          const { data: { session } } = await supabase.auth.getSession();
          const email = session?.user?.email;

          if (session?.user && typeof email === "string") {
            await refreshUser(email);
          } else {
            dispatch({ type: SET_USER, payload: null });
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        dispatch({ type: SET_USER, payload: null });
      } finally {
        dispatch({
          type: SET_AUTH_LOADING,
          payload: false,
        });
      }
    }

    initializeAuth();

    // Only set up Supabase listener if using Supabase auth
    if (!useEnsembleAuth) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        const email = session?.user?.email;

        if (event === "SIGNED_OUT") {
          dispatch({ type: SET_USER, payload: null });
        } else if (session?.user && typeof email === "string") {
          await refreshUser(email);
        } else {
          dispatch({ type: SET_USER, payload: null });
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [useEnsembleAuth]);

  // ... rest of the existing code (wallet tracking, redirecting, etc.) remains unchanged

  return (
    <AppContext.Provider value={[state, dispatch]}>
      {children}
    </AppContext.Provider>
  );
};
```

---

## 5. UI/UX Integration

### 5.1 UI Changes Summary

**Minimal Changes to Existing Flow:**

1. **Text Changes:**
   - "Enter OTP" → "Enter Code"
   - "6-digit OTP" → "6-character code"
   - "OTP sent to email" → "Access code sent to email"

2. **Code Input:**
   - Both systems use 6-character codes
   - Existing 6-input UI component works for both
   - No visual changes needed

3. **Access Code Flow (Supabase):**
   - Remove Supabase access code table check
   - Ensemble backend handles access code validation
   - UI flow remains identical

### 5.2 User Experience Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Unified User Experience                       │
└─────────────────────────────────────────────────────────────────┘

[User visits app]
   │
   ├─> Authenticated? (Check tokens/session)
   │   ├─> Yes → Continue to app
   │   └─> No → Redirect to /register-user
   │
[User enters email]
   │
   └─> Click "Send Code"
       │
       ├─> Ensemble: POST /api/v1/auth/request-access
       │   └─> Email sent with 6-char code (e.g., "ABC123")
       │
       └─> Supabase: POST /api/auth/check-user + signInWithOtp
           └─> Email sent with 6-digit OTP (e.g., "123456")
       │
[User enters code from email]
   │
   └─> Click "Verify Code"
       │
       ├─> Ensemble: POST /api/v1/auth/verify-access
       │   └─> Returns JWT tokens
       │   └─> Store in localStorage
       │   └─> Update app state
       │
       └─> Supabase: verifyOtp + POST /api/auth/verify-user
           └─> Creates Supabase session
           └─> Update app state
       │
[Authenticated - Redirect to home]
```

---

## 6. API Integration Layer

### 6.1 Unified Authentication Interface

```typescript
/**
 * src/lib/auth/auth-provider.ts
 *
 * Unified authentication interface that works with both providers
 */

export interface AuthProvider {
  requestCode(email: string): Promise<{ success: boolean; message: string }>;
  verifyCode(email: string, code: string): Promise<AuthResult>;
  refreshToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }>;
  logout(refreshToken?: string): Promise<void>;
  getAccessToken(): Promise<string | null>;
  isAuthenticated(): Promise<boolean>;
}

export class UnifiedAuthProvider implements AuthProvider {
  private provider: AuthProvider;

  constructor() {
    // Select provider based on configuration
    if (AUTH_CONFIG.provider === 'ensemble') {
      this.provider = new EnsembleAuthProvider();
    } else {
      this.provider = new SupabaseAuthProvider();
    }
  }

  async requestCode(email: string) {
    return this.provider.requestCode(email);
  }

  async verifyCode(email: string, code: string) {
    return this.provider.verifyCode(email, code);
  }

  async refreshToken(refreshToken: string) {
    return this.provider.refreshToken(refreshToken);
  }

  async logout(refreshToken?: string) {
    return this.provider.logout(refreshToken);
  }

  async getAccessToken() {
    return this.provider.getAccessToken();
  }

  async isAuthenticated() {
    return this.provider.isAuthenticated();
  }
}
```

### 6.2 Backend API Compatibility

**Conversations API (already updated in Implementation section)**
- Uses unified `getAuthToken()` method
- Automatically selects token source based on `AUTH_CONFIG.provider`
- No changes needed to API endpoints

### 6.3 Error Handling Strategy

```typescript
/**
 * Unified error handling for both auth systems
 */

export enum AuthErrorCode {
  INVALID_CODE = 'invalid_code',
  CODE_EXPIRED = 'code_expired',
  TOO_MANY_ATTEMPTS = 'too_many_attempts',
  RATE_LIMIT = 'rate_limit',
  TOKEN_EXPIRED = 'token_expired',
  INVALID_TOKEN = 'invalid_token',
  NETWORK_ERROR = 'network_error',
  UNKNOWN_ERROR = 'unknown_error',
}

export class AuthError extends Error {
  code: AuthErrorCode;
  userMessage: string;

  constructor(code: AuthErrorCode, message: string, userMessage?: string) {
    super(message);
    this.code = code;
    this.userMessage = userMessage || message;
    this.name = 'AuthError';
  }
}

// Map errors from both systems to unified error codes
export function mapAuthError(error: any): AuthError {
  // Ensemble errors
  if (error.message?.includes('access_code_expired')) {
    return new AuthError(
      AuthErrorCode.CODE_EXPIRED,
      error.message,
      'Your code has expired. Please request a new one.'
    );
  }

  // Supabase errors
  if (error.message?.includes('otp_expired')) {
    return new AuthError(
      AuthErrorCode.CODE_EXPIRED,
      error.message,
      'Your code has expired. Please request a new one.'
    );
  }

  // Rate limiting
  if (error.status === 429 || error.message?.includes('rate_limit')) {
    return new AuthError(
      AuthErrorCode.RATE_LIMIT,
      error.message,
      'Too many requests. Please wait a few minutes.'
    );
  }

  // Default unknown error
  return new AuthError(
    AuthErrorCode.UNKNOWN_ERROR,
    error.message || 'An unexpected error occurred',
    'Something went wrong. Please try again.'
  );
}
```

---

## 7. Token Management

### 7.1 Token Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                      Token Lifecycle                             │
└─────────────────────────────────────────────────────────────────┘

[Login Success]
   │
   ├─> Store access_token (expires: 1 hour)
   ├─> Store refresh_token (expires: 7 days)
   ├─> Store expiry timestamp
   └─> Store user data
   │
[Make API Request]
   │
   ├─> Check token expiry
   │   ├─> Expired or near expiry (< 5 min) → Refresh
   │   └─> Valid → Use current token
   │
[Token Refresh]
   │
   ├─> POST /api/v1/auth/refresh
   │   └─> Send refresh_token
   │   └─> Get new access_token
   │   └─> Update stored token and expiry
   │
[Refresh Failed]
   │
   └─> Clear all tokens → Redirect to login
```

### 7.2 Automatic Token Refresh

**Proactive Refresh** (before expiry):
```typescript
// Check before each request
if (tokenManager.isTokenExpired(5 * 60 * 1000)) {
  // Less than 5 minutes until expiry - refresh now
  await refreshToken();
}
```

**Reactive Refresh** (on 401):
```typescript
// If request returns 401
if (response.status === 401) {
  // Try to refresh
  await refreshToken();
  // Retry original request
  return retryRequest();
}
```

### 7.3 Token Storage Security

**Web (Browser):**
- localStorage for access and refresh tokens
- HttpOnly cookies not used (need client-side access)
- XSS mitigation via CSP headers

**Mobile (Future):**
- iOS: Keychain Services
- Android: EncryptedSharedPreferences
- React Native: react-native-keychain

---

## 8. Security Considerations

### 8.1 Token Security

**Access Token:**
- Short-lived (1 hour) limits exposure window
- JWT format allows server-side validation without database lookup
- Includes user ID and email in payload for authorization

**Refresh Token:**
- Longer-lived (7 days) for better UX
- Opaque format (not JWT) - must be validated against database
- Single-use recommended (revoke old token when refreshing)

### 8.2 Network Security

**HTTPS Only:**
```typescript
// Enforce HTTPS in production
if (process.env.NODE_ENV === 'production' && !window.location.protocol.includes('https')) {
  window.location.href = window.location.href.replace('http://', 'https://');
}
```

**CORS Configuration:**
```typescript
// Backend CORS settings
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://agenthub.ensemble.codes'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
```

### 8.3 XSS Protection

**Content Security Policy:**
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' 'unsafe-inline' 'unsafe-eval';
               style-src 'self' 'unsafe-inline';
               connect-src 'self' https://api.ensemble.codes;">
```

### 8.4 Rate Limiting

**Client-Side:**
```typescript
// Limit code requests to prevent abuse
const CODE_REQUEST_COOLDOWN = 60 * 1000; // 1 minute
let lastRequestTime = 0;

function canRequestCode(): boolean {
  const now = Date.now();
  if (now - lastRequestTime < CODE_REQUEST_COOLDOWN) {
    return false;
  }
  lastRequestTime = now;
  return true;
}
```

**Server-Side:**
- Backend implements rate limiting per IP and per email
- Exponential backoff on failed attempts
- CAPTCHA after multiple failures (future enhancement)

---

## 9. Testing Strategy

### 9.1 Unit Tests

```typescript
// tests/auth/ensemble-auth.test.ts
describe('EnsembleAuthService', () => {
  test('should request access code', async () => {
    const auth = new EnsembleAuthService({ apiBaseUrl: 'http://test' });
    const result = await auth.requestAccessCode('test@example.com');
    expect(result.success).toBe(true);
  });

  test('should verify access code', async () => {
    const auth = new EnsembleAuthService({ apiBaseUrl: 'http://test' });
    const result = await auth.verifyAccessCode('test@example.com', 'ABC123');
    expect(result.session.access_token).toBeDefined();
  });

  test('should refresh token', async () => {
    const auth = new EnsembleAuthService({ apiBaseUrl: 'http://test' });
    const result = await auth.refreshToken('refresh_token_123');
    expect(result.access_token).toBeDefined();
  });
});

// tests/auth/token-manager.test.ts
describe('TokenManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('should store tokens', () => {
    const manager = new TokenManager();
    manager.storeTokens({
      access_token: 'token123',
      refresh_token: 'refresh123',
      expires_in: 3600,
    });

    const tokens = manager.getTokens();
    expect(tokens?.accessToken).toBe('token123');
  });

  test('should detect expired tokens', () => {
    const manager = new TokenManager();
    manager.storeTokens({
      access_token: 'token123',
      refresh_token: 'refresh123',
      expires_in: -1, // Already expired
    });

    expect(manager.isTokenExpired()).toBe(true);
  });
});
```

### 9.2 Integration Tests

```typescript
// tests/integration/auth-flow.test.ts
describe('Authentication Flow', () => {
  test('complete login flow with Ensemble', async () => {
    // 1. Request code
    const codeRequest = await requestAccessCode('test@example.com');
    expect(codeRequest.success).toBe(true);

    // 2. Verify code (use test code from backend)
    const loginResult = await verifyAccessCode('test@example.com', 'TEST123');
    expect(loginResult.session.access_token).toBeDefined();

    // 3. Make authenticated request
    const response = await authenticatedFetch('/api/v1/user/profile');
    expect(response.ok).toBe(true);
  });

  test('token refresh flow', async () => {
    // 1. Login
    const loginResult = await verifyAccessCode('test@example.com', 'TEST123');

    // 2. Manually expire token
    tokenManager.updateAccessToken('expired_token', -1);

    // 3. Make request (should auto-refresh)
    const response = await authenticatedFetch('/api/v1/user/profile');
    expect(response.ok).toBe(true);

    // 4. Verify new token was stored
    const newToken = tokenManager.getAccessToken();
    expect(newToken).not.toBe('expired_token');
  });
});
```

### 9.3 E2E Tests (Playwright)

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should complete login flow', async ({ page }) => {
    // 1. Navigate to login page
    await page.goto('/register-user');

    // 2. Enter email
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Send Code")');

    // 3. Wait for code input to appear
    await expect(page.locator('text=Enter Code')).toBeVisible();

    // 4. Enter code (use test code)
    const codeInputs = page.locator('input[maxlength="1"]');
    const testCode = 'TEST12';
    for (let i = 0; i < testCode.length; i++) {
      await codeInputs.nth(i).fill(testCode[i]);
    }

    // 5. Submit
    await page.click('button:has-text("Verify")');

    // 6. Should redirect to home
    await expect(page).toHaveURL('/');
  });

  test('should handle invalid code', async ({ page }) => {
    await page.goto('/register-user');

    // Enter email and request code
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Send Code")');

    // Enter invalid code
    const codeInputs = page.locator('input[maxlength="1"]');
    const invalidCode = 'INVALID';
    for (let i = 0; i < invalidCode.length; i++) {
      await codeInputs.nth(i).fill(invalidCode[i]);
    }

    await page.click('button:has-text("Verify")');

    // Should show error
    await expect(page.locator('text=Invalid code')).toBeVisible();
  });
});
```

### 9.4 Test Checklist

**Authentication Flow:**
- [ ] Request access code successfully
- [ ] Receive email with code
- [ ] Verify valid code
- [ ] Reject invalid code
- [ ] Reject expired code
- [ ] Handle rate limiting
- [ ] Store tokens correctly
- [ ] Clear tokens on logout

**Token Management:**
- [ ] Access token stored securely
- [ ] Refresh token stored securely
- [ ] Token expiry checked correctly
- [ ] Automatic refresh before expiry
- [ ] Refresh on 401 response
- [ ] Handle refresh failure
- [ ] Clear tokens on logout

**Error Handling:**
- [ ] Invalid email format
- [ ] Network errors
- [ ] Code expired
- [ ] Too many attempts
- [ ] Rate limiting
- [ ] Invalid token
- [ ] Refresh token expired

**UI/UX:**
- [ ] Email input validation
- [ ] Code input validation (6 characters)
- [ ] Loading states shown
- [ ] Error messages displayed
- [ ] Resend button with countdown
- [ ] Auto-focus next input
- [ ] Paste support for codes

---

## 10. Rollback Plan

### 10.1 Rollback Triggers

**Critical Issues:**
- Authentication success rate < 95%
- Token refresh failure rate > 5%
- User complaints > 10 in first hour
- Security vulnerability discovered

**Performance Issues:**
- API response time > 2 seconds
- Login completion time > 10 seconds
- Error rate > 1%

### 10.2 Rollback Procedure

**Phase 1: Immediate (< 5 minutes)**
```bash
# 1. Set feature flag to revert to Supabase
export NEXT_PUBLIC_AUTH_PROVIDER=supabase

# 2. Redeploy application
vercel --prod

# 3. Clear CDN cache
vercel caching clear
```

**Phase 2: Database (< 15 minutes)**
```sql
-- If Ensemble created new user records, map back to Supabase
UPDATE users
SET auth_provider = 'supabase'
WHERE auth_provider = 'ensemble';
```

**Phase 3: Monitoring (< 30 minutes)**
- Monitor error rates return to baseline
- Verify user login success rate
- Check user complaints
- Analyze logs for issues

### 10.3 Rollback Testing

**Pre-Deployment:**
```typescript
// Test rollback procedure in staging
describe('Rollback Tests', () => {
  test('should work with Supabase after rollback', async () => {
    // Set to Ensemble
    process.env.NEXT_PUBLIC_AUTH_PROVIDER = 'ensemble';

    // Simulate Ensemble auth failure
    // ...

    // Rollback to Supabase
    process.env.NEXT_PUBLIC_AUTH_PROVIDER = 'supabase';

    // Verify Supabase auth still works
    const result = await supabase.auth.signInWithOtp({ email: 'test@example.com' });
    expect(result.error).toBeNull();
  });
});
```

### 10.4 Data Migration Rollback

**User Data:**
- Supabase `users` table remains authoritative during transition
- Ensemble backend reads from same table
- No data migration needed for rollback

**Sessions:**
- Ensemble tokens stored separately from Supabase sessions
- Rollback clears Ensemble tokens, re-creates Supabase sessions
- Users may need to re-login (acceptable for rollback scenario)

---

## 11. Deployment Plan

### 11.1 Environment Setup

**Development:**
```bash
# .env.local
NEXT_PUBLIC_AUTH_PROVIDER=ensemble
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

**Staging:**
```bash
# Vercel Environment Variables
NEXT_PUBLIC_AUTH_PROVIDER=ensemble
NEXT_PUBLIC_API_BASE_URL=https://api-staging.ensemble.codes
```

**Production:**
```bash
# Vercel Environment Variables
NEXT_PUBLIC_AUTH_PROVIDER=supabase  # Start with Supabase
NEXT_PUBLIC_API_BASE_URL=https://api.ensemble.codes
```

### 11.2 Phased Rollout

**Week 1: Development & Testing**
- Complete implementation
- Unit tests passing
- Integration tests passing
- E2E tests passing

**Week 2: Staging Deployment**
- Deploy to staging
- Internal testing
- Fix bugs
- Performance testing

**Week 3: Production Beta (10% traffic)**
- Feature flag: 10% users use Ensemble
- 90% users still use Supabase
- Monitor metrics closely
- Gather user feedback

**Week 4: Production Ramp (50% traffic)**
- Increase to 50% Ensemble
- Monitor error rates
- Compare performance metrics
- Adjust based on feedback

**Week 5: Production Full (100% traffic)**
- All users on Ensemble auth
- Deprecate Supabase auth code
- Keep Supabase for data storage

**Week 6: Cleanup**
- Remove Supabase auth dependencies
- Update documentation
- Archive old code

### 11.3 Monitoring & Alerts

**Key Metrics:**
```typescript
// Track in analytics
export const AUTH_METRICS = {
  // Success rates
  CODE_REQUEST_SUCCESS_RATE: 'auth.code_request.success_rate',
  CODE_VERIFY_SUCCESS_RATE: 'auth.code_verify.success_rate',
  TOKEN_REFRESH_SUCCESS_RATE: 'auth.token_refresh.success_rate',

  // Timings
  CODE_REQUEST_DURATION: 'auth.code_request.duration',
  CODE_VERIFY_DURATION: 'auth.code_verify.duration',
  LOGIN_COMPLETION_TIME: 'auth.login.completion_time',

  // Errors
  CODE_REQUEST_ERRORS: 'auth.code_request.errors',
  CODE_VERIFY_ERRORS: 'auth.code_verify.errors',
  TOKEN_REFRESH_ERRORS: 'auth.token_refresh.errors',
};
```

**Alert Thresholds:**
- Success rate < 95% → Page on-call engineer
- Error rate > 5% → Send alert
- Response time > 2s → Send warning
- User complaints > 5/hour → Escalate

---

## 12. Migration Checklist

### Pre-Migration
- [ ] Backend auth endpoints implemented and tested
- [ ] Frontend auth service implemented
- [ ] Token manager implemented
- [ ] Auth interceptor implemented
- [ ] Unit tests passing (>90% coverage)
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Documentation completed
- [ ] Rollback plan documented
- [ ] Feature flags configured
- [ ] Monitoring dashboards created
- [ ] Alert rules configured

### Migration Phase 1 (Dual Support)
- [ ] Deploy backend auth endpoints to staging
- [ ] Deploy frontend changes to staging
- [ ] Test both auth flows in staging
- [ ] Verify token refresh works
- [ ] Test API calls with both auth systems
- [ ] Load test auth endpoints
- [ ] Security review completed
- [ ] Deploy to production with feature flag OFF

### Migration Phase 2 (Beta Testing)
- [ ] Enable feature flag for 10% of users
- [ ] Monitor error rates
- [ ] Monitor success rates
- [ ] Gather user feedback
- [ ] Fix critical bugs
- [ ] Increase to 50% of users
- [ ] Continue monitoring

### Migration Phase 3 (Full Rollout)
- [ ] Enable feature flag for 100% of users
- [ ] Monitor for 24 hours
- [ ] Verify all metrics within targets
- [ ] Document any issues
- [ ] Plan cleanup phase

### Migration Phase 4 (Cleanup)
- [ ] Remove Supabase auth code
- [ ] Update documentation
- [ ] Archive old API routes
- [ ] Remove feature flags
- [ ] Performance optimization
- [ ] Final security review

---

## 13. Success Criteria

### Functional Requirements
✅ Users can login with email + access code
✅ Tokens stored securely
✅ Automatic token refresh works
✅ API calls authenticated correctly
✅ Logout clears all tokens
✅ Error handling works correctly

### Performance Requirements
✅ Code request: < 2 seconds
✅ Code verify: < 1 second
✅ Token refresh: < 500ms
✅ Login completion: < 10 seconds

### Reliability Requirements
✅ Auth success rate: > 99%
✅ Token refresh success rate: > 99.5%
✅ Error rate: < 0.5%
✅ Uptime: > 99.9%

### User Experience Requirements
✅ No visual changes to UI
✅ Same number of steps
✅ Clear error messages
✅ Loading states shown
✅ Email delivery < 30 seconds

---

## 14. Appendix

### A. API Endpoints Reference

```
Authentication Endpoints:

POST /api/v1/auth/request-access
  Request access code for email
  Body: { email: string }
  Response: { success: boolean, message: string }

POST /api/v1/auth/verify-access
  Verify access code and login
  Body: { email: string, code: string }
  Response: { success: boolean, user: {}, session: {} }

POST /api/v1/auth/refresh
  Refresh access token
  Body: { refresh_token: string }
  Response: { access_token: string, expires_in: number }

POST /api/v1/auth/logout
  Revoke session (optional)
  Body: { refresh_token: string }
  Response: { success: boolean, message: string }
```

### B. Environment Variables

```bash
# Auth Provider Selection
NEXT_PUBLIC_AUTH_PROVIDER=ensemble  # 'supabase' | 'ensemble'

# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://api.ensemble.codes

# Supabase (for backward compatibility)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
```

### C. Token Format

**Access Token (JWT):**
```json
{
  "sub": "user_id_123",
  "email": "user@example.com",
  "exp": 1234567890,
  "iat": 1234564290,
  "session_id": "session_abc123"
}
```

**Refresh Token (Opaque):**
```
Format: Random 32-character string
Example: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
```

---

## 15. Glossary

**Access Code**: 6-character alphanumeric code sent via email for authentication
**Access Token**: Short-lived JWT token used to authenticate API requests
**Refresh Token**: Long-lived opaque token used to obtain new access tokens
**OTP**: One-Time Password (Supabase's 6-digit code)
**JWT**: JSON Web Token, a compact URL-safe token format
**Session**: Authentication state maintained by tokens
**RLS**: Row Level Security (Supabase database feature)

---

**Document Version**: 1.0
**Last Updated**: 2025-01-13
**Author**: Development Team
**Status**: Draft - Ready for Review
