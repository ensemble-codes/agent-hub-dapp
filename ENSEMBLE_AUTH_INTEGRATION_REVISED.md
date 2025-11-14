# Ensemble Authentication Integration - Revised Specification

## Critical Update: Backend Uses Supabase

**Key Insight:** The Ensemble backend uses Supabase for authentication behind the scenes. This means we don't need to replace Supabase - we need to integrate with the Ensemble backend's authentication layer that wraps Supabase.

---

## Table of Contents

1. [Revised Architecture Understanding](#revised-architecture-understanding)
2. [Integration Strategy](#integration-strategy)
3. [Implementation Plan](#implementation-plan)
4. [UI Integration](#ui-integration)
5. [Testing & Rollout](#testing--rollout)

---

## 1. Revised Architecture Understanding

### Current Flow (What We Have Now)

```
┌─────────────────────────────────────────────────────────────────┐
│                    CURRENT ARCHITECTURE                          │
└─────────────────────────────────────────────────────────────────┘

Frontend (Next.js)
   │
   ├─> Supabase Client (Direct)
   │   ├─> signInWithOtp() - Send OTP
   │   ├─> verifyOtp() - Verify OTP
   │   └─> getSession() - Get JWT token
   │
   ├─> Our API Routes (/api/auth/*)
   │   ├─> /api/auth/check-user
   │   ├─> /api/auth/register
   │   ├─> /api/auth/verify-user
   │   └─> Uses supabaseAdmin for database operations
   │
   └─> Backend API (localhost:8000)
       └─> Authenticated with Supabase JWT token
           └─> POST /api/v1/communication/conversations/
           └─> Authorization: Bearer <supabase_jwt>
```

### Target Flow (What We Need)

```
┌─────────────────────────────────────────────────────────────────┐
│                    TARGET ARCHITECTURE                           │
└─────────────────────────────────────────────────────────────────┘

Frontend (Next.js)
   │
   ├─> Backend API Auth Endpoints (localhost:8000)
   │   ├─> POST /api/v1/auth/request-access
   │   │   └─> Backend calls Supabase.auth.signInWithOtp()
   │   │
   │   ├─> POST /api/v1/auth/verify-access
   │   │   └─> Backend calls Supabase.auth.verifyOtp()
   │   │   └─> Returns wrapped JWT + custom session
   │   │
   │   └─> POST /api/v1/auth/refresh
   │       └─> Backend refreshes Supabase session
   │       └─> Returns new wrapped JWT
   │
   └─> Backend API (localhost:8000)
       └─> Authenticated with Backend-issued JWT
           └─> POST /api/v1/communication/conversations/
           └─> Authorization: Bearer <backend_jwt>
           └─> Backend validates JWT and checks Supabase session
```

### Key Differences

**Current (Direct Supabase):**
- Frontend → Supabase directly
- Frontend stores Supabase JWT
- Backend validates Supabase JWT

**Target (Backend-Wrapped Supabase):**
- Frontend → Backend auth endpoints
- Backend → Supabase internally
- Frontend stores backend-issued JWT
- Backend validates its own JWT + Supabase session

---

## 2. Integration Strategy

### Why This Approach?

1. **Unified Authentication Layer**: Backend controls all auth logic
2. **Flexible User Management**: Backend can add custom user metadata
3. **Session Management**: Backend tracks sessions beyond Supabase
4. **Future-Proof**: Can switch auth providers without frontend changes
5. **Better Security**: Backend-to-backend communication only

### What Stays the Same?

✅ **UI/UX Flow**: Exactly the same user experience
✅ **Supabase Database**: Still stores users, access codes, etc.
✅ **Email System**: Supabase still sends OTP emails
✅ **Current API Routes**: Keep `/api/auth/*` for now (backward compatibility)

### What Changes?

🔄 **Authentication Method**: Call backend endpoints instead of Supabase directly
🔄 **Token Format**: Backend-issued JWT instead of Supabase JWT
🔄 **Token Storage**: Same localStorage pattern, different token
🔄 **API Authorization**: Use backend JWT for all API calls

---

## 3. Implementation Plan

### Phase 1: Backend Auth Endpoints (Backend Team)

**Backend must implement these endpoints:**

```typescript
// POST /api/v1/auth/request-access
// Body: { "email": "user@example.com" }
// Action: Call Supabase.auth.signInWithOtp({ email })
// Response: { "success": true, "message": "Access code sent to email" }

// POST /api/v1/auth/verify-access
// Body: { "email": "user@example.com", "code": "123456" }
// Action:
//   1. Call Supabase.auth.verifyOtp({ email, token: code })
//   2. Get Supabase session
//   3. Create/update user in database
//   4. Create custom session tracking
//   5. Issue backend JWT (includes Supabase session info)
// Response: {
//   "success": true,
//   "message": "Login successful",
//   "user": { "id": "...", "email": "...", ... },
//   "session": {
//     "access_token": "backend_jwt...",
//     "refresh_token": "backend_refresh...",
//     "expires_in": 3600,
//     "session_id": "...",
//     "token_type": "bearer"
//   }
// }

// POST /api/v1/auth/refresh
// Body: { "refresh_token": "..." }
// Action:
//   1. Validate refresh token
//   2. Get Supabase session
//   3. Refresh Supabase session if needed
//   4. Issue new backend JWT
// Response: {
//   "access_token": "new_backend_jwt...",
//   "expires_in": 3600,
//   "token_type": "bearer"
// }

// POST /api/v1/auth/logout
// Body: { "refresh_token": "..." }
// Action:
//   1. Revoke refresh token in database
//   2. Optionally call Supabase.auth.signOut()
// Response: { "success": true, "message": "Logged out successfully" }
```

**Backend JWT Payload:**
```typescript
{
  "sub": "supabase_user_id",
  "email": "user@example.com",
  "exp": 1234567890,
  "iat": 1234564290,
  "session_id": "backend_session_id",
  "supabase_session": {
    "access_token": "supabase_jwt...",
    "refresh_token": "supabase_refresh..."
  }
}
```

### Phase 2: Frontend Integration (Our Work)

#### Step 1: Create Auth Service

```typescript
// src/lib/auth/ensemble-auth.ts
/**
 * Ensemble Authentication Service
 * Wraps backend authentication endpoints
 */

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
}

export interface AuthResult {
  success: boolean;
  message: string;
  user: AuthUser;
  session: AuthSession;
}

export class EnsembleAuthService {
  private apiBaseUrl: string;

  constructor() {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBaseUrl) {
      throw new Error('NEXT_PUBLIC_API_BASE_URL is not set');
    }
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Request access code (OTP) via backend
   * Backend will call Supabase.auth.signInWithOtp internally
   */
  async requestAccessCode(email: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.apiBaseUrl}/api/v1/auth/request-access`, {
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
   * Verify access code (OTP) via backend
   * Backend will call Supabase.auth.verifyOtp internally
   */
  async verifyAccessCode(email: string, code: string): Promise<AuthResult> {
    const response = await fetch(`${this.apiBaseUrl}/api/v1/auth/verify-access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = this.mapErrorMessage(data.detail || data.message);
      throw new Error(errorMessage);
    }

    return data;
  }

  /**
   * Refresh access token via backend
   */
  async refreshToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
    const response = await fetch(`${this.apiBaseUrl}/api/v1/auth/refresh`, {
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
        await fetch(`${this.apiBaseUrl}/api/v1/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      } catch (error) {
        console.error('[EnsembleAuth] Logout error:', error);
      }
    }
  }

  /**
   * Map backend error codes to user-friendly messages
   */
  private mapErrorMessage(error: string): string {
    const errorMap: Record<string, string> = {
      'invalid_grant': 'Invalid or expired code. Please try again.',
      'invalid_otp': 'Invalid code. Please try again.',
      'otp_expired': 'Code has expired. Please request a new one.',
      'too_many_attempts': 'Too many failed attempts. Please request a new code.',
      'rate_limit_exceeded': 'Too many requests. Please wait a few minutes.',
      'user_not_found': 'User not found. Please contact support.',
    };

    return errorMap[error] || error || 'An error occurred. Please try again.';
  }
}

// Singleton instance
let instance: EnsembleAuthService | null = null;

export function getEnsembleAuthService(): EnsembleAuthService {
  if (!instance) {
    instance = new EnsembleAuthService();
  }
  return instance;
}
```

#### Step 2: Update Register Page

```typescript
// src/app/register-user/page.tsx
"use client";

import { useState, useEffect, useContext, useRef } from "react";
import { useRouter } from "next/navigation";
import { getEnsembleAuthService } from "@/lib/auth/ensemble-auth";
import { getTokenManager } from "@/lib/auth/token-manager";
import { AppContext } from "@/context/app";
import { SET_USER } from "@/context/app/actions";

const Register = () => {
  const [state, dispatch] = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const { push } = useRouter();

  const ensembleAuth = getEnsembleAuthService();
  const tokenManager = getTokenManager();

  /**
   * Request access code from backend
   * Backend will call Supabase internally
   */
  const handleRequestCode = async () => {
    if (!email) return;
    setIsLoading(true);
    setError(null);

    try {
      await ensembleAuth.requestAccessCode(email);

      setShowCodeInput(true);
      setResendDisabled(true);
      setResendCountdown(300); // 5 minutes

      console.log('[Register] Access code sent to:', email);
    } catch (error) {
      console.error('[Register] Error requesting code:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to send code";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Verify access code via backend
   * Backend will verify with Supabase and return its own JWT
   */
  const handleVerifyCode = async () => {
    if (!email || !code) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await ensembleAuth.verifyAccessCode(email, code);

      // Store backend-issued tokens
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
      console.error('[Register] Error verifying code:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to verify code";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle sign out
   */
  const handleSignOut = async () => {
    if (!state.user) return;

    try {
      const refreshToken = tokenManager.getRefreshToken();
      await ensembleAuth.logout(refreshToken || undefined);
      tokenManager.clear();

      dispatch({ type: SET_USER, payload: null });
    } catch (error) {
      console.error('[Register] Error signing out:', error);
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

  // ... rest of UI remains exactly the same
  // Just replace Supabase calls with backend calls
};

export default Register;
```

#### Step 3: Update App Context

```typescript
// src/context/app/index.tsx
"use client";
import { createContext, FC, useEffect, useReducer, useState } from "react";
import { getTokenManager } from "@/lib/auth/token-manager";
import { useRouter } from "next/navigation";
// ... other imports

export const AppContextProvider: FC<ContextProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [redirecting, setRedirecting] = useState(true);
  const tokenManager = getTokenManager();

  // Check authentication on mount
  useEffect(() => {
    async function initializeAuth() {
      try {
        const user = tokenManager.getUser();

        if (user && tokenManager.hasValidAuth()) {
          // User has valid tokens
          // Optionally refresh user data from backend
          dispatch({ type: SET_USER, payload: user });
        } else {
          dispatch({ type: SET_USER, payload: null });
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        dispatch({ type: SET_USER, payload: null });
      } finally {
        dispatch({ type: SET_AUTH_LOADING, payload: false });
      }
    }

    initializeAuth();
  }, []);

  // ... rest remains the same
};
```

#### Step 4: Update Conversations API

```typescript
// src/lib/api/conversations-api.ts
import { getTokenManager } from '@/lib/auth/token-manager';
import { getEnsembleAuthService } from '@/lib/auth/ensemble-auth';

export class ConversationsAPI {
  /**
   * Get authentication token from backend-issued JWT
   */
  private static async getAuthToken(): Promise<string | null> {
    const tokenManager = getTokenManager();

    // Check if token is expired or needs refresh
    if (tokenManager.isTokenExpired(5 * 60 * 1000)) {
      // Less than 5 minutes until expiry - refresh now
      try {
        const refreshToken = tokenManager.getRefreshToken();
        if (!refreshToken) {
          console.warn('[ConversationsAPI] No refresh token available');
          return null;
        }

        const authService = getEnsembleAuthService();
        const result = await authService.refreshToken(refreshToken);

        tokenManager.updateAccessToken(result.access_token, result.expires_in);

        return result.access_token;
      } catch (error) {
        console.error('[ConversationsAPI] Failed to refresh token:', error);
        // Clear tokens and force re-login
        tokenManager.clear();
        return null;
      }
    }

    const accessToken = tokenManager.getAccessToken();

    if (!accessToken) {
      console.warn('[ConversationsAPI] No access token - user may not be logged in');
      return null;
    }

    return accessToken;
  }

  private static async fetch<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    // Get backend JWT token
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
      console.error('[ConversationsAPI] Unauthorized - session expired');

      // Try to refresh token one more time
      const tokenManager = getTokenManager();
      const refreshToken = tokenManager.getRefreshToken();

      if (refreshToken) {
        try {
          const authService = getEnsembleAuthService();
          const result = await authService.refreshToken(refreshToken);
          tokenManager.updateAccessToken(result.access_token, result.expires_in);

          // Retry the original request with new token
          return this.fetch(endpoint, options);
        } catch (error) {
          console.error('[ConversationsAPI] Token refresh failed:', error);
          tokenManager.clear();
          throw new Error('Session expired - please log in again');
        }
      }

      throw new Error('Unauthorized - please log in again');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // ... rest of the methods remain unchanged
}
```

---

## 4. UI Integration

### No UI Changes Required!

The UI remains **exactly the same** because:

1. **Same Flow**: Email → Send Code → Enter Code → Authenticated
2. **Same Code Format**: 6 characters (Supabase OTP is 6 digits)
3. **Same Error Messages**: Backend can return same error codes
4. **Same Timing**: Backend calls Supabase, same email delivery time

### User Experience

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER EXPERIENCE (UNCHANGED)                   │
└─────────────────────────────────────────────────────────────────┘

[User visits app]
   │
   └─> No valid session → Redirect to /register-user

[Enter email: user@example.com]
   │
   └─> Click "Send Code"
       │
       Frontend → Backend → Supabase.auth.signInWithOtp()
       │
       └─> "Code sent to your email" (same message)

[Check email - receives 6-digit code: 123456]
   │
[Enter code: 1 2 3 4 5 6]
   │
   └─> Click "Verify"
       │
       Frontend → Backend → Supabase.auth.verifyOtp()
       │
       Backend → Issues own JWT (wraps Supabase session)
       │
       Frontend → Stores backend JWT
       │
       └─> Authenticated! → Redirect to home

[Make API calls]
   │
   └─> Send: Authorization: Bearer <backend_jwt>
       │
       Backend → Validates JWT → Checks Supabase session
       │
       └─> Returns response
```

---

## 5. Testing & Rollout

### Testing Checklist

**Backend Testing (Backend Team):**
- [ ] Auth endpoints implemented
- [ ] Supabase integration working
- [ ] JWT generation and validation
- [ ] Token refresh mechanism
- [ ] Error handling
- [ ] Rate limiting

**Frontend Testing (Our Team):**
- [ ] Request code flow
- [ ] Verify code flow
- [ ] Token storage
- [ ] Token refresh
- [ ] API calls with new tokens
- [ ] Logout flow
- [ ] Error handling

**Integration Testing:**
- [ ] End-to-end auth flow
- [ ] Token expiry and refresh
- [ ] Multiple concurrent sessions
- [ ] Error scenarios
- [ ] Rate limiting

### Rollout Strategy

**Phase 1: Development & Testing** (Week 1)
- Backend implements auth endpoints
- Frontend implements integration
- Local testing with both teams

**Phase 2: Staging Deployment** (Week 2)
- Deploy to staging environment
- Full integration testing
- Performance testing
- Security review

**Phase 3: Production Deployment** (Week 3)
- Deploy to production
- Monitor error rates
- Monitor performance
- Gather user feedback

**Phase 4: Deprecation** (Week 4+)
- Remove direct Supabase client calls
- Remove old `/api/auth/*` routes (optional)
- Update documentation

---

## 6. Key Differences from Original Spec

### What Changed?

1. **No Supabase Replacement**: We keep Supabase, just route through backend
2. **Simpler Migration**: No dual auth support needed
3. **Same OTP Format**: Backend uses Supabase OTP (6 digits, not 6 chars)
4. **Backend JWT**: Backend issues its own JWT that wraps Supabase session
5. **No Access Code Table**: Backend uses Supabase OTP directly

### What Stayed the Same?

1. **UI/UX**: Exactly the same user experience
2. **Token Management**: Still need token storage and refresh
3. **API Integration**: Still need to update conversations-api.ts
4. **Security**: Same security considerations

---

## 7. Environment Variables

```bash
# .env.local (Development)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# .env.production (Production)
NEXT_PUBLIC_API_BASE_URL=https://api.ensemble.codes

# Keep Supabase vars for now (backward compatibility during migration)
NEXT_PUBLIC_SUPABASE_URL=https://pgwulhyapaeyxymkdabn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## 8. Migration Checklist

### Backend Requirements (Backend Team)
- [ ] Implement `/api/v1/auth/request-access` endpoint
- [ ] Implement `/api/v1/auth/verify-access` endpoint
- [ ] Implement `/api/v1/auth/refresh` endpoint
- [ ] Implement `/api/v1/auth/logout` endpoint
- [ ] JWT generation with Supabase session info
- [ ] JWT validation middleware
- [ ] Token refresh logic
- [ ] Error handling and user-friendly messages
- [ ] Rate limiting
- [ ] Documentation

### Frontend Requirements (Our Team)
- [ ] Create `src/lib/auth/ensemble-auth.ts`
- [ ] Create `src/lib/auth/token-manager.ts`
- [ ] Update `src/app/register-user/page.tsx`
- [ ] Update `src/context/app/index.tsx`
- [ ] Update `src/lib/api/conversations-api.ts`
- [ ] Remove direct Supabase client calls (auth only)
- [ ] Testing
- [ ] Documentation

### Testing Requirements
- [ ] Unit tests for auth service
- [ ] Unit tests for token manager
- [ ] Integration tests for auth flow
- [ ] E2E tests for login/logout
- [ ] Token refresh testing
- [ ] Error scenario testing
- [ ] Performance testing

---

## 9. Timeline

**Week 1: Backend Implementation**
- Backend team implements auth endpoints
- Frontend team prepares integration code
- Daily sync meetings

**Week 2: Frontend Integration**
- Frontend integrates with backend endpoints
- Local testing with backend
- Bug fixes

**Week 3: Testing & Staging**
- Integration testing
- Staging deployment
- Security review
- Performance testing

**Week 4: Production Deployment**
- Production deployment
- Monitoring
- User feedback
- Bug fixes

---

## 10. Success Criteria

### Functional
✅ Users can login with email + OTP (unchanged UX)
✅ Backend JWT tokens stored and used correctly
✅ Token refresh works automatically
✅ API calls authenticated with backend JWT
✅ Logout clears tokens and revokes session

### Performance
✅ Auth request: < 2 seconds
✅ Auth verify: < 1 second
✅ Token refresh: < 500ms
✅ No performance degradation

### Reliability
✅ Auth success rate: > 99%
✅ Token refresh success rate: > 99.5%
✅ Error rate: < 0.5%

---

## Summary

**What We're Actually Doing:**

1. Backend wraps Supabase authentication with its own API layer
2. Backend issues its own JWTs that contain Supabase session info
3. Frontend calls backend auth endpoints instead of Supabase directly
4. Frontend stores backend JWTs instead of Supabase JWTs
5. UI/UX remains **exactly the same** for users

**Why This is Better:**

- ✅ Centralized auth logic in backend
- ✅ Backend controls session management
- ✅ Easier to add custom user data
- ✅ Future-proof for auth provider changes
- ✅ Better security (backend-to-backend only)
- ✅ No UI changes needed

**Key Takeaway:** We're not replacing Supabase - we're putting a backend layer on top of it.

---

**Document Version**: 2.0 (Revised)
**Last Updated**: 2025-01-13
**Status**: Ready for Implementation
