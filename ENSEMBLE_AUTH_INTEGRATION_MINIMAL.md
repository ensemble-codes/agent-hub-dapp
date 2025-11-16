# Ensemble Authentication Integration - Minimal Spec

**Goal:** Integrate backend authentication endpoints (that wrap Supabase) into the existing register-user flow with minimal changes.

---

## What We're Doing

**Current:** Frontend → Supabase (direct) → JWT → Backend API
**Target:** Frontend → Backend Auth Endpoints → Backend JWT → Backend API

Backend uses Supabase internally - we just route through the backend layer.

---

## Backend Requirements

Backend team must implement these 4 endpoints:

### 1. Request Access Code
```http
POST /api/v1/auth/request-access
Content-Type: application/json

{
  "email": "user@example.com"
}

Response:
{
  "success": true,
  "message": "Access code sent to email"
}
```

**Backend Action:** Call `Supabase.auth.signInWithOtp({ email })`

### 2. Verify Access Code
```http
POST /api/v1/auth/verify-access
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "user_metadata": {}
  },
  "session": {
    "access_token": "backend_jwt_token",
    "refresh_token": "backend_refresh_token",
    "expires_in": 3600,
    "token_type": "bearer"
  }
}
```

**Backend Action:**
1. Call `Supabase.auth.verifyOtp({ email, token: code })`
2. Get Supabase session
3. Create/update user in database
4. Issue backend JWT (include Supabase session)
5. Return response

### 3. Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "backend_refresh_token"
}

Response:
{
  "access_token": "new_backend_jwt_token",
  "expires_in": 3600,
  "token_type": "bearer"
}
```

**Backend Action:**
1. Validate refresh token
2. Refresh Supabase session if needed
3. Issue new backend JWT

### 4. Logout
```http
POST /api/v1/auth/logout
Content-Type: application/json

{
  "refresh_token": "backend_refresh_token"
}

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Backend Action:**
1. Revoke refresh token
2. Optionally call `Supabase.auth.signOut()`

---

## Frontend Implementation

### File 1: `src/lib/auth/ensemble-auth.ts`

```typescript
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
```

### File 2: `src/lib/auth/token-manager.ts`

```typescript
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
  }

  /**
   * Update access token after refresh
   */
  updateAccessToken(accessToken: string, expiresIn: number): void {
    const expiresAt = Date.now() + expiresIn * 1000;

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, expiresAt.toString());
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
   */
  isTokenExpired(thresholdMs: number = 5 * 60 * 1000): boolean {
    const expiresAt = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);

    if (!expiresAt) {
      return true;
    }

    const expiryTime = parseInt(expiresAt, 10);
    const now = Date.now();

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
    if (!user) return null;

    try {
      return JSON.parse(user);
    } catch {
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
```

### File 3: Update `src/app/register-user/page.tsx`

**Changes needed:**

1. **Import new services:**
```typescript
import { getEnsembleAuthService } from "@/lib/auth/ensemble-auth";
import { getTokenManager } from "@/lib/auth/token-manager";
```

2. **Replace Supabase OTP calls:**

**Before:**
```typescript
// Current code
const result = await supabase.auth.signInWithOtp({ email });
```

**After:**
```typescript
// New code
const ensembleAuth = getEnsembleAuthService();
await ensembleAuth.requestAccessCode(email);
```

**Before:**
```typescript
// Current code
const result = await supabase.auth.verifyOtp({
  email,
  token: otp,
  type: "email"
});
```

**After:**
```typescript
// New code
const ensembleAuth = getEnsembleAuthService();
const tokenManager = getTokenManager();

const result = await ensembleAuth.verifyAccessCode(email, code);

// Store tokens
tokenManager.storeTokens({
  access_token: result.session.access_token,
  refresh_token: result.session.refresh_token,
  expires_in: result.session.expires_in,
});

// Store user
tokenManager.storeUser({
  id: result.user.id,
  email: result.user.email,
  user_metadata: result.user.user_metadata,
});

// Update app state
dispatch({ type: SET_USER, payload: result.user });
```

3. **Update logout:**

**Before:**
```typescript
await supabase.auth.signOut();
```

**After:**
```typescript
const ensembleAuth = getEnsembleAuthService();
const tokenManager = getTokenManager();

const refreshToken = tokenManager.getRefreshToken();
await ensembleAuth.logout(refreshToken || undefined);
tokenManager.clear();
```

