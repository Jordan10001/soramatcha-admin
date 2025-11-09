"use client"

import React from "react"

interface EventCardProps {
  id: string
  name: string
  description?: string
  location?: string
  img_url?: string | null
  onDelete?: (id: string) => void
  onEdit?: (id: string) => void
}

export function EventCard({ id, name, description, location, img_url, onDelete, onEdit }: EventCardProps) {
  return (
  <div className="w-full mx-auto bg-[#efe2d0] rounded-[8px] p-4 shadow-sm min-h-[200px] overflow-hidden">
      <div className="flex gap-6 items-stretch h-full p-2">
        {/* Left: square image */}
        <div className="w-1/3 flex-shrink-0">
          <div className="bg-white rounded-md overflow-hidden aspect-square shadow-inner">
            {img_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img_url} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-gray-orange">No image</div>
            )}
          </div>
        </div>

        {/* Right: values only (no labels) */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div className="text-gray-orange min-w-0 ">
            <h3 className="text-lg font-semibold line-clamp-2">{name}</h3>
            <p className="text-sm mt-4 max-h-28 overflow-auto">{description || "-"}</p>
            <p className="text-sm mt-4 line-clamp-2">{location || "-"}</p>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => onDelete?.(id)}
              className="bg-pastel-orange text-gray-orange font-medium py-2 rounded-md text-sm uppercase"
            >
              Delete
            </button>
            <button
              onClick={() => onEdit?.(id)}
              className="bg-pastel-orange text-gray-orange font-medium py-2 rounded-md text-sm uppercase"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
