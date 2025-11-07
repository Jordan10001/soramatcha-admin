import { createClient } from "@/lib/supabase/server"
import { signOut } from "@/lib/actions"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-[--background-1]">
      <nav className="border-b border-gray-200 bg-[--background-1] px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-color">Soramatcha Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-color">{user?.email}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-color">Dashboard</h2>
          <p className="mt-2 text-color/70">Welcome to the Soramatcha admin panel</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Placeholder cards */}
          <div className="rounded-lg border border-gray-200 bg-background p-6">
            <h3 className="font-semibold text-color">Analytics</h3>
            <p className="mt-2 text-sm text-color/70">View your analytics data</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-background p-6">
            <h3 className="font-semibold text-color">Users</h3>
            <p className="mt-2 text-sm text-color/70">Manage user accounts</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-background p-6">
            <h3 className="font-semibold text-color">Settings</h3>
            <p className="mt-2 text-sm text-color/70">Configure your settings</p>
          </div>
        </div>
      </main>
    </div>
  )
}
