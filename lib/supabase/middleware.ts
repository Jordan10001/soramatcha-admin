import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/auth/login", "/auth/sign-up", "/auth/callback"]

export async function updateSession(request: NextRequest) {
  // If Supabase is not configured, allow all routes
  if (!isSupabaseConfigured) {
    return NextResponse.next({ request })
  }

  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Handle auth callback code exchange
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        return NextResponse.redirect(new URL("/menu", request.url))
      }
    } catch (e) {
      // Continue with existing flow
    }
  }

  // Refresh session
  try {
    await supabase.auth.getSession()
  } catch (e) {
    // Continue even if session refresh fails
  }

  // Check protected routes
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (!isPublicRoute && !request.nextUrl.pathname.startsWith("/_next")) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        return NextResponse.redirect(new URL("/auth/login", request.url))
      }
    } catch (e) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
  }

  return res
}
