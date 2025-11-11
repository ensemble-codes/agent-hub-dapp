/**
 * Supabase SSR Client Utilities
 *
 * This module provides Supabase clients optimized for different Next.js contexts:
 *
 * - client.ts: Browser client for client components
 * - server.ts: Server client for server components and route handlers
 * - middleware.ts: Middleware client for Next.js middleware
 *
 * @see https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=nextjs
 */

export { createClient as createBrowserClient } from './client'
export { createClient as createServerClient } from './server'
export { updateSession } from './middleware'
