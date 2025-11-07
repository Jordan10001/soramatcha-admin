"use client"

import { useEffect } from "react"

interface InfoModalProps {
  isOpen: boolean
  title?: string
  message?: string
  onClose: () => void
  // auto close in ms, default 2000
  autoClose?: number
}

export function InfoModal({ isOpen, title = "Info", message = "", onClose, autoClose = 2000 }: InfoModalProps) {
  useEffect(() => {
    if (!isOpen) return
    if (autoClose && autoClose > 0) {
      const t = setTimeout(() => onClose(), autoClose)
      return () => clearTimeout(t)
    }
  }, [isOpen, autoClose, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-light-orange rounded-2xl shadow-lg p-6 w-full max-w-sm">
        <h3 className="text-lg font-bold text-gray-orange mb-2 text-center uppercase">{title}</h3>
        <p className="text-sm text-gray-orange mb-4 text-center">{message}</p>
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-pastel-orange text-gray-orange rounded-md font-medium uppercase"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}
