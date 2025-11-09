"use client"

import React, { useState, useEffect } from "react"
import { EventCard } from "./event-card"
import { EditEventModal } from "./edit-event-modal"
import { deleteEvent } from "@/app/actions/event"
import { useRouter } from "next/navigation"
import { InfoModal } from "./info-modal"
import { DeleteConfirmation } from "./delete-confirmation"

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
      // show info modal for create
      setInfoMessage("Event created successfully")
      setIsInfoOpen(true)
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
      setInfoMessage("Event updated successfully")
      setIsInfoOpen(true)
    }

    window.addEventListener("sora:event:updated", handler as EventListener)
    return () => window.removeEventListener("sora:event:updated", handler as EventListener)
  }, [])

  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name?: string } | null>(null)

  const performDelete = async (id: string) => {
    // If this is a temporary client-side id (created optimistically), don't call server
    if (typeof id === "string" && id.startsWith("temp-")) {
      // simply remove locally
      setEvents((cur) => cur.filter((ev: any) => ev.id !== id))
      setInfoMessage("Unsaved event removed")
      setIsInfoOpen(true)
      return
    }

    // Optimistically remove from UI (keep immutable copy)
    const previous = [...events]
    setEvents((cur) => cur.filter((ev: any) => ev.id !== id))

    try {
      const res = await deleteEvent(id)
      if (!res || (res as any).success === false) {
        // server reported failure: revert and refresh to keep state consistent
        try {
          console.error("Failed to delete on server:", JSON.stringify(res))
        } catch (err) {
          console.error("Failed to delete on server (raw):", res)
        }
        setEvents(previous)
        try {
          router.refresh()
        } catch (e) {
          /* ignore */
        }
        return
      }

      // success
      setInfoMessage("Event deleted successfully")
      setIsInfoOpen(true)
    } catch (e) {
      console.error("Error calling deleteEvent:", e)
      // Revert optimistic removal on error
      setEvents(previous)
      try { router.refresh() } catch (e) {}
    }
  }

  const openDelete = (id: string, name?: string) => {
    setDeleteTarget({ id, name })
    setIsDeleteOpen(true)
  }

  const closeDelete = () => {
    setIsDeleteOpen(false)
    setDeleteTarget(null)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    const { id } = deleteTarget
    await performDelete(id)
    closeDelete()
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
          <EventCard key={e.id} id={e.id} name={e.name} description={e.description} location={e.location ?? e.locations} img_url={e.img_url} onDelete={() => openDelete(e.id, e.name)} onEdit={handleEdit} />
        ))}
      </div>

      <EditEventModal isOpen={isModalOpen} onClose={closeModal} event={editing} events={events} />
      <InfoModal isOpen={isInfoOpen} title="Success" message={infoMessage || ""} onClose={() => { setIsInfoOpen(false); setInfoMessage(null) }} />
      <DeleteConfirmation
        isOpen={isDeleteOpen}
        title={deleteTarget ? `Delete event` : "Delete"}
        message={deleteTarget ? `Are you sure you want to permanently delete this event${deleteTarget.name ? `: ${deleteTarget.name}` : ""}? This action cannot be undone.` : undefined}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onCancel={closeDelete}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
