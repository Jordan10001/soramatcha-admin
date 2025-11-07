"use client"

import { useState, useRef, useEffect } from "react"
import { Upload } from "lucide-react"

interface FileUploadProps {
  onFileSelect: (file: File, preview: string) => void
  disabled?: boolean
  resetTrigger?: number
  // optional initial preview URL (e.g. existing uploaded image) to show when component mounts
  initialPreview?: string | null
  // max file size in bytes (default 10 MB)
  maxFileSize?: number
}

export function FileUpload({ onFileSelect, disabled = false, resetTrigger, maxFileSize = 10 * 1024 * 1024, initialPreview }: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset preview when resetTrigger changes
  useEffect(() => {
    if (resetTrigger !== undefined) {
      setPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }, [resetTrigger])

  // When an initial preview url is provided from parent (for edit flows), show it
  useEffect(() => {
    if (initialPreview) {
      // only set the preview from parent if no user-selected preview exists
      setPreview((current) => current ?? initialPreview)
      // ensure file input has no selected file
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }, [initialPreview])

  const handleFile = (file: File) => {
    const maxSize = maxFileSize

    // Reset previous error
    setError(null)

    if (file.size > maxSize) {
      setPreview(null)
      setError(`File too large. Max ${Math.round(maxSize / (1024 * 1024))} MB`)
      // clear the input value so user can pick again
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }

    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const previewUrl = reader.result as string
        setPreview(previewUrl)
        onFileSelect(file, previewUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true)
    } else if (e.type === "dragleave") {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  return (
    <div className="space-y-3">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg aspect-square text-center transition-colors flex items-center justify-center ${
          isDragActive
            ? "border-gray-orange bg-pastel-orange"
            : "border-gray-400 bg-pastel-orange"
        }`}
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover rounded"
          />
        ) : (
          <div className="text-center">
            <Upload size={32} className="mx-auto mb-2 text-gray-orange" />
            <p className="text-sm font-semibold text-gray-orange uppercase">
              Drag and Drop
            </p>
            <p className="text-xs text-gray-orange">or</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 bg-light-orange hover:bg-gray-300 text-gray-orange px-4 py-2 text-xs font-semibold rounded uppercase"
              disabled={disabled}
            >
              Choose File
            </button>
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />
      {error && <div className="text-sm text-red-500">{error}</div>}
    </div>
  )
}

// default prop destructure helper
const propsDefault = { maxFileSize: 10 * 1024 * 1024 }
