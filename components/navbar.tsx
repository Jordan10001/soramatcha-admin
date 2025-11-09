"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "@/lib/actions"
import { LogOut } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()

  const isMenuActive = pathname.startsWith("/menu")
  const isEventActive = pathname.startsWith("/event")

  return (
    <nav className="bg-light-orange border-b px-6 py-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between lg:justify-center gap-4 lg:gap-12 relative">
        {/* Center: Menu and Event */}
        <div className="flex items-center gap-4 lg:gap-12">
          <Link
            href="/menu"
            className={`text-xs lg:text-base text-gray-orange transition-colors uppercase ${
              isMenuActive ? "font-semibold" : "font-medium"
            }`}
          >
            Menu
          </Link>
          <Link
            href="/event"
            className={`text-xs lg:text-base text-gray-orange transition-colors uppercase ${
              isEventActive ? "font-semibold" : "font-medium"
            }`}
          >
            Event
          </Link>
        </div>

        {/* Right: Logout Icon - Always visible */}
        <div className="absolute right-6 flex items-center gap-4">
          <form action={signOut}>
            <button
              type="submit"
              className="text-gray-orange hover:text-gray-800 transition-colors p-2 rounded-lg hover:bg-pastel-orange"
              title="Logout"
            >
              <LogOut size={24} />
            </button>
          </form>
        </div>
      </div>
    </nav>
  )
}
