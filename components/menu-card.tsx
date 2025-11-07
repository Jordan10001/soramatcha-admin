"use client"

import React from "react"

interface MenuCardProps {
  id: string
  name: string
  description: string
  price: number
  img_url?: string | null
  onDelete?: (id: string) => void
  onEdit?: (id: string) => void
}

function formatPrice(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) return "Rp0"
  try {
    // Format number with Indonesian thousands separator and no decimals, then prepend 'Rp' (no space)
    const nf = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 })
    return `Rp${nf.format(value)}`
  } catch {
    return `Rp${value}`
  }
}

export function MenuCard({ id, name, description, price, img_url, onDelete, onEdit }: MenuCardProps) {
  return (
    <div className="w-full bg-light-orange rounded-lg p-3 sm:p-4 shadow-sm">
      <div className="bg-white rounded-md overflow-hidden shadow-inner aspect-square">
        {img_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img_url} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm text-gray-orange">No image</div>
        )}
      </div>

      <div className="mt-3">
        <h3 className="text-base sm:text-lg font-bold text-gray-orange uppercase tracking-wide">{name}</h3>
        <p className="text-sm sm:text-xs text-gray-orange mt-1 line-clamp-2">{description}</p>

        <div className="mt-3">
          <div className="w-full text-right text-sm sm:text-base font-bold text-gray-orange">{formatPrice(price)}</div>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => onDelete?.(id)}
            className="bg-pastel-orange text-gray-orange font-medium py-2 rounded-md text-sm"
          >
            Delete
          </button>
          <button
            onClick={() => onEdit?.(id)}
            className="bg-pastel-orange text-gray-orange font-medium py-2 rounded-md text-sm"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  )
}
