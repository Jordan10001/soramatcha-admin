import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import LoginForm from "@/components/login-form"

export default async function LoginPage() {
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[--background-1]">
        <div className="text-center px-4">
          <h1 className="text-3xl font-bold">404</h1>
          <p className="mt-2 ">Configuration Error</p>
        </div>
      </div>
    )
  }

  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/menu")
  }

  return <LoginForm />
}
