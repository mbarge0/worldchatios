import { env } from '@/config/env'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Create a single supabase client for interacting with your database
// This client is safe to use in browser environments
export const supabase = createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
        },
    }
)

