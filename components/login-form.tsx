"use client"

import React, { useState } from "react"
import { signInWithEmail } from "@/app/actions/auth"
import { ErrorModal } from "./error-modal"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!email || !password) {
      setError("Email and password are required")
      setLoading(false)
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email format")
      setLoading(false)
      return
    }
    // Client-side validation: prevent calling server when password is obviously invalid.
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    try {
      await signInWithEmail(email.trim(), password)
      // If signInWithEmail succeeds, it will redirect automatically
      // This catch block will only be reached if there's an actual error
    } catch (err: any) {
      // Ignore redirect errors (they're expected on success)
      if (err?.message?.includes("NEXT_REDIRECT")) {
        return
      }
      const errorMsg = err?.message || "An error occurred during sign in"
      setError(errorMsg)
      setLoading(false)
    }
  }

  return (
    <>
      <div className="min-h-screen w-full flex items-center justify-center ">
        <div className="w-full max-w-md space-y-8 px-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <input
                id="email"
                name="email"
                type="email"
                placeholder="EMAIL :"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg bg-light-orange border-0 px-6 py-4 placeholder:text-gray-orange text-gray-orange focus:outline-none focus:ring-2 focus:ring-pastel-orange focus:border-transparent"
              />

              <input
                id="password"
                name="password"
                type="password"
                placeholder="PASSWORD :"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg bg-light-orange border-0 px-6 py-4 placeholder:text-gray-orange text-gray-orange focus:outline-none focus:ring-2 focus:ring-pastel-orange focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-light-orange py-4 text-lg font-semibold rounded-lg transition-colors"
            >
              {loading ? "LOGGING IN..." : "LOGIN"}
            </button>
          </form>
        </div>
      </div>

      {error && (
        <ErrorModal 
          message={error} 
          onClose={() => setError(null)}
          duration={5000}
        />
      )}
    </>
  )
}
