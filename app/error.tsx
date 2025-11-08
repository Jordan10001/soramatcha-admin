"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center ">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-orange">Something went wrong</h2>
        <p className="mt-2 text-gray-orange">{error.message}</p>
        <button
          onClick={reset}
          className="mt-4 rounded-lg bg-pastel-orange px-4 py-2 text-gray-orange"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
