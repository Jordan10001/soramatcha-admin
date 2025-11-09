// d:/Coding/soramatcha/soramatcha-admin/lib/supabase/auth-client.tsx
"use client"

import { useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase/client"

export function SupabaseAuthWatcher({ children }: { children: React.ReactNode }) {
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    let cleanup = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }

    const setExpiryTimer = async (session?: any) => {
      cleanup()
      const s = session ?? (await supabase.auth.getSession()).data.session
      if (!s) return
      // session.expires_at is in seconds (UNIX time)
      const expiresAtSec = (s as any).expires_at
      if (!expiresAtSec) return
      const msLeft = expiresAtSec * 1000 - Date.now()
      if (msLeft <= 0) {
        // already expired
        await supabase.auth.signOut()
        return
      }
      timerRef.current = window.setTimeout(async () => {
        // when expired, sign out (clears sessionStorage)
        await supabase.auth.signOut()
      }, msLeft)
    }

    // initial setup
    setExpiryTimer().catch(console.error)

    // subscribe to auth changes to reset timer when session changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setExpiryTimer(session).catch(console.error)
    })

    return () => {
      cleanup()
      sub?.subscription.unsubscribe()
    }
  }, [])

  return <>{children}</>
}