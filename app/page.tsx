import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { signOut } from "@/lib/actions"

export default async function Home() {
  // If Supabase is not configured, show setup message directly
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center ">
        <h1 className="text-2xl font-bold mb-4">Connect Supabase to get started</h1>
      </div>
    )
  }

  // Get the user from the server. Wrap in try/catch to avoid letting an
  // unexpected runtime error bubble out and cause the opaque Next.js server
  // components error page.
  let user: any = null
  try {
    const supabase = await createClient()
    const {
      data: { user: u },
    } = await supabase.auth.getUser()
    user = u
  } catch (err) {
    // Log the error server-side for debugging and render a helpful message
    // instead of the generic Next.js error. In dev you'll still get stack
    // traces in the terminal.
    // eslint-disable-next-line no-console
    console.error("Error fetching Supabase user in app/page:", err)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-lg p-6 rounded  border border-pastel-orange">
          <h2 className="text-xl font-semibold mb-2">Server error</h2>
          <p className="text-sm text-gray-orange">
            There was a problem initializing the server data source. Please check
            the server logs and your Supabase environment configuration.
          </p>
        </div>
      </div>
    )
  }

  // If no user, redirect to login
  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1>Hello {user.email}</h1>
        <form action={signOut}>
          <Button type="submit">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </form>
      </div>
    </div>
  )
}
