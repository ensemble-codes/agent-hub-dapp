# Current Authentication Model Analysis

## Overview

The application uses a **dual authentication system** combining **Privy** for Web3 wallet authentication and **Supabase** for traditional user management and database operations.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
└──────────────┬──────────────────────┬─────────────────────┘
               │                      │
               ↓                      ↓
    ┌──────────────────┐   ┌──────────────────┐
    │  Privy Provider  │   │ Supabase Client  │
    │  (Web3 Auth)     │   │  (User DB)       │
    └──────────────────┘   └──────────────────┘
               │                      │
               ↓                      ↓
    ┌──────────────────┐   ┌──────────────────┐
    │ - Wallet login   │   │ - User profiles  │
    │ - Email login    │   │ - Auth state     │
    │ - Google login   │   │ - Session mgmt   │
    │ - Embedded wallet│   │ - Database       │
    └──────────────────┘   └──────────────────┘
```

## Components

### 1. Privy Authentication (`@privy-io/react-auth`)

**Location**: `src/components/onchainconfig/provider.tsx`

**Configuration**:
```typescript
<PrivyProvider
  appId={process.env.NEXT_PUBLIC_PRIVY_ID}
  clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID}
  config={{
    appearance: {
      accentColor: "#F94D27",
      showWalletLoginFirst: true,
      walletChainType: "ethereum-only"
    },
    defaultChain: baseSepolia,
    supportedChains: [baseSepolia],
    loginMethods: ["google", "email", "wallet"],
    embeddedWallets: {
      createOnLogin: "users-without-wallets",
      requireUserPasswordOnCreate: false
    }
  }}
>
```

**Features**:
- Multiple login methods: Google OAuth, Email, Wallet connection
- Embedded wallet creation for users without existing wallets
- Base Sepolia chain support
- No password required for embedded wallets
- MFA support available

**Key Hooks Used**:
- `usePrivy()` - Access authentication state and methods
  - `authenticated` - Boolean indicating if user is logged in
  - `ready` - Boolean indicating if Privy has initialized
  - `login()` - Trigger login flow
  - `logout()` - Log out user
  - `user` - Current Privy user object

- `useWallets()` - Access connected wallets
  - `wallets` - Array of connected wallet objects
  - Each wallet has: `address`, `chainId`, `walletClientType`

### 2. Supabase Authentication

**Location**: `src/context/app/index.tsx`

**Flow**:
```typescript
supabase.auth.onAuthStateChange(async (event, session) => {
  const email = session?.user?.email;
  if (event === "SIGNED_OUT") {
    dispatch({ type: SET_USER, payload: null });
  }
  if (session?.user && typeof email === "string") {
    await refreshUser(email); // Fetch user profile from database
  } else {
    dispatch({ type: SET_USER, payload: null });
  }
});
```

**User Data Management**:
- Listens to Supabase auth state changes
- Fetches user profile from custom database via API route `/api/auth/check-user`
- Stores user data in React Context
- Redirects unauthenticated users to `/register-user`

### 3. Application Context (`AppContextProvider`)

**Location**: `src/context/app/index.tsx`

**State Management**:
```typescript
interface AppState {
  user: User | null;           // User profile from database
  embeddedWallet: Wallet | undefined; // Connected wallet from Privy
  authLoading: boolean;        // Authentication loading state
}
```

**Key Functions**:
- `refreshUser(email)` - Fetches user profile from API
- `trackWalletConnection(walletAddress)` - Links wallet to user profile
- Auto-redirect logic for unauthenticated users

### 4. API Routes

**Auth-related routes**:
- `/api/auth/check-user` - Verify user exists and fetch profile
- `/api/auth/register` - Register new user
- `/api/auth/verify-user` - Verify user credentials
- `/api/auth/update-wallet` - Link wallet address to user
- `/api/auth/check-wallet` - Check if wallet is registered

## Authentication Flow

### Initial Load
```
1. App loads → PrivyProvider initializes
2. Supabase auth state listener activates
3. If user session exists → fetch user profile
4. If no session → redirect to /register-user
5. Show loading screen for 2 seconds during initialization
```

### Login Flow
```
1. User clicks login (in websocket-chat: authenticated ? handleSend() : login())
2. Privy modal opens with login options
3. User selects method:
   - Google → OAuth flow
   - Email → Email verification
   - Wallet → Connect wallet (MetaMask, WalletConnect, etc.)
4. Privy authenticates user
5. If no embedded wallet → create one automatically
6. Wallet connection triggers state update in AppContext
7. trackWalletConnection() links wallet to user profile
8. User can now interact with chat and send messages
```

### Wallet Management
```
1. Privy manages wallet connection state
2. useWallets() hook provides access to connected wallets
3. First wallet is automatically selected
4. Wallet address is tracked in user profile
5. Auto-switch to Base Sepolia chain on connection
```

## Current Implementation in WebsocketChat

**Location**: `src/components/chat/websocket-chat.tsx`

```typescript
const { authenticated, login } = usePrivy();

