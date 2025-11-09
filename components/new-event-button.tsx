"use client"

import { useState } from "react"
import { NewEventModal } from "./new-event-modal"
import { createEvent } from "@/app/actions/event"

interface NewEventButtonProps {
  events?: Array<any>
}

export function NewEventButton({ events = [] }: NewEventButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = async (data: { name: string; description: string; location: string; imageUrl: string }) => {
    try {
      // Persist the event along with the uploaded image URL
      const res = await createEvent(data.name, data.description, data.location, data.imageUrl)
      if (!res || (res as any).success === false) {
        console.error("Failed to create event on server:", res)
        // close modal anyway; server-side error will surface in console. Consider showing UI error later.
        setIsOpen(false)
        return
      }

      const created = (res as any).data ? (Array.isArray((res as any).data) ? (res as any).data[0] : (res as any).data) : null

      const createdEvent = created ? { ...created, location: created.locations ?? created.location } : { name: data.name, description: data.description, location: data.location, img_url: data.imageUrl }

      // Notify any client-side listeners (EventList) to prepend the created event
      try {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("sora:event:created", { detail: createdEvent }))
        }
      } catch (e) {
        console.error("Failed to dispatch created event:", e)
      }

      setIsOpen(false)
    } catch (e) {
      console.error("Error creating event:", e)
      setIsOpen(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-light-orange rounded-[8px] px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base font-semibold text-gray-orange tracking-widest text-center uppercase"
      >
        New Event
      </button>

      <NewEventModal isOpen={isOpen} onClose={() => setIsOpen(false)} onSubmit={handleSubmit} events={events} />
    </>
  )
}