**Note:** Keep all existing UI code - only change the authentication method calls.

### File 4: Update `src/context/app/index.tsx`

**Changes needed:**

1. **Replace session check:**

**Before:**
```typescript
const { data: { session } } = await supabase.auth.getSession();
```

**After:**
```typescript
const tokenManager = getTokenManager();
const user = tokenManager.getUser();

if (user && tokenManager.hasValidAuth()) {
  // User has valid tokens
  dispatch({ type: SET_USER, payload: user });
}
```

2. **Remove Supabase auth listener:**

Delete this entire block:
```typescript
const {
  data: { subscription },
} = supabase.auth.onAuthStateChange(async (event, session) => {
  // ...
});

return () => subscription.unsubscribe();
```

### File 5: Update `src/lib/api/conversations-api.ts`

**Replace `getAuthToken()` method:**

**Before:**
```typescript
private static async getAuthToken(): Promise<string | null> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return null;
  }

  return session.access_token;
}
```

**After:**
```typescript
import { getTokenManager } from '@/lib/auth/token-manager';
import { getEnsembleAuthService } from '@/lib/auth/ensemble-auth';

private static async getAuthToken(): Promise<string | null> {
  const tokenManager = getTokenManager();

  // Check if token needs refresh
  if (tokenManager.isTokenExpired(5 * 60 * 1000)) {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) {
        console.warn('[ConversationsAPI] No refresh token');
        return null;
      }

      const authService = getEnsembleAuthService();
      const result = await authService.refreshToken(refreshToken);
      tokenManager.updateAccessToken(result.access_token, result.expires_in);

      return result.access_token;
    } catch (error) {
      console.error('[ConversationsAPI] Failed to refresh token:', error);
      tokenManager.clear();
      return null;
    }
  }

  return tokenManager.getAccessToken();
}
```

---

## Testing Checklist

### Backend Testing (Backend Team)
- [ ] `/api/v1/auth/request-access` sends email with code
- [ ] `/api/v1/auth/verify-access` validates code and returns JWT
- [ ] `/api/v1/auth/refresh` returns new access token
- [ ] `/api/v1/auth/logout` revokes session
- [ ] JWT includes user ID and email
- [ ] Error messages are user-friendly

### Frontend Testing (Our Team)
- [ ] User can request code
- [ ] User receives email
- [ ] User can verify code
- [ ] Tokens stored in localStorage
- [ ] User redirected after login
- [ ] API calls use new tokens
- [ ] Token refresh works automatically
- [ ] Logout clears tokens
- [ ] User can login again after logout

### Integration Testing
- [ ] Complete login flow works
- [ ] API calls authenticated correctly
- [ ] Token refresh on expiry
- [ ] Logout and re-login
- [ ] Error handling (invalid code, expired code, etc.)

---

## Deployment

### Step 1: Backend Deployment
Backend team deploys auth endpoints to staging/production.

### Step 2: Frontend Deployment
1. Create new auth service files
2. Update register-user page
3. Update app context
4. Update conversations API
5. Test thoroughly
6. Deploy to production

### Step 3: Verify
- [ ] Monitor error rates
- [ ] Monitor login success rate
- [ ] Check user feedback
- [ ] Performance metrics

---

## Rollback Plan

If issues occur:

1. **Quick rollback:** Revert frontend deployment (auth code)
2. **Users can still login:** Direct Supabase calls still work
3. **No data loss:** Supabase database unchanged

---

## Environment Variables

```bash
# Required
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000  # or production URL

# Keep for backward compatibility (optional)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

---

## Summary

**What Changes:**
- Frontend calls backend auth endpoints instead of Supabase directly
- Store backend JWT instead of Supabase JWT
- Use backend JWT for API calls

**What Stays Same:**
- UI/UX (exact same user experience)
- Supabase sends the email (backend calls it)
- 6-digit OTP code format
- Email delivery time
- Error messages

**Files to Create:**
1. `src/lib/auth/ensemble-auth.ts` (new)
2. `src/lib/auth/token-manager.ts` (new)

**Files to Update:**
1. `src/app/register-user/page.tsx` (replace auth calls)
2. `src/context/app/index.tsx` (replace session check)
3. `src/lib/api/conversations-api.ts` (replace token getter)

**Total Changes:** ~200 lines of code, no UI changes

---

**Status:** Ready for Implementation
**Estimated Time:** 1-2 days development + 1 day testing
