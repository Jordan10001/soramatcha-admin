import { Navbar } from "@/components/navbar"
import Link from "next/link"
import { EventCard } from "@/components/event-card"
import { NewEventButton } from "@/components/new-event-button"
import { getEvents } from "@/app/actions/event"

export default async function EventPage() {
  const sampleEvents: any[] = await getEvents()

  return (
    <div>
      <Navbar />

        
      <div className=" p-6">
        <div className="flex items-center justify-between mb-4">        
            <NewEventButton />        
        </div>

        <main className="max-w-6xl mx-auto py-6 px-4">
          <div className="grid grid-cols-1 gap-6">
          {sampleEvents.map((e) => (
            <EventCard key={e.id} id={e.id} name={e.name} description={e.description} location={e.locations} img_url={e.img_url} />
          ))}
        </div>
        </main>
      </div>
    </div>
  )
}