"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Validate environment variables
const validateEnv = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error("Missing Supabase configuration")
  }

  return { url, key }
}

export async function signInWithEmail(email: string, password: string) {
  // Server-side validation: return structured results for predictable validation
  // errors instead of throwing. This prevents Next.js from rendering the
  // opaque server-components error page in production.
  if (!email || !password) {
    return { success: false, message: "Email and password are required" }
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, message: "Invalid email format" }
  }
  
  if (password.length < 6) {
    return { success: false, message: "Password must be at least 6 characters" }
  }

  try {
    let url: string, key: string
    try {
      const env = validateEnv()
      url = env.url
      key = env.key
    } catch (envErr) {
      // Missing env should return structured error, not throw
      // Log so hosting logs contain the reason
      // eslint-disable-next-line no-console
      console.error("Missing Supabase configuration in signInWithEmail", envErr)
      return { success: false, message: "Missing Supabase configuration" }
    }
    const cookieStore = await cookies()

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (e) {
            // Cookie error - continue anyway
          }
        },
      },
    })

    const { error, data } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    })

    if (error) {
      // Log Supabase auth error for server logs
      // eslint-disable-next-line no-console
      console.error("Supabase signInWithPassword error:", error)
      return { success: false, message: error.message }
    }
  
    if (!data?.session) {
      // eslint-disable-next-line no-console
      console.error("No session created after sign in for user:", email)
      return { success: false, message: "No session created after sign in" }
    }
  
    revalidatePath("/", "layout")
    // On success we still redirect server-side. This will trigger a
    // NEXT_REDIRECT which the client already ignores in its catch block.
    redirect("/menu")
  } catch (error) {
    // Let server-side redirect bubble up so the client can ignore it. For
    // other unexpected errors, return a structured failure result.
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error
    }
    // eslint-disable-next-line no-console
    console.error("Unexpected signInWithEmail error:", error)
    return { success: false, message: "Server error — please try again later" }
  }
}
