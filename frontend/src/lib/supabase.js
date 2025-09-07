import { createClient } from '@supabase/supabase-js'
import { Capacitor } from '@capacitor/core'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const isNative = Capacitor.isNativePlatform()

// Configure retry options for native platforms
const retryOptions = isNative ? {
  retries: 3,
  retryDelay: (attempt) => Math.min(1000 * Math.pow(2, attempt), 10000),
  retryCondition: (error) => {
    // Retry on network errors or 5xx server errors
    return error.message?.includes('network') || 
           (error.status >= 500 && error.status < 600) ||
           error.message?.includes('NSURLErrorDomain')
  }
} : undefined

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: !isNative
  },
  global: {
    headers: {
      'X-Client-Info': 'sanusspace-app'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  ...(isNative && { retryOptions })
}) 