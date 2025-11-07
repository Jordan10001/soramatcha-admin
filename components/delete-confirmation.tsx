"use client"

import { useState } from "react"

interface DeleteConfirmationProps {
  isOpen: boolean
  title?: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  onCancel: () => void
  onConfirm: () => Promise<void> | void
}

export function DeleteConfirmation({
  isOpen,
  title = "Delete Confirmation",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onCancel,
  onConfirm,
}: DeleteConfirmationProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    try {
      setIsProcessing(true)
      await onConfirm()
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
  <div className="bg-light-orange rounded-2xl shadow-lg p-6 w-full max-w-md mx-4 sm:mx-0">
        <h3 className="text-lg font-bold text-gray-orange mb-4 text-center uppercase">{title}</h3>
        <p className="text-sm text-gray-orange mb-6 text-center">{message}</p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-white rounded-md text-gray-orange border"
            disabled={isProcessing}
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 bg-pastel-orange text-gray-orange rounded-md font-medium uppercase"
            disabled={isProcessing}
          >
            {isProcessing ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
