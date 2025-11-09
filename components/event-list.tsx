"use client"

import React, { useState, useEffect } from "react"
import { EventCard } from "./event-card"
import { EditEventModal } from "./edit-event-modal"
import { deleteEvent } from "@/app/actions/event"
import { useRouter } from "next/navigation"

interface EventListProps {
  initialEvents: Array<any>
}

export default function EventList({ initialEvents }: EventListProps) {
  const [events, setEvents] = useState(initialEvents || [])
  const [editing, setEditing] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  // Listen for global created-event notifications so new events appear immediately
  useEffect(() => {
    const handler = (ev: any) => {
      const created = ev?.detail
      if (!created) return
      // ensure we have an id (server should provide one); if not, synthesize a temp id
      const entry = { id: created.id ?? `temp-${Date.now()}`, ...created }
      setEvents((prev) => [entry, ...prev])
    }

    window.addEventListener("sora:event:created", handler as EventListener)
    return () => window.removeEventListener("sora:event:created", handler as EventListener)
  }, [])

  // Listen for updates and replace the item in local state
  useEffect(() => {
    const handler = (ev: any) => {
      const updated = ev?.detail
      if (!updated) return
      setEvents((prev: any[]) => prev.map((it) => (it.id === updated.id ? { ...it, ...updated } : it)))
    }

    window.addEventListener("sora:event:updated", handler as EventListener)
    return () => window.removeEventListener("sora:event:updated", handler as EventListener)
  }, [])

  const handleDelete = async (id: string) => {
    // Optimistically remove from UI
    const previous = events
    setEvents((cur) => cur.filter((ev: any) => ev.id !== id))

    try {
      const res = await deleteEvent(id)
      if (!res || (res as any).success === false) {
        // server reported failure: revert and refresh to keep state consistent
        console.error("Failed to delete on server:", res)
        setEvents(previous)
        try { router.refresh() } catch (e) {}
      }
    } catch (e) {
      console.error(e)
      // Revert optimistic removal on error
      setEvents(previous)
      try { router.refresh() } catch (e) {}
    }
  }

  const handleEdit = (id: string) => {
    const ev = events.find((x) => x.id === id)
    setEditing(ev || null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditing(null)
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-6">
        {events.map((e: any) => (
          <EventCard key={e.id} id={e.id} name={e.name} description={e.description} location={e.location ?? e.locations} img_url={e.img_url} onDelete={handleDelete} onEdit={handleEdit} />
        ))}
      </div>

      <EditEventModal isOpen={isModalOpen} onClose={closeModal} event={editing} events={events} />
    </div>
  )
}
