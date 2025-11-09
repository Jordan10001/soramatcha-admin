"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FileUpload } from "./file-upload"
import { ErrorModal } from "./error-modal"
import { uploadEventImage, deleteEventImage, createEvent } from "@/app/actions/event"

interface NewEventModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    name: string
    description: string
    location: string
    imageUrl: string
  }) => void
  events?: Array<{ id: string; name: string }>
  isLoading?: boolean
}

export function NewEventModal({
  isOpen,
  onClose,
  onSubmit,
  events = [],
  isLoading = false,
}: NewEventModalProps) {
  const [resetTrigger, setResetTrigger] = useState(0)
  const [formData, setFormData] = useState({ name: "", description: "", location: "" })
  const [selectedFile, setSelectedFile] = useState<{ file: File; preview: string } | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileSelect = (file: File, preview: string) => {
    setSelectedFile({ file, preview })
  }

  const handleChangeImage = async () => {
    if (selectedFile) {
      setSelectedFile(null)
      setResetTrigger((prev) => prev + 1)
      return
    }

    if (uploadedImageUrl) {
      try {
        let filePath: string | null = null
        const idx = uploadedImageUrl.indexOf("/events/")
        if (idx !== -1) {
          filePath = uploadedImageUrl.substring(idx + "/events/".length).split("?")[0].replace(/^\/+/, "")
        }

        if (!filePath) {
          const parts = uploadedImageUrl.split("/public/")
          filePath = parts[1] || null
        }

        if (filePath) {
          await deleteEventImage(filePath)
          setUploadedImageUrl(null)
          setSelectedFile(null)
          setResetTrigger((prev) => prev + 1)
        }
      } catch (error) {
        console.error("Error deleting image:", error)
      }
    }
  }

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const missing: string[] = []
    if (!formData.name.trim()) missing.push("name")
    if (!formData.location.trim()) missing.push("location")
    // require an image (either already uploaded or a selected file)
    if (!uploadedImageUrl && !selectedFile) missing.push("image")

    if (missing.length > 0) {
      // show which fields are missing to make it clearer for the user
      const pretty = missing.map((m) => (m === "image" ? "image" : m)).join(", ")
      setErrorMessage(`Please fill required fields: ${pretty}`)
      return
    }

    const nameTrim = formData.name.trim()
    const duplicate = events.some((ev) => ev.name?.trim().toLowerCase() === nameTrim.toLowerCase())
    if (duplicate) {
      setErrorMessage("Event name already exists")
      return
    }

    try {
      let imageUrlToSave = uploadedImageUrl

      if (selectedFile && !uploadedImageUrl) {
        setIsUploading(true)
        const result = await uploadEventImage(selectedFile.file)
        setIsUploading(false)

        if (!result || result.success !== true || !result.url) {
          const msg = result?.message || "Failed to upload image"
          setErrorMessage(msg)
          return
        }

        imageUrlToSave = result.url
        setSelectedFile(null)
      }

      // At this point we should have imageUrlToSave (can be null) and valid form data
      const createRes = await createEvent(formData.name.trim(), formData.description.trim(), formData.location.trim(), imageUrlToSave as string)

      if (!createRes || (createRes as any).success !== true) {
        const msg = (createRes && (createRes as any).message) || "Failed to create event"
        setErrorMessage(msg)
        return
      }

      // success: reset and close modal, refresh page
      setFormData({ name: "", description: "", location: "" })
      setUploadedImageUrl(null)
      setSelectedFile(null)
      setResetTrigger((prev) => prev + 1)
      setErrorMessage(null)
      onClose()
      try {
        router.refresh()
      } catch (e) {
        // ignore
      }
    } catch (error) {
      console.error("Error while saving event and uploading image:", error)
      setIsUploading(false)
      setErrorMessage("Server error while saving event")
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setFormData({ name: "", description: "", location: "" })
      setUploadedImageUrl(null)
      setSelectedFile(null)
      setResetTrigger((prev) => prev + 1)
      onClose()
    }
  }

  // Reset local modal state whenever the modal is closed from the parent
  useEffect(() => {
    if (!isOpen) {
      setFormData({ name: "", description: "", location: "" })
      setUploadedImageUrl(null)
      setSelectedFile(null)
      setResetTrigger((prev) => prev + 1)
      setErrorMessage(null)
      setIsUploading(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-light-orange rounded-2xl shadow-lg p-6 sm:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {errorMessage && <ErrorModal message={errorMessage} onClose={() => setErrorMessage(null)} />}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <FileUpload resetTrigger={resetTrigger} onFileSelect={handleFileSelect} disabled={isUploading || isLoading} initialPreview={uploadedImageUrl} />
          </div>

          <div className="flex flex-col gap-3 ">
            <div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="EVENT NAME"
                autoComplete="off"
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
                rows={5}
                className="w-full bg-pastel-orange border-0 px-4 py-3 text-base text-gray-orange placeholder:text-gray-orange rounded-[8px] focus:outline-none focus:ring-2 focus:ring-pastel-orange resize-none uppercase"
                disabled={isLoading}
              />
            </div>

            <div>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="LOCATION"
                autoComplete="off"
                className="w-full bg-pastel-orange border-0 px-4 py-3 text-base text-gray-orange placeholder:text-gray-orange rounded-[8px] focus:outline-none focus:ring-2 focus:ring-pastel-orange uppercase"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-3 mt-auto">
              <button
                onClick={handleChangeImage}
                type="button"
                disabled={isUploading || isLoading || !(uploadedImageUrl || selectedFile)}
                className="w-full bg-pastel-orange text-gray-orange px-4 py-3 text-base font-medium rounded-[8px] uppercase"
              >
                CHANGE IMAGE
              </button>

              <button
                type="submit"
                className="w-full bg-pastel-orange text-gray-orange px-4 py-3 text-base font-medium rounded-[8px]  uppercase "
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