// Message sending is gated by authentication
return (
  <ChatLayout
    handleSend={authenticated ? () => handleSend() : () => login()}
    handleTaskSend={authenticated ? (msg) => handleTaskSend(msg) : () => login()}
    // ...
  />
);
```

**Behavior**:
- If user is not authenticated → clicking send triggers Privy login modal
- After login completes → user can send messages
- No explicit token management in frontend code

## Token Management

### Current State: **NO TOKEN-BASED API AUTHENTICATION**

**Observations**:
- No `getAccessToken()` calls found in codebase
- No Bearer tokens in API requests
- Conversations API (`src/lib/api/conversations-api.ts`) makes requests **without authentication headers**
- Backend API likely relies on other auth mechanisms (session cookies, API keys, or is open)

**Implications**:
```typescript
// Current implementation (no auth headers)
const response = await fetch(`${API_BASE_URL}${endpoint}`, {
  headers: {
    'Content-Type': 'application/json',
    // ❌ No Authorization header
  },
});
```

## Security Considerations

### Current Setup
- ✅ Privy handles wallet signatures and Web3 authentication
- ✅ Supabase manages session state and user data
- ✅ Frontend authentication gating prevents unauthorized UI actions
- ⚠️ **No API-level authentication for conversation endpoints**
- ⚠️ **Backend must validate requests independently**

### Potential Issues
1. **Open API**: If backend doesn't validate requests, anyone can:
   - Create conversations
   - Read message history
   - Access other users' data

2. **No Token Expiration**: If using session-based auth:
   - Sessions might not expire properly
   - No refresh token mechanism visible

3. **Frontend-only Gates**: Authentication checks only in UI:
   - Malicious users can bypass by calling APIs directly
   - Need backend validation

## Recommendations for Conversation API Integration

Based on the spec's security section (Section 7.1), you should implement:

### Option 1: Use Privy Access Tokens

```typescript
import { usePrivy } from '@privy-io/react-auth';

const { getAccessToken } = usePrivy();

// In ConversationsAPI
private static async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = await getAccessToken(); // Get Privy JWT

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options?.headers,
    },
  });
  // ...
}
```

### Option 2: Use Supabase Session Tokens

```typescript
import { supabase } from '@/lib/supabase';

// In ConversationsAPI
private static async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options?.headers,
    },
  });
  // ...
}
```

### Option 3: Backend API Keys (Current Setup?)

```typescript
// If backend uses API keys from environment
const response = await fetch(`${API_BASE_URL}${endpoint}`, {
  headers: {
    'X-API-Key': process.env.NEXT_PUBLIC_API_KEY,
    // or backend validates by origin/session cookies
  },
});
```

## Integration with Conversation API

### What You Need to Do

1. **Determine Backend Auth Mechanism**:
   - Check backend API documentation at `http://localhost:8000/docs`
   - Look for authentication requirements (Bearer token, API key, session)
   - Test if current requests work without auth headers

2. **Add Token to Requests** (if needed):
   ```typescript
   // Update src/lib/api/conversations-api.ts
   import { usePrivy } from '@privy-io/react-auth';

   export class ConversationsAPI {
     private static async getAuthToken(): Promise<string | null> {
       // Implement based on your auth choice
       // Option 1: Privy
       // const { getAccessToken } = usePrivy(); // Can't use hooks in static class
       // Need to pass token as parameter or restructure

       // Option 2: Supabase
       const { data: { session } } = await supabase.auth.getSession();
       return session?.access_token || null;
     }
   }
   ```

3. **Handle 401 Unauthorized**:
   ```typescript
   if (response.status === 401) {
     // Token expired or invalid
     // Trigger re-authentication or token refresh
     throw new Error('Unauthorized - please log in again');
   }
   ```

4. **Test Authentication Flow**:
   - Create conversation while logged in
   - Verify request includes auth header
   - Test with invalid/expired token
   - Confirm 401 handling works

## Environment Variables

```bash
# Privy (Web3 Auth)
NEXT_PUBLIC_PRIVY_ID=cmd48qa7k018yjv0ntzk2ybn6
NEXT_PUBLIC_PRIVY_CLIENT_ID=client-WY6NkcqAj8Kz18AQ1u4QW12sQATzmHa27gdvCztGpjSWy

# Supabase (User DB & Auth)
NEXT_PUBLIC_SUPABASE_URL=https://pgwulhyapaeyxymkdabn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend API
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Summary

**Current State**:
- ✅ Dual auth system: Privy (Web3) + Supabase (traditional)
- ✅ Multiple login methods: Google, Email, Wallet
- ✅ Embedded wallet creation for seamless UX
- ✅ Frontend authentication gating works
- ⚠️ **No token-based API authentication for conversation endpoints**
- ⚠️ **Backend validation mechanism unclear**

**Next Steps for Conversation API**:
1. Check backend API authentication requirements
2. Add Bearer token to ConversationsAPI requests if needed
3. Implement token refresh logic
4. Add 401 error handling and re-authentication flow
5. Test full authentication flow end-to-end

**Recommendation**: Before proceeding with conversation API testing, verify:
- Does backend require authentication?
- Which token should be used (Privy JWT or Supabase session)?
- Is there an API key or other auth mechanism?
