import { Navbar } from "@/components/navbar"
import Link from "next/link"
import { EventCard } from "@/components/event-card"

export default async function EventPage() {
  // TODO: replace with real data fetching
  const sampleEvents = [
    {
      id: "1",
      name: "Soramatcha Tasting ppppppppppppp ppppppppppppppppppppppppppppp",
      description: "lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      location: "Jakarta Cafe lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      img_url: null,
    },
    {
      id: "2",
      name: "Soramatcha Tasting ppppppppppppp ppppppppppppppppppppppppppppp",
      description: "lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      location: "Jakarta Cafe lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      img_url: null,
    },
  ]

  return (
    <div>
      <Navbar />

        
      <div className=" p-6">
        <div>
          <div className="w-full bg-light-orange rounded-[8px] px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base font-semibold text-gray-orange uppercase tracking-widest text-center">NEW EVENT</div>
        </div>

        <main className="max-w-6xl mx-auto py-6 px-4">
          <div className="grid grid-cols-1 gap-6">
          {sampleEvents.map((e) => (
            <EventCard key={e.id} id={e.id} name={e.name} description={e.description} location={e.location} img_url={e.img_url} />
          ))}
        </div>
        </main>
      </div>
    </div>
  )
}