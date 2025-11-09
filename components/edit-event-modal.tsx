"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FileUpload } from "./file-upload"
import { ErrorModal } from "./error-modal"
import { uploadEventImage, deleteEventImage, updateEvent } from "@/app/actions/event"

interface EditEventModalProps {
  isOpen: boolean
  onClose: () => void
  event: { id: string; name: string; description?: string; location?: string; img_url?: string | null } | null
  events?: Array<{ id: string; name: string }>
  isLoading?: boolean
}

export function EditEventModal({ isOpen, onClose, event, events = [], isLoading = false }: EditEventModalProps) {
  const [resetTrigger, setResetTrigger] = useState(0)
  const [formData, setFormData] = useState({ name: "", description: "", location: "" })
  const [selectedFile, setSelectedFile] = useState<{ file: File; preview: string } | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [shouldRemoveImage, setShouldRemoveImage] = useState(false)

  const router = useRouter()

  useEffect(() => {
    if (isOpen && event) {
      // event may have `location` or `locations` depending on DB mapping
      const loc = (event as any).location ?? (event as any).locations ?? ""
      setFormData({ name: event.name || "", description: event.description || "", location: loc })
      setUploadedImageUrl(event.img_url || null)
      setSelectedFile(null)
      setShouldRemoveImage(false)
      setErrorMessage(null)
      setIsUploading(false)
    }

    if (!isOpen) {
      setFormData({ name: "", description: "", location: "" })
      setUploadedImageUrl(null)
      setSelectedFile(null)
      setShouldRemoveImage(false)
      setResetTrigger((p) => p + 1)
      setErrorMessage(null)
      setIsUploading(false)
    }
  }, [isOpen, event])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
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

    // If an image was already uploaded to storage, delete it from bucket (will be removed on update if cleared)
    if (uploadedImageUrl) {
      try {
        // Determine file path in storage from the public URL.
        // Support common Supabase public URL shapes such as:
        // - https://.../storage/v1/object/public/event/<filePath>
        // - https://.../object/public/event/<filePath>
        // - https://.../public/event/<filePath>
        // - https://.../event/<filePath>
        const candidates = [
          "/storage/v1/object/public/event/",
          "/object/public/event/",
          "/public/event/",
          "/event/",
          "/events/",
          "/public/events/",
        ]

        let filePath: string | null = null
        for (const seg of candidates) {
          const idx = uploadedImageUrl.indexOf(seg)
          if (idx !== -1) {
            let path = uploadedImageUrl.substring(idx + seg.length)
            const q = path.indexOf("?")
            if (q !== -1) path = path.substring(0, q)
            filePath = path.replace(/^\/+/, "")
            break
          }
        }

        if (filePath) {
          // Delete immediately from storage as requested by the admin
          const delRes = await deleteEventImage(filePath)
          if (!delRes || (delRes as any).success !== true) {
            console.error("deleteEventImage reported failure:", delRes)
          }
        } else {
          console.warn("Could not determine storage path from URL:", uploadedImageUrl)
        }
      } catch (e) {
        console.error("Error deleting event image on Change Image:", e)
      }

      // Update local state: clear preview and mark removal so Save will clear DB as well
      setUploadedImageUrl(null)
      setSelectedFile(null)
      setShouldRemoveImage(true)
      setResetTrigger((prev) => prev + 1)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setFormData({ name: "", description: "", location: "" })
      setUploadedImageUrl(null)
      setSelectedFile(null)
      setErrorMessage(null)
      setResetTrigger((prev) => prev + 1)
      onClose()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!event) return

    const missing: string[] = []
    if (!formData.name.trim()) missing.push("name")
    if (!formData.location.trim()) missing.push("location")
    if (!uploadedImageUrl && !selectedFile) missing.push("image")

    if (missing.length > 0) {
      const pretty = missing.join(", ")
      setErrorMessage(`Please fill required fields: ${pretty}`)
      return
    }

    const nameTrim = formData.name.trim()
    const duplicate = events?.some((ev) => ev.id !== event.id && ev.name?.trim().toLowerCase() === nameTrim.toLowerCase())
    if (duplicate) {
      setErrorMessage("Event name already exists")
      return
    }

    try {
      let imageUrlToSave = uploadedImageUrl

      // If user selected a new file, upload it now
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

      // If the user explicitly removed the image (shouldRemoveImage === true) and did not
      // select a replacement, we want to clear the image on the DB as well. Set imageUrlToSave
      // to null in that case so the server knows to remove the previous file and clear the column.
      if (shouldRemoveImage && !imageUrlToSave) {
        imageUrlToSave = null
      }

      const res = await updateEvent(event.id, formData.name.trim(), formData.description.trim(), formData.location.trim(), imageUrlToSave ?? undefined)

      if (!res || (res as any).success !== true) {
        const msg = (res && (res as any).message) || "Failed to update event"
        setErrorMessage(msg)
        return
      }

      // success: prepare updated event object and notify client so UI can update immediately
      const updatedRow = (res as any).data ? (Array.isArray((res as any).data) ? (res as any).data[0] : (res as any).data) : null
      const updatedEvent = updatedRow
        ? { ...updatedRow, location: (updatedRow as any).locations ?? (updatedRow as any).location ?? formData.location }
        : { id: event.id, name: formData.name.trim(), description: formData.description.trim(), location: formData.location.trim(), img_url: imageUrlToSave }

      setFormData({ name: "", description: "", location: "" })
      setUploadedImageUrl(null)
      setSelectedFile(null)
      setResetTrigger((prev) => prev + 1)
      setErrorMessage(null)
      // dispatch update event for client-side listeners
      try {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("sora:event:updated", { detail: updatedEvent }))
        }
      } catch (e) {
        console.error("Failed to dispatch updated event:", e)
      }

      onClose()
    } catch (error) {
      console.error("Error updating event:", error)
      setIsUploading(false)
      setErrorMessage("Server error while updating event")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
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
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="DESCRIPTION" rows={5} className="w-full bg-pastel-orange border-0 px-4 py-3 text-base text-gray-orange placeholder:text-gray-orange rounded-[8px] focus:outline-none focus:ring-2 focus:ring-pastel-orange resize-none uppercase" disabled={isLoading} />
            </div>

            <div>
              <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="LOCATION" autoComplete="off" className="w-full bg-pastel-orange border-0 px-4 py-3 text-base text-gray-orange placeholder:text-gray-orange rounded-[8px] focus:outline-none focus:ring-2 focus:ring-pastel-orange uppercase" disabled={isLoading} />
            </div>

            <div className="space-y-3 mt-auto">
              <button onClick={handleChangeImage} type="button" disabled={isUploading || isLoading || !(uploadedImageUrl || selectedFile)} className="w-full bg-pastel-orange text-gray-orange px-4 py-3 text-base font-medium rounded-[8px] uppercase">
                CHANGE IMAGE
              </button>

              <button type="submit" className="w-full bg-pastel-orange text-gray-orange px-4 py-3 text-base font-medium rounded-[8px]  uppercase " disabled={isLoading || isUploading}>
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
