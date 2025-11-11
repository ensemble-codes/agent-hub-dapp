/**
 * @deprecated This file is deprecated. Use the following instead:
 * - For client components: import { createClient } from '@/lib/supabase/client'
 * - For server components: import { createClient } from '@/lib/supabase/server'
 * - For middleware: import { updateSession } from '@/lib/supabase/middleware'
 *
 * This file is kept for backward compatibility only.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey
  })
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)
