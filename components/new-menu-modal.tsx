"use client"

import { useState, useRef } from "react"
import { FileUpload } from "./file-upload"
import { ErrorModal } from "./error-modal"
import { uploadMenuImage, deleteMenuImage } from "@/app/actions/menu"

interface NewMenuModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    name: string
    description: string
    price: string
    categoryId: string
    imageUrl: string
  }) => void
  categories: Array<{ id: string; name: string }>
  isLoading?: boolean
  menus?: Array<{ id: string; name: string }>
}

export function NewMenuModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  isLoading = false,
  menus = [],
}: NewMenuModalProps) {
  const [resetTrigger, setResetTrigger] = useState(0)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
  })
  const [selectedFile, setSelectedFile] = useState<{ file: File; preview: string } | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileSelect = (file: File, preview: string) => {
    setSelectedFile({ file, preview })
  }

  // Image upload will happen on form submit instead of a separate button

  const handleChangeImage = async () => {
    // If a new file was selected but not yet uploaded, just clear the selection/preview
    if (selectedFile) {
      setSelectedFile(null)
      // Reset FileUpload preview
      setResetTrigger((prev) => prev + 1)
      return
    }

    // If an image was already uploaded to storage, delete it from bucket
    if (uploadedImageUrl) {
      try {
        // Extract storage path robustly (match server helper logic)
        let filePath: string | null = null
        const idx = uploadedImageUrl.indexOf("/menus/")
        if (idx !== -1) {
          filePath = uploadedImageUrl.substring(idx + "/menus/".length).split("?")[0].replace(/^\/+/, "")
        }

        // Fallback to previous strategy if not found
        if (!filePath) {
          const parts = uploadedImageUrl.split("/public/")
          filePath = parts[1] || null
        }

        if (filePath) {
          await deleteMenuImage(filePath)
          setUploadedImageUrl(null)
          setSelectedFile(null)
          // Reset FileUpload preview
          setResetTrigger((prev) => prev + 1)
        } else {
          console.error("Could not determine file path from URL:", uploadedImageUrl)
        }
      } catch (error) {
        console.error("Error deleting image:", error)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation: semua field harus diisi (termasuk description dan image)
    const missingFields: string[] = []
    if (!formData.name.trim()) missingFields.push("name")
    if (!formData.description.trim()) missingFields.push("description")
    if (!formData.price.trim()) missingFields.push("price")
    if (!formData.categoryId) missingFields.push("category")
    if (!uploadedImageUrl && !selectedFile) missingFields.push("image")

    if (missingFields.length > 0) {
      // Show existing error modal
      setErrorMessage("All fields are required")
      return
    }

    // Check duplicate menu name (case-insensitive)
    const nameTrim = formData.name.trim()
    const duplicate = menus.some((m) => m.name?.trim().toLowerCase() === nameTrim.toLowerCase())
    if (duplicate) {
      setErrorMessage("Menu name already exists")
      return
    }

    // Validate price is an integer (no decimals or non-digit characters)
    const normalizedPrice = formData.price.replace(/,/g, "").trim()
    if (!/^\d+$/.test(normalizedPrice)) {
      setErrorMessage("Price must be an integer")
      return
    }

    try {
      // If there's a selected file but not yet uploaded, upload it now
      if (selectedFile && !uploadedImageUrl) {
        setIsUploading(true)
        const result = await uploadMenuImage(selectedFile.file)
        setUploadedImageUrl(result.url)
        // keep a reference to uploaded image path/url to pass to parent
        // clear selectedFile preview
        setSelectedFile(null)
        setIsUploading(false)

        setErrorMessage(null)
        onSubmit({
          ...formData,
          imageUrl: result.url,
        })

        // reset form state
        setFormData({
          name: "",
          description: "",
          price: "",
          categoryId: "",
        })
        setUploadedImageUrl(null)
        // Reset FileUpload preview
        setResetTrigger(prev => prev + 1)
        return
      }

      // If image already uploaded, submit immediately
      if (uploadedImageUrl) {
        setErrorMessage(null)
        onSubmit({
          ...formData,
          imageUrl: uploadedImageUrl,
        })

        setFormData({
          name: "",
          description: "",
          price: "",
          categoryId: "",
        })
        setUploadedImageUrl(null)
        setSelectedFile(null)
        setResetTrigger(prev => prev + 1)
      }
    } catch (error) {
      console.error("Error while saving menu and uploading image:", error)
      setIsUploading(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      // Reset all states when closing
      setFormData({
        name: "",
        description: "",
        price: "",
        categoryId: "",
      })
      setUploadedImageUrl(null)
      setSelectedFile(null)
      setResetTrigger(prev => prev + 1)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-light-orange rounded-2xl shadow-lg p-6 sm:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {errorMessage && (
          <ErrorModal message={errorMessage} onClose={() => setErrorMessage(null)} />
        )}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Upload */}
          <div className="space-y-3">
            <FileUpload
              resetTrigger={resetTrigger}
              onFileSelect={handleFileSelect}
              disabled={isUploading || isLoading}
              initialPreview={uploadedImageUrl}
            />
            {/* No separate upload button: image will be uploaded when admin clicks Save */}
          </div>

          {/* Right: Form Fields - Match aspect-square height */}
          <div className="flex flex-col gap-3">
            {/* Menu Name */}
            <div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="MENU NAME"
                autoComplete="off"
                className="w-full bg-pastel-orange border-0 px-4 py-3 text-base text-gray-orange placeholder:text-gray-orange rounded-[8px] focus:outline-none focus:ring-2 focus:ring-pastel-orange uppercase"
                disabled={isLoading}
              />
            </div>

            {/* Description */}
            <div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="DESCRIPTION"
                rows={3}
                className="w-full bg-pastel-orange border-0 px-4 py-3 text-base text-gray-orange placeholder:text-gray-orange rounded-[8px] focus:outline-none focus:ring-2 focus:ring-pastel-orange resize-none uppercase"
                disabled={isLoading}
              />
            </div>

            {/* Price */}
            <div>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="PRICE"
                autoComplete="off"
                className="w-full bg-pastel-orange border-0 px-4 py-3 text-base text-gray-orange placeholder:text-gray-orange rounded-[8px] focus:outline-none focus:ring-2 focus:ring-pastel-orange uppercase"
                disabled={isLoading}
              />
            </div>

            {/* Category */}
            <div>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full bg-pastel-orange border-0 px-4 py-3 text-base text-gray-orange rounded-[8px] focus:outline-none focus:ring-2 focus:ring-pastel-orange"
                disabled={isLoading}
              >
                <option value="">SELECT CATEGORY</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Buttons Container */}
            <div className="space-y-3 mt-auto">
              {/* Change Image Button */}
              <button
                onClick={handleChangeImage}
                type="button"
                disabled={isUploading || isLoading || !(uploadedImageUrl || selectedFile)}
                className="w-full bg-pastel-orange  text-gray-orange px-4 py-3 text-base font-medium rounded-[8px] uppercase"
              >
                CHANGE IMAGE
              </button>

              {/* Save Button */}
              <button
                type="submit"
                className="w-full bg-pastel-orange  text-gray-orange px-4 py-3 text-base font-medium rounded-[8px]  uppercase "
                disabled={isLoading || isUploading}
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
