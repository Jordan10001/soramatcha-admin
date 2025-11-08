"use client"

import { useState } from "react"
import { ErrorModal } from "./error-modal"

interface NewCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string) => void
  isLoading?: boolean
  categories?: Array<{ id: string; name: string }>
}

export function NewCategoryModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  categories = [],
}: NewCategoryModalProps) {
  const [categoryName, setCategoryName] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const name = categoryName.trim()
    if (!name) return

    // check duplicate (case-insensitive)
    const exists = categories.some((c) => c.name.trim().toLowerCase() === name.toLowerCase())
    if (exists) {
      setErrorMessage("Category name already exists")
      return
    }

    onSubmit(name)
    setCategoryName("")
    setErrorMessage(null)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-light-orange rounded-2xl shadow-lg p-6 w-full max-w-sm relative">
        {errorMessage && (
          <ErrorModal message={errorMessage} onClose={() => setErrorMessage(null)} />
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="CATEGORY NAME"
            className="w-full bg-pastel-orange border-0 px-0 py-4 text-center rounded-xl text-base text-gray-orange placeholder:text-gray-orange focus:outline-none focus:ring-0 uppercase font-medium"
            disabled={isLoading}
            autoFocus
          />

          <button
            type="submit"
            className="w-full bg-pastel-orange text-gray-orange px-4 py-4 text-base rounded-xl transition-colors uppercase"
            disabled={isLoading || !categoryName.trim()}
          >
            {isLoading ? "Creating..." : "Confirm"}
          </button>
        </form>
      </div>
    </div>
  )
}
