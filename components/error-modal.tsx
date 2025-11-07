"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"

interface ErrorModalProps {
  message: string
  onClose: () => void
  duration?: number
}

export function ErrorModal({ message, onClose, duration = 5000 }: ErrorModalProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="rounded-lg bg-light-orange border border-pastel-orange shadow-lg overflow-hidden max-w-md">
        <div className="flex items-start gap-3 p-4">
          <div className="mt-0.5">
            <svg className="w-5 h-5 text-gray-orange" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-orange">Error</h3>
            <p className="text-sm text-gray-orange mt-1">{message}</p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false)
              onClose()
            }}
            className="text-gray-orange hover:text-pastel-orange transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
