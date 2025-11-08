"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

const createClient = async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // Don't throw here to avoid crashing Server Actions / Server Components render.
    // Return a dummy client with the subset of API we use so pages can render a
    // helpful message instead of the generic Next.js server error.
    console.warn("Missing Supabase configuration in lib/actions.createClient")
    return {
      auth: {
        signOut: () => Promise.resolve({ data: null, error: null }),
      },
    }
  }

  const cookieStore = await cookies()
  return createServerClient(url, key, {
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
          // ignore cookie errors
        }
      },
    },
  })
}

export async function signOut() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath("/", "layout")
    redirect("/auth/login")
  } catch (error) {
    throw error
  }
}
