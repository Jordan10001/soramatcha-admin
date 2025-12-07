import { Navbar } from "@/components/navbar"
import { NewEventButton } from "@/components/new-event-button"
import { getEvents } from "@/app/actions/event"
import EventList from "@/components/event-list"

export default async function EventPage() {
  const sampleEvents: any[] = await getEvents()

  return (
    <div>
      <Navbar />

      <div className=" p-6">
        <div className="flex items-center justify-between mb-4">
          <NewEventButton events={sampleEvents} />
        </div>

        <main className="max-w-6xl mx-auto py-6 px-4">
          {/* client-side list handles edit/delete modals */}
          <EventList initialEvents={sampleEvents} />
        </main>
      </div>
    </div>
  )
}