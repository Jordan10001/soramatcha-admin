"use client"

import { createBrowserClient } from "@supabase/ssr"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

// Create a singleton instance of the Supabase client for Client Components
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      // store session in sessionStorage so it is cleared when the tab/window is closed
      // guard access to `window.sessionStorage` so this module can be imported
      // (or server-side rendered) without throwing `ReferenceError: sessionStorage is not defined`.
      storage: typeof window !== "undefined" ? window.sessionStorage : undefined,
      // don't auto refresh tokens (we will sign out when expired)
      autoRefreshToken: false,
      // persist session using chosen storage
      persistSession: true,
    },
  }
)

