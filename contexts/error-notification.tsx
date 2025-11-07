"use client"

import { createContext, useContext, useState, useCallback } from "react"
import { ErrorModal } from "@/components/error-modal"

interface ErrorNotificationContextType {
  showError: (message: string, duration?: number) => void
  hideError: () => void
}

const ErrorNotificationContext = createContext<ErrorNotificationContextType | undefined>(undefined)

export function ErrorNotificationProvider({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<string | null>(null)

  const showError = useCallback((message: string, duration: number = 5000) => {
    setError(message)
  }, [])

  const hideError = useCallback(() => {
    setError(null)
  }, [])

  return (
    <ErrorNotificationContext.Provider value={{ showError, hideError }}>
      {children}
      {error && <ErrorModal message={error} onClose={hideError} duration={5000} />}
    </ErrorNotificationContext.Provider>
  )
}

export function useErrorNotification() {
  const context = useContext(ErrorNotificationContext)
  if (!context) {
    throw new Error("useErrorNotification must be used within ErrorNotificationProvider")
  }
  return context
}
