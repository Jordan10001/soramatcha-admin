"use client"

import { useState, useRef, useEffect } from "react"
import { FileUpload } from "./file-upload"
import { uploadMenuImage, deleteMenuImage } from "@/app/actions/menu"

interface EditMenuModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    id: string
    name: string
    description: string
    price: string
    categoryId: string
    imageUrl: string | null
  }) => void
  categories: Array<{ id: string; name: string }>
  initialData: {
    id: string
    name: string
    description: string
    price: number
    category_id: string | null
    img_url?: string | null
  } | null
  isLoading?: boolean
}

export function EditMenuModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  initialData,
  isLoading = false,
}: EditMenuModalProps) {
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

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        price: String(initialData.price ?? ""),
        categoryId: initialData.category_id || "",
      })
      setUploadedImageUrl(initialData.img_url || null)
      setSelectedFile(null)
      setResetTrigger((s) => s + 1)
    }
  }, [initialData])

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

  const handleChangeImage = async () => {
    // If a new file was selected but not yet uploaded, just clear the selection/preview
    if (selectedFile) {
      setSelectedFile(null)
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

    if (!initialData) return

    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.price.trim() ||
      !formData.categoryId
    ) {
      return
    }

    try {
      let finalImageUrl = uploadedImageUrl

      if (selectedFile) {
        setIsUploading(true)
        const result = await uploadMenuImage(selectedFile.file)
        finalImageUrl = result.url
        setSelectedFile(null)
        setIsUploading(false)
      }

      onSubmit({
        id: initialData.id,
        name: formData.name,
        description: formData.description,
        price: formData.price,
        categoryId: formData.categoryId,
        imageUrl: finalImageUrl,
      })

      // reset
      setFormData({ name: "", description: "", price: "", categoryId: "" })
      setUploadedImageUrl(null)
      setSelectedFile(null)
      setResetTrigger((prev) => prev + 1)
    } catch (error) {
      console.error("Error updating menu and uploading image:", error)
      setIsUploading(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setFormData({ name: "", description: "", price: "", categoryId: "" })
      setUploadedImageUrl(null)
      setSelectedFile(null)
      setResetTrigger((prev) => prev + 1)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-light-orange rounded-2xl shadow-lg p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <FileUpload resetTrigger={resetTrigger} onFileSelect={handleFileSelect} disabled={isUploading || isLoading} initialPreview={uploadedImageUrl} />
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="MENU NAME"
                className="w-full bg-pastel-orange border-0 px-4 py-3 text-base text-gray-orange placeholder:text-gray-orange rounded-[8px] focus:outline-none focus:ring-2 focus:ring-pastel-orange uppercase"
                disabled={isLoading}
              />
            </div>

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

            <div>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="PRICE"
                className="w-full bg-pastel-orange border-0 px-4 py-3 text-base text-gray-orange placeholder:text-gray-orange rounded-[8px] focus:outline-none focus:ring-2 focus:ring-pastel-orange uppercase"
                disabled={isLoading}
              />
            </div>

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

            <div className="space-y-3 mt-auto">
              <button
                onClick={handleChangeImage}
                type="button"
                disabled={isUploading || isLoading || !(uploadedImageUrl || selectedFile)}
                className="w-full bg-pastel-orange  text-gray-orange px-4 py-3 text-base font-medium rounded-[8px] uppercase"
              >
                CHANGE IMAGE
              </button>

              <button
                type="submit"
                className="w-full bg-pastel-orange  text-gray-orange px-4 py-3 text-base font-medium rounded-[8px]  uppercase "
                disabled={
                  isLoading ||
                  isUploading ||
                  !formData.name.trim() ||
                  !formData.description.trim() ||
                  !formData.price.trim() ||
                  !formData.categoryId ||
                  !(uploadedImageUrl || selectedFile)
                }
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
