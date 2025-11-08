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
  // if (!email || !password) {
  //   throw new Error("Email and password are required")
  // }

  // if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  //   throw new Error("Invalid email format")
  // }

  // if (password.length < 6) {
  //   throw new Error("Password must be at least 6 characters")
  // }

  try {
    const { url, key } = validateEnv()
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
      throw new Error(error.message)
    }

    if (!data?.session) {
      throw new Error("No session created after sign in")
    }

    revalidatePath("/", "layout")
    // Use redirect here - it's a special Next.js function that will handle redirect
    redirect("/menu")
  } catch (error) {
    // Re-throw validation and auth errors, but let redirect() pass through
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error
    }
    throw error
  }
}
