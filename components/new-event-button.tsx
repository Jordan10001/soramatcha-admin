"use client"

import { useState } from "react"
import { NewEventModal } from "./new-event-modal"

export function NewEventButton() {
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = (data: { name: string; description: string; location: string; imageUrl: string }) => {
    // For now just log — the parent page can replace this with a real action
    console.log("New event submitted", data)
    setIsOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-light-orange rounded-[8px] px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base font-semibold text-gray-orange tracking-widest text-center uppercase"
      >
        New Event
      </button>

      <NewEventModal isOpen={isOpen} onClose={() => setIsOpen(false)} onSubmit={handleSubmit} events={[]} />
    </>
  )
}
